import { useEffect, useMemo, useState } from "react";

import {
  getRegions,
  getTemperatureData,
} from "../../services/api";

import SeverityBadge from "../../components/SeverityBadge/SeverityBadge";

import "./Monitoring.css";


function Monitoring() {

  const [regions, setRegions] =
    useState([]);

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

  /*
   * Regional comparison selections.
   * Maximum of 4 regions can be compared.
   */
  const [comparisonRegions, setComparisonRegions] =
    useState([]);


  /* =====================================================
     LOAD REGIONS
  ===================================================== */

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
          setSelectedRegion(
            data[0].name
          );
        }

        /*
         * Start comparison with first
         * two available regions.
         */
        if (data.length > 1) {

          setComparisonRegions([
            data[0].name,
            data[1].name,
          ]);

        } else if (data.length === 1) {

          setComparisonRegions([
            data[0].name,
          ]);

        }

      })
      .catch((error) => {

        console.error(
          "Monitoring regions error:",
          error
        );

      });

  }, []);


  /* =====================================================
     LOAD TEMPERATURE DATA
  ===================================================== */

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


  /* =====================================================
     SELECTED REGION
  ===================================================== */

  const region = useMemo(() => {

    return (
      regions.find(
        (item) =>
          item.name === selectedRegion
      ) || regions[0]
    );

  }, [
    regions,
    selectedRegion,
  ]);


  /* =====================================================
     SEASONAL DATA
  ===================================================== */

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


  /* =====================================================
     TEMPERATURE DATA
  ===================================================== */

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


  /*
   * If 30 days is selected but the
   * JSON has fewer values, use all
   * available values.
   */
  if (period === "30") {

    displayedTemperatures =
      temperatures.slice(-30);

    displayedLabels =
      labels.slice(-30);

  }


  /* =====================================================
     GRAPH CALCULATIONS
  ===================================================== */

  const minTemperature =
    displayedTemperatures.length > 0
      ? Math.min(
          ...displayedTemperatures
        )
      : 0;


  const maxTemperature =
    displayedTemperatures.length > 0
      ? Math.max(
          ...displayedTemperatures
        )
      : 1;


  const getHeight = (temperature) => {

    return (
      (
        (temperature -
          minTemperature) /
        (
          maxTemperature -
          minTemperature ||
          1
        )
      ) *
        85 +
      15
    );

  };


  /*
   * These values are only used
   * for positioning the line.
   *
   * Normal temperature is NOT
   * drawn inside the graph.
   */

  const graphMin =
    Math.floor(
      minTemperature - 1
    );


  const graphMax =
    Math.ceil(
      maxTemperature + 1
    );


  const graphRange =
    graphMax -
      graphMin ||
    1;


  const getLineY = (temperature) => {

    return (
      100 -
      (
        (
          temperature -
          graphMin
        ) /
        graphRange
      ) *
        100
    );

  };


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


  /* =====================================================
     LINE POINTS
  ===================================================== */

  const linePoints =
    displayedTemperatures
      .map(
        (
          temperature,
          index
        ) => {

          const x =
            displayedTemperatures.length === 1
              ? 50
              : (
                  index /
                  (
                    displayedTemperatures.length -
                    1
                  )
                ) *
                100;


          const y =
            getLineY(
              temperature
            );


          return `${x},${y}`;

        }
      )
      .join(" ");


  /* =====================================================
     REGIONAL COMPARISON
  ===================================================== */

  const comparisonData =
    comparisonRegions
      .map(
        (name) =>
          regions.find(
            (item) =>
              item.name === name
          )
      )
      .filter(Boolean);


  /*
   * Select / deselect a region.
   *
   * Maximum = 4 regions.
   */

  const toggleComparisonRegion = (
    regionName
  ) => {

    setComparisonRegions(
      (current) => {

        if (
          current.includes(
            regionName
          )
        ) {

          return current.filter(
            (name) =>
              name !== regionName
          );

        }


        if (
          current.length >= 4
        ) {

          return current;

        }


        return [
          ...current,
          regionName,
        ];

      }
    );

  };


  /*
   * Select all first 4 regions.
   */

  const selectComparisonRegions = () => {

    setComparisonRegions(
      regions
        .slice(0, 4)
        .map(
          (item) =>
            item.name
        )
    );

  };


  /*
   * Clear comparison.
   */

  const clearComparison = () => {

    setComparisonRegions([]);

  };


  /*
   * Make selected comparison region
   * the active monitoring region.
   */

  const openComparisonRegion = (
    regionName
  ) => {

    setSelectedRegion(
      regionName
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  /*
   * Highest values used by comparison
   * bars.
   */

  const comparisonMaxTemperature =
    comparisonData.length > 0
      ? Math.max(
          ...comparisonData.map(
            (item) =>
              Number(
                item.temperature
              ) || 0
          )
        )
      : 1;


  const comparisonMaxDeparture =
    comparisonData.length > 0
      ? Math.max(
          ...comparisonData.map(
            (item) =>
              Math.abs(
                Number(
                  item.departure
                ) || 0
              )
          )
        )
      : 1;


  /* =====================================================
     LOADING
  ===================================================== */

  if (
    !region ||
    !temperatureData
  ) {

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


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

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


      {/* =====================================================
          FILTER PANEL
      ===================================================== */}

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

            {regions.map(
              (item) => (

                <option
                  key={item.name}
                  value={item.name}
                >
                  {item.name}
                </option>

              )
            )}

          </select>

        </div>


        {/* SEASON */}

        <div className="monitoring-filter-group">

          <label>
            SEASON
          </label>

          <div className="filter-buttons">

            {seasonalValues.map(
              (item) => (

                <button
                  type="button"
                  key={item.name}
                  className={
                    season === item.name
                      ? "filter-btn active"
                      : "filter-btn"
                  }
                  onClick={() =>
                    setSeason(
                      item.name
                    )
                  }
                >
                  {item.name}
                </button>

              )
            )}

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
            ].map(
              (item) => (

                <button
                  type="button"
                  key={item.value}
                  className={
                    period === item.value
                      ? "filter-btn active"
                      : "filter-btn"
                  }
                  onClick={() => {

                    setPeriod(
                      item.value
                    );

                    setHoveredIndex(null);

                    setSelectedIndex(null);

                  }}
                >
                  {item.label}
                </button>

              )
            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          STAT CARDS
      ===================================================== */}

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


      {/* =====================================================
          CHARTS
      ===================================================== */}

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


          {/* LINE CHART */}

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
                  (
                    temperature,
                    index
                  ) => {

                    const x =
                      displayedTemperatures.length === 1
                        ? 50
                        : (
                            index /
                            (
                              displayedTemperatures.length -
                              1
                            )
                          ) *
                          100;


                    const y =
                      getLineY(
                        temperature
                      );


                    const isActive =
                      activeIndex ===
                      index;


                    return (

                      <g
                        key={`${displayedLabels[index]}-${temperature}`}
                      >

                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="transparent"
                          className="monitoring-hit-area"
                          onMouseEnter={() =>
                            setHoveredIndex(
                              index
                            )
                          }
                          onMouseLeave={() =>
                            setHoveredIndex(
                              null
                            )
                          }
                          onClick={() =>
                            toggleSelected(
                              index
                            )
                          }
                        />


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


              {activeIndex !== null && (

                <div
                  className="monitoring-tooltip"
                  style={{
                    left: `${
                      displayedTemperatures.length === 1
                        ? 50
                        : (
                            activeIndex /
                            (
                              displayedTemperatures.length -
                              1
                            )
                          ) *
                          100
                    }%`,
                  }}
                >

                  <strong>
                    {
                      displayedTemperatures[
                        activeIndex
                      ]
                    }°C
                  </strong>

                  <span>
                    {
                      displayedLabels[
                        activeIndex
                      ]
                    }
                  </span>

                </div>

              )}

            </div>

          )}


          {/* COLUMN CHART */}

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
                  (
                    temperature,
                    index
                  ) => {

                    const height =
                      getHeight(
                        temperature
                      );


                    const isActive =
                      activeIndex ===
                      index;


                    return (

                      <div
                        key={`${displayedLabels[index]}-${temperature}`}
                        className="monitoring-column-item"
                        onMouseEnter={() =>
                          setHoveredIndex(
                            index
                          )
                        }
                        onMouseLeave={() =>
                          setHoveredIndex(
                            null
                          )
                        }
                        onClick={() =>
                          toggleSelected(
                            index
                          )
                        }
                      >

                        {isActive && (

                          <div className="monitoring-column-tooltip">

                            <strong>
                              {temperature}°C
                            </strong>

                            <span>
                              {
                                displayedLabels[
                                  index
                                ]
                              }
                            </span>

                          </div>

                        )}


                        <div
                          className={
                            isActive
                              ? "monitoring-temperature-column active"
                              : "monitoring-temperature-column"
                          }
                          style={{
                            height:
                              `${height}%`,
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

            {displayedLabels.map(
              (label) => (

                <span key={label}>
                  {label}
                </span>

              )
            )}

          </div>


          <div className="monitoring-chart-footer">

            Normal temperature:

            <strong>
              {" "}
              {normalTemperature}°C
            </strong>

          </div>

        </section>


        {/* SEASONAL ANALYSIS */}

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

            {seasonalValues.map(
              (item) => {

                const height =
                  (
                    item.value /
                    maxSeasonValue
                  ) *
                  100;


                const isSelected =
                  item.name === season;


                return (

                  <button
                    type="button"
                    key={item.name}
                    className={
                      isSelected
                        ? "season-column-wrap selected"
                        : "season-column-wrap"
                    }
                    onClick={() =>
                      setSeason(
                        item.name
                      )
                    }
                  >

                    <span className="season-value">
                      {item.value}
                    </span>


                    <div
                      className="season-column"
                      style={{
                        height:
                          `${height}%`,
                      }}
                    />


                    <span className="season-label">
                      {item.name}
                    </span>

                  </button>

                );

              }
            )}

          </div>

        </section>

      </div>


      {/* =====================================================
          REGIONAL COMPARISON
      ===================================================== */}

      <section className="monitoring-comparison">


        <div className="section-heading">

          <div>

            <div className="eyebrow">
              CROSS-REGION ANALYSIS
            </div>

            <h3>
              Regional comparison
            </h3>

            <p>
              Select up to four regions to compare
              current heatwave conditions side by side.
            </p>

          </div>


          <div className="comparison-actions">

            <button
              type="button"
              className="comparison-action"
              onClick={
                selectComparisonRegions
              }
            >
              Compare first 4
            </button>


            <button
              type="button"
              className="comparison-action secondary"
              onClick={
                clearComparison
              }
            >
              Clear
            </button>

          </div>

        </div>


        {/* REGION SELECTOR */}

        <div className="comparison-selector">

          <div className="comparison-selector-header">

            <span>
              SELECT REGIONS
            </span>

            <small>
              {comparisonRegions.length}/4 selected
            </small>

          </div>


          <div className="comparison-region-options">

            {regions.map(
              (item) => {

                const isSelected =
                  comparisonRegions.includes(
                    item.name
                  );


                const disabled =
                  !isSelected &&
                  comparisonRegions.length >= 4;


                return (

                  <button
                    type="button"
                    key={item.name}
                    disabled={disabled}
                    className={
                      isSelected
                        ? "comparison-region-option selected"
                        : "comparison-region-option"
                    }
                    onClick={() =>
                      toggleComparisonRegion(
                        item.name
                      )
                    }
                  >

                    <span className="comparison-check">

                      {isSelected
                        ? "✓"
                        : ""}

                    </span>


                    <span>

                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.state}
                      </small>

                    </span>


                    <b>
                      {item.temperature}°C
                    </b>

                  </button>

                );

              }
            )}

          </div>

        </div>


        {/* EMPTY STATE */}

        {comparisonData.length === 0 && (

          <div className="comparison-empty">

            <strong>
              Select at least one region
            </strong>

            <span>
              Choose regions above to start comparing
              their current conditions.
            </span>

          </div>

        )}


        {/* COMPARISON DASHBOARD */}

        {comparisonData.length > 0 && (

          <>

            {/* SUMMARY CARDS */}

            <div className="comparison-summary-grid">

              {comparisonData.map(
                (item) => {

                  const isMainRegion =
                    item.name ===
                    selectedRegion;


                  return (

                    <button
                      type="button"
                      key={item.name}
                      className={
                        isMainRegion
                          ? "comparison-summary-card active"
                          : "comparison-summary-card"
                      }
                      onClick={() =>
                        openComparisonRegion(
                          item.name
                        )
                      }
                    >

                      <div className="comparison-summary-top">

                        <span>
                          {item.name}
                        </span>

                        {isMainRegion && (

                          <small>
                            ACTIVE
                          </small>

                        )}

                      </div>


                      <strong>
                        {item.temperature}°C
                      </strong>


                      <div className="comparison-summary-meta">

                        <span>
                          Normal{" "}
                          {item.normal}°C
                        </span>

                        <span
                          className="comparison-departure"
                        >
                          {item.departure >= 0
                            ? "+"
                            : ""}
                          {item.departure}°C
                        </span>

                      </div>


                      <div className="comparison-summary-risk">

                        <SeverityBadge>
                          {item.risk}
                        </SeverityBadge>

                      </div>

                    </button>

                  );

                }
              )}

            </div>


            {/* VISUAL COMPARISON */}

            <div className="comparison-chart-grid">


              {/* TEMPERATURE */}

              <section className="comparison-chart-card">

                <div className="comparison-chart-heading">

                  <div>

                    <h4>
                      Maximum temperature
                    </h4>

                    <p>
                      Current observed maximum
                    </p>

                  </div>

                  <span>
                    °C
                  </span>

                </div>


                <div className="comparison-bars">

                  {comparisonData.map(
                    (item) => {

                      const temperature =
                        Number(
                          item.temperature
                        ) || 0;


                      const width =
                        (
                          temperature /
                          comparisonMaxTemperature
                        ) *
                        100;


                      return (

                        <button
                          type="button"
                          key={item.name}
                          className="comparison-bar-row"
                          onClick={() =>
                            openComparisonRegion(
                              item.name
                            )
                          }
                        >

                          <span className="comparison-bar-label">
                            {item.name}
                          </span>


                          <div className="comparison-bar-track">

                            <div
                              className="comparison-bar-fill temperature"
                              style={{
                                width:
                                  `${width}%`,
                              }}
                            />

                          </div>


                          <strong>
                            {item.temperature}°
                          </strong>

                        </button>

                      );

                    }
                  )}

                </div>

              </section>


              {/* DEPARTURE */}

              <section className="comparison-chart-card">

                <div className="comparison-chart-heading">

                  <div>

                    <h4>
                      Temperature departure
                    </h4>

                    <p>
                      Difference from normal maximum
                    </p>

                  </div>

                  <span>
                    °C
                  </span>

                </div>


                <div className="comparison-bars">

                  {comparisonData.map(
                    (item) => {

                      const departure =
                        Number(
                          item.departure
                        ) || 0;


                      const width =
                        (
                          Math.abs(
                            departure
                          ) /
                          comparisonMaxDeparture
                        ) *
                        100;


                      return (

                        <button
                          type="button"
                          key={item.name}
                          className="comparison-bar-row"
                          onClick={() =>
                            openComparisonRegion(
                              item.name
                            )
                          }
                        >

                          <span className="comparison-bar-label">
                            {item.name}
                          </span>


                          <div className="comparison-bar-track">

                            <div
                              className={
                                departure >= 3
                                  ? "comparison-bar-fill departure high"
                                  : "comparison-bar-fill departure"
                              }
                              style={{
                                width:
                                  `${width}%`,
                              }}
                            />

                          </div>


                          <strong>
                            {departure >= 0
                              ? "+"
                              : ""}
                            {departure}°
                          </strong>

                        </button>

                      );

                    }
                  )}

                </div>

              </section>

            </div>


            {/* DETAILED TABLE */}

            <div className="monitoring-table-wrap comparison-table-wrap">

              <table className="monitoring-table comparison-table">

                <thead>

                  <tr>

                    <th>
                      REGION
                    </th>

                    <th>
                      TEMP
                    </th>

                    <th>
                      NORMAL
                    </th>

                    <th>
                      DEPARTURE
                    </th>

                    <th>
                      MIN TEMP
                    </th>

                    <th>
                      HUMIDITY
                    </th>

                    <th>
                      STATUS
                    </th>

                    <th>
                      SEVERITY
                    </th>

                    <th>
                      RISK
                    </th>

                    <th>
                      TREND
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {comparisonData.map(
                    (item) => {

                      const isSelected =
                        item.name ===
                        selectedRegion;


                      return (

                        <tr
                          key={item.name}
                          className={
                            isSelected
                              ? "selected-region-row"
                              : ""
                          }
                          onClick={() =>
                            openComparisonRegion(
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


                          <td>
                            {item.normal}°C
                          </td>


                          <td
                            className={
                              Number(
                                item.departure
                              ) >= 3
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
                            {item.minTemp}°C
                          </td>


                          <td>
                            {item.humidity}%
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

                    }
                  )}

                </tbody>

              </table>

            </div>


            <div className="comparison-footer-note">

              Click any compared region to make it
              the active monitoring region.

            </div>

          </>

        )}

      </section>

    </div>

  );

}


export default Monitoring;