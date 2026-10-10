
async function fetchJSON(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.json();
}

/* =========================================
   DASHBOARD
========================================= */

export function getDashboard() {
  return fetchJSON("/data/dashboard.json");
}

/* =========================================
   REGIONS
========================================= */

export function getRegions() {
  return fetchJSON("/data/regions.json");
}

/* =========================================
   TEMPERATURE DATA
========================================= */

export async function getTemperatureData(regionName) {
  const data = await fetchJSON("/data/temperature.json");

  if (data && !Array.isArray(data) && regionName && data[regionName]) {
    return data[regionName];
  }

  if (data?.regions && regionName && data.regions[regionName]) {
    return data.regions[regionName];
  }

  if (Array.isArray(data)) {
    const regionData = data.find(
      (item) => item.region === regionName || item.name === regionName
    );

    if (regionData) return regionData;
    if (data.length > 0) return data[0];
  }

  if (data && Array.isArray(data.temperatures)) {
    return data;
  }

  throw new Error(`Temperature data not found for ${regionName}`);
}

/* =========================================
   FORECASTS
========================================= */

export async function getForecasts(regionName) {
  const data = await fetchJSON("/data/forecasts.json");

  if (data && !Array.isArray(data) && regionName && data[regionName]) {
    return data[regionName];
  }

  if (data?.regions && regionName && data.regions[regionName]) {
    return data.regions[regionName];
  }

  if (Array.isArray(data)) {
    const regionData = data.find(
      (item) => item.region === regionName || item.name === regionName
    );

    if (regionData) return regionData.forecasts || regionData;
    return data;
  }

  if (data && Array.isArray(data.forecasts)) {
    return data.forecasts;
  }

  return [];
}

/* =========================================
   ALERTS
========================================= */

export function getAlerts() {
  return fetchJSON("/data/alerts.json");
}

/* =========================================
   HOTSPOTS
========================================= */

export function getHotspots() {
  return fetchJSON("/data/hotspots.json");
}

/* =========================================
   LOCATIONS
========================================= */

export function getLocations() {
  return fetchJSON("/data/locations.json");
}

/* =========================================
   ADVISORIES
========================================= */

export function getAdvisories() {
  return fetchJSON("/data/advisories.json");
}

/* =========================================
   LIVE WEATHER FROM BACKEND
========================================= */

