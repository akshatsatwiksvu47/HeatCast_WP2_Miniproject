export default function About() {
  const systemSteps = [
    ["01", "Meteorological data", "Historical IMD observations"],
    ["02", "Data processing", "Cleaning, normalisation, feature preparation"],
    ["03", "Regional & seasonal analysis", "Region-wise aggregation"],
    ["04", "AI heatwave intelligence", "Forecasting and prediction models"],
    ["05", "Forecast / severity / hotspots", "Classification and ranking"],
    ["06", "Forecast validation", "Compare predictions against observations"],
    ["07", "Dashboard & visualisation", "This frontend"],
    ["08", "Warnings & advisories", "Stakeholder-specific guidance"],
  ];

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">METHODOLOGY</div>
          <h1>About HeatCast</h1>
          <p>
            Use Case KJS-CE5-01 — Climate Intelligence for Heatwave
            Monitoring, Prediction, and Early Warning. Web Programming II
            mini-project, BTech Information Technology (Third Year).
          </p>
        </div>
      </div>

      <div className="about-two">
        <section className="panel">
          <h2>What HeatCast is</h2>
          <p>
            HeatCast is a heatwave intelligence and decision-support platform,
            not a general weather application. It is built to answer three
            questions in order: what is happening now, what is expected next,
            and what different stakeholders should do about it.
          </p>

          <p>
            The current phase uses replaceable mock data so that the interface,
            information hierarchy, and component structure can be finalised
            before the dataset, backend, and models are available.
          </p>
        </section>

        <section className="panel">
          <h2>The problem</h2>
          <p>
            Heatwaves are extreme events whose onset, duration, and severity
            vary sharply between regions. HeatCast combines regional
            monitoring, region-specific analysis, reliable short-range
            forecasting, and warnings that reach the right audience early
            enough to be acted on.
          </p>

          <p>
            Raw temperature values alone are not decision support. HeatCast's
            role is to turn observations into severity, risk, hotspots,
            warnings, and concrete actions.
          </p>
        </section>
      </div>

      <section>
        <div className="section-heading">
          <div>
            <h3>How the system works</h3>
            <p>
              Data → processing → analysis → AI → validation → decision
              support → early warning.
            </p>
          </div>
        </div>

        <div className="system-grid">
          {systemSteps.map(([number, title, description]) => (
            <div className="system-card" key={number}>
              <span>{number}</span>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h3>Technology & roadmap</h3>
        </div>

        <div className="roadmap-grid">
          <div className="roadmap-card">
            <h3>CURRENT PHASE — FRONTEND</h3>
            <ul>
              <li>React with component-based architecture</li>
              <li>Client-side routing across six sections</li>
              <li>Reusable UI components driven entirely by props</li>
              <li>Mock data consumed only through a service layer</li>
              <li>Charts and map-style visualisation</li>
              <li>Responsive layout with loading, error, and empty states</li>
            </ul>
          </div>

          <div className="roadmap-card">
            <h3>NEXT PHASE — BACKEND & DATA</h3>
            <ul>
              <li>College-provided meteorological dataset</li>
              <li>Backend APIs replacing mock service functions</li>
              <li>Fetch-based data retrieval</li>
              <li>Persistence for regions, observations, and issued warnings</li>
            </ul>
          </div>

          <div className="roadmap-card">
            <h3>LATER PHASE — AI & IOT</h3>
            <ul>
              <li>Maximum-temperature forecasting model</li>
              <li>Heatwave prediction and severity classification</li>
              <li>Hotspot identification from model output</li>
              <li>AWS / IoT localized station observations</li>
              <li>Forecast validation against observed values</li>
              <li>LLM-generated stakeholder advisories</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}