import "./About.css";

function About() {
  return (
    <div className="page about-page">

      {/* HEADER */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            ABOUT HEATCAST
          </div>

          <h1>
            Climate Intelligence for Heatwave Monitoring
          </h1>

          <p>
            HeatCast is a climate intelligence platform designed
            to monitor, understand and communicate heatwave risk
            across regions.
          </p>
        </div>
      </div>


      {/* MAIN INTRO */}
      <section className="about-hero panel">

        <div className="about-hero-content">

          <div className="about-icon">
            H
          </div>

          <div>
            <div className="eyebrow">
              CLIMATE INTELLIGENCE
            </div>

            <h2>
              Turning climate data into actionable insight.
            </h2>

            <p>
              HeatCast brings together temperature observations,
              regional monitoring, forecasts and heatwave warnings
              into a single interface. The goal is to make
              heat-related information easier to understand and
              act upon.
            </p>
          </div>

        </div>

      </section>


      {/* WHAT HEATCAST DOES */}
      <section className="about-section">

        <div className="about-section-heading">
          <div className="eyebrow">
            PLATFORM
          </div>

          <h2>
            What HeatCast does
          </h2>

          <p>
            The platform is organized around the key stages of
            heatwave intelligence.
          </p>
        </div>


        <div className="about-feature-grid">

          <div className="panel about-feature-card">

            <span className="about-feature-number">
              01
            </span>

            <h3>
              Monitor
            </h3>

            <p>
              Track current temperature, humidity, heatwave
              status and regional conditions across monitored
              locations.
            </p>

          </div>


          <div className="panel about-feature-card">

            <span className="about-feature-number">
              02
            </span>

            <h3>
              Forecast
            </h3>

            <p>
              View expected temperature conditions and forecast
              heatwave risk over the coming days.
            </p>

          </div>


          <div className="panel about-feature-card">

            <span className="about-feature-number">
              03
            </span>

            <h3>
              Identify Hotspots
            </h3>

            <p>
              Compare monitored regions geographically and
              identify areas experiencing elevated heat
              conditions.
            </p>

          </div>


          <div className="panel about-feature-card">

            <span className="about-feature-number">
              04
            </span>

            <h3>
              Alert
            </h3>

            <p>
              Communicate heatwave warnings and provide
              stakeholder-specific guidance when risk increases.
            </p>

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section className="panel about-workflow">

        <div className="about-section-heading">

          <div className="eyebrow">
            SYSTEM WORKFLOW
          </div>

          <h2>
            From climate data to action
          </h2>

        </div>


        <div className="workflow">

          <div className="workflow-step">

            <div className="workflow-number">
              01
            </div>

            <div>
              <h3>
                Data
              </h3>

              <p>
                Climate and regional observations provide the
                underlying information.
              </p>
            </div>

          </div>


          <div className="workflow-line" />


          <div className="workflow-step">

            <div className="workflow-number">
              02
            </div>

            <div>
              <h3>
                Analysis
              </h3>

              <p>
                Temperature trends and heatwave indicators are
                analyzed to understand regional conditions.
              </p>
            </div>

          </div>


          <div className="workflow-line" />


          <div className="workflow-step">

            <div className="workflow-number">
              03
            </div>

            <div>
              <h3>
                Prediction
              </h3>

              <p>
                Forecast information helps identify potential
                future heatwave conditions.
              </p>
            </div>

          </div>


          <div className="workflow-line" />


          <div className="workflow-step">

            <div className="workflow-number">
              04
            </div>

            <div>
              <h3>
                Warning
              </h3>

              <p>
                The resulting intelligence can support timely
                warnings and heat-response decisions.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* STAKEHOLDERS */}
      <section className="about-section">

        <div className="about-section-heading">

          <div className="eyebrow">
            WHO IT SUPPORTS
          </div>

          <h2>
            Designed for different stakeholders
          </h2>

        </div>


        <div className="stakeholder-grid">

          <div className="panel stakeholder-card">

            <h3>
              Citizen
            </h3>

            <p>
              Understand heat conditions and receive practical
              information for staying safe during periods of
              elevated heat.
            </p>

          </div>


          <div className="panel stakeholder-card">

            <h3>
              Farmer
            </h3>

            <p>
              Understand heat conditions that may affect crops,
              livestock and field activities.
            </p>

          </div>


          <div className="panel stakeholder-card">

            <h3>
              Health Department
            </h3>

            <p>
              Support facility readiness and public-health
              response during heatwave events.
            </p>

          </div>


          <div className="panel stakeholder-card">

            <h3>
              Local Authority
            </h3>

            <p>
              Support coordinated local heat-action measures and
              communication during high-risk conditions.
            </p>

          </div>

        </div>

      </section>


      {/* PROJECT STATUS */}
      <section className="panel about-status">

        <div>

          <div className="eyebrow">
            PROJECT
          </div>

          <h2>
            HeatCast
          </h2>

          <p>
            Climate Intelligence for Heatwave Monitoring,
            Prediction, and Early Warning.
          </p>

        </div>


        <div className="about-status-badge">
          WP2 MINI PROJECT
        </div>

      </section>

    </div>
  );
}

export default About;