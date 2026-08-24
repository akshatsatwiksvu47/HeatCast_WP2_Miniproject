import { NavLink } from "react-router-dom";

import "./Navbar.css";


function Navbar() {

  return (

    <nav className="navbar">


      {/* =========================================
          BRAND
      ========================================= */}

      <NavLink
        to="/"
        className="navbar-brand"
        aria-label="Go to HeatCast Dashboard"
      >

        <div className="brand-mark">
          H
        </div>


        <div className="brand-copy">

          <div className="brand-name">
            HeatCast
          </div>


          <div className="brand-subtitle">
            CLIMATE INTELLIGENCE
          </div>

        </div>

      </NavLink>



      {/* =========================================
          NAVIGATION
      ========================================= */}

      <div className="navbar-links">


        {/* DASHBOARD */}

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          Dashboard
        </NavLink>



        {/* MONITORING */}

        <NavLink
          to="/monitoring"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          Monitoring
        </NavLink>



        {/* FORECAST */}

        <NavLink
          to="/forecast"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          Forecast
        </NavLink>



        {/* HOTSPOTS */}

        <NavLink
          to="/hotspots"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          Hotspots
        </NavLink>



        {/* ALERTS */}

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          Alerts
        </NavLink>



        {/* AI PREDICTION */}

        <NavLink
          to="/prediction"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          AI Prediction
        </NavLink>



        {/* ABOUT */}

        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
        >
          About
        </NavLink>


      </div>

    </nav>

  );

}


export default Navbar;