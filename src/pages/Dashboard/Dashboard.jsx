
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getDashboard,
  getRegions,
} from "../../services/api";

import {
  findLiveRegion,
  getHeatMetrics,
} from "../../utils/heatRisk";

import {
  getLiveWeather,
  getWeatherStatus,
} from "../../services/weatherApi";

import StatCard from "../../components/StatCard/StatCard";
import SeverityBadge from "../../components/SeverityBadge/SeverityBadge";
import TemperatureChart from "../../components/TemperatureChart/TemperatureChart";
import RegionalTable from "../../components/RegionalTable/RegionalTable";
import HeatRiskCard from "../../components/HeatRiskCard/HeatRiskCard";
import HeatwaveProbability from "../../components/HeatwaveProbability/HeatwaveProbability";
import RiskExplanation from "../../components/RiskExplanation/RiskExplanation";
import StakeholderAdvisory from "../../components/StakeholderAdvisory/StakeholderAdvisory";

import "./Dashboard.css";

const REFRESH_INTERVAL = 5 * 60 * 1000;

function validNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatTemperature(value) {
  const number = validNumber(value);
  return number === null ? "—" : `${number.toFixed(1)}°C`;
}

function formatDeparture(value) {
  const number = validNumber(value);

  if (number === null) return "—";

  return `${number > 0 ? "+" : ""}${number.toFixed(1)}°C`;
}

function formatUpdatedAt(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return (
    new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(date) + " IST"
  );
}

function getRiskTitle(severity) {
  switch (severity) {
    case "Extreme":
      return "EXTREME HEAT RISK";
    case "Severe":
      return "SEVERE HEAT RISK";
    case "High":
      return "HIGH HEAT RISK";
    case "Moderate":
      return "MODERATE HEAT RISK";
    case "Low":
      return "LOW HEAT RISK";
    default:
      return "LIVE WEATHER UNAVAILABLE";
  }
}

