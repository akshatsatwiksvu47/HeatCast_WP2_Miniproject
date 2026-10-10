// Shared rule-based heat-risk calculation used across HeatCast pages.
// This is a prototype classification, not an official IMD warning.
const numberOrNull = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return null;
};

export const findLiveRegion = (records, name) => {
  const wanted = String(name || "").trim().toLowerCase();
  return (Array.isArray(records) ? records : []).find(
    (item) => String(item?.region || item?.name || "").trim().toLowerCase() === wanted
  ) || null;
};

export function getHeatMetrics(region = {}, liveRecord = null) {
  const current = liveRecord?.current || {};
  const today = Array.isArray(liveRecord?.forecast) ? liveRecord.forecast[0] || {} : {};
  const temperature = numberOrNull(
    current.temperature_2m, current.temperature, region.temperature
  );
  const feelsLike = numberOrNull(
    current.apparent_temperature, current.apparentTemperature, current.feelsLike,
    current.apparent_temp, region.feelsLike
  );
  const humidity = numberOrNull(
    current.relative_humidity_2m, current.relative_humidity, current.humidity, region.humidity
  );
  const minimum = numberOrNull(
    today.min, today.temperature_2m_min, today.temperature_min, today.temperatureMin,
    region.minTemp
  );
  const forecastMaximum = numberOrNull(
    today.max, today.temperature_2m_max, today.temperature_max, today.temperatureMax
  );
  const normal = numberOrNull(region.normal, region.normalMax, region.normal_max);
  const departure = temperature !== null && normal !== null
    ? Number((temperature - normal).toFixed(1))
    : numberOrNull(region.departure);

  // Current status uses current air temperature and Open-Meteo's apparent temperature.
  // Do not reuse the old static severity/risk labels from JSON.
  // Use the same rule set on Dashboard, Monitoring and Hotspots.
  // Current apparent temperature is preferred when the provider supplies it.
  const heatIndicator = Math.max(temperature ?? -Infinity, feelsLike ?? -Infinity);
  const validHeatIndicator = Number.isFinite(heatIndicator) ? heatIndicator : null;

  let severity = "Unavailable";
  if (validHeatIndicator !== null) {
    if (validHeatIndicator >= 42 || departure >= 5) severity = "Extreme";
    else if (validHeatIndicator >= 39 || departure >= 4) severity = "Severe";
    else if (validHeatIndicator >= 36 || departure >= 3) severity = "High";
    else if (validHeatIndicator >= 33 || departure >= 2) severity = "Moderate";
    else severity = "Low";

    // High humidity can raise one level only when it is already hot.
    if (feelsLike === null && humidity !== null && humidity >= 70 && validHeatIndicator >= 33) {
      const levels = ["Low", "Moderate", "High", "Severe", "Extreme"];
      severity = levels[Math.min(levels.indexOf(severity) + 1, levels.length - 1)];
    }
  }

  const statusBySeverity = {
    Low: "NO ELEVATED HEAT RISK",
    Moderate: "HEAT RISK WATCH",
    High: "ELEVATED HEAT RISK",
    Severe: "HIGH HEAT RISK",
    Extreme: "HIGH HEAT RISK",
    Unavailable: "LIVE WEATHER UNAVAILABLE",
  };

  return {
    temperature: temperature === null ? region.temperature : Number(temperature.toFixed(1)),
    feelsLike: feelsLike === null ? null : Number(feelsLike.toFixed(1)),
    humidity,
    minTemp: minimum,
    forecastMaximum,
    normal,
    departure,
    heatIndicator: validHeatIndicator === null ? null : Number(validHeatIndicator.toFixed(1)),
    severity,
    risk: severity,
    status: statusBySeverity[severity],
    hasLiveWeather: Boolean(liveRecord && current && Object.keys(current).length),
    refreshedAt: liveRecord?.refreshedAt || liveRecord?.updatedAt || null,
  };
}

export const severityClass = (severity) =>
  `risk-${String(severity || "unavailable").toLowerCase().replace(/[^a-z]+/g, "-")}`;
