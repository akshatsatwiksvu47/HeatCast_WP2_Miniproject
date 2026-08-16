import { useState } from "react";
import { regions } from "../data/mockData";
import StatCard from "../components/StatCard";
import SeverityBadge from "../components/SeverityBadge";
import TemperatureChart from "../components/TemperatureChart";
import RegionalTable from "../components/RegionalTable";

export default function Dashboard() {
  const [region, setRegion] = useState("Delhi NCR");

  const selected =
    regions.find((item) => item.name === region) || regions[0];

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">DECISION SUPPORT</div>
          <h1>Heatwave Situation Dashboard</h1>
          <p>
            A single-screen view answering what is happening now, what is
            expected next, and which warnings are in force.
          </p>
        </div>

        <div className="heading-control">
          <label>REGION</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {regions.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        </div>
      </div>

      <section className="hero-status">
        <div>
          <div className="micro-label">SELECTED REGION • UPDATED TODAY, 14:25 IST</div>
          <h2>{selected.name}</h2>
          <span className="location-text">{selected.state}</span>

          <div className="hero-temp">
            {selected.temperature.toFixed(1)}
            <small>°C</small>
          </div>

          <div className="hero-status-line">
            <strong>{selected.status}</strong>
            <SeverityBadge>{selected.severity}</SeverityBadge>
            <SeverityBadge>{selected.risk}</SeverityBadge>
          </div>
        </div>

        <div className="hero-mini-grid">
          <div>
            <span>NORMAL MAX</span>
            <strong>{selected.normal.toFixed(1)}°C</strong>
          </div>

          <div>
            <span>DEPARTURE</span>
            <strong>+{selected.departure.toFixed(1)}°C</strong>
          </div>

          <div>
            <span>MIN TEMP</span>
            <strong>{selected.minTemp.toFixed(1)}°C</strong>
          </div>

          <div>
            <span>HUMIDITY</span>
            <strong>{selected.humidity}%</strong>
          </div>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard
          label="MAX TEMPERATURE"
          value="44.6"
          unit="°C"
          subtext="Normal 39.8°C"
        />
        <StatCard
          label="HEATWAVE RISK"
          value="Extreme"
          subtext="HEATWAVE ONGOING"
          tone="red"
        />
        <StatCard
          label="SEVERITY"
          value="Severe"
          subtext="Classification placeholder"
          tone="orange"
        />
        <StatCard
          label="FORECAST PEAK (5D)"
          value="47.3"
          unit="°C"
          subtext="Expected Day 4"
        />
        <StatCard
          label="ACTIVE ALERTS"
          value="4"
          subtext="Across monitored regions"
          tone="red"
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-title-row">
            <div>
              <h3>Temperature trend — last 14 days</h3>
              <p>Observed maximum temperature versus normal.</p>
            </div>
            <div className="chart-legend">
              <span className="legend-orange"></span> Max temp
              <span className="legend-grey"></span> Normal
            </div>
          </div>

          <TemperatureChart />
        </section>

        <section className="panel warning-panel">
          <div className="panel-title-row">
            <h3>Active warning</h3>
          </div>

          <div className="warning-card">
            <div className="warning-title">
              SEVERE HEATWAVE WARNING
            </div>

            <SeverityBadge>Severe</SeverityBadge>

            <p>
              Maximum temperature expected to remain 5–6°C above normal for
              three consecutive days with limited overnight cooling.
            </p>

            <div className="warning-meta">
              <span>Region<br /><strong>Delhi NCR</strong></span>
              <span>Expected max<br /><strong>47.3°C</strong></span>
              <span>Valid until<br /><strong>18 Aug 2026</strong></span>
            </div>
          </div>

          <button className="primary-btn">Open alerts & advisories</button>
        </section>
      </div>

      <section>
        <div className="section-heading">
          <div>
            <h3>Regional summary</h3>
            <p>Select a row to view details on the dashboard region.</p>
          </div>

          <span className="text-link">Go to regional monitoring →</span>
        </div>

        <RegionalTable limit={12} />
      </section>
    </div>
  );
}