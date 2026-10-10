
import { useEffect, useState } from "react";

import {
  getRegions,
  getAIPrediction
} from "../../services/api";

import AIPredictionCard from "../../components/AIPredictionCard/AIPredictionCard";

import "./Prediction.css";

const REFRESH_INTERVAL = 60 * 1000;

function Prediction() {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load available regions
  useEffect(() => {
    let cancelled = false;

    async function loadRegions() {
      try {
        const data = await getRegions();

        if (cancelled) return;

        setRegions(data);

        if (data.length > 0) {
          setSelectedRegion(data[0].name);
        } else {
          setError("No regional data is available.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Region loading error:", err);

        if (!cancelled) {
          setError("Unable to load regional data.");
          setLoading(false);
        }
      }
    }

    loadRegions();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load prediction and refresh automatically
  useEffect(() => {
    if (!selectedRegion) return;

    let cancelled = false;
    let requestInProgress = false;

    async function loadPrediction(isInitial = false) {
      if (requestInProgress || cancelled) return;

      requestInProgress = true;

      if (isInitial) {
        setLoading(true);
      }

      try {
        const data = await getAIPrediction(selectedRegion);

        if (cancelled) return;

        setPrediction(data);
        setLastUpdated(new Date());
        setError("");
      } catch (err) {
        console.error("Prediction loading error:", err);

        if (!cancelled) {
          setError(
            "Unable to refresh prediction data. Please check your connection."
          );
        }
      } finally {
        requestInProgress = false;

        if (!cancelled && isInitial) {
          setLoading(false);
        }
      }
    }

    loadPrediction(true);

    const intervalId = setInterval(() => {
      loadPrediction(false);
    }, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [selectedRegion]);

  function formatUpdatedTime(date) {
    if (!date) return "Waiting for first update";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  return (
    <div className="prediction-page">
      {/* PAGE HEADER */}
      <div className="prediction-page-header">
        <div>
          <span className="prediction-page-kicker">
            CLIMATE INTELLIGENCE
          </span>

          <h1>AI Heatwave Prediction</h1>

          <p>
            Analyze regional weather conditions and estimate
            potential heatwave risk with automatically refreshed
            prediction data.
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
            disabled={regions.length === 0}
          >
            {regions.map((region) => (
              <option key={region.name} value={region.name}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AUTO-REFRESH STATUS */}
      <div
        className="prediction-page-note"
        aria-live="polite"
      >
        <strong>
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: error ? "#d97706" : "#16a34a",
              marginRight: "8px"
            }}
          />
          Automatic Refresh Enabled
        </strong>

        <p>
          Predictions refresh every 60 seconds while this page
          remains open. Last successful calculation:{" "}
          {formatUpdatedTime(lastUpdated)}.
        </p>

        <p>
          The backend updates stored weather hourly. Predictions
          only change when the weather or forecast data used by
          the calculation changes.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="prediction-error" role="alert">
          {error}
        </div>
      )}

      {/* INITIAL LOADING */}
      {loading && (
        <div className="prediction-loading">
          Loading prediction for {selectedRegion}...
        </div>
      )}

      {/* PREDICTION CARD */}
      {!loading && prediction && (
        <AIPredictionCard prediction={prediction} />
      )}

      {/* NO PREDICTION */}
      {!loading && !error && !prediction && (
        <div className="prediction-loading">
          No prediction is currently available.
        </div>
      )}
    </div>
  );
}

export default Prediction;
