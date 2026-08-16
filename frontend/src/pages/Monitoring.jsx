import { useState } from "react";
import { regions, seasonalValues } from "../data/mockData";
import StatCard from "../components/StatCard";
import TemperatureChart from "../components/TemperatureChart";
import RegionalTable from "../components/RegionalTable";
import SeverityBadge from "../components/SeverityBadge";

export default function Monitoring() {
  const [selectedRegion, setSelectedRegion] = useState("Nagpur");
  const [season, setSeason] = useState("Summer");
  const [period, setPeriod] = useState("Last 14 days");

  const region =
    regions.find((item) => item.name === selectedRegion) || regions[3];

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">MONITORING</div>
          <h1>Regional Heat Monitoring</h1>
          <p>
            Region-wise and seasonal analysis of observed heat conditions.
            Filters shape the query that will later be sent to the backend API.
          </p>
        </div>
      </div>

      <section className="filter-panel">
        <div>
          <label>REGION</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regions.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>SEASON</label>
          <div className="button-group">
            {["Pre-Monsoon", "Summer", "Monsoon", "Post-Monsoon"].map(
              (item) => (
                <button
                  key={item}
                  className={season === item ? "selected" : ""}
                  onClick={() => setSeason(item)}
                >
                  {item}
                </button>
              )
            )}
          </div>
        </div>

        <div>
          <label>PERIOD</label>
          <div className="button-group">
            {["Last 7 days", "Last 14 days", "Last 30 days"].map((item) => (
              <button
                key={item}
                className={period === item ? "selected" : ""}
                onClick={() => setPeriod(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="stats-grid four">
        <StatCard
          label="MAXIMUM TEMPERATURE"
          value={region.temperature.toFixed(1)}
          unit="°C"
          subtext={`Departure +${region.departure.toFixed(1)}°C`}
        />

        <StatCard
          label="HEATWAVE STATUS"
          value="Ongoing"
          subtext={region.severity}
          tone="red"
        />

        <StatCard
          label="MINIMUM TEMPERATURE"
          value={region.minTemp.toFixed(1)}
          unit="°C"
          subtext="Night-time recovery indicator"
        />

        <StatCard
          label="RELATIVE HUMIDITY"
          value={region.humidity}
          unit="%"
          subtext="Trend: stable"
        />
      </div>

      <div className="monitor-grid">
        <section className="panel">
          <div className="panel-title-row">
            <div>
              <h3>Temperature trend — last 14 days</h3>
              <p>{region.name} — observed maximum vs normal.</p>
            </div>
          </div>

          <TemperatureChart compact />
        </section>

        <section className="panel">
          <h3>Seasonal analysis</h3>
          <p>Heatwave days per season.</p>

          <div className="season-chart">
            {seasonalValues.map((item) => (
              <div className="season-column" key={item.name}>
                <div
                  className={`season-bar ${
                    item.name === "Summer" ? "selected-bar" : ""
                  }`}
                  style={{ height: `${item.value * 22}px` }}
                ></div>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <div className="section-heading">
          <div>
            <h3>Regional comparison</h3>
            <p>Current maximum temperature across monitored regions.</p>
          </div>
        </div>

        <RegionalTable />
      </section>
    </div>
  );
}