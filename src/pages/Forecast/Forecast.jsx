
import { useEffect, useMemo, useState } from "react";
import { getRegions } from "../../services/api";
import { getLiveWeather } from "../../services/weatherApi";
import SeverityBadge from "../../components/SeverityBadge/SeverityBadge";
import "./Forecast.css";

const classifyHeatRisk = (max, normal) => {
  const temperature = Number(max);
  const baseline = Number(normal);
  if (!Number.isFinite(temperature)) return "Unavailable";

  const departure =
    Number.isFinite(baseline) && baseline > 0
      ? temperature - baseline
      : null;

  if (temperature >= 42 || (departure !== null && departure >= 5))
    return "Extreme";
  if (temperature >= 39 || (departure !== null && departure >= 4))
    return "Severe";
  if (temperature >= 36 || (departure !== null && departure >= 3))
    return "High";
  if (temperature >= 33 || (departure !== null && departure >= 2))
    return "Moderate";
  return "Low";
};

const getHeatwaveStatus = (severity) => {
  switch (severity) {
    case "Extreme":
    case "Severe":
      return "HIGH HEAT RISK";
    case "High":
      return "ELEVATED HEAT RISK";
    case "Moderate":
      return "HEAT RISK WATCH";
    case "Low":
      return "NO ELEVATED HEAT RISK";
    default:
      return "FORECAST UNAVAILABLE";
  }
};

