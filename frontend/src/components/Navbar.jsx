import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Monitoring", path: "/monitoring" },
  { label: "Forecast", path: "/forecast" },
  { label: "Hotspots", path: "/hotspots" },
  { label: "Alerts", path: "/alerts" },
  { label: "About", path: "/about" },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">♨</div>
        <div>
          <div className="brand-name">HeatCast</div>
          <div className="brand-subtitle">CLIMATE INTELLIGENCE</div>
        </div>
      </div>

      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mock-badge">
        <span></span>
        MOCK DATA
      </div>
    </header>
  );
}