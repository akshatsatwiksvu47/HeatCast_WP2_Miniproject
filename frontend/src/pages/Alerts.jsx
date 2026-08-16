import { useState } from "react";
import { alerts, advisories } from "../data/mockData";
import SeverityBadge from "../components/SeverityBadge";

const stakeholders = [
  "Citizen",
  "Farmer",
  "Health Department",
  "Local Authority",
];

export default function Alerts() {
  const [selectedAlert, setSelectedAlert] = useState(alerts[0]);
  const [stakeholder, setStakeholder] = useState("Citizen");

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">EARLY WARNING</div>
          <h1>Alerts & Advisories</h1>
          <p>
            Active warnings translated into actions. Select a warning, then
            choose the stakeholder to see the advisory written for that
            audience.
          </p>
        </div>
      </div>

      <div className="alerts-grid">
        <section>
          <div className="section-heading">
            <h3>Active warnings</h3>
            <span>{alerts.length} in force</span>
          </div>

          <div className="alert-list">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                className={`alert-list-card ${
                  selectedAlert.id === alert.id ? "selected-alert" : ""
                }`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="alert-top">
                  <strong>{alert.title}</strong>
                  <SeverityBadge>{alert.severity}</SeverityBadge>
                </div>

                <span className="alert-id">{alert.id}</span>

                <p>{alert.description}</p>

                <div className="alert-meta">
                  <span>Region<br /><strong>{alert.region}</strong></span>
                  <span>Expected max<br /><strong>{alert.expected}</strong></span>
                  <span>Valid until<br /><strong>{alert.valid}</strong></span>
                </div>

                <span className="alert-action">
                  {selectedAlert.id === alert.id
                    ? "Showing advisory"
                    : "View advisory"}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="section-heading">
            <h3>Advisory</h3>
          </div>

          <div className="panel advisory-main">
            <div className="alert-top">
              <div>
                <span className="alert-id">{selectedAlert.id}</span>
                <h2>{selectedAlert.region}</h2>
              </div>
              <SeverityBadge>{selectedAlert.severity}</SeverityBadge>
            </div>

            <p>
              Issued 15 Aug 2026, 09:00 IST • valid until{" "}
              {selectedAlert.valid}
            </p>

            <div className="advisory-divider"></div>

            <ul className="advisory-points">
              <li>Peak maximum temperature 46–47°C</li>
              <li>Night minimum staying above 30°C</li>
              <li>Low relative humidity, high solar load</li>
              <li>Elevated urban heat island effect in core city</li>
            </ul>

            <div className="stakeholder-grid">
              {stakeholders.map((item) => (
                <button
                  key={item}
                  className={
                    stakeholder === item ? "stakeholder selected" : "stakeholder"
                  }
                  onClick={() => setStakeholder(item)}
                >
                  <strong>{item}</strong>
                  <span>
                    {item === "Citizen"
                      ? "General public safety guidance"
                      : item === "Farmer"
                      ? "Crop, livestock, and field-work guidance"
                      : item === "Health Department"
                      ? "Facility and clinical readiness"
                      : "Municipal heat action response"}
                  </span>
                </button>
              ))}
            </div>

            <div className="advisory-content">
              <div className="advisory-heading">
                <span>♧</span>
                <strong>ADVISORY — {stakeholder.toUpperCase()}</strong>
              </div>

              <h3>
                {stakeholder === "Citizen"
                  ? "Avoid outdoor exposure during peak afternoon hours."
                  : `Recommended actions for ${stakeholder.toLowerCase()}.`}
              </h3>

              <ul>
                {advisories[stakeholder].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="mock-note">
                In the final system, this text will be generated per
                stakeholder by an AI/LLM layer using validated forecast
                output.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}