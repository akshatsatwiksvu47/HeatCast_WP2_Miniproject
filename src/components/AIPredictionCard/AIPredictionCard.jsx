import "./AIPredictionCard.css";


function getSeverityClass(severity) {

  const value = String(severity).toLowerCase();


  if (value === "low") {
    return "risk-low";
  }


  if (value === "moderate") {
    return "risk-moderate";
  }


  if (value === "high") {
    return "risk-high";
  }


  if (value === "severe") {
    return "risk-severe";
  }


  if (value === "extreme") {
    return "risk-extreme";
  }


  return "risk-moderate";
}


function AIPredictionCard({ prediction }) {

  if (!prediction) {

    return (
      <div className="ai-prediction-card">

        <p>
          Loading AI prediction...
        </p>

      </div>
    );

  }


  const severityClass =
    getSeverityClass(prediction.severity);


  return (
    <div className="ai-prediction-card">


      {/* =========================================
          HEADER
      ========================================= */}

      <div className="ai-prediction-header">

        <div>

          <span className="ai-label">
            AI PREDICTION
          </span>

          <h2>
            Heatwave Prediction
          </h2>

        </div>


        <span className="prediction-status">
          MODEL READY
        </span>

      </div>



      {/* =========================================
          MAIN PREDICTION
      ========================================= */}

      <div className="prediction-main">


        {/* PROBABILITY */}

        <div
          className={
            `prediction-score ${severityClass}`
          }
        >

          <span className="prediction-score-label">
            Predicted Probability
          </span>


          <strong>
            {prediction.probability}%
          </strong>


          <span className="prediction-likelihood">
            {prediction.likelihood}
          </span>

        </div>



        {/* SUMMARY */}

        <div className="prediction-summary">

          <p>
            {prediction.insight}
          </p>


          <div className="prediction-meta">


            <div>

              <span>
                REGION
              </span>

              <strong>
                {prediction.region}
              </strong>

            </div>


            <div>

              <span>
                HORIZON
              </span>

              <strong>
                {prediction.horizon}
              </strong>

            </div>


            <div>

              <span>
                CONFIDENCE
              </span>

              <strong>
                {prediction.confidence}%
              </strong>

            </div>


          </div>

        </div>

      </div>



      {/* =========================================
          METRICS
      ========================================= */}

      <div className="prediction-metrics">


        <div className="prediction-metric">

          <span>
            Predicted Temperature
          </span>

          <strong>
            {prediction.predictedTemperature}°C
          </strong>

        </div>



        <div className="prediction-metric">

          <span>
            Expected Departure
          </span>

          <strong>
            {prediction.departure >= 0
              ? `+${prediction.departure}°C`
              : `${prediction.departure}°C`}
          </strong>

        </div>



        <div className="prediction-metric">

          <span>
            Risk Level
          </span>

          <strong>
            {prediction.risk}
          </strong>

        </div>



        <div className="prediction-metric">

          <span>
            Severity
          </span>

          <strong>
            {prediction.severity}
          </strong>

        </div>


      </div>



      {/* =========================================
          PREDICTION FACTORS
      ========================================= */}

      <div className="prediction-factors">


        <div className="prediction-section-title">
          Prediction Factors
        </div>


        <div className="factor-list">


          {prediction.factors.map((factor) => (

            <div
              className="prediction-factor"
              key={factor.name}
            >


              <div className="factor-top">

                <span>
                  {factor.name}
                </span>

                <strong>
                  {factor.value}
                </strong>

              </div>



              <div className="factor-bar">

                <div
                  className="factor-fill"
                  style={{
                    width: `${factor.score}%`
                  }}
                />

              </div>



              <small>
                {factor.description}
              </small>


            </div>

          ))}


        </div>

      </div>



      {/* =========================================
          DISCLAIMER
      ========================================= */}

      <div className="prediction-disclaimer">

        <strong>
          Prototype Prediction Layer
        </strong>

        <span>
          This interface is prepared for future ML
          model integration. Current values are
          structured prediction data used by the
          frontend.
        </span>

      </div>


    </div>
  );
}


export default AIPredictionCard;