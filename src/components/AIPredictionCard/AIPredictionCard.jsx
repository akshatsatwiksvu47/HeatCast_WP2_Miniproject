
import "./AIPredictionCard.css";

function getSeverityClass(severity) {
  const value = String(severity || "moderate").toLowerCase();

  if (value === "low") return "risk-low";
  if (value === "moderate") return "risk-moderate";
  if (value === "elevated") return "risk-high";
  if (value === "high") return "risk-high";
  if (value === "severe") return "risk-severe";
  if (value === "extreme") return "risk-extreme";

  return "risk-moderate";
}

function AIPredictionCard({ prediction }) {
  if (!prediction) {
    return (
      <div className="ai-prediction-card">
        <p>Loading prediction...</p>
      </div>
    );
  }

  const severityClass = getSeverityClass(prediction.severity);
  const factors = Array.isArray(prediction.factors)
    ? prediction.factors
    : [];

  return (
    <div className="ai-prediction-card">
      {/* HEADER */}

      <div className="ai-prediction-header">
        <div>
          <span className="ai-label">
            CLIMATE INTELLIGENCE
          </span>

          <h2>Heatwave Prediction</h2>
        </div>

        <span className="prediction-status">
          RULE-BASED
        </span>
      </div>

      {/* MAIN PREDICTION */}

      <div className="prediction-main">
        <div className={`prediction-score ${severityClass}`}>
          <span className="prediction-score-label">
            Heat Risk Score
          </span>

          <strong>
            {prediction.probability}/100
          </strong>

          <span className="prediction-likelihood">
            {prediction.likelihood}
          </span>
        </div>

        <div className="prediction-summary">
          <p>{prediction.insight}</p>

          <div className="prediction-meta">
            <div>
              <span>REGION</span>
              <strong>{prediction.region}</strong>
            </div>

            <div>
              <span>FORECAST HORIZON</span>
              <strong>{prediction.horizon}</strong>
            </div>

            <div>
              <span>DATA COVERAGE</span>
              <strong>{prediction.dataCoverage ?? prediction.confidence}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* METRICS */}

      <div className="prediction-metrics">
        <div className="prediction-metric">
          <span>Expected Maximum Temperature</span>
          <strong>{prediction.predictedTemperature}°C</strong>
        </div>

        <div className="prediction-metric">
          <span>Expected Departure</span>
          <strong>
            {prediction.departure >= 0
              ? `+${prediction.departure}°C`
              : `${prediction.departure}°C`}
          </strong>
        </div>

        <div className="prediction-metric">
          <span>Risk Level</span>
          <strong>{prediction.risk}</strong>
        </div>

        <div className="prediction-metric">
          <span>Severity</span>
          <strong>{prediction.severity}</strong>
        </div>
      </div>

      {/* PREDICTION FACTORS */}

      <div className="prediction-factors">
        <div className="prediction-section-title">
          Factors Influencing Heat Risk
        </div>

        <div className="factor-list">
          {factors.map((factor) => {
            const score = Math.min(
              100,
              Math.max(0, Number(factor.score) || 0)
            );

            return (
              <div
                className="prediction-factor"
                key={factor.name}
              >
                <div className="factor-top">
                  <span>{factor.name}</span>
                  <strong>{factor.value}</strong>
                </div>

                <div
                  className="factor-bar"
                  role="progressbar"
                  aria-label={`${factor.name} indicator`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={score}
                >
                  <div
                    className="factor-fill"
                    style={{ width: `${score}%` }}
                  />
                </div>

                <small>{factor.description}</small>
              </div>
            );
          })}
        </div>
      </div>

      {/* DATA SOURCE */}

      <div className="prediction-disclaimer">
        <strong>
          Rule-Based Prediction Prototype
        </strong>

        <span>
          {prediction.source
            ? `Data source: ${prediction.source}. `
            : ""}
          The heat-risk score is calculated using available weather
          data and predefined JavaScript rules. It is not a calibrated
          probability, a trained machine-learning prediction, or an
          official heatwave warning.
        </span>
      </div>
    </div>
  );
}

export default AIPredictionCard;
