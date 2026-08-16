import { useState } from "react";
import { regions } from "../data/mockData";
import SeverityBadge from "../components/SeverityBadge";

export default function Hotspots() {
  const [selected, setSelected] = useState("Nagpur");

  const region =
    regions.find((item) => item.name === selected) || regions[3];

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">HOTSPOTS</div>
          <h1>Heatwave Hotspot Identification</h1>
          <p>
            Geographic view of where heat conditions are concentrated. Select a
            hotspot to inspect its temperature, status, severity, forecast,
            and warning state.
          </p>
        </div>
      </div>

      <div className="filter-tabs">
        {["All regions (12)", "Low (2)", "Moderate (4)", "High (4)", "Severe (2)"].map(
          (item, index) => (
            <button className={index === 0 ? "selected" : ""} key={item}>
              {item}
            </button>
          )
        )}
      </div>

      <div className="hotspot-grid">
        <section className="india-map panel">
          <div className="map-placeholder">
            <div className="india-shape"></div>

            {regions.slice(0, 10).map((item, index) => {
              const positions = [
                [47, 27],
                [38, 33],
                [61, 32],
                [55, 43],
                [68, 47],
                [42, 52],
                [58, 55],
                [49, 63],
                [62, 66],
                [38, 67],
              ];

              const [left, top] = positions[index];

              return (
                <button
                  key={item.name}
                  className={`map-point ${
                    item.name === selected ? "map-selected" : ""
                  } ${item.risk.toLowerCase()}`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  onClick={() => setSelected(item.name)}
                  title={item.name}
                >
                  <span></span>
                  <label>{item.name}</label>
                </button>
              );
            })}

            <div className="map-legend">
              <span><i className="dot low-dot"></i> Low</span>
              <span><i className="dot moderate-dot"></i> Moderate</span>
              <span><i className="dot high-dot"></i> High</span>
              <span><i className="dot severe-dot"></i> Severe</span>
            </div>
          </div>
        </section>

        <aside className="hotspot-side">
          <section className="panel selected-hotspot">
            <div className="micro-label">SELECTED HOTSPOT</div>
            <h2>{region.name}</h2>
            <p>{region.state}</p>

            <div className="hotspot-temp">
              ♨ {region.temperature.toFixed(1)}<small>°C</small>
            </div>

            <div className="badge-row">
              <SeverityBadge>{region.status}</SeverityBadge>
              <SeverityBadge>{region.severity}</SeverityBadge>
              <SeverityBadge>{region.risk}</SeverityBadge>
            </div>

            <div className="hotspot-stats">
              <div>
                <span>NORMAL MAX</span>
                <strong>{region.normal}°C</strong>
              </div>

              <div>
                <span>DEPARTURE</span>
                <strong>+{region.departure}°C</strong>
              </div>

              <div>
                <span>MIN TEMP</span>
                <strong>{region.minTemp}°C</strong>
              </div>

              <div>
                <span>HUMIDITY</span>
                <strong>{region.humidity}%</strong>
              </div>
            </div>
          </section>

          <section className="panel">
            <h3>♨ SHORT-RANGE FORECAST</h3>

            {["Today", "Tomorrow", "Day 3"].map((day, index) => (
              <div className="mini-forecast" key={day}>
                <span>{day}</span>
                <strong>{[43.8, 44.9, 46.0][index]}°C</strong>
                <SeverityBadge>
                  {index === 2 ? "High" : "Moderate"}
                </SeverityBadge>
              </div>
            ))}
          </section>

          <section className="panel warning-status">
            <h3>♧ WARNING STATUS</h3>
            <p>
              Severe heatwave warning in force until 17 Aug 2026, 20:00 IST.
            </p>
            <button className="primary-btn">View advisory</button>
          </section>
        </aside>
      </div>
    </div>
  );
}