
import mongoose from "mongoose";

const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 20000;

// Keep requests controlled to avoid bursts against Open-Meteo.
const MAX_CONCURRENT_REQUESTS = 2;
const MAX_ATTEMPTS = 4;
const INITIAL_RETRY_DELAY_MS = 15000;

let refreshPromise = null;

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getRetryAfterMs(response) {
  const value = response.headers.get("retry-after");

  if (!value) return null;

  const seconds = Number(value);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const date = Date.parse(value);

  if (Number.isFinite(date)) {
    return Math.max(0, date - Date.now());
  }

  return null;
}

async function fetchWeatherWithRetry(url, regionName) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response;

    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });
    } catch (error) {
      // Retry network errors and timeouts with backoff.
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(
          `${regionName}: weather request failed after ${attempt} attempts: ${error.message}`
        );
      }

      const delay = INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1);

      console.warn(
        `[Weather] ${regionName}: request failed; retrying in ${Math.ceil(delay / 1000)}s (attempt ${attempt + 1}/${MAX_ATTEMPTS}).`
      );

      await sleep(delay);
      continue;
    }

    if (response.ok) {
      return response.json();
    }

    const status = response.status;

    // Do not retry ordinary client errors such as HTTP 400.
    const retryable =
      status === 429 ||
      status === 408 ||
      status >= 500;

    if (!retryable || attempt === MAX_ATTEMPTS) {
      throw new Error(`Open-Meteo returned HTTP ${status}.`);
    }

    const retryAfter = getRetryAfterMs(response);
    const backoff = INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1);
    const delay = Math.max(retryAfter ?? 0, backoff);

    console.warn(
      `[Weather] ${regionName}: HTTP ${status}; retrying in ${Math.ceil(delay / 1000)}s (attempt ${attempt + 1}/${MAX_ATTEMPTS}).`
    );

    await sleep(delay);
  }

  throw new Error(`${regionName}: weather request exhausted retries.`);
}

function buildWeatherUrl(city) {
  const url = new URL(WEATHER_API);

  url.search = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "weather_code"
    ].join(","),
    forecast_days: "7",
    timezone: "Asia/Kolkata"
  }).toString();

  return url;
}

function validateWeather(weather) {
  if (!weather?.current || !weather?.daily) {
    throw new Error("Open-Meteo returned incomplete weather data.");
  }

  const daily = weather.daily;

  const requiredDailyFields = [
    daily.time,
    daily.temperature_2m_max,
    daily.temperature_2m_min,
    daily.precipitation_probability_max,
    daily.weather_code
  ];

  if (requiredDailyFields.some((field) => !Array.isArray(field))) {
    throw new Error("Open-Meteo returned an invalid daily forecast.");
  }

  const forecastLength = daily.time.length;

  if (
    forecastLength === 0 ||
    requiredDailyFields.some(
      (field) => field.length !== forecastLength
    )
  ) {
    throw new Error(
      "Forecast arrays are empty or have inconsistent lengths."
    );
  }

  const forecast = daily.time.map((date, index) => ({
    date,
    max: daily.temperature_2m_max[index],
    min: daily.temperature_2m_min[index],
    precipitationProbability:
      daily.precipitation_probability_max[index],
    weatherCode: daily.weather_code[index]
  }));

  const current = weather.current;

  const currentFields = [
    current.temperature_2m,
    current.relative_humidity_2m,
    current.apparent_temperature,
    current.precipitation,
    current.weather_code,
    current.wind_speed_10m
  ];

  if (
    currentFields.some(
      (value) =>
        value === undefined ||
        value === null ||
        !Number.isFinite(Number(value))
    )
  ) {
    throw new Error("Open-Meteo returned invalid current weather values.");
  }

  if (
    forecast.some(
      (day) =>
        !day.date ||
        !Number.isFinite(Number(day.max)) ||
        !Number.isFinite(Number(day.min)) ||
        day.precipitationProbability == null ||
        !Number.isFinite(Number(day.precipitationProbability)) ||
        day.weatherCode == null
    )
  ) {
    throw new Error("Open-Meteo returned invalid forecast values.");
  }

  return { current, forecast };
}

async function refreshOneCity(city, collection, refreshedAt) {
  const url = buildWeatherUrl(city);

  const weather = await fetchWeatherWithRetry(url, city.name);
  const { current, forecast } = validateWeather(weather);

  const document = {
    region: city.name,
    state: city.state,
    coordinates: {
      latitude: city.latitude,
      longitude: city.longitude
    },
    current: {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      apparentTemperature: current.apparent_temperature,
      precipitation: current.precipitation,
      weatherCode: current.weather_code,
      windSpeed: current.wind_speed_10m,
      observedAt: current.time
    },
    forecast,
    timezone: weather.timezone || "Asia/Kolkata",
    source: "Open-Meteo",
    sourceUpdatedAt: current.time,
    refreshedAt,
    updatedAt: refreshedAt
  };

  // Only write after the new weather data has been validated.
  // Failed fetches do not overwrite the previous valid document.
  await collection.replaceOne(
    { region: city.name },
    document,
    { upsert: true }
  );

  return {
    region: city.name,
    temperature: document.current.temperature,
    forecastDays: forecast.length,
    observedAt: document.current.observedAt,
    refreshedAt: refreshedAt.toISOString()
  };
}

async function runWithConcurrency(items, limit, task) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex++;

      if (index >= items.length) return;

      try {
        results[index] = {
          status: "fulfilled",
          value: await task(items[index], index)
        };
      } catch (error) {
        results[index] = {
          status: "rejected",
          reason: error
        };
      }
    }
  }

  const workerCount = Math.min(limit, items.length);

  await Promise.all(
    Array.from({ length: workerCount }, () => worker())
  );

  return results;
}

async function performRefresh() {
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("MongoDB is not connected.");
  }

  const hotspots = await db
    .collection("hotspots")
    .find({
      latitude: { $type: "number" },
      longitude: { $type: "number" },
      name: { $type: "string" }
    })
    .toArray();

  if (hotspots.length === 0) {
    throw new Error(
      "No cities with valid coordinates found in hotspots."
    );
  }

  const collection = db.collection("liveweather");
  const refreshedAt = new Date();

  console.log(
    `[Weather] Refreshing ${hotspots.length} regions with concurrency ${MAX_CONCURRENT_REQUESTS}.`
  );

  const results = await runWithConcurrency(
    hotspots,
    MAX_CONCURRENT_REQUESTS,
    (city) => refreshOneCity(city, collection, refreshedAt)
  );

  const successful = [];
  const failed = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successful.push(result.value);
    } else {
      failed.push({
        region: hotspots[index].name,
        error:
          result.reason?.message ||
          "Unknown weather refresh error."
      });
    }
  });

  console.log(
    `Weather refresh complete: ${successful.length} succeeded, ` +
    `${failed.length} failed out of ${hotspots.length}.`
  );

  if (failed.length > 0) {
    console.error("Failed weather locations:", failed);
  }

  return {
    success: failed.length === 0,
    refreshedAt: refreshedAt.toISOString(),
    total: hotspots.length,
    updated: successful.length,
    failed: failed.length,
    results: successful,
    errors: failed
  };
}

export function refreshWeatherData() {
  // Reuse an in-progress refresh rather than starting another batch.
  if (refreshPromise) {
    console.log(
      "[Weather] Refresh already in progress; reusing the existing operation."
    );

    return refreshPromise;
  }

  refreshPromise = performRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
