
import { useEffect, useState } from "react";

import { getRegions, getLiveWeatherData } from "../../services/api";
import { findLiveRegion, getHeatMetrics } from "../../utils/heatRisk";

import SeverityBadge from "../SeverityBadge/SeverityBadge";
import "./RegionalTable.css";

const REFRESH_INTERVAL = 5 * 60 * 1000;

function formatTemperature(value) {
  const number = Number(value);
  return value !== null && value !== undefined && value !== "" &&
    Number.isFinite(number)
    ? `${number.toFixed(1).replace(/\.0$/, "")}°C`
    : "—";
}

function formatDeparture(value) {
  const number = Number(value);

  if (value === null || value === undefined || value === "" ||
      !Number.isFinite(number)) {
    return "—";
  }

  const sign = number > 0 ? "+" : "";
  return `${sign}${number.toFixed(1).replace(/\.0$/, "")}°C`;
}

function RegionalTable() {
  const [regions, setRegions] = useState([]);
  const [liveWeather, setLiveWeather] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRegionalData() {
      try {
        const [regionData, weatherData] = await Promise.all([
          getRegions(),
          getLiveWeatherData(),
        ]);

        if (cancelled) return;

        setRegions(Array.isArray(regionData) ? regionData : []);
        setLiveWeather(Array.isArray(weatherData) ? weatherData : []);
        setError("");
      } catch (err) {
        console.error("Regional table data error:", err);

        if (!cancelled) {
          setError("Unable to load regional weather data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRegionalData();

    const refreshInterval = setInterval(loadRegionalData, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="table-wrap">
        <p>Loading regional weather data...</p>
      </div>
    );
  }

  if (error && regions.length === 0) {
    return (
      <div className="table-wrap">
        <p role="alert">{error} Please check the backend connection.</p>
      </div>
    );
  }

  if (regions.length === 0) {
    return (
      <div className="table-wrap">
        <p>No monitored regions are available.</p>
      </div>
    );
  }

  const dynamicRegions = regions.map((region) => {
    const liveRegion = findLiveRegion(liveWeather, region.name);

    // Never label old static temperatures as live observations.
    if (!liveRegion) {
      return {
        ...region,
        temperature: null,
        departure: null,
        risk: "Unavailable",
        severity: "Unavailable",
        status: "LIVE DATA UNAVAILABLE",
      };
    }

    const metrics = getHeatMetrics(region, liveRegion);

    return {
      ...region,
      ...metrics,
      normal: region.normal,
    };
  });

  return (
    <div className="table-wrap">
      {error && (
        <p role="status">
          Weather refresh failed. Showing the last successfully loaded data.
        </p>
      )}

      <table>
        <thead>
          <tr>
            <th>REGION</th>
            <th>TEMPERATURE</th>
            <th>NORMAL</th>
            <th>DEPARTURE</th>
            <th>RISK</th>
            <th>SEVERITY</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>
          {dynamicRegions.map((region) => (
            <tr key={region.name}>
              <td>
                <strong>{region.name}</strong>
                <small>{region.state || "—"}</small>
              </td>

              <td>{formatTemperature(region.temperature)}</td>

              <td>{formatTemperature(region.normal)}</td>

              <td>{formatDeparture(region.departure)}</td>

              <td>
                <SeverityBadge>{region.risk || "Unavailable"}</SeverityBadge>
              </td>

              <td>
                <SeverityBadge>
                  {region.severity || "Unavailable"}
                </SeverityBadge>
              </td>

              <td>{region.status || "STATUS UNAVAILABLE"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RegionalTable;
