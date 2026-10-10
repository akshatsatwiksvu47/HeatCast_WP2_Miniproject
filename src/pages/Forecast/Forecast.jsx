import { useEffect, useMemo, useState } from "react";

import {
  getRegions,
} from "../../services/api";

import {
  getLiveWeather,
} from "../../services/weatherApi";

import SeverityBadge from "../../components/SeverityBadge/SeverityBadge";

import "./Forecast.css";


function Forecast() {
  const [regions, setRegions] = useState([]);

  const [selectedRegion, setSelectedRegion] =
    useState("Delhi NCR");

  const [forecastPeriod, setForecastPeriod] =
    useState(7);

  const [forecastData, setForecastData] =
    useState([]);

  const [selectedDay, setSelectedDay] =
    useState(3);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  /* =========================================
     LOAD REGIONS
  ========================================= */

  useEffect(() => {
    getRegions()
      .then((data) => {
        const regionList =
          Array.isArray(data)
            ? data
            : data.regions || [];

        setRegions(regionList);
      })
      .catch((err) => {
        console.error(
          "Regions data error:",
          err
        );

        setError(
          "Unable to load regions."
        );
      });
  }, []);


  /* =========================================
     LOAD LIVE REGION-SPECIFIC FORECAST
  ========================================= */

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getLiveWeather()
      .then((weatherData) => {
        if (cancelled) return;

        const liveRegion = weatherData.find(
          (item) => item.region === selectedRegion
        );

        if (!liveRegion || !Array.isArray(liveRegion.forecast)) {
          throw new Error(`No live forecast found for ${selectedRegion}.`);
        }

        const regionInfo = regions.find(
          (item) => item.name === selectedRegion
        );

        const normal = Number(regionInfo?.normal ?? 0);

        const result = liveRegion.forecast.map((item) => {
          const date = new Date(`${item.date}T12:00:00+05:30`);
          const day = new Intl.DateTimeFormat("en-IN", {
            weekday: "short",
            timeZone: "Asia/Kolkata"
          }).format(date);
          const formattedDate = new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            timeZone: "Asia/Kolkata"
          }).format(date);

          const departure = normal ? Number(item.max) - normal : 0;
          const maxTemperature = Number(item.max);
          const severity =
            maxTemperature >= 42 || departure >= 5 ? "Extreme" :
            maxTemperature >= 39 || departure >= 4 ? "Severe" :
            maxTemperature >= 36 || departure >= 3 ? "High" :
            maxTemperature >= 33 || departure >= 2 ? "Moderate" : "Low";

          return {
            date: formattedDate,
            day,
            max: item.max,
            min: item.min,
            probability: item.precipitationProbability ?? 0,
            severity,
            weatherCode: item.weatherCode,
            isoDate: item.date
          };
        });

        setForecastData(result);
        setSelectedDay(Math.min(3, Math.max(result.length - 1, 0)));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Live forecast data error:", err);
        setForecastData([]);
        setError("Unable to load live forecast data. Check that the backend and weather API are running.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRegion, regions]);

  /* =========================================
     SELECTED REGION
  ========================================= */

  const region = useMemo(() => {
    return (
      regions.find(
        (item) =>
          item.name === selectedRegion
      ) ||
      regions[0] ||
      null
    );
  }, [
    regions,
    selectedRegion,
  ]);


  /* =========================================
     VISIBLE FORECAST
  ========================================= */

  const visibleForecasts =
    forecastData.slice(
      0,
      forecastPeriod
    );


  /* =========================================
     PEAK FORECAST
  ========================================= */

  const peakForecast =
    visibleForecasts.length > 0
      ? visibleForecasts.reduce(
          (highest, current) =>
            Number(current.max) >
            Number(highest.max)
              ? current
              : highest
        )
      : null;


  /* =========================================
     CLASSIFICATION
  ========================================= */

  const classification =
    peakForecast?.severity ||
    "Unavailable";


  /* =========================================
     HEATWAVE STATUS
  ========================================= */

  const heatwaveStatus =
    classification === "Extreme" || classification === "Severe"
      ? "HIGH HEAT RISK"
      : classification === "High"
      ? "ELEVATED HEAT RISK"
      : classification === "Moderate"
      ? "HEAT RISK WATCH"
      : classification === "Low"
      ? "NO ELEVATED HEAT RISK"
      : "FORECAST UNAVAILABLE";


  /* =========================================
     CONFIDENCE
  ========================================= */

  const confidence =
    peakForecast?.probability ?? 0;


  /* =========================================
     LOADING
  ========================================= */

  if (
    loading ||
    regions.length === 0
  ) {
    return (
      <div className="page">

        <div className="page-placeholder">

          <h2>
            Loading forecast data...
          </h2>

        </div>

      </div>
    );
  }


  /* =========================================
     ERROR
  ========================================= */

  if (error) {
    return (
      <div className="page">

        <div className="page-placeholder">

          <h2>
            {error}
          </h2>

        </div>

      </div>
    );
  }


  return (
    <div className="page">


      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            PREDICTION
          </div>

          <h1>
            Forecast & Heatwave Prediction
          </h1>

          <p>
            Live seven-day temperature forecasts with actual calendar dates
            and precipitation probabilities for monitored regions.
          </p>

        </div>

      </div>


      {/* =====================================
          LIVE DATA INFORMATION
      ===================================== */}

      <div className="mock-info">
        <strong>Live weather forecast.</strong>
        <span>
          Temperatures and dates are fetched from the backend weather service.
          The probability shown on each day is precipitation probability,
          not AI-generated heatwave probability. Heatwave risk classification
          is a basic temperature-departure estimate, not an operational warning.
        </span>
      </div>


      {/* =====================================
          CONTROLS
      ===================================== */}

      <section className="forecast-controls">

        <div className="forecast-control-group">

          <label htmlFor="forecast-region">
            REGION
          </label>

          <select
            id="forecast-region"
            value={selectedRegion}
            onChange={(event) => {
              setSelectedRegion(
                event.target.value
              );

              setSelectedDay(0);
            }}
          >

            {regions.map((item) => (

              <option
                key={item.name}
                value={item.name}
              >
                {item.name}
                {item.state
                  ? ` — ${item.state}`
                  : ""}
              </option>

            ))}

          </select>

        </div>


        <div className="forecast-control-group">

          <label>
            FORECAST PERIOD
          </label>

          <div className="period-buttons">

            {[3, 5, 7].map(
              (period) => (

                <button
                  key={period}
                  className={
                    forecastPeriod === period
                      ? "period-btn active"
                      : "period-btn"
                  }
                  onClick={() => {

                    setForecastPeriod(
                      period
                    );

                    setSelectedDay(
                      Math.min(
                        3,
                        period - 1
                      )
                    );

                  }}
                >
                  {period} days
                </button>

              )
            )}

          </div>

        </div>

      </section>


      {/* =====================================
          PREDICTION BANNER
      ===================================== */}

      <section className="prediction-banner">

        <div className="prediction-main">

          <div className="micro-label">

            HEATWAVE PREDICTION •{" "}
            {forecastPeriod}-DAY HORIZON

          </div>

          <h2>
            {heatwaveStatus}
          </h2>

          <div className="prediction-badges">

            <SeverityBadge>
              {classification}
            </SeverityBadge>

            {region?.risk && (
              <SeverityBadge>
                {region.risk}
              </SeverityBadge>
            )}

          </div>

          {peakForecast && (
            <p>
              Expected peak maximum temperature{" "}
              <strong>
                {peakForecast.max}°C
              </strong>{" "}
              on{" "}
              <strong>
                {peakForecast.day}
              </strong>.
            </p>
          )}

        </div>


        <div className="confidence-box">

          <span>
            RAIN PROBABILITY
          </span>

          <strong>
            {confidence}%
          </strong>

          <div className="confidence-bar">

            <div
              style={{
                width:
                  `${confidence}%`,
              }}
            />

          </div>

          <small>
            Precipitation probability for the selected peak day.
          </small>

        </div>

      </section>


      {/* =====================================
          FORECAST CARDS
      ===================================== */}

      <section className="forecast-section">

        <div className="section-heading">

          <div>

            <h3>
              Maximum-temperature forecast
            </h3>

            <p>
              Predicted daily maximum and
              minimum temperatures for{" "}
              {selectedRegion}.
            </p>

          </div>

        </div>


        <div className="forecast-cards">

          {visibleForecasts.map(
            (item, index) => {

              const isPeak =
                peakForecast === item;

              const isSelected =
                selectedDay === index;

              return (
                <button
                  key={
                    `${selectedRegion}-${item.day}-${index}`
                  }
                  className={[
                    "forecast-card",

                    isPeak
                      ? "peak"
                      : "",

                    isSelected
                      ? "selected"
                      : "",

                  ].join(" ")}
                  onClick={() =>
                    setSelectedDay(index)
                  }
                >

                  <div className="forecast-card-top">

                    <strong>
                      {item.day}
                    </strong>

                    <span>
                      {item.date}
                    </span>

                  </div>


                  <div className="forecast-max">

                    {item.max}

                    <small>
                      °C
                    </small>

                  </div>


                  <div className="forecast-min">

                    Min {item.min}°C

                  </div>


                  <SeverityBadge>
                    {item.severity}
                  </SeverityBadge>


                  <div className="forecast-probability">

                    <span>
                      Rain chance
                    </span>

                    <strong>
                      {item.probability}%
                    </strong>

                  </div>


                  <div className="probability-bar">

                    <div
                      style={{
                        width:
                          `${item.probability}%`,
                      }}
                    />

                  </div>

                </button>
              );
            }
          )}

        </div>

      </section>


      {/* =====================================
          SUMMARY CARDS
      ===================================== */}

      <div className="forecast-summary-grid">

        <div className="forecast-summary-card">

          <span>
            FORECAST HORIZON
          </span>

          <strong>
            {forecastPeriod} days
          </strong>

          <small>
            Adjustable request parameter
          </small>

        </div>


        <div className="forecast-summary-card orange">

          <span>
            PEAK DAY
          </span>

          <strong>

            {peakForecast
              ? `${peakForecast.day} (${peakForecast.date})`
              : "—"}

          </strong>

          <small>
            Highest predicted maximum
            temperature
          </small>

        </div>


        <div className="forecast-summary-card red">

          <span>
            CLASSIFICATION
          </span>

          <strong>
            {classification}
          </strong>

          <small>
            Forecast severity classification
          </small>

        </div>

      </div>


      {/* =====================================
          PREDICTION EXPLANATION
      ===================================== */}

      <section className="prediction-explanation">

        <div>

          <h3>
            ⓘ Prediction explanation
          </h3>

          <p>
            These forecasts come from Open-Meteo. The displayed severity is
            a simple temperature-departure estimate and is not an official
            heatwave warning or an AI/ML model prediction.
          </p>

        </div>


        <ul>

          <li>
            Sustained positive departure from
            the regional normal maximum
            temperature.
          </li>

          <li>
            Consecutive days above the working
            heatwave threshold.
          </li>

          <li>
            Night-time minimum temperature
            remains elevated, limiting overnight
            recovery.
          </li>

        </ul>

      </section>

    </div>
  );
}

export default Forecast;