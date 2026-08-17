import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

      <NavLink
        to="/"
        className="navbar-brand"
        aria-label="Go to HeatCast Dashboard"
      >
        <div className="brand-mark">
          H
        </div>

        <div>
          <div className="brand-name">
            HeatCast
          </div>

          <div className="brand-subtitle">
            CLIMATE INTELLIGENCE
          </div>
        </div>
      </NavLink>


      <div className="navbar-links">

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "nav-link active"
              : "nav-link"
          }
          end
        >
          Dashboard
        </NavLink>


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