function getRiskDescription(region, hasLiveWeather) {
  if (!hasLiveWeather) {
    return `Live Open-Meteo weather data is unavailable for ${region.name}. The current risk assessment cannot be confirmed.`;
  }

  const temperature = validNumber(region.temperature);
  const departure = validNumber(region.departure);

  const parts = [
    `HeatCast's rule-based assessment for ${region.name}.`,
  ];

  if (temperature !== null) {
    parts.push(`Current air temperature is ${temperature.toFixed(1)}°C.`);
  } else {
    parts.push("Current air temperature is unavailable.");
  }

  if (departure !== null) {
    parts.push(
      `The temperature departure from the regional reference is ${
        departure > 0 ? "+" : ""
      }${departure.toFixed(1)}°C.`
    );
  }

  parts.push(
    "This is a project risk assessment, not an official meteorological warning."
  );

  return parts.join(" ");
}

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("Delhi NCR");

  const [liveWeather, setLiveWeather] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStaticStructure() {
      try {
        const [dashboardData, regionData] = await Promise.all([
          getDashboard(),
          getRegions(),
        ]);

        if (cancelled) return;

        setDashboard(dashboardData);
        setRegions(Array.isArray(regionData) ? regionData : []);
      } catch (error) {
        console.error("Dashboard setup data error:", error);
      }
    }

    async function loadWeather() {
      try {
        const [weatherData, statusData] = await Promise.all([
          getLiveWeather(),
          getWeatherStatus().catch(() => []),
        ]);

        if (cancelled) return;

        setLiveWeather(Array.isArray(weatherData) ? weatherData : []);
        setWeatherError(false);

        const latestStatus = Array.isArray(statusData)
          ? statusData
              .map((item) => item.refreshedAt)
              .filter(Boolean)
              .sort()
              .at(-1)
          : null;

        const latestRecord = Array.isArray(weatherData)
          ? weatherData
              .map((item) => item.refreshedAt || item.updatedAt)
              .filter(Boolean)
              .sort()
              .at(-1)
          : null;

        setLastUpdated(latestStatus || latestRecord || null);
      } catch (error) {
        console.error("Live weather request failed:", error);

        if (!cancelled) {
          setWeatherError(true);
        }
      } finally {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      }
    }

    loadStaticStructure();
    loadWeather();

    const intervalId = setInterval(loadWeather, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  if (!dashboard || regions.length === 0) {
    return (
      <div className="page">
        <div className="page-placeholder">
          <h2>Loading HeatCast data...</h2>
        </div>
      </div>
    );
  }

  const baseRegion =
    regions.find((item) => item.name === selectedRegion) || regions[0];

  const liveRegion = findLiveRegion(liveWeather, baseRegion?.name);
  const metrics = getHeatMetrics(baseRegion, liveRegion);

  // Never present a static regional temperature as a live observation.
  const hasLiveWeather = Boolean(liveRegion && metrics.hasLiveWeather);

  const region = {
    ...baseRegion,
    ...metrics,
    temperature: hasLiveWeather ? metrics.temperature : null,
    heatIndicator: hasLiveWeather ? metrics.heatIndicator : null,
    humidity: hasLiveWeather ? metrics.humidity : null,
    minTemp: hasLiveWeather ? metrics.minTemp : null,
    departure: hasLiveWeather ? metrics.departure : null,
    severity: hasLiveWeather ? metrics.severity : "Unavailable",
    risk: hasLiveWeather ? metrics.risk : "Unavailable",
    status: hasLiveWeather ? metrics.status : "LIVE WEATHER UNAVAILABLE",
    hasLiveWeather,
  };

  const dynamicRegions = regions.map((item) => {
    const itemLive = findLiveRegion(liveWeather, item.name);
    const itemMetrics = getHeatMetrics(item, itemLive);
    const itemHasLive = Boolean(itemLive && itemMetrics.hasLiveWeather);

    return {
      ...item,
      ...itemMetrics,
      temperature: itemHasLive ? itemMetrics.temperature : null,
      severity: itemHasLive ? itemMetrics.severity : "Unavailable",
      status: itemHasLive ? itemMetrics.status : "LIVE WEATHER UNAVAILABLE",
      hasLiveWeather: itemHasLive,
    };
  });

  const availableRegions = dynamicRegions.filter(
    (item) => item.hasLiveWeather && validNumber(item.temperature) !== null
  );

  const hottestRegion = [...availableRegions].sort(
    (a, b) => Number(b.temperature) - Number(a.temperature)
  )[0];

  const riskRank = {
    Low: 0,
    Moderate: 1,
    High: 2,
    Severe: 3,
    Extreme: 4,
  };

  const highestRiskRegion = [...availableRegions]
    .filter((item) => item.severity in riskRank)
    .sort(
      (a, b) =>
        riskRank[b.severity] - riskRank[a.severity]
    )[0];

  const updatedLabel =
    formatUpdatedAt(lastUpdated) ||
    (weatherLoading ? "Loading weather..." : "Update time unavailable");

  const warningTitle = getRiskTitle(region.severity);

  return (
    <div className="page">
      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">DECISION SUPPORT</div>

          <h1>Heatwave Situation Dashboard</h1>

          <p>
            A single-screen view of current heat conditions, risk,
            forecasts and heat advisories.
          </p>
        </div>

        <div className="heading-control">
          <label htmlFor="region-select">REGION</label>

          <select
            id="region-select"
            value={region.name}
            onChange={(event) => setSelectedRegion(event.target.value)}
          >
            {regions.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CURRENT REGION STATUS */}
      <section className="hero-status">
        <div className="hero-main">
          <div className="micro-label">
            SELECTED REGION • {updatedLabel}
          </div>

          <h2>{region.name}</h2>

          <span className="location-text">{region.state}</span>

          <p className="live-weather-note">
            {hasLiveWeather
              ? weatherError
                ? "Showing the last successfully retrieved weather record."
                : `Weather data connected${metrics.refreshedAt
                    ? ` · Updated ${formatUpdatedAt(metrics.refreshedAt)}`
                    : ""}`
              : weatherLoading
                ? "Retrieving weather data..."
                : "Live weather unavailable — current conditions cannot be confirmed."}
          </p>

          <div className="hero-temp">
            {formatTemperature(region.temperature) === "—"
              ? "—"
              : Number(region.temperature).toFixed(1)}
            {validNumber(region.temperature) !== null && <small>°C</small>}
          </div>

          <div className="hero-status-line">
            <strong>{region.status}</strong>
            <SeverityBadge>{region.severity}</SeverityBadge>
            <SeverityBadge>{region.risk}</SeverityBadge>
          </div>
        </div>

        <div className="hero-mini-grid">
          <div>
            <span>NORMAL MAX</span>
            <strong>{formatTemperature(region.normal)}</strong>
          </div>

          <div>
            <span>DEPARTURE</span>
            <strong>{formatDeparture(region.departure)}</strong>
          </div>

          <div>
            <span>MIN TEMP</span>
            <strong>{formatTemperature(region.minTemp)}</strong>
          </div>

          <div>
            <span>HUMIDITY</span>
            <strong>
              {validNumber(region.humidity) === null
                ? "—"
                : `${Number(region.humidity).toFixed(0)}%`}
            </strong>
          </div>
        </div>
      </section>

      {/* SUMMARY STAT CARDS */}
      <div className="stats-grid">
        <StatCard
          label="MAX TEMPERATURE"
          value={
            hottestRegion
              ? Number(hottestRegion.temperature).toFixed(1)
              : "—"
          }
          unit={hottestRegion ? "°C" : ""}
          subtext={
            hottestRegion
              ? `Current reading · ${hottestRegion.name}`
              : "Live data unavailable"
          }
        />

        <StatCard
          label="HEATWAVE RISK"
          value={highestRiskRegion?.severity || "Unavailable"}
          subtext={highestRiskRegion?.status || "Live data unavailable"}
          tone="red"
        />

        <StatCard
          label="SEVERITY"
          value={region.severity}
          subtext="Selected region classification"
          tone="orange"
        />

        <StatCard
          label="FORECAST PEAK"
          value="—"
          subtext="Forecast maximum not available in this view"
        />

        <StatCard
          label="ACTIVE ALERTS"
          value="—"
          subtext="Official alert count not connected"
          tone="red"
        />
      </div>

      {/* HEAT INTELLIGENCE */}
      <div className="dashboard-intelligence-grid">
        <HeatRiskCard region={region} />
        <HeatwaveProbability region={region} />
      </div>

      {/* RISK + STAKEHOLDER INTELLIGENCE */}
      <div className="dashboard-support-grid">
        <div className="dashboard-support-risk">
          <RiskExplanation region={region} />
        </div>

        <div className="dashboard-support-advisory">
          <StakeholderAdvisory region={region} />
        </div>
      </div>

      {/* TEMPERATURE + CURRENT HEAT ADVISORY */}
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-title-row">
            <div>
              <h3>Temperature trend</h3>
              <p>
                Available temperature data for the selected region.
                Historical observations are shown only when available.
              </p>
            </div>

            <div className="chart-legend">
              <span className="legend-orange" />
              Temperature
            </div>
          </div>

          <TemperatureChart
            regionName={region.name}
            normalTemperature={region.normal}
          />
        </section>

        {/* DYNAMIC HEAT ADVISORY */}
        <section className="panel warning-panel">
          <div className="panel-title-row">
            <h3>Current heat advisory</h3>
          </div>

          <div className="warning-card">
            <div className="warning-title">{warningTitle}</div>

            <SeverityBadge>{region.severity}</SeverityBadge>

            <p>{getRiskDescription(region, hasLiveWeather)}</p>

            <div className="warning-meta">
              <span>
                Region
                <strong>{region.name}</strong>
              </span>

              <span>
                Current temperature
                <strong>{formatTemperature(region.temperature)}</strong>
              </span>

              <span>
                Departure from normal
                <strong>{formatDeparture(region.departure)}</strong>
              </span>
            </div>
          </div>

          <Link to="/alerts" className="primary-btn">
            Open alerts & advisories
          </Link>
        </section>
      </div>

      {/* REGIONAL SUMMARY */}
      <section>
        <div className="section-heading">
          <div>
            <h3>Regional summary</h3>
            <p>Current heat conditions across monitored regions.</p>
          </div>

          <Link to="/monitoring" className="text-link">
            Regional monitoring →
          </Link>
        </div>

        <RegionalTable />
      </section>
    </div>
  );
}

export default Dashboard;