export async function getLiveWeatherData() {
  const response = await fetch("http://localhost:5000/api/weather");

  if (!response.ok) {
    throw new Error(`Failed to load live weather: ${response.status}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to load live weather data.");
  }

  return result.data;
}

/* =========================================
   HELPERS
========================================= */

function getNumber(...values) {
  for (const value of values) {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
}

function clamp(value, min = 0, max = 100) {
  return Math.round(Math.min(max, Math.max(min, value)));
}

function getRiskCategory(score) {
  if (score >= 85) {
    return { risk: "Extreme", severity: "Extreme" };
  }

  if (score >= 70) {
    return { risk: "High", severity: "Severe" };
  }

  if (score >= 50) {
    return { risk: "Elevated", severity: "High" };
  }

  if (score >= 30) {
    return { risk: "Moderate", severity: "Moderate" };
  }

  return { risk: "Low", severity: "Low" };
}

/* =========================================
   AI HEATWAVE PREDICTION
   Rule-based JavaScript prototype
========================================= */

export async function getAIPrediction(regionName) {
  const regions = await getRegions();

  const region = regions.find(
    (item) =>
      String(item.name).toLowerCase() ===
      String(regionName).toLowerCase()
  );

  if (!region) {
    throw new Error(`Prediction data not found for ${regionName}`);
  }

  let liveRecord = null;

  try {
    const liveData = await getLiveWeatherData();

    const records = Array.isArray(liveData)
      ? liveData
      : Array.isArray(liveData?.data)
      ? liveData.data
      : liveData
      ? [liveData]
      : [];

    liveRecord =
      records.find(
        (item) =>
          String(item.region || item.name || "").toLowerCase() ===
          String(regionName).toLowerCase()
      ) || null;
  } catch (error) {
    console.warn(
      "Live weather unavailable. Using regional fallback data.",
      error
    );
  }

  const current = liveRecord?.current || {};
  const forecast = liveRecord?.forecast || {};
  const daily = forecast.daily || forecast;

  const normal = getNumber(region.normal);

  const liveTemperature = getNumber(
    current.temperature_2m,
    current.temperature
  );

  const temperature =
    liveTemperature ??
    getNumber(region.temperature) ??
    0;

  const humidity = getNumber(
    current.relative_humidity_2m,
    current.relative_humidity,
    current.humidity,
    region.humidity
  );

  const apparentTemperature = getNumber(
    current.apparent_temperature,
    current.apparentTemperature
  );

  const forecastMaxima = (
    daily.temperature_2m_max ||
    daily.temperatureMax ||
    daily.maxTemperature ||
    []
  )
    .slice(0, 2)
    .map(Number)
    .filter(Number.isFinite);

  const hasForecast = forecastMaxima.length > 0;

  const predictedTemperature = hasForecast
    ? Math.max(...forecastMaxima)
    : temperature;

  const departure =
    normal !== null
      ? Number((predictedTemperature - normal).toFixed(1))
      : getNumber(region.departure) ?? 0;

  const temperatureScore = clamp(
    ((predictedTemperature - 25) / 20) * 100
  );

  const anomalyScore = clamp(
    ((departure + 1) / 7) * 100
  );

  const humidityScore =
    humidity === null
      ? null
      : clamp(((humidity - 30) / 50) * 100);

  const apparentScore =
    apparentTemperature === null
      ? null
      : clamp(((apparentTemperature - 25) / 20) * 100);

  const scoringFactors = [
    {
      score: temperatureScore,
      weight: 0.45,
      available: predictedTemperature > 0
    },
    {
      score: anomalyScore,
      weight: 0.30,
      available: normal !== null || region.departure !== undefined
    },
    {
      score: humidityScore,
      weight: 0.10,
      available: humidityScore !== null
    },
    {
      score: apparentScore,
      weight: 0.15,
      available: apparentScore !== null
    }
  ];

  const availableWeight = scoringFactors
    .filter((factor) => factor.available)
    .reduce((sum, factor) => sum + factor.weight, 0);

  const riskScore = availableWeight > 0
    ? clamp(
        scoringFactors
          .filter((factor) => factor.available)
          .reduce(
            (sum, factor) => sum + factor.score * factor.weight,
            0
          ) / availableWeight
      )
    : 0;

  const { risk, severity } = getRiskCategory(riskScore);

  let likelihood = "Low Risk";

  if (riskScore >= 85) {
    likelihood = "Very High Risk";
  } else if (riskScore >= 70) {
    likelihood = "High Risk";
  } else if (riskScore >= 50) {
    likelihood = "Elevated Risk";
  } else if (riskScore >= 30) {
    likelihood = "Moderate Risk";
  }

  const dataCoverage = Math.round(
    (
      Number(liveTemperature !== null) +
      Number(hasForecast) +
      Number(normal !== null) +
      Number(humidity !== null) +
      Number(apparentTemperature !== null)
    ) / 5 * 100
  );

  const signedDeparture =
    `${departure >= 0 ? "+" : ""}${departure.toFixed(1)}°C`;

  const factors = [
    {
      name: "Forecast Maximum Temperature",
      value: `${predictedTemperature.toFixed(1)}°C`,
      score: temperatureScore,
      description: hasForecast
        ? "Maximum temperature from the available weather forecast."
        : "Regional fallback temperature used because forecast data is unavailable."
    },
    {
      name: "Temperature Departure",
      value: signedDeparture,
      score: anomalyScore,
      description: normal !== null
        ? "Estimated maximum temperature compared with the configured regional normal."
        : "Uses the configured regional departure because a normal temperature is unavailable."
    },
    {
      name: "Relative Humidity",
      value: humidity === null ? "Unavailable" : `${humidity}%`,
      score: humidityScore ?? 0,
      description: humidity === null
        ? "Humidity is unavailable and excluded from the risk calculation."
        : "Humidity is considered as one indicator of heat stress."
    },
    {
      name: "Apparent Temperature",
      value:
        apparentTemperature === null
          ? "Unavailable"
          : `${apparentTemperature.toFixed(1)}°C`,
      score: apparentScore ?? 0,
      description: apparentTemperature === null
        ? "Apparent temperature is unavailable and excluded from the risk calculation."
        : "Represents how hot conditions may feel."
    }
  ];

  return {
    region: region.name,
    probability: riskScore,
    likelihood,
    confidence: dataCoverage,
    horizon: hasForecast
      ? "Next 24–48 Hours"
      : "Current Conditions — Forecast Unavailable",
    predictedTemperature: Number(predictedTemperature.toFixed(1)),
    departure: Number(departure.toFixed(1)),
    risk,
    severity,
    dataCoverage,
    source: hasForecast
      ? "Live weather forecast"
      : liveTemperature !== null
      ? "Live current weather"
      : "Regional fallback data",
    insight:
      `${region.name} has a rule-based heat-risk score of ` +
      `${riskScore}/100. The estimated maximum temperature is ` +
      `${predictedTemperature.toFixed(1)}°C, approximately ` +
      `${signedDeparture} compared with the configured regional normal.`,
    factors
  };
}
