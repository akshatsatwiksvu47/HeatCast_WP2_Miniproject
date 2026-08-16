import { useState } from "react";
import { forecast } from "../data/mockData";
import SeverityBadge from "../components/SeverityBadge";

export default function Forecast() {
  const [days, setDays] = useState(7);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PREDICTION</div>
          <h1>Forecast & Heatwave Prediction</h1>
          <p>
            Maximum-temperature forecasting, heatwave prediction, and
            severity classification. This screen is the placeholder for the
            future AI/ML model output.
          </p>
        </div>
      </div>

      <div className="info-banner">
        <strong>ⓘ &nbsp; Mock prediction output.</strong>
        No model is connected yet. Values shown are hand-authored placeholders
        that demonstrate how real forecast, probability, and severity
        responses will be rendered once the dataset and AI/ML service exist.
      </div>

      <section className="filter-panel">
        <div>
          <label>REGION</label>
          <select>
            <option>Delhi NCR — Delhi</option>
            <option>Nagpur — Maharashtra</option>
            <option>Jaipur — Rajasthan</option>
          </select>
        </div>

        <div>
          <label>FORECAST PERIOD</label>
          <div className="button-group">
            {[3, 5, 7].map((item) => (
              <button
                key={item}
                className={days === item ? "selected" : ""}
                onClick={() => setDays(item)}
              >
                {item} days
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="prediction-banner">
        <div>
          <div className="micro-label">HEATWAVE PREDICTION • {days}-DAY HORIZON</div>
          <h2>HEATWAVE ONGOING</h2>
          <div className="badge-row">
            <SeverityBadge>Extreme</SeverityBadge>
            <SeverityBadge>Severe</SeverityBadge>
          </div>
          <p>Expected peak maximum temperature 47.3°C on Day 4.</p>
        </div>

        <div className="confidence">
          <span>PREDICTION CONFIDENCE</span>
          <strong>94<small>%</small></strong>
          <div className="confidence-bar">
            <span></span>
          </div>
          <small>Placeholder value — will come from the model/API</small>
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <h3>Maximum-temperature forecast</h3>
          </div>
        </div>

        <div className="forecast-grid">
          {forecast.map((item, index) => (
            <div
              className={`forecast-card ${
                index === 3 ? "forecast-selected" : ""
              }`}
              key={item.day}
            >
              <strong>{item.day}</strong>
              <small>{item.date}</small>

              <div className="forecast-temp">
                {item.max}
                <small>°C</small>
              </div>

              <div className="forecast-min">
                Min {item.min}°C
              </div>

              <SeverityBadge>{item.severity}</SeverityBadge>

              <div className="probability">
                <span>Probability</span>
                <strong>{item.probability}%</strong>
              </div>

              <div className="probability-bar">
                <span style={{ width: `${item.probability}%` }}></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="stats-grid three">
        <div className="large-info-card">
          <span>FORECAST HORIZON</span>
          <strong>7<small> days</small></strong>
          <p>Adjustable request parameter</p>
        </div>

        <div className="large-info-card orange">
          <span>PEAK DAY</span>
          <strong>Day 4 (18 Aug)</strong>
          <p>Highest predicted maximum temperature</p>
        </div>

        <div className="large-info-card red">
          <span>CLASSIFICATION</span>
          <strong>Severe</strong>
          <p>Severity class placeholder</p>
        </div>
      </div>

      <section className="panel explanation">
        <h3>ⓘ Prediction explanation</h3>
        <p>
          This panel will display the observations and features the model
          actually used. These features are not defined yet, so the notes
          below are generic placeholders.
        </p>

        <ul>
          <li>Sustained positive departure from the regional normal maximum temperature.</li>
          <li>Consecutive days above the working heatwave threshold.</li>
          <li>Night-time minimum temperature remains elevated, limiting overnight recovery.</li>
        </ul>
      </section>
    </div>
  );
}