function Forecast() {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("Delhi NCR");
  const [forecastPeriod, setForecastPeriod] = useState(7);
  const [forecastData, setForecastData] = useState([]);
  const [selectedDay, setSelectedDay] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load configured regions.
  useEffect(() => {
    let cancelled = false;

    getRegions()
      .then((data) => {
        if (cancelled) return;

        const list = Array.isArray(data)
          ? data
          : data?.regions || [];

        setRegions(list);

        if (
          list.length &&
          !list.some((item) => item.name === selectedRegion)
        ) {
          setSelectedRegion(list[0].name);
        }
      })
      .catch((err) => {
        console.error("Regions data error:", err);
        if (!cancelled) setError("Unable to load regions.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch the current live forecast for the selected region.
  useEffect(() => {
    if (!selectedRegion || regions.length === 0) return;

    let cancelled = false;

    const loadForecast = async () => {
      setLoading(true);
      setError(null);

      try {
        const weatherData = await getLiveWeather();
        if (cancelled) return;

        const liveRegion = Array.isArray(weatherData)
          ? weatherData.find(
              (item) =>
                item.region?.trim().toLowerCase() ===
                selectedRegion.trim().toLowerCase()
            )
          : null;

        if (!Array.isArray(liveRegion?.forecast)) {
          throw new Error(`No live forecast found for ${selectedRegion}.`);
        }

        const regionInfo = regions.find(
          (item) => item.name === selectedRegion
        );

        const normal = Number(regionInfo?.normal);
        const validNormal =
          Number.isFinite(normal) && normal > 0 ? normal : null;

        const formatterDay = new Intl.DateTimeFormat("en-IN", {
          weekday: "short",
          timeZone: "Asia/Kolkata",
        });

        const formatterDate = new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short",
          timeZone: "Asia/Kolkata",
        });

        const result = liveRegion.forecast
          .filter(
            (item) =>
              item.date &&
              Number.isFinite(Number(item.max)) &&
              Number.isFinite(Number(item.min))
          )
          .map((item) => {
            // Use midday IST to avoid date changes caused by timezone conversion.
            const date = new Date(`${item.date}T12:00:00+05:30`);
            const max = Number(item.max);
            const min = Number(item.min);
            const departure =
              validNormal !== null ? max - validNormal : null;

            const probability = Number(
              item.precipitationProbability ?? 0
            );

            return {
              isoDate: item.date,
              date: formatterDate.format(date),
              day: formatterDay.format(date),
              max,
              min,
              normal: validNormal,
              departure:
                departure === null
                  ? null
                  : Number(departure.toFixed(1)),
              probability: Number.isFinite(probability)
                ? Math.max(0, Math.min(100, probability))
                : 0,
              severity: classifyHeatRisk(max, validNormal),
              weatherCode: item.weatherCode,
            };
          });

        if (!result.length) {
          throw new Error("The weather service returned no valid forecast days.");
        }

        if (cancelled) return;

        setForecastData(result);
        setSelectedDay(Math.min(3, result.length - 1));
      } catch (err) {
        console.error("Live forecast data error:", err);

        if (!cancelled) {
          setForecastData([]);
          setError(
            "Unable to load live forecast data. Check that the backend and weather API are running."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadForecast();

    return () => {
      cancelled = true;
    };
  }, [selectedRegion, regions]);

  const region = useMemo(
    () =>
      regions.find((item) => item.name === selectedRegion) ||
      null,
    [regions, selectedRegion]
  );

  const visibleForecasts = forecastData.slice(0, forecastPeriod);

  // The peak is the hottest daily maximum within the selected horizon.
  const peakForecast = useMemo(() => {
    if (!visibleForecasts.length) return null;

    return visibleForecasts.reduce((highest, current) =>
      current.max > highest.max ? current : highest
    );
  }, [visibleForecasts]);

  // Use the same classification source for the banner and summary.
  const classification = peakForecast?.severity || "Unavailable";
  const heatwaveStatus = getHeatwaveStatus(classification);

  // Rain probability is precipitation probability, not heatwave probability.
  const rainProbability = peakForecast?.probability ?? null;

  const selectedForecast = visibleForecasts[selectedDay] || null;

  if (loading || regions.length === 0) {
    return (
      <div className="page">
        <div className="page-placeholder">
          <h2>Loading forecast data...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-placeholder">
          <h2>{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* PAGE HEADER */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">PREDICTION</div>
          <h1>Forecast &amp; Heatwave Prediction</h1>
          <p>
            Live temperature forecasts, regional heat-risk estimates,
            and precipitation probabilities for monitored regions.
          </p>
        </div>
      </div>

      {/* DATA INFORMATION */}
      <div className="mock-info">
        <strong>Live weather forecast.</strong>
        <span>
          Forecasts are retrieved from the backend weather service.
          Heat-risk categories use a prototype temperature and regional
          departure rule. Rain probability describes precipitation, not
          the probability of a heatwave. These classifications are not
          official warnings or outputs from a trained AI/ML model.
        </span>
      </div>

      {/* CONTROLS */}
      <section className="forecast-controls">
        <div className="forecast-control-group">
          <label htmlFor="forecast-region">REGION</label>
          <select
            id="forecast-region"
            value={selectedRegion}
            onChange={(event) => {
              setSelectedRegion(event.target.value);
              setSelectedDay(0);
            }}
          >
            {regions.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
                {item.state ? ` — ${item.state}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="forecast-control-group">
          <label>FORECAST PERIOD</label>
          <div className="period-buttons">
            {[3, 5, 7].map((period) => (
              <button
                key={period}
                type="button"
                className={
                  forecastPeriod === period
                    ? "period-btn active"
                    : "period-btn"
                }
                onClick={() => {
                  setForecastPeriod(period);
                  setSelectedDay((current) =>
                    Math.min(current, period - 1, forecastData.length - 1)
                  );
                }}
              >
                {period} days
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PREDICTION BANNER */}
      <section className="prediction-banner">
        <div className="prediction-main">
          <div className="micro-label">
            HEATWAVE PREDICTION • {forecastPeriod}-DAY HORIZON
          </div>

          <h2>{heatwaveStatus}</h2>

          <div className="prediction-badges">
            <SeverityBadge>{classification}</SeverityBadge>
          </div>

          {peakForecast && (
            <p>
              Expected peak maximum temperature{" "}
              <strong>{peakForecast.max.toFixed(1)}°C</strong> on{" "}
              <strong>{peakForecast.day}</strong>
              {peakForecast.departure !== null && (
                <>
                  {" "}({peakForecast.departure >= 0 ? "+" : ""}
                  {peakForecast.departure.toFixed(1)}°C against the
                  configured regional normal).
                </>
              )}
              {peakForecast.departure === null && "."}
            </p>
          )}
        </div>

        <div className="confidence-box">
          <span>RAIN PROBABILITY</span>

          <strong>
            {rainProbability === null ? "—" : `${rainProbability}%`}
          </strong>

          <div className="confidence-bar">
            <div
              style={{
                width: `${rainProbability ?? 0}%`,
              }}
            />
          </div>

          <small>
            Precipitation probability on the forecast peak-temperature day.
          </small>
        </div>
      </section>

      {/* FORECAST CARDS */}
      <section className="forecast-section">
        <div className="section-heading">
          <div>
            <h3>Maximum-temperature forecast</h3>
            <p>
              Daily maximum and minimum temperatures for {selectedRegion}.
              Select a day to inspect it.
            </p>
          </div>
        </div>

        <div className="forecast-cards">
          {visibleForecasts.map((item, index) => {
            const isPeak = peakForecast?.isoDate === item.isoDate;
            const isSelected = selectedDay === index;

            return (
              <button
                type="button"
                key={`${selectedRegion}-${item.isoDate}`}
                className={[
                  "forecast-card",
                  isPeak ? "peak" : "",
                  isSelected ? "selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedDay(index)}
              >
                <div className="forecast-card-top">
                  <strong>{item.day}</strong>
                  <span>{item.date}</span>
                </div>

                <div className="forecast-max">
                  {item.max.toFixed(1)}
                  <small>°C</small>
                </div>

                <div className="forecast-min">
                  Min {item.min.toFixed(1)}°C
                </div>

                <SeverityBadge>{item.severity}</SeverityBadge>

                <div className="forecast-probability">
                  <span>Rain chance</span>
                  <strong>{item.probability}%</strong>
                </div>

                <div className="probability-bar">
                  <div
                    style={{
                      width: `${item.probability}%`,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SUMMARY CARDS */}
      <div className="forecast-summary-grid">
        <div className="forecast-summary-card">
          <span>FORECAST HORIZON</span>
          <strong>{forecastPeriod} days</strong>
          <small>Selected forecast period</small>
        </div>

        <div className="forecast-summary-card orange">
          <span>PEAK DAY</span>
          <strong>
            {peakForecast
              ? `${peakForecast.day} (${peakForecast.date})`
              : "—"}
          </strong>
          <small>
            {peakForecast
              ? `Maximum temperature: ${peakForecast.max.toFixed(1)}°C`
              : "No forecast available"}
          </small>
        </div>

        <div className="forecast-summary-card red">
          <span>PEAK-DAY CLASSIFICATION</span>
          <strong>{classification}</strong>
          <small>Same rule-based classification as the banner</small>
        </div>
      </div>

      {/* SELECTED DAY DETAILS */}
      {selectedForecast && (
        <section className="prediction-explanation">
          <div>
            <h3>ⓘ Selected-day details</h3>
            <p>
              {selectedForecast.day}, {selectedForecast.date}: maximum{" "}
              {selectedForecast.max.toFixed(1)}°C and minimum{" "}
              {selectedForecast.min.toFixed(1)}°C. The classification is{" "}
              {selectedForecast.severity}.
              {selectedForecast.departure !== null
                ? ` Temperature departure from the configured regional normal is ${selectedForecast.departure >= 0 ? "+" : ""}${selectedForecast.departure.toFixed(1)}°C.`
                : " A regional normal temperature is unavailable, so classification uses absolute temperature thresholds."}
            </p>
          </div>

          <ul>
            <li>
              The selected day's risk category is calculated from its
              maximum temperature and, when available, departure from the
              configured regional normal.
            </li>
            <li>
              The banner and summary classification represent the hottest
              daily maximum within the chosen forecast period.
            </li>
            <li>
              Rain probability describes expected precipitation and does
              not measure heatwave probability.
            </li>
          </ul>
        </section>
      )}
    </div>
  );
}

export default Forecast;
