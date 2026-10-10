
import mongoose from "mongoose";

const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 20000;

export const refreshWeatherData = async () => {
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

  const results = await Promise.allSettled(
    hotspots.map(async (city) => {
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

      const response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });

      if (!response.ok) {
        throw new Error(
          `Open-Meteo returned HTTP ${response.status}.`
        );
      }

      const weather = await response.json();

      if (!weather.current || !weather.daily) {
        throw new Error(
          "Open-Meteo returned incomplete weather data."
        );
      }

      const daily = weather.daily;

      const requiredDailyFields = [
        daily.time,
        daily.temperature_2m_max,
        daily.temperature_2m_min,
        daily.precipitation_probability_max,
        daily.weather_code
      ];

      if (
        requiredDailyFields.some(
          (field) => !Array.isArray(field)
        )
      ) {
        throw new Error(
          "Open-Meteo returned an invalid daily forecast."
        );
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
        throw new Error(
          "Open-Meteo returned invalid current weather values."
        );
      }

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

      // Update only after the city's API response has been validated.
      // A failed request leaves the existing document untouched.
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
    })
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
};
