import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { getHotspots, getLiveWeatherData } from "../../services/api";

import SeverityBadge from "../../components/SeverityBadge/SeverityBadge";
import { findLiveRegion, getHeatMetrics } from "../../utils/heatRisk";

import "./Hotspots.css";

function Hotspots() {

  const [hotspots, setHotspots] = useState([]);

  const [selectedHotspot, setSelectedHotspot] = useState(null);

  const [filter, setFilter] = useState("All");
  const [liveWeather, setLiveWeather] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHotspots() {
      try {
        const data = await getHotspots();
        const items = Array.isArray(data)
          ? data
          : data?.hotspots || data?.data || [];

        if (cancelled) return;
        setHotspots(items);
        setSelectedHotspot((current) => current || items[0] || null);
        setLoadError(items.length ? "" : "No hotspot data is available.");
      } catch (error) {
        console.error("Hotspots data error:", error);
        if (!cancelled) {
          setLoadError("Unable to load hotspot data. Check the frontend data and backend connection.");
        }
      }
    }

    async function loadLiveWeather() {
      try {
        const data = await getLiveWeatherData();
        if (!cancelled) {
          setLiveWeather(Array.isArray(data) ? data : data?.data || []);
        }
      } catch (error) {
        console.error("Hotspots live weather error:", error);
      }
    }

    loadHotspots();
    loadLiveWeather();
    const refreshInterval = setInterval(loadLiveWeather, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, []);

  if (!hotspots.length) {
    return (
      <div className="page">
        <div className="page-placeholder">
          <h2>{loadError || "Loading hotspot data..."}</h2>
          {loadError && (
            <button type="button" onClick={() => window.location.reload()}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  /*

   * =====================================================

   * REAL CITY COORDINATES

   * =====================================================

   */

  const cityCoordinates = {

    "Delhi NCR": {

      latitude: 28.6139,

      longitude: 77.2090,

    },

    Jaipur: {

      latitude: 26.9124,

      longitude: 75.7873,

    },

    Lucknow: {

      latitude: 26.8467,

      longitude: 80.9462,

    },

    Patna: {

      latitude: 25.5941,

      longitude: 85.1376,

    },

    Ahmedabad: {

      latitude: 23.0225,

      longitude: 72.5714,

    },

    Kolkata: {

      latitude: 22.5726,

      longitude: 88.3639,

    },

    Nagpur: {

      latitude: 21.1458,

      longitude: 79.0882,

    },

    Mumbai: {

      latitude: 19.0760,

      longitude: 72.8777,

    },

    Bhubaneswar: {

      latitude: 20.2961,

      longitude: 85.8245,

    },

    Hyderabad: {

      latitude: 17.3850,

      longitude: 78.4867,

    },

    Bengaluru: {

      latitude: 12.9716,

      longitude: 77.5946,

    },

    Chennai: {

      latitude: 13.0827,

      longitude: 80.2707,

    },

  };

  /*

   * =====================================================

   * MAP CALIBRATION

   * =====================================================

   */

  const MIN_LONGITUDE = 68.0;

  const MAX_LONGITUDE = 98.0;

  const MIN_LATITUDE = 7.5;

  const MAX_LATITUDE = 37.2;

  /*

   * =====================================================

   * MERCATOR PROJECTION

   * =====================================================

   */

  const mercatorY = (latitude) => {

    const radians =

      (latitude * Math.PI) / 180;

    return Math.log(

      Math.tan(

        Math.PI / 4 +

        radians / 2

      )

    );

  };

  const maxMercatorY =

    mercatorY(MAX_LATITUDE);

  const minMercatorY =

    mercatorY(MIN_LATITUDE);

  /*

   * =====================================================

   * CONVERT GEO COORDINATES TO MAP POSITION

   * =====================================================

   */

  const getMapPosition = (cityName) => {

    const coordinates =

      cityCoordinates[cityName];

    if (!coordinates) {

      return {

        left: 50,

        top: 50,

      };

    }

    const longitudeRatio =

      (

        coordinates.longitude -

        MIN_LONGITUDE

      ) /

      (

        MAX_LONGITUDE -

        MIN_LONGITUDE

      );

    const latitudeMercator =

      mercatorY(

        coordinates.latitude

      );

    const latitudeRatio =

      (

        maxMercatorY -

        latitudeMercator

      ) /

      (

        maxMercatorY -

        minMercatorY

      );

    return {

      left:

        longitudeRatio * 100,

      top:

        latitudeRatio * 100,

    };

  };

  const severityConfig = {
    Low: { color: "#22c55e", glow: "rgba(34,197,94,0.35)" },
    Moderate: { color: "#eab308", glow: "rgba(234,179,8,0.38)" },
    High: { color: "#f97316", glow: "rgba(249,115,22,0.42)" },
    Severe: { color: "#ef4444", glow: "rgba(239,68,68,0.45)" },
    Extreme: { color: "#c026d3", glow: "rgba(192,38,211,0.48)" },
  };

  const normalizeName = (value) =>
    String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  const findLiveWeather = (name) => {
    const wanted = normalizeName(name);
    const aliases = {
      delhincr: ["delhi", "newdelhi", "delhincr"],
      delhi: ["delhi", "newdelhi", "delhincr"],
      mumbai: ["mumbai", "bombay"],
      bengaluru: ["bengaluru", "bangalore"],
    };
    const candidates = aliases[wanted] || [wanted];
    return liveWeather.find((item) => {
      const actual = normalizeName(item.region || item.name || item.city);
      return candidates.includes(actual) || actual === wanted;
    });
  };

  const readNumber = (...values) => {
    for (const value of values) {
      if (value !== undefined && value !== null && value !== "" && Number.isFinite(Number(value))) {
        return Number(value);
      }
    }
    return null;
  };

  const getWeatherValues = (hotspot) => {
    const live = findLiveWeather(hotspot.name);
    const current = live?.current || {};
    const forecast = Array.isArray(live?.forecast) ? live.forecast : [];
    const metrics = getHeatMetrics(hotspot, live);
    const temperature = metrics.temperature;
    const feelsLike = metrics.feelsLike;
    const humidity = metrics.humidity;
    const minimum = metrics.minTemp;
    const forecastMaxima = forecast.map((day) => readNumber(
      day.temperature_2m_max, day.max, day.temperature_max, day.temperatureMax
    )).filter((value) => value !== null);
    const forecastPeak = forecastMaxima.length ? Math.max(...forecastMaxima) : null;
    const normal = metrics.normal;
    const departure = metrics.departure;
    const severity = metrics.severity === "Unavailable" ? "Low" : metrics.severity;
    const risk = metrics.risk === "Unavailable" ? "Low" : metrics.risk;
    const status = metrics.status;
    return {
      ...hotspot,
      liveWeather: live,
      temperature,
      humidity,
      feelsLike,
      minTemp: minimum,
      normal,
      departure,
      forecast: forecast,
      forecastPeak,
      severity,
      risk,
      status,
      severityColor: severityConfig[severity].color,
      severityGlow: severityConfig[severity].glow,
    };
  };

  const dynamicHotspots = hotspots.map(getWeatherValues);
  const selected = dynamicHotspots.find((item) => item.name === selectedHotspot?.name)
    || dynamicHotspots[0];
  const selectedLiveWeather = selected?.liveWeather;
  const liveTemperature = selected?.temperature;
  const liveHumidity = selected?.humidity;
  const liveFeelsLike = selected?.feelsLike;
  const liveMinimum = selected?.minTemp;
  const liveDeparture = selected?.departure;
  const liveForecast = selected?.forecast || [];

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "low": return "hotspot-low";
      case "moderate": return "hotspot-moderate";
      case "high": return "hotspot-high";
      case "severe": return "hotspot-severe";
      case "extreme": return "hotspot-extreme";
      default: return "hotspot-low";
    }
  };

  const filteredHotspots = filter === "All"
    ? dynamicHotspots
    : dynamicHotspots.filter((item) => item.severity.toLowerCase() === filter.toLowerCase());

  return (

    <div className="page hotspots-page">

      {/* ==========================================

          PAGE HEADER

      =========================================== */}

      <div className="page-heading">

        <div>

          <div className="eyebrow">

            HOTSPOTS

          </div>

          <h1>

            Heatwave Hotspot Identification

          </h1>

          <p>

            Geographic view of where heat conditions

            are concentrated. Select a hotspot to inspect

            its live temperature, dynamically calculated heat risk,

            forecast and warning state.

          </p>

        </div>

      </div>

      {/* ==========================================

          FILTERS

      =========================================== */}

      <div className="hotspot-filters">

        {[

          "All",

          "Low",

          "Moderate",

          "High",

          "Severe",
          "Extreme",

        ].map((option) => {

          const count = option === "All"
            ? dynamicHotspots.length
            : dynamicHotspots.filter((item) => item.severity.toLowerCase() === option.toLowerCase()).length;

          return (

            <button

              key={option}

              type="button"

              className={

                filter === option

                  ? "hotspot-filter active"

                  : "hotspot-filter"

              }

              onClick={() =>

                setFilter(option)

              }

            >

              {option}

              <span>

                {count}

              </span>

            </button>

          );

        })}

      </div>

      {/* ==========================================

          MAIN CONTENT

      =========================================== */}

      <div className="hotspots-grid">

        {/* ========================================

            INDIA MAP

        ========================================= */}

        <section className="panel hotspot-map-panel">

          <div className="panel-title-row">

            <div>

              <h3>

                Regional heat concentration

              </h3>

              <p>
                Marker colors and risk levels are recalculated from current weather and the available forecast.
              </p>

            </div>

          </div>

          <div className="india-map-wrapper">

            <div className="india-map-stage">

              <img

                src="/india.svg"

                alt="India heatwave map"

                className="india-map"

              />

              {/* CITY MARKERS */}

              {filteredHotspots.map(

                (hotspot) => {

                  const position =

                    getMapPosition(

                      hotspot.name

                    );

                  const isSelected =

                    selected?.name ===

                    hotspot.name;

                  return (

                    <button

                      key={hotspot.name}

                      type="button"

                      className={`

                        hotspot-marker

                        ${getSeverityClass(

                          hotspot.severity

                        )}

                        ${

                          isSelected

                            ? "selected"

                            : ""

                        }

                      `}

                      style={{
                        left: `${position.left}%`,
                        top: `${position.top}%`,
                        "--severity-color": hotspot.severityColor,
                        "--severity-glow": hotspot.severityGlow,
                      }}

                      onClick={() =>

                        setSelectedHotspot(

                          hotspot

                        )

                      }

                      aria-label={

                        `Select ${hotspot.name}`

                      }

                    >

                      <span className="hotspot-dot" style={{ backgroundColor: hotspot.severityColor, boxShadow: `0 0 0 5px ${hotspot.severityGlow}, 0 0 20px ${hotspot.severityGlow}` }} />

                      <span className="hotspot-label" style={{ color: hotspot.severityColor }}>

                        {hotspot.name}

                      </span>

                    </button>

                  );

                }

              )}

            </div>

            {/* LEGEND */}

            <div className="hotspot-map-legend">

              <div>

                <span className="legend-dot low" style={{ backgroundColor: severityConfig.Low.color }} />

                <span>Low</span>

              </div>

              <div>

                <span className="legend-dot moderate" style={{ backgroundColor: severityConfig.Moderate.color }} />

                <span>Moderate</span>

              </div>

              <div>

                <span className="legend-dot high" style={{ backgroundColor: severityConfig.High.color }} />

                <span>High</span>

              </div>

              <div>
                <span className="legend-dot severe" style={{ backgroundColor: severityConfig.Severe.color }} />
                <span>Severe</span>
              </div>
              <div>
                <span className="legend-dot extreme" style={{ backgroundColor: severityConfig.Extreme.color }} />
                <span>Extreme</span>
              </div>

            </div>
            <p className="hotspot-live-note">Rule-based prototype estimate; not an official IMD warning. Data refreshes every 5 minutes from the backend cache.</p>
          </div>

        </section>

        {/* ========================================

            RIGHT SIDE DETAILS

        ========================================= */}

        <div className="hotspot-details">

          {/* SELECTED HOTSPOT */}

          <section className="panel selected-hotspot-panel">

            <div className="micro-label">

              SELECTED HOTSPOT

            </div>

            <h2>

              {selected.name}

            </h2>

            <span className="location-text">

              {selected.state}

            </span>

            <p className="hotspot-live-note">
              {selectedLiveWeather?.refreshedAt
                ? `Live weather updated ${new Intl.DateTimeFormat("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Asia/Kolkata",
                  }).format(new Date(selectedLiveWeather.refreshedAt))} IST`
                : "Showing available regional data while live weather loads."}
            </p>

            <div className="hotspot-temperature">

              {liveTemperature}

              <small>

                °C

              </small>

            </div>

            <div className="hero-status-line">

              <strong>

                {selected.status}

              </strong>

              <SeverityBadge>

                {selected.severity}

              </SeverityBadge>

              <SeverityBadge>

                {selected.risk}

              </SeverityBadge>

            </div>

            <div className="hotspot-stat-grid">

              <div>

                <span>

                  NORMAL MAX

                </span>

                <strong>

                  {selected.normal}°C

                </strong>

              </div>

              <div>

                <span>

                  DEPARTURE

                </span>

                <strong>

                  {liveDeparture > 0 ? "+" : ""}{liveDeparture ?? "—"}°C

                </strong>

              </div>

              <div>

                <span>

                  MIN TEMP

                </span>

                <strong>

                  {liveMinimum ?? "—"}°C

                </strong>

              </div>

              <div>

                <span>

                  HUMIDITY

                </span>

                <strong>

                  {liveHumidity ?? "—"}%

                </strong>

              </div>

                {liveFeelsLike != null && (
                  <div>
                    <span>FEELS LIKE</span>
                    <strong>{liveFeelsLike}°C</strong>
                  </div>
                )}

            </div>

          </section>

          {/* SHORT RANGE FORECAST */}

          <section className="panel">

            <div className="panel-title-row">

              <h3>

                ☁ Short-range forecast

              </h3>

            </div>

            <div className="hotspot-forecast">
              {liveForecast.length > 0 ? (
                liveForecast.slice(0, 3).map((day, index) => (
                  <div key={day.date || index}>
                    <span>
                      {day.date
                        ? new Intl.DateTimeFormat("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            timeZone: "Asia/Kolkata",
                          }).format(new Date(day.date))
                        : ["Today", "Tomorrow", "Day 3"][index]}
                    </span>
                    <strong>
                      {day.max ?? day.temperature_max ?? day.temperatureMax ?? "—"}°C
                    </strong>
                    <small>
                      Min {day.min ?? day.temperature_min ?? day.temperatureMin ?? "—"}°C
                    </small>
                  </div>
                ))
              ) : (
                <>
                  <div>
                    <span>Current</span>
                    <strong>{liveTemperature ?? "—"}°C</strong>
                    <SeverityBadge>{selected.severity}</SeverityBadge>
                  </div>
                  <div>
                    <span>Forecast</span>
                    <strong>Unavailable</strong>
                    <small>Live forecast not available</small>
                  </div>
                </>
              )}
            </div>

          </section>

          {/* WARNING STATUS */}

          <section

            className={`

              panel

              hotspot-warning-panel

              ${

                ["severe", "extreme"].includes(selected.severity?.toLowerCase())
                  ? selected.severity.toLowerCase()
                  : ""

              }

            `}

          >

            <div className="panel-title-row">

              <h3>

                ⚠ Warning status

              </h3>

            </div>

            <p>

              {selected.severity === "Low"
                ? `Current readings do not indicate elevated heat risk for ${selected.name}.`
                : `${selected.status} detected for ${selected.name} based on the current weather readings.`}

            </p>

            {/* FIXED: NOW NAVIGATES TO ALERTS */}

            <Link

              to="/alerts"

              className="primary-btn"

            >

              View advisory

            </Link>

          </section>

        </div>

      </div>

    </div>

  );

}

export default Hotspots;