import "./HeatRiskCard.css";

function HeatRiskCard({
  region,
}) {
  if (!region) {
    return null;
  }

  /*
   * =====================================================
   * PROTOTYPE COMPOSITE HEAT RISK SCORE
   * =====================================================
   *
   * This is a frontend prototype score.
   *
   * It combines:
   * - Temperature departure from normal
   * - Current temperature
   * - Humidity
   * - Current severity
   * - Current risk classification
   *
   * Later this can be replaced directly with the
   * backend / ML model's actual risk score.
   */

  const temperature =
    Number(region.temperature) || 0;

  const normal =
    Number(region.normal) || 0;

  const departure =
    Number(region.departure) || 0;

  const humidity =
    Number(region.humidity) || 0;


  const temperatureScore =
    Math.min(
      30,
      Math.max(
        0,
        ((temperature - 30) / 16) * 30
      )
    );


  const anomalyScore =
    Math.min(
      30,
      Math.max(
        0,
        (departure / 8) * 30
      )
    );


  const humidityScore =
    Math.min(
      15,
      Math.max(
        0,
        ((humidity - 40) / 60) * 15
      )
    );


  const severityMap = {
    low: 2,
    moderate: 6,
    high: 11,
    severe: 15,
    extreme: 15,
  };


  const severityScore =
    severityMap[
      region.severity?.toLowerCase()
    ] || 0;


  const riskMap = {
    low: 2,
    moderate: 5,
    high: 8,
    severe: 10,
    extreme: 10,
  };


  const riskScore =
    riskMap[
      region.risk?.toLowerCase()
    ] || 0;


  const rawScore =
    temperatureScore +
    anomalyScore +
    humidityScore +
    severityScore +
    riskScore;


  const score = Math.min(
    100,
    Math.max(
      0,
      Math.round(rawScore)
    )
  );


  let classification = "LOW";
  let tone = "low";

  if (score >= 75) {
    classification = "SEVERE";
    tone = "severe";
  } else if (score >= 55) {
    classification = "HIGH";
    tone = "high";
  } else if (score >= 30) {
    classification = "MODERATE";
    tone = "moderate";
  }


  const temperatureProgress =
    Math.min(
      100,
      (temperatureScore / 30) * 100
    );

  const anomalyProgress =
    Math.min(
      100,
      (anomalyScore / 30) * 100
    );

  const humidityProgress =
    Math.min(
      100,
      (humidityScore / 15) * 100
    );


  return (
    <section
      className={`panel heat-risk-card ${tone}`}
    >

      {/* HEADER */}

      <div className="heat-risk-header">

        <div>

          <div className="micro-label">
            COMPOSITE RISK
          </div>

          <h3>
            Heat Risk Score
          </h3>

        </div>

        <span className="heat-risk-region">
          {region.name}
        </span>

      </div>


      {/* SCORE */}

      <div className="heat-risk-score-area">

        <div className="heat-risk-score">
          {score}
        </div>

        <div className="heat-risk-score-info">

          <strong>
            {classification} RISK
          </strong>

          <span>
            Current regional assessment
          </span>

        </div>

      </div>


      {/* SCORE SCALE */}

      <div className="heat-risk-scale">

        <span className="scale-low">
          LOW
        </span>

        <div className="scale-track">

          <div
            className="scale-fill"
            style={{
              width: `${score}%`,
            }}
          />

          <div
            className="scale-marker"
            style={{
              left: `${score}%`,
            }}
          />

        </div>

        <span className="scale-severe">
          SEVERE
        </span>

      </div>


      {/* CONTRIBUTING FACTORS */}

      <div className="heat-risk-factors">

        <div className="heat-risk-factor">

          <div className="factor-heading">

            <span>
              Temperature anomaly
            </span>

            <strong>
              +{departure}°C
            </strong>

          </div>

          <div className="factor-track">

            <div
              className="factor-fill"
              style={{
                width:
                  `${temperatureProgress}%`,
              }}
            />

          </div>

        </div>


        <div className="heat-risk-factor">

          <div className="factor-heading">

            <span>
              Heatwave severity
            </span>

            <strong>
              {region.severity}
            </strong>

          </div>

          <div className="factor-track">

            <div
              className="factor-fill"
              style={{
                width:
                  `${(severityScore / 15) * 100}%`,
              }}
            />

          </div>

        </div>


        <div className="heat-risk-factor">

          <div className="factor-heading">

            <span>
              Humidity
            </span>

            <strong>
              {humidity}%
            </strong>

          </div>

          <div className="factor-track">

            <div
              className="factor-fill"
              style={{
                width:
                  `${humidityProgress}%`,
              }}
            />

          </div>

        </div>

      </div>


      {/* FOOTNOTE */}

      <div className="heat-risk-note">

        Prototype composite indicator based on
        current regional heat conditions.

      </div>

    </section>
  );
}

export default HeatRiskCard;