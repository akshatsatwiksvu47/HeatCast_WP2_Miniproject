import { useEffect, useMemo, useState } from "react";

import {
  getRegions,
  getTemperatureData,
} from "../../services/api";

import SeverityBadge from "../../components/SeverityBadge/SeverityBadge";

import "./Monitoring.css";


function Monitoring() {
  const [regions, setRegions] = useState([]);

  const [selectedRegion, setSelectedRegion] =
    useState("Nagpur");

  const [season, setSeason] =
    useState("Pre-Monsoon");

  const [period, setPeriod] =
    useState("14");

  const [temperatureData, setTemperatureData] =
    useState(null);

  const [chartType, setChartType] =
    useState("line");

  const [hoveredIndex, setHoveredIndex] =
    useState(null);

  const [selectedIndex, setSelectedIndex] =
    useState(null);


  /* =========================
     LOAD REGIONS
  ========================= */

  useEffect(() => {
    getRegions()
      .then((data) => {
        setRegions(data);

        if (
          data.length > 0 &&
          !data.some(
            (item) =>
              item.name === selectedRegion
          )
        ) {
          setSelectedRegion(data[0].name);
        }
      })
      .catch((error) => {
        console.error(
          "Monitoring regions error:",
          error
        );
      });
  }, []);


  /* =========================
     LOAD TEMPERATURE DATA
  ========================= */

  useEffect(() => {
    setTemperatureData(null);
    setHoveredIndex(null);
    setSelectedIndex(null);

    getTemperatureData(selectedRegion)
      .then((data) => {
        setTemperatureData(data);
      })
      .catch((error) => {
        console.error(
          "Monitoring temperature error:",
          error
        );

        setTemperatureData(null);
      });
  }, [selectedRegion]);


  /* =========================
     SELECTED REGION
  ========================= */

  const region = useMemo(() => {
    return (
      regions.find(
        (item) =>
          item.name === selectedRegion
      ) || regions[0]
    );
  }, [regions, selectedRegion]);


  /* =========================
     SEASONAL DATA
  ========================= */

  const seasonalValues = [
    {
      name: "Pre-Monsoon",
      value: 2,
    },
    {
      name: "Summer",
      value: 8,
    },
    {
      name: "Monsoon",
      value: 1,
    },
    {
      name: "Post-Monsoon",
      value: 1,
    },
  ];


  const maxSeasonValue =
    Math.max(
      ...seasonalValues.map(
        (item) => item.value
      )
    );


  /* =========================
     TEMPERATURE DATA
  ========================= */

  const temperatures =
    temperatureData?.temperatures || [];

  const labels =
    temperatureData?.labels || [];

  const normalTemperature =
    region?.normal ??
    temperatureData?.normalTemperature ??
    0;


  let displayedTemperatures =
    temperatures;

  let displayedLabels =
    labels;


  if (period === "7") {
    displayedTemperatures =
      temperatures.slice(-7);

    displayedLabels =
      labels.slice(-7);
  }


  /* =========================
     GRAPH CALCULATIONS
  ========================= */

  const minTemperature =
    displayedTemperatures.length > 0
      ? Math.min(...displayedTemperatures)
      : 0;

  const maxTemperature =
    displayedTemperatures.length > 0
      ? Math.max(...displayedTemperatures)
      : 1;


  const getHeight = (temperature) =>
    ((temperature - minTemperature) /
      (maxTemperature - minTemperature || 1)) *
      85 +
    15;


  /*
    These values are only used for
    positioning the temperature line.
    The normal temperature is NOT
    drawn inside the graph.
  */

  const graphMin =
    Math.floor(minTemperature - 1);

  const graphMax =
    Math.ceil(maxTemperature + 1);

  const graphRange =
    graphMax - graphMin || 1;


  const getLineY = (temperature) =>
    100 -
    ((temperature - graphMin) /
      graphRange) *
      100;


  const activeIndex =
    hoveredIndex !== null
      ? hoveredIndex
      : selectedIndex;


  const toggleSelected = (index) => {
    setSelectedIndex(
      selectedIndex === index
        ? null
        : index
    );
  };


  /* =========================
     LINE POINTS
  ========================= */

  const linePoints =
    displayedTemperatures
      .map((temperature, index) => {
        const x =
          displayedTemperatures.length === 1
            ? 50
            : (
                index /
                (displayedTemperatures.length - 1)
              ) *
              100;

        const y =
          getLineY(temperature);

        return `${x},${y}`;
      })
      .join(" ");


  /* =========================
     LOADING
  ========================= */

  if (!region || !temperatureData) {
    return (
      <div className="page">

        <div className="page-placeholder">

          <h2>
            Loading monitoring data...
          </h2>

        </div>

      </div>
    );
  }


  return (
    <div className="page monitoring-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            LIVE MONITORING
          </div>

          <h1>
            Regional Monitoring
          </h1>

          <p>
            Monitor current temperature,
            humidity, heatwave status and
            risk across regions.
          </p>

        </div>

      </div>


      {/* =========================
          FILTER PANEL
      ========================= */}

      <section className="monitoring-filters">

        {/* REGION */}

        <div className="monitoring-filter-group">

          <label htmlFor="monitoring-region">
            REGION
          </label>

          <select
            id="monitoring-region"
            value={selectedRegion}
            onChange={(event) => {

              setSelectedRegion(
                event.target.value
              );

              setHoveredIndex(null);
              setSelectedIndex(null);

            }}
          >

            {regions.map((item) => (

              <option
                key={item.name}
                value={item.name}
              >
                {item.name}
              </option>

            ))}

          </select>

        </div>


        {/* SEASON */}

        <div className="monitoring-filter-group">

          <label>
            SEASON
          </label>

          <div className="filter-buttons">

            {seasonalValues.map((item) => (

              <button
                key={item.name}
                className={
                  season === item.name
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() =>
                  setSeason(item.name)
                }
              >
                {item.name}
              </button>

            ))}

          </div>

        </div>


        {/* PERIOD */}

        <div className="monitoring-filter-group">

          <label>
            PERIOD
          </label>

          <div className="filter-buttons">

            {[
              {
                value: "7",
                label: "Last 7 days",
              },
              {
                value: "14",
                label: "Last 14 days",
              },
              {
                value: "30",
                label: "Last 30 days",
              },
            ].map((item) => (

              <button
                key={item.value}
                className={
                  period === item.value
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() => {

                  setPeriod(item.value);

                  setHoveredIndex(null);
                  setSelectedIndex(null);

                }}
              >
                {item.label}
              </button>

            ))}

          </div>

        </div>

      </section>


      {/* =========================
          STAT CARDS
      ========================= */}

      <div className="monitoring-stats">

        <div className="monitoring-stat-card">

          <span>
            MAXIMUM TEMPERATURE
          </span>

          <strong>
            {region.temperature}°C
          </strong>

          <small>
            Departure{" "}
            {region.departure >= 0
              ? "+"
              : ""}
            {region.departure}°C
          </small>

        </div>


        <div className="monitoring-stat-card monitoring-stat-red">

          <span>
            HEATWAVE STATUS
          </span>

          <strong>
            {region.status}
          </strong>

          <small>
            {region.severity}
          </small>

        </div>


        <div className="monitoring-stat-card">

          <span>
            MINIMUM TEMPERATURE
          </span>

          <strong>
            {region.minTemp}°C
          </strong>

          <small>
            Night-time recovery indicator
          </small>

        </div>


        <div className="monitoring-stat-card">

          <span>
            RELATIVE HUMIDITY
          </span>

          <strong>
            {region.humidity}%
          </strong>

          <small>
            Trend: {region.trend}
          </small>

        </div>

      </div>


      {/* =========================
          CHARTS
      ========================= */}

      <div className="monitoring-chart-grid">

        {/* TEMPERATURE CHART */}

        <section className="panel monitoring-chart-panel">

          <div className="panel-title-row">

            <div>

              <h3>
                Temperature trend —
                last {period} days
              </h3>

              <p>
                {region.name} — observed maximum
                temperature versus normal.
              </p>

            </div>

          </div>


          {/* CHART CONTROLS */}

          <div className="monitoring-chart-controls">

            <div className="chart-legend">

              <span className="legend-orange"></span>

              Maximum temperature

            </div>


            <div className="monitoring-chart-type">

              <label htmlFor="monitoring-chart-type">
                Chart type
              </label>

              <select
                id="monitoring-chart-type"
                value={chartType}
                onChange={(event) => {

                  setChartType(
                    event.target.value
                  );

                  setHoveredIndex(null);
                  setSelectedIndex(null);

                }}
              >

                <option value="line">
                  Line
                </option>

                <option value="columns">
                  Columns
                </option>

              </select>

            </div>

          </div>


          {/* =========================
              LINE CHART
          ========================= */}

          {chartType === "line" && (

            <div className="monitoring-line-chart">

              <div className="monitoring-grid-lines">

                <span />
                <span />
                <span />
                <span />
                <span />

              </div>


              <svg
                className="monitoring-line-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >

                <polyline
                  points={linePoints}
                  fill="none"
                  stroke="#ff8a1f"
                  strokeWidth="0.7"
                  vectorEffect="non-scaling-stroke"
                />


                {displayedTemperatures.map(
                  (temperature, index) => {

                    const x =
                      displayedTemperatures.length === 1
                        ? 50
                        : (
                            index /
                            (displayedTemperatures.length - 1)
                          ) *
                          100;

                    const y =
                      getLineY(temperature);

                    const isActive =
                      activeIndex === index;

                    return (

                      <g
                        key={`${displayedLabels[index]}-${temperature}`}
                      >

                        {/* Invisible hit area */}

                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="transparent"
                          className="monitoring-hit-area"
                          onMouseEnter={() =>
                            setHoveredIndex(index)
                          }
                          onMouseLeave={() =>
                            setHoveredIndex(null)
                          }
                          onClick={() =>
                            toggleSelected(index)
                          }
                        />


                        {/* Visible point */}

                        <circle
                          cx={x}
                          cy={y}
                          r={
                            isActive
                              ? "2"
                              : "1"
                          }
                          className={
                            isActive
                              ? "monitoring-line-point active"
                              : "monitoring-line-point"
                          }
                          pointerEvents="none"
                          vectorEffect="non-scaling-stroke"
                        />

                      </g>

                    );

                  }
                )}

              </svg>


              {/* TOOLTIP */}

              {activeIndex !== null && (

                <div
                  className="monitoring-tooltip"
                  style={{
                    left: `${
                      displayedTemperatures.length === 1
                        ? 50
                        : (
                            activeIndex /
                            (displayedTemperatures.length - 1)
                          ) *
                          100
                    }%`,
                  }}
                >

                  <strong>
                    {displayedTemperatures[
                      activeIndex
                    ]}°C
                  </strong>

                  <span>
                    {displayedLabels[
                      activeIndex
                    ]}
                  </span>

                </div>

              )}

            </div>

          )}


          {/* =========================
              COLUMN CHART
          ========================= */}

          {chartType === "columns" && (

            <div className="monitoring-column-chart">

              <div className="monitoring-column-grid">

                <span />
                <span />
                <span />
                <span />
                <span />

              </div>


              <div className="monitoring-columns">

                {displayedTemperatures.map(
                  (temperature, index) => {

                    const height =
                      getHeight(temperature);

                    const isActive =
                      activeIndex === index;

                    return (

                      <div
                        key={`${displayedLabels[index]}-${temperature}`}
                        className="monitoring-column-item"
                        onMouseEnter={() =>
                          setHoveredIndex(index)
                        }
                        onMouseLeave={() =>
                          setHoveredIndex(null)
                        }
                        onClick={() =>
                          toggleSelected(index)
                        }
                      >

                        {/* TOOLTIP */}

                        {isActive && (

                          <div className="monitoring-column-tooltip">

                            <strong>
                              {temperature}°C
                            </strong>

                            <span>
                              {displayedLabels[
                                index
                              ]}
                            </span>

                          </div>

                        )}


                        {/* BAR */}

                        <div
                          className={
                            isActive
                              ? "monitoring-temperature-column active"
                              : "monitoring-temperature-column"
                          }
                          style={{
                            height: `${height}%`,
                          }}
                        />

                      </div>

                    );

                  }
                )}

              </div>

            </div>

          )}


          {/* LABELS */}

          <div className="monitoring-chart-labels">

            {displayedLabels.map((label) => (

              <span key={label}>
                {label}
              </span>

            ))}

          </div>


          {/* NORMAL TEMPERATURE */}

          <div className="monitoring-chart-footer">

            Normal temperature:

            <strong>
              {" "}
              {normalTemperature}°C
            </strong>

          </div>

        </section>


        {/* =========================
            SEASONAL ANALYSIS
        ========================= */}

        <section className="panel monitoring-season-panel">

          <div className="panel-title-row">

            <div>

              <h3>
                Seasonal analysis
              </h3>

              <p>
                Heatwave days by season.
              </p>

            </div>

          </div>


          <div className="season-chart">

            {seasonalValues.map((item) => {

              const height =
                (item.value /
                  maxSeasonValue) *
                100;

              const isSelected =
                item.name === season;

              return (

                <button
                  key={item.name}
                  className={
                    isSelected
                      ? "season-column-wrap selected"
                      : "season-column-wrap"
                  }
                  onClick={() =>
                    setSeason(item.name)
                  }
                >

                  <span className="season-value">
                    {item.value}
                  </span>

                  <div
                    className="season-column"
                    style={{
                      height: `${height}%`,
                    }}
                  />

                  <span className="season-label">
                    {item.name}
                  </span>

                </button>

              );

            })}

          </div>

        </section>

      </div>


      {/* =========================
          REGIONAL COMPARISON
      ========================= */}

      <section className="monitoring-comparison">

        <div className="section-heading">

          <div>

            <h3>
              Regional comparison
            </h3>

            <p>
              Current maximum temperature
              across monitored regions.
            </p>

          </div>

        </div>


        <div className="monitoring-table-wrap">

          <table className="monitoring-table">

            <thead>

              <tr>

                <th>REGION</th>
                <th>MAX TEMP</th>
                <th>DEPARTURE</th>
                <th>STATUS</th>
                <th>SEVERITY</th>
                <th>RISK</th>
                <th>TREND</th>

              </tr>

            </thead>


            <tbody>

              {regions.map((item) => {

                const isSelected =
                  item.name === selectedRegion;

                return (

                  <tr
                    key={item.name}
                    className={
                      isSelected
                        ? "selected-region-row"
                        : ""
                    }
                    onClick={() =>
                      setSelectedRegion(
                        item.name
                      )
                    }
                  >

                    <td>

                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.state}
                      </small>

                    </td>


                    <td>
                      {item.temperature}°C
                    </td>


                    <td
                      className={
                        item.departure >= 3
                          ? "departure-high"
                          : ""
                      }
                    >

                      {item.departure >= 0
                        ? "+"
                        : ""}

                      {item.departure}°C

                    </td>


                    <td>

                      <span className="status-badge">
                        {item.status}
                      </span>

                    </td>


                    <td>

                      <SeverityBadge>
                        {item.severity}
                      </SeverityBadge>

                    </td>


                    <td>

                      <SeverityBadge>
                        {item.risk}
                      </SeverityBadge>

                    </td>


                    <td>

                      <span
                        className={`trend-${item.trend}`}
                      >

                        {item.trend === "up" &&
                          "↗"}

                        {item.trend === "down" &&
                          "↘"}

                        {item.trend === "flat" &&
                          "—"}

                      </span>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}


export default Monitoring;