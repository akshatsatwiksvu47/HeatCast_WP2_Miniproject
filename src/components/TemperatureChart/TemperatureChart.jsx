import { useEffect, useState } from "react";
import { getTemperatureData } from "../../services/api";

import "./TemperatureChart.css";


function TemperatureChart({
  regionName = "Delhi NCR",
  normalTemperature,
}) {

  const [data, setData] = useState(null);

  const [chartType, setChartType] =
    useState("columns");

  const [hoveredIndex, setHoveredIndex] =
    useState(null);

  const [selectedIndex, setSelectedIndex] =
    useState(null);


  /* =========================================
     LOAD REGION TEMPERATURE DATA
  ========================================= */

  useEffect(() => {

    setData(null);
    setHoveredIndex(null);
    setSelectedIndex(null);

    getTemperatureData(regionName)
      .then((result) => {

        setData(result);

      })
      .catch((error) => {

        console.error(
          "Temperature data error:",
          error
        );

        setData(null);

      });

  }, [regionName]);


  /* =========================================
     LOADING
  ========================================= */

  if (!data) {

    return (
      <div className="chart-placeholder">
        Loading temperature data...
      </div>
    );

  }


  const temperatures =
    Array.isArray(data.temperatures)
      ? data.temperatures
      : [];


  const labels =
    Array.isArray(data.labels)
      ? data.labels
      : [];


  if (temperatures.length === 0) {

    return (
      <div className="chart-placeholder">
        No temperature data available.
      </div>
    );

  }


  /* =========================================
     TEMPERATURE RANGE
  ========================================= */

  const minTemperature =
    Math.min(...temperatures);

  const maxTemperature =
    Math.max(...temperatures);


  /*
    Give the chart some breathing room above
    and below the actual values.
  */

  const chartMin =
    Math.floor(minTemperature - 2);

  const chartMax =
    Math.ceil(maxTemperature + 2);


  const temperatureRange =
    chartMax - chartMin || 1;


  /* =========================================
     HEIGHT CALCULATION
  ========================================= */

  const getHeight = (temperature) => {

    return (
      ((temperature - chartMin) /
        temperatureRange) *
      100
    );

  };


  /* =========================================
     ACTIVE POINT
  ========================================= */

  const activeIndex =
    hoveredIndex !== null
      ? hoveredIndex
      : selectedIndex;


  /* =========================================
     POINT POSITION
  ========================================= */

  const getX = (index) => {

    if (temperatures.length === 1) {
      return 50;
    }

    return (
      (index /
        (temperatures.length - 1)) *
      100
    );

  };


  const getY = (temperature) => {

    return (
      100 -
      getHeight(temperature)
    );

  };


  /* =========================================
     SELECT POINT
  ========================================= */

  const handleSelect = (index) => {

    setSelectedIndex(
      selectedIndex === index
        ? null
        : index
    );

  };


  return (

    <div className="chart-wrap">


      {/* =====================================
          CHART HEADER
      ===================================== */}

      <div className="chart-toolbar">

        <div className="chart-legend">

          <span className="legend-orange"></span>

          Maximum temperature

        </div>


        <div className="chart-type-control">

          <label htmlFor={`chart-type-${regionName}`}>
            Chart type
          </label>

          <select
            id={`chart-type-${regionName}`}
            value={chartType}
            onChange={(event) => {

              setChartType(
                event.target.value
              );

              setHoveredIndex(null);
              setSelectedIndex(null);

            }}
          >

            <option value="columns">
              Columns
            </option>

            <option value="line">
              Line
            </option>

          </select>

        </div>

      </div>


      {/* =====================================
          COLUMNS
      ===================================== */}

      {chartType === "columns" && (

        <div className="temperature-column-chart">

          <div className="column-grid">

            <span />
            <span />
            <span />
            <span />
            <span />

          </div>


          <div className="temperature-columns">

            {temperatures.map(
              (temperature, index) => {

                const isActive =
                  activeIndex === index;


                return (

                  <div
                    key={`${labels[index]}-${index}`}
                    className="temperature-column-wrap"
                    onMouseEnter={() =>
                      setHoveredIndex(index)
                    }
                    onMouseLeave={() =>
                      setHoveredIndex(null)
                    }
                    onClick={() =>
                      handleSelect(index)
                    }
                  >

                    <div
                      className={
                        isActive
                          ? "temperature-column active"
                          : "temperature-column"
                      }
                      style={{
                        height:
                          `${getHeight(
                            temperature
                          )}%`,
                      }}
                    />


                    {isActive && (

                      <div className="temperature-tooltip">

                        <strong>
                          {temperature}°C
                        </strong>

                        <span>
                          {labels[index]}
                        </span>

                      </div>

                    )}

                  </div>

                );

              }
            )}

          </div>

        </div>

      )}


      {/* =====================================
          LINE CHART
      ===================================== */}

      {chartType === "line" && (

        <div className="temperature-line-chart">

          <div className="line-chart-grid">

            <span />
            <span />
            <span />
            <span />
            <span />

          </div>


          <svg
            className="temperature-line-svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >

            {/* LINE */}

            <polyline
              points={temperatures
                .map(
                  (temperature, index) => {

                    return `${getX(index)},${getY(
                      temperature
                    )}`;

                  }
                )
                .join(" ")}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />


            {/* POINTS */}

            {temperatures.map(
              (temperature, index) => {

                const x =
                  getX(index);

                const y =
                  getY(temperature);

                const isActive =
                  activeIndex === index;


                return (

                  <g
                    key={`${labels[index]}-${index}`}
                  >

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
                          ? "temperature-line-point active"
                          : "temperature-line-point"
                      }
                      vectorEffect="non-scaling-stroke"
                    />


                    {/* Large invisible hit area */}

                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="transparent"
                      className="temperature-hit-area"
                      onMouseEnter={() =>
                        setHoveredIndex(index)
                      }
                      onMouseLeave={() =>
                        setHoveredIndex(null)
                      }
                      onClick={() =>
                        handleSelect(index)
                      }
                    />

                  </g>

                );

              }
            )}

          </svg>


          {activeIndex !== null && (

            <div
              className="temperature-tooltip line-tooltip"
              style={{
                left:
                  `${getX(
                    activeIndex
                  )}%`,
              }}
            >

              <strong>
                {temperatures[activeIndex]}°C
              </strong>

              <span>
                {labels[activeIndex]}
              </span>

            </div>

          )}

        </div>

      )}


      {/* =====================================
          X AXIS LABELS
      ===================================== */}

      <div className="chart-labels">

        {labels.map((label) => (

          <span key={label}>
            {label}
          </span>

        ))}

      </div>


      {/* =====================================
          NORMAL TEMPERATURE
      ===================================== */}

      <div className="chart-normal">

        Normal temperature:{" "}

        <strong>
          {normalTemperature ??
            data.normalTemperature}
          °C
        </strong>

      </div>

    </div>

  );

}


export default TemperatureChart;