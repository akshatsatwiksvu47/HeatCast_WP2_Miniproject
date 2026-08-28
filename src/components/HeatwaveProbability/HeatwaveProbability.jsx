import "./HeatwaveProbability.css";

function HeatwaveProbability({ region }) {
  if (!region) {
    return null;
  }

  /*
   * =====================================================
   * PROTOTYPE HEATWAVE PROBABILITY
   * =====================================================
   *
   * Current frontend prototype estimate.
   *
   * It uses available regional indicators and can later
   * be replaced by the output of an ML prediction model.
   */

  const temperature =
    Number(region.temperature) || 0;

  const departure =
    Number(region.departure) || 0;

  const humidity =
    Number(region.humidity) || 0;


  /*
   * Prototype probability calculation.
   */

  const temperatureFactor = Math.min(
    30,
    Math.max(
      0,
      ((temperature - 35) / 12) * 30
    )
  );


  const departureFactor = Math.min(
    30,
    Math.max(
      0,
      (departure / 8) * 30
    )
  );


  const humidityFactor = Math.min(
    20,
    Math.max(
      0,
      ((humidity - 30) / 60) * 20
    )
  );


  const severityMap = {
    low: 5,
    moderate: 10,
    high: 15,
    severe: 20,
    extreme: 20,
  };


  const severityFactor =
    severityMap[
      region.severity?.toLowerCase()
    ] || 0;


  const probability = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        temperatureFactor +
        departureFactor +
        humidityFactor +
        severityFactor
      )
    )
  );


  let likelihood = "LOW";
  let tone = "low";


  if (probability >= 75) {
    likelihood = "HIGH";
    tone = "high";
  } else if (probability >= 45) {
    likelihood = "MODERATE";
    tone = "moderate";
  }


  /*
   * Prototype confidence.
   */

  let confidence = "Moderate";

  if (probability >= 70) {
    confidence = "High";
  } else if (probability < 40) {
    confidence = "Low";
  }


  return (
    <section
      className={`panel heatwave-probability-card ${tone}`}
    >

      {/* HEADER */}

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


      {/* MAIN PROBABILITY */}

      <div className="probability-main">

        <div className="probability-number">
          {probability}
          <small>%</small>
        </div>

        <div className="probability-description">

          <strong>
            {likelihood} LIKELIHOOD
          </strong>

          <span>
            Estimated likelihood of heatwave
            conditions.
          </span>

        </div>

      </div>


      {/* PROBABILITY BAR */}

      <div className="probability-bar">

        <div className="probability-track">

          <div
            className="probability-fill"
            style={{
              width: `${probability}%`,
            }}
          />

          <div
            className="probability-marker"
            style={{
              left: `${probability}%`,
            }}
          />

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

      </div>


      {/* DETAILS */}

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


      {/* NOTE */}

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