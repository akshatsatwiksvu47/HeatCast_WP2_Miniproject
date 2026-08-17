import { useState } from "react";
import "./RiskExplanation.css";

function RiskExplanation({ region }) {
  const [expanded, setExpanded] = useState(true);

  if (!region) {
    return null;
  }

  const temperature = Number(region.temperature) || 0;
  const normal = Number(region.normal) || 0;
  const departure = Number(region.departure) || 0;
  const humidity = Number(region.humidity) || 0;
  const minTemperature = Number(region.minTemp) || 0;

  const severity =
    region.severity || "Unknown";

  const risk =
    region.risk || "Unknown";

  const status =
    region.status || "Monitoring";

  /*
   * =====================================================
   * RISK FACTORS
   * =====================================================
   */

  const factors = [];


  /*
   * TEMPERATURE ANOMALY
   */

  if (departure >= 5) {
    factors.push({
      type: "critical",
      label: "Temperature anomaly",
      value: `+${departure}°C`,
      description:
        `The current maximum temperature is ${departure}°C above the normal maximum for ${region.name}.`,
    });
  } else if (departure >= 3) {
    factors.push({
      type: "high",
      label: "Temperature anomaly",
      value: `+${departure}°C`,
      description:
        `The current temperature is significantly above the normal maximum for ${region.name}.`,
    });
  } else if (departure >= 1) {
    factors.push({
      type: "moderate",
      label: "Temperature anomaly",
      value: `+${departure}°C`,
      description:
        `The current temperature is above the normal maximum for the region.`,
    });
  } else {
    factors.push({
      type: "low",
      label: "Temperature anomaly",
      value: `${departure >= 0 ? "+" : ""}${departure}°C`,
      description:
        "The current temperature is close to the normal maximum.",
    });
  }


  /*
   * ABSOLUTE TEMPERATURE
   */

  if (temperature >= 45) {
    factors.push({
      type: "critical",
      label: "Extreme temperature",
      value: `${temperature}°C`,
      description:
        "The observed maximum temperature is at an extreme level and contributes strongly to heatwave risk.",
    });
  } else if (temperature >= 42) {
    factors.push({
      type: "high",
      label: "High temperature",
      value: `${temperature}°C`,
      description:
        "The observed maximum temperature is high enough to contribute significantly to heat stress.",
    });
  } else if (temperature >= 38) {
    factors.push({
      type: "moderate",
      label: "Elevated temperature",
      value: `${temperature}°C`,
      description:
        "The observed maximum temperature is elevated and is being monitored for heatwave conditions.",
    });
  } else {
    factors.push({
      type: "low",
      label: "Maximum temperature",
      value: `${temperature}°C`,
      description:
        "The current maximum temperature is not at an extreme level.",
    });
  }


  /*
   * HUMIDITY
   */

  if (humidity >= 75) {
    factors.push({
      type: "critical",
      label: "Humidity",
      value: `${humidity}%`,
      description:
        "High humidity can reduce the body's ability to cool through evaporation and may increase heat stress.",
    });
  } else if (humidity >= 60) {
    factors.push({
      type: "high",
      label: "Humidity",
      value: `${humidity}%`,
      description:
        "Moderately high humidity may increase perceived heat stress.",
    });
  } else if (humidity >= 40) {
    factors.push({
      type: "moderate",
      label: "Humidity",
      value: `${humidity}%`,
      description:
        "Humidity is contributing moderately to the overall heat conditions.",
    });
  } else {
    factors.push({
      type: "low",
      label: "Humidity",
      value: `${humidity}%`,
      description:
        "Humidity is relatively low and is contributing less to heat stress.",
    });
  }


  /*
   * NIGHTTIME / MINIMUM TEMPERATURE
   */

  if (minTemperature >= 32) {
    factors.push({
      type: "critical",
      label: "Minimum temperature",
      value: `${minTemperature}°C`,
      description:
        "The high minimum temperature indicates limited nighttime cooling.",
    });
  } else if (minTemperature >= 28) {
    factors.push({
      type: "high",
      label: "Minimum temperature",
      value: `${minTemperature}°C`,
      description:
        "The elevated minimum temperature may reduce nighttime recovery from heat exposure.",
    });
  } else {
    factors.push({
      type: "low",
      label: "Minimum temperature",
      value: `${minTemperature}°C`,
      description:
        "Nighttime temperatures are comparatively lower, allowing greater nighttime cooling.",
    });
  }


  /*
   * SEVERITY / RISK
   */

  const severityLower =
    severity.toLowerCase();

  const riskLower =
    risk.toLowerCase();

  let overallMessage =
    `Current conditions in ${region.name} are being monitored.`;

  if (
    severityLower === "severe" ||
    severityLower === "extreme" ||
    riskLower === "severe" ||
    riskLower === "extreme"
  ) {
    overallMessage =
      `${region.name} is currently experiencing severe heat conditions requiring close monitoring and timely response.`;
  } else if (
    severityLower === "high" ||
    riskLower === "high"
  ) {
    overallMessage =
      `${region.name} is showing elevated heat conditions with indicators consistent with high heatwave risk.`;
  } else if (
    severityLower === "moderate" ||
    riskLower === "moderate"
  ) {
    overallMessage =
      `${region.name} is experiencing moderate heat conditions and should continue to be monitored.`;
  } else {
    overallMessage =
      `${region.name} is currently showing comparatively lower heatwave risk based on the available indicators.`;
  }


  return (
    <section
      className={`panel risk-explanation-card ${
        expanded ? "expanded" : "collapsed"
      }`}
    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="risk-explanation-header">

        <div>

          <div className="micro-label">
            EXPLAINABLE RISK
          </div>

          <h3>
            Why is {region.name} at {risk.toLowerCase()} risk?
          </h3>

        </div>


        <button
          type="button"
          className="risk-explanation-toggle"
          onClick={() =>
            setExpanded(!expanded)
          }
          aria-label={
            expanded
              ? "Collapse risk explanation"
              : "Expand risk explanation"
          }
        >
          {expanded ? "−" : "+"}
        </button>

      </div>


      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <div className="risk-explanation-summary">

        <div
          className={`risk-summary-indicator ${severityLower}`}
        >
          <span className="risk-summary-dot" />

          <strong>
            {severity}
          </strong>

        </div>


        <p>
          {overallMessage}
        </p>

      </div>


      {/* =====================================================
          FACTORS
      ====================================================== */}

      {expanded && (

        <div className="risk-factors">

          {factors.map(
            (factor, index) => (

              <div
                className="risk-factor"
                key={`${factor.label}-${index}`}
              >

                <div
                  className={`risk-factor-indicator ${factor.type}`}
                />

                <div className="risk-factor-content">

                  <div className="risk-factor-heading">

                    <span>
                      {factor.label}
                    </span>

                    <strong>
                      {factor.value}
                    </strong>

                  </div>

                  <p>
                    {factor.description}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      )}


      {/* =====================================================
          CURRENT STATUS
      ====================================================== */}

      {expanded && (

        <div className="risk-explanation-footer">

          <div>

            <span>
              CURRENT STATUS
            </span>

            <strong>
              {status}
            </strong>

          </div>


          <div>

            <span>
              NORMAL MAX
            </span>

            <strong>
              {normal}°C
            </strong>

          </div>


          <div>

            <span>
              DEPARTURE
            </span>

            <strong>
              +{departure}°C
            </strong>

          </div>

        </div>

      )}

    </section>
  );
}

export default RiskExplanation;