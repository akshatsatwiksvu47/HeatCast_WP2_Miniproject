import { useEffect, useState } from "react";

import {
  getRegions,
  getAIPrediction
} from "../../services/api";

import AIPredictionCard
  from "../../components/AIPredictionCard/AIPredictionCard";

import "./Prediction.css";

function Prediction() {

  const [regions, setRegions] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState("");

  const [prediction, setPrediction] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* =========================================
     LOAD REGIONS
  ========================================= */

  useEffect(() => {

    getRegions()

      .then((data) => {

        setRegions(data);

        if (data.length > 0) {
          setSelectedRegion(data[0].name);
        }

      })

      .catch((err) => {

        console.error(
          "Region loading error:",
          err
        );

        setError(
          "Unable to load regional data."
        );

      });

  }, []);


  /* =========================================
     LOAD PREDICTION
  ========================================= */

  useEffect(() => {

    if (!selectedRegion) {
      return;
    }

    setLoading(true);

    getAIPrediction(selectedRegion)

      .then((data) => {
        setPrediction(data);
      })

      .catch((err) => {

        console.error(
          "AI prediction error:",
          err
        );

        setError(
          "Unable to load prediction data."
        );

      })

      .finally(() => {
        setLoading(false);
      });

  }, [selectedRegion]);


  return (
    <div className="prediction-page">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="prediction-page-header">

        <div>

          <span className="prediction-page-kicker">
            CLIMATE INTELLIGENCE
          </span>

          <h1>
            AI Heatwave Prediction
          </h1>

          <p>
            Prediction-focused climate intelligence
            for identifying potential heatwave
            conditions.
          </p>

        </div>


        {/* REGION SELECTOR */}

        <div className="prediction-region-control">

          <label htmlFor="prediction-region">
            Select Region
          </label>

          <select
            id="prediction-region"
            value={selectedRegion}
            onChange={(event) =>
              setSelectedRegion(event.target.value)
            }
          >

            {regions.map((region) => (

              <option
                key={region.name}
                value={region.name}
              >
                {region.name}
              </option>

            ))}

          </select>

        </div>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (

        <div className="prediction-error">
          {error}
        </div>

      )}


      {/* =====================================
          LOADING
      ===================================== */}

      {loading && !error && (

        <div className="prediction-loading">
          Loading prediction for {selectedRegion}...
        </div>

      )}


      {/* =====================================
          PREDICTION
      ===================================== */}

      {!loading &&
        !error &&
        prediction && (

          <AIPredictionCard
            prediction={prediction}
          />

        )}


      {/* =====================================
          FUTURE AI NOTE
      ===================================== */}

      {!loading &&
        !error &&
        prediction && (

          <div className="prediction-page-note">

            <strong>
              Future AI Integration
            </strong>

            <p>
              The current interface provides the
              frontend prediction layer using
              structured climate data. Future
              development can connect this interface
              to a trained machine-learning model
              through a backend prediction API.
            </p>

          </div>

        )}

    </div>
  );
}

export default Prediction;