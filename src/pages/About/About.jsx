
import "./About.css";

function About() {
  return (
    <div className="page about-page">
      {/* PAGE INTRO */}
      <header className="about-intro">
        <div className="eyebrow">ABOUT HEATCAST</div>

        <div className="about-intro-main">
          <h1>
            Climate intelligence
            <span> for a hotter world.</span>
          </h1>

          <p>
            HeatCast is a climate intelligence prototype designed to
            monitor regional weather, assess heat-related risk, explore
            forecast conditions, and communicate practical early-warning
            guidance.
          </p>
        </div>
      </header>

      {/* MAIN INTRODUCTION */}
      <section className="about-hero panel">
        <div className="about-hero-top">
          <div>
            <div className="eyebrow">CLIMATE INTELLIGENCE</div>
            <h2>Turning weather data into actionable insight.</h2>
          </div>
        </div>

        <div className="about-hero-body">
          <p>
            HeatCast combines live weather observations, regional reference
            data, available temperature forecasts, and a shared rule-based
            risk calculation in one interface. It helps users understand
            current conditions, compare monitored regions, identify
            elevated heat risk, and explore precautions for different
            stakeholders.
          </p>

          <div className="about-hero-points">
            <span>Live weather monitoring</span>
            <span>Rule-based risk assessment</span>
            <span>Early-warning guidance</span>
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES */}
      <section className="about-section">
        <div className="about-section-heading">
          <div>
            <div className="eyebrow">PLATFORM</div>
            <h2>What HeatCast does</h2>
          </div>

          <p>
            The platform connects weather observations, risk analysis,
            forecasts, and practical guidance.
          </p>
        </div>

        <div className="about-feature-grid">
          <div className="panel about-feature-card">
            <span className="about-feature-number">01</span>
            <div className="about-feature-content">
              <h3>Monitor</h3>
              <p>
                Retrieve current weather observations for configured
                regions, including air temperature and relative humidity
                when available. Compare regional conditions using a
                consistent set of calculated metrics.
              </p>
            </div>
          </div>

          <div className="panel about-feature-card">
            <span className="about-feature-number">02</span>
            <div className="about-feature-content">
              <h3>Forecast</h3>
              <p>
                Display available daily temperature forecasts and use
                forecast maxima in the prototype's rule-based prediction
                analysis. Forecast results are distinguished from current
                observations.
              </p>
            </div>
          </div>

          <div className="panel about-feature-card">
            <span className="about-feature-number">03</span>
            <div className="about-feature-content">
              <h3>Identify Hotspots</h3>
              <p>
                Compare configured regions using their available live
                weather and calculated risk levels to help identify
                locations experiencing comparatively elevated heat
                conditions.
              </p>
            </div>
          </div>

          <div className="panel about-feature-card">
            <span className="about-feature-number">04</span>
            <div className="about-feature-content">
              <h3>Alert</h3>
              <p>
                Generate prototype heat-risk alerts from available
                regional weather data and provide precautionary guidance
                tailored to citizens, farmers, health departments, and
                local authorities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SYSTEM WORKFLOW */}
      <section className="panel about-workflow">
        <div className="about-section-heading workflow-heading">
          <div>
            <div className="eyebrow">SYSTEM WORKFLOW</div>
            <h2>From weather data to informed action</h2>
          </div>

          <p>
            A frontend-to-backend workflow connects weather retrieval,
            processing, risk assessment, and guidance.
          </p>
        </div>

        <div className="workflow">
          <div className="workflow-step">
            <div className="workflow-number">01</div>
            <div className="workflow-step-content">
              <span>INPUT</span>
              <h3>Weather Data</h3>
              <p>
                Open-Meteo supplies current weather observations and
                available forecasts for configured locations. Regional
                reference values provide context for temperature
                comparisons.
              </p>
            </div>
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <div className="workflow-number">02</div>
            <div className="workflow-step-content">
              <span>PROCESS</span>
              <h3>Backend and Storage</h3>
              <p>
                A Node.js and Express backend retrieves weather data
                and makes stored records available through API endpoints.
                MongoDB stores the weather records consumed by the
                React frontend.
              </p>
            </div>
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <div className="workflow-number">03</div>
            <div className="workflow-step-content">
              <span>ANALYZE</span>
              <h3>Rule-Based Risk Assessment</h3>
              <p>
                Shared JavaScript logic evaluates available temperature,
                apparent temperature, humidity, and departure from the
                configured regional normal. Consistent rules produce
                prototype risk categories across monitoring and related
                views.
              </p>
            </div>
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <div className="workflow-number">04</div>
            <div className="workflow-step-content">
              <span>FORECAST</span>
              <h3>Risk Estimation</h3>
              <p>
                Available forecast maxima and regional reference values
                feed a separate rule-based prediction score. When
                forecast data is unavailable, the interface should
                distinguish current-condition analysis from forecast
                estimates.
              </p>
            </div>
          </div>

          <div className="workflow-line" />

          <div className="workflow-step">
            <div className="workflow-number">05</div>
            <div className="workflow-step-content">
              <span>ACT</span>
              <h3>Alerts and Advisories</h3>
              <p>
                Calculated risk categories help identify regions that
                need attention. The Alerts &amp; Advisories page presents
                stakeholder-specific precautions to support awareness
                and informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="about-section">
        <div className="about-section-heading">
          <div>
            <div className="eyebrow">TECHNOLOGY</div>
            <h2>How the platform is built</h2>
          </div>

          <p>
            A web-based architecture connects the user interface,
            weather API, backend processing, and database.
          </p>
        </div>

        <div className="about-feature-grid">
          <div className="panel about-feature-card">
            <span className="about-feature-number">01</span>
            <div className="about-feature-content">
              <h3>React Frontend</h3>
              <p>
                React presents regional monitoring, temperature charts,
                forecast information, hotspot comparisons, alerts,
                and stakeholder guidance through an interactive
                web interface.
              </p>
            </div>
          </div>

          <div className="panel about-feature-card">
            <span className="about-feature-number">02</span>
            <div className="about-feature-content">
              <h3>Node.js and Express</h3>
              <p>
                The backend exposes API endpoints used by the frontend
                to retrieve live weather records and related status
                information.
              </p>
            </div>
          </div>

          <div className="panel about-feature-card">
            <span className="about-feature-number">03</span>
            <div className="about-feature-content">
              <h3>MongoDB</h3>
              <p>
                Weather records retrieved by the backend are stored
                in MongoDB and served to the frontend for regional
                monitoring and analysis.
              </p>
            </div>
          </div>

          <div className="panel about-feature-card">
            <span className="about-feature-number">04</span>
            <div className="about-feature-content">
              <h3>Open-Meteo and JavaScript Rules</h3>
              <p>
                Open-Meteo provides weather observations and forecasts.
                Shared JavaScript calculations classify current heat
                risk, while a separate rule-based scoring function
                estimates forecast-related risk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STAKEHOLDERS */}
      <section className="about-section">
        <div className="about-section-heading">
          <div>
            <div className="eyebrow">WHO IT SUPPORTS</div>
            <h2>Designed for different stakeholders</h2>
          </div>

          <p>
            Different users can interpret heat conditions and explore
            precautions relevant to their responsibilities.
          </p>
        </div>

        <div className="stakeholder-grid">
          <div className="panel stakeholder-card">
            <div className="stakeholder-number">01</div>
            <div className="stakeholder-content">
              <h3>Citizen</h3>
              <p>
                Understand current heat conditions and access practical
                precautions for hydration, shade, reduced heat exposure,
                and recognizing possible heat-related illness.
              </p>
            </div>
          </div>

          <div className="panel stakeholder-card">
            <div className="stakeholder-number">02</div>
            <div className="stakeholder-content">
              <h3>Farmer</h3>
              <p>
                Review heat conditions that may affect field activities,
                worker safety, crops, and livestock, with guidance on
                shade, water, and cooler working hours.
              </p>
            </div>
          </div>

          <div className="panel stakeholder-card">
            <div className="stakeholder-number">03</div>
            <div className="stakeholder-content">
              <h3>Health Department</h3>
              <p>
                Explore precautions relating to heat-illness awareness,
                healthcare readiness, cooling arrangements, and
                appropriate escalation procedures.
              </p>
            </div>
          </div>

          <div className="panel stakeholder-card">
            <div className="stakeholder-number">04</div>
            <div className="stakeholder-content">
              <h3>Local Authority</h3>
              <p>
                Review regional heat-risk information and precautions
                relating to public communication, drinking-water
                access, cooling facilities, and coordinated response.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LIMITATIONS AND PROJECT STATUS */}
      <section className="panel about-workflow">
        <div className="about-section-heading workflow-heading">
          <div>
            <div className="eyebrow">CURRENT CAPABILITIES</div>
            <h2>A transparent prototype</h2>
          </div>

          <p>
            HeatCast demonstrates a practical workflow for regional
            heat monitoring and early-warning support.
          </p>
        </div>

        <div className="about-hero-body">
          <p>
            The current implementation uses weather data, configured
            regional reference values, and rule-based JavaScript
            calculations. It does not currently represent a trained
            machine-learning model, and its risk categories are not
            official IMD classifications or government-issued warnings.
          </p>

          <p>
            Results depend on the availability, freshness, and coverage
            of weather records, along with the configured regional
            baselines and prototype thresholds. Current observations,
            forecast maxima, and estimated risk scores represent
            different measures and should not be treated as
            interchangeable.
          </p>

          <p>
            HeatCast is intended as a demonstration and decision-support
            prototype. Users should consult official meteorological
            warnings and local authorities for operational decisions.
          </p>
        </div>
      </section>

      {/* PROJECT STATUS */}
      <section className="panel about-status">
        <div className="about-status-main">
          <div className="eyebrow">THE PROJECT</div>

          <h2>HeatCast</h2>

          <p>
            Climate Intelligence for Heatwave Monitoring, Prediction,
            and Early Warning.
          </p>
        </div>

        <div className="about-status-right">
          <div className="about-status-badge">WP2 MINI PROJECT</div>

          <div className="about-status-line">
            <span />
            Rule-based climate intelligence prototype
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
