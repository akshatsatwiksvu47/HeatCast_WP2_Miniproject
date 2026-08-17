import { useEffect, useState } from "react";

import {
  getDashboard,
  getRegions,
  getAlerts,
} from "../../services/api";

import StatCard from "../../components/StatCard/StatCard";
import SeverityBadge from "../../components/SeverityBadge/SeverityBadge";
import TemperatureChart from "../../components/TemperatureChart/TemperatureChart";
import RegionalTable from "../../components/RegionalTable/RegionalTable";

import "./Dashboard.css";


function Dashboard() {

  const [dashboard, setDashboard] = useState(null);

  const [regions, setRegions] = useState([]);

  const [alerts, setAlerts] = useState([]);

  const [selectedRegion, setSelectedRegion] =
    useState("Delhi NCR");


  /* =========================
     LOAD DASHBOARD DATA
  ========================= */

  useEffect(() => {

    getDashboard()
      .then((data) => {
        setDashboard(data);
      })
      .catch((error) => {
        console.error(
          "Dashboard data error:",
          error
        );
      });


    getRegions()
      .then((data) => {
        setRegions(data);
      })
      .catch((error) => {
        console.error(
          "Regions data error:",
          error
        );
      });


    getAlerts()
      .then((data) => {
        setAlerts(data);
      })
      .catch((error) => {
        console.error(
          "Alerts data error:",
          error
        );
      });

  }, []);


  /* =========================
     LOADING
  ========================= */

  if (
    !dashboard ||
    regions.length === 0
  ) {

    return (

      <div className="page">

        <div className="page-placeholder">

          <h2>
            Loading HeatCast data...
          </h2>

        </div>

      </div>

    );

  }


  /* =========================
     SELECTED REGION
  ========================= */

  const region =
    regions.find(
      (item) =>
        item.name === selectedRegion
    ) || regions[0];


  /* =========================
     SELECTED REGION WARNING
  ========================= */

  const selectedWarning =
    alerts.find(
      (alert) =>
        alert.region === region.name
    ) || null;


  /* =========================
     WARNING STATUS
  ========================= */

  const hasWarning =
    selectedWarning !== null;


  /* =========================
     MAIN DASHBOARD
  ========================= */

  return (

    <div className="page">


      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            DECISION SUPPORT
          </div>

          <h1>
            Heatwave Situation Dashboard
          </h1>

          <p>
            A single-screen view of current
            heatwave conditions, risk,
            forecasts and active warnings.
          </p>

        </div>


        {/* REGION SELECTOR */}

        <div className="heading-control">

          <label htmlFor="region-select">
            REGION
          </label>

          <select
            id="region-select"
            value={region.name}
            onChange={(event) =>
              setSelectedRegion(
                event.target.value
              )
            }
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

      </div>


      {/* =========================
          CURRENT REGION STATUS
      ========================= */}

      <section className="hero-status">

        <div className="hero-main">

          <div className="micro-label">

            SELECTED REGION •{" "}
            {dashboard.updated}

          </div>


          <h2>
            {region.name}
          </h2>


          <span className="location-text">
            {region.state}
          </span>


          <div className="hero-temp">

            {region.temperature}

            <small>
              °C
            </small>

          </div>


          <div className="hero-status-line">

            <strong>
              {region.status}
            </strong>


            <SeverityBadge>
              {region.severity}
            </SeverityBadge>


            <SeverityBadge>
              {region.risk}
            </SeverityBadge>

          </div>

        </div>


        {/* REGION MINI STATS */}

        <div className="hero-mini-grid">

          <div>

            <span>
              NORMAL MAX
            </span>

            <strong>
              {region.normal}°C
            </strong>

          </div>


          <div>

            <span>
              DEPARTURE
            </span>

            <strong>
              {region.departure >= 0
                ? "+"
                : ""}
              {region.departure}°C
            </strong>

          </div>


          <div>

            <span>
              MIN TEMP
            </span>

            <strong>
              {region.minTemp}°C
            </strong>

          </div>


          <div>

            <span>
              HUMIDITY
            </span>

            <strong>
              {region.humidity}%
            </strong>

          </div>

        </div>

      </section>


      {/* =========================
          STAT CARDS
      ========================= */}

      <div className="stats-grid">


        <StatCard
          label="MAX TEMPERATURE"
          value={region.temperature}
          unit="°C"
          subtext={`Normal ${region.normal}°C`}
        />


        <StatCard
          label="HEATWAVE RISK"
          value={region.risk}
          subtext={region.status}
          tone="red"
        />


        <StatCard
          label="SEVERITY"
          value={region.severity}
          subtext="Current classification"
          tone="orange"
        />


        <StatCard
          label="FORECAST PEAK"
          value={dashboard.forecastPeak}
          unit="°C"
          subtext={`Expected ${dashboard.forecastPeakDay}`}
        />


        <StatCard
          label="ACTIVE ALERTS"
          value={dashboard.activeAlerts}
          subtext="Across monitored regions"
          tone="red"
        />

      </div>


      {/* =========================
          CHART + WARNING
      ========================= */}

      <div className="dashboard-grid">


        {/* TEMPERATURE TREND */}

        <section className="panel">

          <div className="panel-title-row">

            <div>

              <h3>
                Temperature trend —
                last 14 days
              </h3>

              <p>
                Observed maximum temperature
                for {region.name}.
              </p>

            </div>


            <div className="chart-legend">

              <span className="legend-orange"></span>

              Temperature

            </div>

          </div>


          <TemperatureChart
            regionName={region.name}
            normalTemperature={region.normal}
          />

        </section>


        {/* ACTIVE WARNING */}

        <section className="panel warning-panel">

          <div className="panel-title-row">

            <h3>
              Active warning
            </h3>

          </div>


          {hasWarning ? (

            <div className="warning-card">

              <div className="warning-title">

                {selectedWarning.title}

              </div>


              <SeverityBadge>
                {selectedWarning.severity}
              </SeverityBadge>


              <p>
                {selectedWarning.description}
              </p>


              <div className="warning-meta">


                <span>

                  Region

                  <strong>
                    {selectedWarning.region}
                  </strong>

                </span>


                <span>

                  Expected max

                  <strong>
                    {selectedWarning.expected}
                  </strong>

                </span>


                <span>

                  Valid until

                  <strong>
                    {selectedWarning.valid}
                  </strong>

                </span>


              </div>

            </div>

          ) : (

            /* =========================
               NO WARNING STATE
            ========================= */

            <div className="warning-card no-warning-card">

              <div className="warning-title">
                NO ACTIVE WARNING
              </div>


              <SeverityBadge>
                {region.severity}
              </SeverityBadge>


              <p>
                There is currently no active
                warning issued for{" "}
                <strong>
                  {region.name}
                </strong>.
              </p>


              <div className="warning-meta">

                <span>

                  Region

                  <strong>
                    {region.name}
                  </strong>

                </span>


                <span>

                  Current status

                  <strong>
                    {region.status}
                  </strong>

                </span>


                <span>

                  Risk

                  <strong>
                    {region.risk}
                  </strong>

                </span>

              </div>

            </div>

          )}


          <button className="primary-btn">

            Open alerts & advisories

          </button>

        </section>

      </div>


      {/* =========================
          REGIONAL SUMMARY
      ========================= */}

      <section>

        <div className="section-heading">

          <div>

            <h3>
              Regional summary
            </h3>

            <p>
              Current heatwave conditions
              across monitored regions.
            </p>

          </div>


          <span className="text-link">
            Regional monitoring →
          </span>

        </div>


        <RegionalTable />

      </section>

    </div>

  );

}


export default Dashboard;