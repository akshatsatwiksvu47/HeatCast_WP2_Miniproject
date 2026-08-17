import { useEffect, useState } from "react";
import { getHotspots } from "../../services/api";
import SeverityBadge from "../../components/SeverityBadge/SeverityBadge";
import "./Hotspots.css";

function Hotspots() {
  const [hotspots, setHotspots] = useState([]);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    getHotspots()
      .then((data) => {
        setHotspots(data);

        if (data.length > 0) {
          setSelectedHotspot(data[0]);
        }
      })
      .catch((error) => {
        console.error("Hotspots data error:", error);
      });
  }, []);

  if (!hotspots.length) {
    return (
      <div className="page">
        <div className="page-placeholder">
          <h2>Loading hotspot data...</h2>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * REAL CITY COORDINATES
   * =====================================================
   *
   * Actual latitude / longitude values.
   * These are converted into positions on the
   * India SVG below.
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
   *
   * Based on the India SVG currently being used.
   *
   * These are geographic bounds, NOT city positions.
   */

  const MIN_LONGITUDE = 68.0;
  const MAX_LONGITUDE = 98.0;

  const MIN_LATITUDE = 7.5;
  const MAX_LATITUDE = 37.2;


  /*
   * Web Mercator projection.
   *
   * This gives us proper geographic spacing vertically
   * instead of treating latitude as a simple flat number.
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
   * Convert latitude / longitude into percentage
   * coordinates inside the map.
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


    /*
     * Longitude:
     *
     * West  -> 0%
     * East  -> 100%
     */

    const longitudeRatio =
      (
        coordinates.longitude -
        MIN_LONGITUDE
      ) /
      (
        MAX_LONGITUDE -
        MIN_LONGITUDE
      );


    /*
     * Latitude:
     *
     * North -> 0%
     * South -> 100%
     */

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


  /*
   * =====================================================
   * SEVERITY
   * =====================================================
   */

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "low":
        return "hotspot-low";

      case "moderate":
        return "hotspot-moderate";

      case "high":
        return "hotspot-high";

      case "severe":
        return "hotspot-severe";

      default:
        return "hotspot-moderate";
    }
  };


  /*
   * =====================================================
   * FILTER
   * =====================================================
   */

  const filteredHotspots =
    filter === "All"
      ? hotspots
      : hotspots.filter(
          (item) =>
            item.severity?.toLowerCase() ===
            filter.toLowerCase()
        );


  const selected =
    selectedHotspot || hotspots[0];


  return (
    <div className="page hotspots-page">

      {/* ================================================
          HEADER
      ================================================= */}

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
            its temperature, status, severity, forecast
            and warning state.
          </p>

        </div>

      </div>


      {/* ================================================
          FILTERS
      ================================================= */}

      <div className="hotspot-filters">

        {[
          "All",
          "Low",
          "Moderate",
          "High",
          "Severe",
        ].map((option) => {

          const count =
            option === "All"
              ? hotspots.length
              : hotspots.filter(
                  (item) =>
                    item.severity?.toLowerCase() ===
                    option.toLowerCase()
                ).length;

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


      {/* ================================================
          MAIN CONTENT
      ================================================= */}

      <div className="hotspots-grid">


        {/* ==============================================
            INDIA MAP
        =============================================== */}

        <section className="panel hotspot-map-panel">

          <div className="panel-title-row">

            <div>

              <h3>
                Regional heat concentration
              </h3>

              <p>
                Monitored regions across India.
              </p>

            </div>

          </div>


          <div className="india-map-wrapper">

            {/* ==========================================
                MAP
            =========================================== */}

            <div className="india-map-stage">

              <img
                src="/india.svg"
                alt="India heatwave map"
                className="india-map"
              />


              {/* ========================================
                  CITY MARKERS
              ========================================= */}

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
                        left:
                          `${position.left}%`,

                        top:
                          `${position.top}%`,
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

                      <span className="hotspot-dot" />

                      <span className="hotspot-label">
                        {hotspot.name}
                      </span>

                    </button>
                  );
                }
              )}

            </div>


            {/* ==========================================
                LEGEND
                OUTSIDE THE MAP
            =========================================== */}

            <div className="hotspot-map-legend">

              <div>
                <span className="legend-dot low" />
                <span>Low</span>
              </div>

              <div>
                <span className="legend-dot moderate" />
                <span>Moderate</span>
              </div>

              <div>
                <span className="legend-dot high" />
                <span>High</span>
              </div>

              <div>
                <span className="legend-dot severe" />
                <span>Severe</span>
              </div>

            </div>

          </div>

        </section>


        {/* ==============================================
            RIGHT DETAILS
        =============================================== */}

        <div className="hotspot-details">


          {/* ============================================
              SELECTED HOTSPOT
          ============================================= */}

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


            <div className="hotspot-temperature">

              {selected.temperature}

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
                  +{selected.departure}°C
                </strong>

              </div>


              <div>

                <span>
                  MIN TEMP
                </span>

                <strong>
                  {selected.minTemp}°C
                </strong>

              </div>


              <div>

                <span>
                  HUMIDITY
                </span>

                <strong>
                  {selected.humidity}%
                </strong>

              </div>

            </div>

          </section>


          {/* ============================================
              SHORT RANGE FORECAST
          ============================================= */}

          <section className="panel">

            <div className="panel-title-row">

              <h3>
                ☁ Short-range forecast
              </h3>

            </div>


            <div className="hotspot-forecast">

              <div>

                <span>
                  Today
                </span>

                <strong>
                  {selected.temperature}°C
                </strong>

                <SeverityBadge>
                  {selected.severity}
                </SeverityBadge>

              </div>


              <div>

                <span>
                  Tomorrow
                </span>

                <strong>
                  {(
                    Number(
                      selected.temperature
                    ) + 0.8
                  ).toFixed(1)}
                  °C
                </strong>

                <SeverityBadge>
                  {selected.severity}
                </SeverityBadge>

              </div>


              <div>

                <span>
                  Day 3
                </span>

                <strong>
                  {(
                    Number(
                      selected.temperature
                    ) + 1.5
                  ).toFixed(1)}
                  °C
                </strong>

                <SeverityBadge>
                  {selected.risk}
                </SeverityBadge>

              </div>

            </div>

          </section>


          {/* ============================================
              WARNING STATUS
          ============================================= */}

          <section
            className={`
              panel
              hotspot-warning-panel
              ${
                selected.severity?.toLowerCase() ===
                "severe"
                  ? "severe"
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

              {selected.status ===
              "NO HEATWAVE"
                ? `No active heatwave warning for ${selected.name}.`
                : `Heatwave conditions are currently being monitored for ${selected.name}.`}

            </p>


            <button
              type="button"
              className="primary-btn"
            >
              View advisory
            </button>

          </section>

        </div>

      </div>

    </div>
  );
}

export default Hotspots;