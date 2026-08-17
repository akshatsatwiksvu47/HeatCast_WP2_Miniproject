import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getDashboard,
  getRegions,
} from "../../services/api";

import StatCard from "../../components/StatCard/StatCard";
import SeverityBadge from "../../components/SeverityBadge/SeverityBadge";
import TemperatureChart from "../../components/TemperatureChart/TemperatureChart";
import RegionalTable from "../../components/RegionalTable/RegionalTable";

import HeatRiskCard from "../../components/HeatRiskCard/HeatRiskCard";
import HeatwaveProbability from "../../components/HeatwaveProbability/HeatwaveProbability";
import RiskExplanation from "../../components/RiskExplanation/RiskExplanation";
import StakeholderAdvisory from "../../components/StakeholderAdvisory/StakeholderAdvisory";

function Dashboard() {

  const [dashboard, setDashboard] =
    useState(null);

  const [regions, setRegions] =
    useState([]);

  const [selectedRegion, setSelectedRegion] =
    useState("Delhi NCR");


  useEffect(() => {

    getDashboard()
      .then((data) =>
        setDashboard(data)
      )
      .catch((error) => {

        console.error(
          "Dashboard data error:",
          error
        );

      });


    getRegions()
      .then((data) =>
        setRegions(data)
      )
      .catch((error) => {

        console.error(
          "Regions data error:",
          error
        );

      });

  }, []);


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


  const region =
    regions.find(
      (item) =>
        item.name ===
        selectedRegion
    ) || regions[0];


  return (

    <div className="page">


      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            DECISION SUPPORT
          </div>

          <h1>
            Heatwave Situation Dashboard
          </h1>

          <p>
            A single-screen view of current heatwave
            conditions, risk, forecasts and active warnings.
          </p>

        </div>


        <div className="heading-control">

          <label htmlFor="region-select">
            REGION
          </label>


          <select
            id="region-select"
            value={selectedRegion}
            onChange={(event) =>
              setSelectedRegion(
                event.target.value
              )
            }
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

      </div>


      {/* =====================================================
          CURRENT REGION STATUS
      ====================================================== */}

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
              +{region.departure}°C
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


      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <div className="stats-grid">


        <StatCard
          label="MAX TEMPERATURE"
          value={
            dashboard.maxTemperature
          }
          unit="°C"
          subtext={
            `Normal ${dashboard.normalMax}°C`
          }
        />


        <StatCard
          label="HEATWAVE RISK"
          value={
            dashboard.heatwaveRisk
          }
          subtext={
            dashboard.heatwaveStatus
          }
          tone="red"
        />


        <StatCard
          label="SEVERITY"
          value={
            dashboard.severity
          }
          subtext="Current classification"
          tone="orange"
        />


        <StatCard
          label="FORECAST PEAK"
          value={
            dashboard.forecastPeak
          }
          unit="°C"
          subtext={
            `Expected ${dashboard.forecastPeakDay}`
          }
        />


        <StatCard
          label="ACTIVE ALERTS"
          value={
            dashboard.activeAlerts
          }
          subtext="Across monitored regions"
          tone="red"
        />


      </div>


      {/* =====================================================
          HEAT INTELLIGENCE
      ====================================================== */}

      <div className="dashboard-intelligence-grid">


        <HeatRiskCard
          region={region}
        />


        <HeatwaveProbability
          region={region}
        />


      </div>


      {/* =====================================================
          EXPLAINABLE RISK
      ====================================================== */}

      <div className="dashboard-explanation-row">

        <RiskExplanation
          region={region}
        />

      </div>


      {/* =====================================================
          STAKEHOLDER ADVISORY
      ====================================================== */}

      <div className="dashboard-advisory-row">

        <StakeholderAdvisory
          region={region}
        />

      </div>


      {/* =====================================================
          TEMPERATURE + WARNING
      ====================================================== */}

      <div className="dashboard-grid">


        {/* TEMPERATURE CHART */}

        <section className="panel">


          <div className="panel-title-row">


            <div>

              <h3>
                Temperature trend — last 14 days
              </h3>


              <p>
                Observed maximum temperature for the
                selected region.
              </p>

            </div>


            <div className="chart-legend">

              <span className="legend-orange"></span>

              Temperature

            </div>


          </div>


          <TemperatureChart
            regionName={region.name}
            normalTemperature={
              region.normal
            }
          />


        </section>


        {/* ACTIVE WARNING */}

        <section className="panel warning-panel">


          <div className="panel-title-row">

            <h3>
              Active warning
            </h3>

          </div>


          <div className="warning-card">


            <div className="warning-title">

              {region.name ===
              dashboard.activeWarning.region
                ? dashboard.activeWarning.title
                : `Heatwave monitoring — ${region.name}`}

            </div>


            <SeverityBadge>

              {region.name ===
              dashboard.activeWarning.region
                ? dashboard.activeWarning.severity
                : region.severity}

            </SeverityBadge>


            <p>

              {region.name ===
              dashboard.activeWarning.region
                ? dashboard.activeWarning.description
                : `Current conditions in ${region.name} are being monitored for heatwave risk.`}

            </p>


            <div className="warning-meta">


              <span>

                Region

                <strong>
                  {region.name}
                </strong>

              </span>


              <span>

                Expected max

                <strong>

                  {region.name ===
                  dashboard.activeWarning.region
                    ? dashboard.activeWarning.expectedMax
                    : `${region.temperature}°C`}

                </strong>

              </span>


              <span>

                Valid until

                <strong>

                  {region.name ===
                  dashboard.activeWarning.region
                    ? dashboard.activeWarning.validUntil
                    : "Current monitoring period"}

                </strong>

              </span>


            </div>


          </div>


          <Link
            to="/alerts"
            className="primary-btn"
          >
            Open alerts & advisories
          </Link>


        </section>


      </div>


      {/* =====================================================
          REGIONAL SUMMARY
      ====================================================== */}

      <section>


        <div className="section-heading">


          <div>

            <h3>
              Regional summary
            </h3>


            <p>
              Current heatwave conditions across
              monitored regions.
            </p>

          </div>


          <Link
            to="/monitoring"
            className="text-link"
          >
            Regional monitoring →
          </Link>


        </div>


        <RegionalTable />


      </section>


    </div>

  );

}


export default Dashboard;