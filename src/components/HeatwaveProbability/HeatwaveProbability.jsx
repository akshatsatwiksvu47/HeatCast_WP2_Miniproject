import "./HeatwaveProbability.css";

function HeatwaveProbability({ region }) {
  if (!region) {
    return null;
  }

  const temperature = Number(region.temperature) || 0;
  const normal = Number(region.normal) || 0;
  const departure = Number(region.departure) || 0;
  const humidity = Number(region.humidity) || 0;

  const severityWeights = {
    low: 0.15,
    moderate: 0.40,
    high: 0.72,
    severe: 0.90,
    extreme: 0.96,
  };

  const riskWeights = {
    low: 0.15,
    moderate: 0.40,
    high: 0.70,
    severe: 0.90,
    extreme: 0.96,
  };

  const severity =
    severityWeights[
      region.severity?.toLowerCase()
    ] ?? 0;

  const risk =
    riskWeights[
      region.risk?.toLowerCase()
    ] ?? 0;

  const anomalyFactor = Math.min(
    1,
    Math.max(
      0,
      departure / 8
    )
  );

  const temperatureFactor = Math.min(
    1,
    Math.max(
      0,
      (temperature - normal) / 8
    )
  );

  const humidityFactor = Math.min(
    1,
    Math.max(
      0,
      (humidity - 40) / 60
    )
  );

  /*
   * Prototype probability model.
   *
   * Later this value can come directly
   * from the backend / ML model.
   */

  const probability = Math.round(
    (
      anomalyFactor * 0.30 +
      temperatureFactor * 0.20 +
      humidityFactor * 0.10 +
      severity * 0.20 +
      risk * 0.20
    ) * 100
  );

  const boundedProbability = Math.min(
    99,
    Math.max(
      1,
      probability
    )
  );

  let classification = "LOW LIKELIHOOD";
  let tone = "low";

  if (boundedProbability >= 75) {
    classification = "HIGH LIKELIHOOD";
    tone = "high";
  } else if (boundedProbability >= 50) {
    classification = "MODERATE LIKELIHOOD";
    tone = "moderate";
  }

  let confidence = "Low";

  if (
    departure >= 4 &&
    region.severity?.toLowerCase() !== "low"
  ) {
    confidence = "High";
  } else if (
    departure >= 2 ||
    region.severity?.toLowerCase() === "moderate"
  ) {
    confidence = "Medium";
  }

  return (
    <section
      className={`panel heatwave-probability-card ${tone}`}
    >

      <div className="probability-header">

        <div>

          <div className="micro-label">
            EARLY WARNING
          </div>

          <h3>
            Heatwave Probability
          </h3>

        </div>

        <span className="probability-region">
          {region.name}
        </span>

      </div>


      <div className="probability-main">

        <div className="probability-number">
          {boundedProbability}
          <small>%</small>
        </div>

        <div className="probability-description">

          <strong>
            {classification}
          </strong>

          <span>
            Estimated likelihood of heatwave
            conditions.
          </span>

        </div>

      </div>


      <div className="probability-bar">

        <div className="probability-track">

          <div
            className="probability-fill"
            style={{
              width:
                `${boundedProbability}%`,
            }}
          />

          <div
            className="probability-marker"
            style={{
              left:
                `${boundedProbability}%`,
            }}
          />

        </div>

      </div>


      <div className="probability-scale">

        <span>
          0%
        </span>

        <span>
          50%
        </span>

        <span>
          100%
        </span>

      </div>


      <div className="probability-details">

        <div>

          <span>
            CONFIDENCE
          </span>

          <strong>
            {confidence}
          </strong>

        </div>


        <div>

          <span>
            TEMPERATURE
          </span>

          <strong>
            {temperature}°C
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


      <div className="probability-note">

        Prototype probability estimate based on
        current regional heat indicators. Final
        probability will be supplied by the
        prediction model.

      </div>

    </section>
  );
}

export default HeatwaveProbability;