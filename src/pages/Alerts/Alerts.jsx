import { useEffect, useState } from "react";



import {



  getRegions,



  getAdvisories,



  getLiveWeatherData,



} from "../../services/api";



import SeverityBadge from "../../components/SeverityBadge/SeverityBadge";
import { getHeatMetrics, findLiveRegion } from "../../utils/heatRisk";



import "./Alerts.css";



const stakeholders = [



  {



    id: "citizen",



    name: "Citizen",



    description: "General public safety guidance",



  },



  {



    id: "farmer",



    name: "Farmer",



    description: "Crop, livestock, and field-work guidance",



  },



  {



    id: "health",



    name: "Health Department",



    description: "Facility and clinical readiness",



  },



  {



    id: "authority",



    name: "Local Authority",



    description: "Municipal heat action response",



  },



];



function Alerts() {



  const [alerts, setAlerts] = useState([]);
  const [regions, setRegions] = useState([]);



  const [advisories, setAdvisories] = useState([]);



  const [liveWeather, setLiveWeather] = useState([]);



  const [loading, setLoading] = useState(true);



  const [loadError, setLoadError] = useState("");



  const [selectedAlert, setSelectedAlert] =



    useState(null);



  const [selectedStakeholder, setSelectedStakeholder] =



    useState("citizen");



  useEffect(() => {
    let cancelled = false;

    Promise.all([getRegions(), getAdvisories()])
      .then(([regionsData, advisoriesData]) => {
        if (cancelled) return;
        setRegions(Array.isArray(regionsData) ? regionsData : regionsData?.regions || []);
        setAdvisories(Array.isArray(advisoriesData) ? advisoriesData : advisoriesData?.advisories || []);
      })
      .catch((error) => {
        console.error("Alerts data error:", error);
        setLoadError("Unable to load region or advisory data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);


  useEffect(() => {



    let cancelled = false;



    async function loadLiveWeather() {



      try {



        const data = await getLiveWeatherData();



        if (!cancelled) {



          setLiveWeather(Array.isArray(data) ? data : []);



        }



      } catch (error) {



        console.error("Alerts live weather error:", error);



      }



    }



    loadLiveWeather();



    const refreshInterval = setInterval(loadLiveWeather, 5 * 60 * 1000);



    return () => {



      cancelled = true;



      clearInterval(refreshInterval);



    };



  }, []);



  /*
   * Build alerts from live observations using the shared HeatCast rules.
   * Static alerts.json is deliberately not used to decide which regions
   * currently have heat risk.
   */
  useEffect(() => {
    if (!regions.length || !liveWeather.length) return;

    const nextAlerts = regions
      .map((region) => {
        const live = findLiveRegion(liveWeather, region.name);
        const metrics = getHeatMetrics(region, live);
        if (!metrics.hasLiveWeather ||
            !["Moderate", "High", "Severe", "Extreme"].includes(metrics.severity)) {
          return null;
        }

        const severity = metrics.severity;
        const temperature = metrics.temperature;
        const forecastMax = metrics.forecastMaximum;
        const refreshedAt = metrics.refreshedAt;
        const validUntil = refreshedAt
          ? `Live conditions · updated ${new Intl.DateTimeFormat("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Kolkata",
            }).format(new Date(refreshedAt))} IST`
          : "Live conditions · refreshed periodically";

        return {
          id: `LIVE-${region.name.replace(/[^a-z0-9]+/gi, "-").toUpperCase()}`,
          title: `${severity} heat risk`,
          severity,
          description: `Current live weather indicates ${severity.toLowerCase()} heat risk in ${region.name}.`,
          region: region.name,
          expectedMax: forecastMax != null
            ? `${Number(forecastMax).toFixed(1)}°C forecast maximum`
            : temperature != null
            ? `${Number(temperature).toFixed(1)}°C current temperature`
            : "Unavailable",
          validUntil,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const rank = { Extreme: 4, Severe: 3, High: 2, Moderate: 1 };
        return rank[b.severity] - rank[a.severity];
      });

    setAlerts(nextAlerts);
    setSelectedAlert((current) => {
      if (current) {
        const existing = nextAlerts.find(
          (alert) => alert.region === (current.region || current.location)
        );
        if (existing) return existing;
      }
      return nextAlerts[0] || null;
    });
  }, [regions, liveWeather]);


  if (loading) {



    return (



      <div className="page">



        <div className="page-placeholder">



          <h2>Loading alerts...</h2>



        </div>



      </div>



    );



  }



  if (!selectedAlert) {



    return (



      <div className="page alerts-page">



        <div className="page-placeholder">



          <h2>{loadError ? "Alerts unavailable" : liveWeather.length === 0 ? "Waiting for live weather" : "No active heat-risk alerts"}</h2>



          <p>



            {loadError ||



              (liveWeather.length === 0
                ? "Live weather has not loaded yet. Check that the backend is running and weather records are available."
                : "No regions currently meet the configured Moderate-or-higher heat-risk threshold.")}



          </p>



          {liveWeather.length > 0 && (



            <p>



              Live weather is connected for {liveWeather.length} regions.



            </p>



          )}



        </div>



      </div>



    );



  }



  /*



   * Helper so the page remains compatible



   * with the mock JSON even if some fields



   * are named slightly differently.



   */



  const getValue = (



    object,



    ...keys



  ) => {



    for (const key of keys) {



      if (



        object &&



        object[key] !== undefined &&



        object[key] !== null



      ) {



        return object[key];



      }



    }



    return "—";



  };



  const selectedAlertId =



    getValue(



      selectedAlert,



      "id",



      "alertId",



      "code"



    );



  const selectedRegion =



    getValue(



      selectedAlert,



      "region",



      "location"



    );



  const selectedLiveWeather = liveWeather.find(



    (item) =>



      item.region?.toString().trim().toLowerCase() ===



      selectedRegion?.toString().trim().toLowerCase()



  );



  const liveCurrentTemperature =



    selectedLiveWeather?.current?.temperature_2m ??



    selectedLiveWeather?.current?.temperature;



  const liveCurrentHumidity =



    selectedLiveWeather?.current?.relative_humidity_2m ??



    selectedLiveWeather?.current?.relative_humidity ??



    selectedLiveWeather?.current?.humidity;



  const liveFeelsLike =



    selectedLiveWeather?.current?.apparent_temperature ??



    selectedLiveWeather?.current?.apparentTemperature;



  const liveWeatherUpdatedAt =



    selectedLiveWeather?.refreshedAt ||



    selectedLiveWeather?.updatedAt;



  const formattedLiveUpdate = liveWeatherUpdatedAt



    ? new Intl.DateTimeFormat("en-IN", {



        dateStyle: "medium",



        timeStyle: "short",



        timeZone: "Asia/Kolkata",



      }).format(new Date(liveWeatherUpdatedAt))



    : null;



  /*



   * Find advisory for the currently



   * selected alert + stakeholder.



   */





  // Generate advisory content from the selected region's current weather.

  // Existing JSON advisories are used only as supplementary fallback content.

  const currentTemperature = Number(liveCurrentTemperature);

  const feelsLikeTemperature = Number(liveFeelsLike);

  const currentHumidity = Number(liveCurrentHumidity);



  const hasTemperature =

    liveCurrentTemperature !== null &&

    liveCurrentTemperature !== undefined &&

    Number.isFinite(currentTemperature);



  const hasFeelsLike =

    liveFeelsLike !== null &&

    liveFeelsLike !== undefined &&

    Number.isFinite(feelsLikeTemperature);



  const hasHumidity =

    liveCurrentHumidity !== null &&

    liveCurrentHumidity !== undefined &&

    Number.isFinite(currentHumidity);



  const heatIndicator = Math.max(

    hasTemperature ? currentTemperature : -Infinity,

    hasFeelsLike ? feelsLikeTemperature : -Infinity

  );



  let heatLevel = "moderate";



  if (heatIndicator >= 42) {

    heatLevel = "extreme";

  } else if (heatIndicator >= 38) {

    heatLevel = "high";

  } else if (heatIndicator >= 34) {

    heatLevel = "elevated";

  } else if (heatIndicator >= 0 && heatIndicator < 34) {

    heatLevel = "moderate";

  }



  const levelLabel = {

    moderate: "Heat Safety Guidance",

    elevated: "Elevated Heat Precautions",

    high: "High Heat Advisory",

    extreme: "Extreme Heat Precautions"

  }[heatLevel];



  const weatherSummary = hasTemperature

    ? `Current temperature in ${selectedRegion} is ${currentTemperature.toFixed(1)}°C` +

      (hasFeelsLike

        ? `, with a feels-like temperature of ${feelsLikeTemperature.toFixed(1)}°C`

        : "") +

      (hasHumidity ? ` and relative humidity of ${Math.round(currentHumidity)}%` : "") +

      "."

    : `Live weather is currently unavailable for ${selectedRegion}. Use the precautionary guidance below and check official local updates.`;



  const stakeholderGuidance = {

    citizen: {

      moderate: [

        "Drink water regularly and take breaks in a cool or shaded place.",

        "Limit strenuous outdoor activity if you begin to feel overheated.",

        "Check on children, older adults, and people who may be more vulnerable to heat."

      ],

      elevated: [

        "Drink water regularly and reduce prolonged exposure to direct sunlight.",

        "Prefer shaded or cool places and schedule strenuous outdoor activity for cooler hours.",

        "Check on children, older adults, and people with existing health vulnerabilities."

      ],

      high: [

        "Avoid strenuous outdoor activity during the hottest part of the day.",

        "Stay in a cool or shaded environment, drink water regularly, and wear lightweight clothing.",

        "Seek medical help for confusion, fainting, or other signs of serious heat illness."

      ],

      extreme: [

        "Minimize outdoor activity and remain in a cool indoor place where possible.",

        "Drink water regularly unless a healthcare professional has advised fluid restriction.",

        "Confusion, collapse, or altered consciousness can be an emergency; seek urgent medical help."

      ]

    },

    farmer: {

      moderate: [

        "Plan demanding field work for cooler morning or evening hours when practical.",

        "Provide reliable drinking water and shaded rest breaks for workers.",

        "Ensure livestock have access to shade and clean drinking water."

      ],

      elevated: [

        "Shift strenuous field work away from the hottest hours where practical.",

        "Increase shaded rest breaks and ensure workers have access to drinking water.",

        "Check livestock for heat stress and provide shade and adequate water."

      ],

      high: [

        "Avoid strenuous field work during peak afternoon heat where possible.",

        "Provide frequent rest in shade, drinking water, and a buddy check for workers.",

        "Monitor livestock closely and ensure shaded areas and water are readily available."

      ],

      extreme: [

        "Suspend or reschedule strenuous outdoor work during the hottest period where feasible.",

        "Keep workers in shaded or cool rest areas and watch for heat-illness symptoms.",

        "Move livestock to shade where possible and ensure continuous access to clean water."

      ]

    },

    health: {

      moderate: [

        "Reinforce routine screening for heat-related symptoms in at-risk patients.",

        "Remind staff to maintain hydration and reduce avoidable heat exposure.",

        "Review local heat-health guidance and escalation procedures."

      ],

      elevated: [

        "Remind clinical teams to assess heat exposure in symptomatic and vulnerable patients.",

        "Check availability of drinking water, cooling, and basic heat-illness supplies.",

        "Share prevention advice with older adults and people with chronic conditions."

      ],

      high: [

        "Review readiness to triage and manage heat exhaustion and heatstroke.",

        "Check cooling, hydration, staffing, and escalation arrangements for increased demand.",

        "Use current local health-department protocols for suspected heat-related illness."

      ],

      extreme: [

        "Activate applicable local heat-health readiness procedures.",

        "Confirm triage, cooling, emergency escalation, and staffing arrangements.",

        "Follow official health-department instructions and report unusual increases in heat-related cases."

      ]

    },

    authority: {

      moderate: [

        "Share routine heat-safety messaging through local communication channels.",

        "Check public drinking-water access and shaded public spaces.",

        "Monitor official forecasts and local warnings for changing conditions."

      ],

      elevated: [

        "Increase public reminders about hydration and avoiding peak heat.",

        "Check drinking-water points, shaded areas, and access to cooling facilities.",

        "Coordinate updates with local health and emergency teams."

      ],

      high: [

        "Disseminate timely heat-safety guidance through trusted local channels.",

        "Check readiness of water points, cooling shelters, and assistance for vulnerable residents.",

        "Coordinate with health and emergency services and follow official warning protocols."

      ],

      extreme: [

        "Issue or relay official local heat warnings according to established procedures.",

        "Prioritize access to cooling, drinking water, and assistance for vulnerable residents.",

        "Coordinate response services and follow instructions from the responsible authorities."

      ]

    }

  };



  const selectedGuidance =

    stakeholderGuidance[selectedStakeholder] ||

    stakeholderGuidance.citizen;



  const generatedActions = selectedGuidance[heatLevel];



  const advisoryTitle = hasTemperature

    ? levelLabel

    : "Heat Safety Guidance — Live Data Unavailable";



  const advisoryDescription = weatherSummary;



  const actionList = generatedActions;



  const advisorySourceLabel = hasTemperature

    ? `Guidance adjusted using current weather conditions for ${selectedRegion}.`

    : "Precautionary guidance only; live weather could not be matched to this region.";





  return (



    <div className="page alerts-page">



      {/* =====================================================



          PAGE HEADER



      ===================================================== */}



      <div className="page-heading">



        <div>



          <div className="eyebrow">



            EARLY WARNING



          </div>



          <h1>



            Alerts & Advisories



          </h1>



          <p>



            Active warnings translated into actions.



            Select a warning, then choose the stakeholder



            to see the advisory written for that audience.



          </p>



        </div>



      </div>



      {/* =====================================================



          MAIN ALERT + ADVISORY AREA



      ===================================================== */}



      <div className="alerts-layout">



        {/* ===================================================



            LEFT — ACTIVE WARNINGS



        =================================================== */}



        <section className="alerts-column">
          <div className="alerts-section-heading">
            <h3>Active warnings</h3>
            <div className="alerts-heading-counts">
              <span>{alerts.length} in force</span>
              <span className="alerts-live-count">{liveWeather.length} live regions</span>
            </div>
          </div>

          <div className="alerts-dropdown-wrap">
            <label className="alerts-dropdown-label" htmlFor="active-alert-select">Select a region</label>
            <select
              id="active-alert-select"
              className="alerts-dropdown-select"
              value={selectedAlert ? getValue(selectedAlert, "region", "location") : ""}
              onChange={(event) => {
                const nextAlert = alerts.find((alert) => getValue(alert, "region", "location") === event.target.value);
                if (nextAlert) {
                  setSelectedAlert(nextAlert);
                  setSelectedStakeholder("citizen");
                }
              }}
              disabled={alerts.length === 0}
            >
              {alerts.length === 0 ? (
                <option value="">No active alerts</option>
              ) : alerts.map((alert, index) => {
                const region = getValue(alert, "region", "location");
                const severity = getValue(alert, "severity", "level");
                return (
                  <option key={getValue(alert, "id", "alertId", "code") || `${region}-${index}`} value={region}>
                    {region} — {severity}
                  </option>
                );
              })}
            </select>

            {selectedAlert && (
              <div className="alerts-dropdown-summary">
                <div className="alert-card-top">
                  <div>
                    <div className="alert-title">{getValue(selectedAlert, "title", "name", "type")}</div>
                    <div className="alert-id">{getValue(selectedAlert, "id", "alertId", "code")}</div>
                  </div>
                  <SeverityBadge>{getValue(selectedAlert, "severity", "level")}</SeverityBadge>
                </div>
                <p className="alert-description">{getValue(selectedAlert, "description", "message", "text")}</p>
                <div className="alert-meta">
                  <span><small>Region</small><strong>{getValue(selectedAlert, "region", "location")}</strong></span>
                  <span><small>Expected max</small><strong>{getValue(selectedAlert, "expectedMax", "expected_max", "maxTemperature")}</strong></span>
                  <span><small>Valid until</small><strong>{getValue(selectedAlert, "validUntil", "valid_until", "expires")}</strong></span>
                  <span><small>Live temperature</small><strong>
                    {(() => {
                      const regionName = String(getValue(selectedAlert, "region", "location")).trim().toLowerCase();
                      const live = liveWeather.find((item) => item.region?.toString().trim().toLowerCase() === regionName);
                      const temp = live?.current?.temperature_2m ?? live?.current?.temperature;
                      return temp != null ? `${temp}°C` : "Unavailable";
                    })()}
                  </strong></span>
                </div>
                <div className="alert-card-action">Showing advisory on the right</div>
              </div>
            )}
            {alerts.length === 0 && (
              <div className="alerts-empty-message">
                <h3>{loadError ? "Alerts unavailable" : liveWeather.length === 0 ? "Waiting for live weather" : "No active heat-risk alerts"}</h3>
                <p>{loadError || (liveWeather.length === 0
                  ? "Live weather has not loaded yet. Check that the backend is running and weather records are available."
                  : "No regions currently meet the configured Moderate-or-higher heat-risk threshold.")}</p>
                {liveWeather.length > 0 && <p>Live weather is connected for {liveWeather.length} regions.</p>}
              </div>
            )}
          </div>
        </section>



        {/* ===================================================



            RIGHT — ADVISORY



        =================================================== */}



        <section className="advisory-section">



          <div className="advisory-section-heading">



            <div>



              <h3>



                Advisory



              </h3>



            </div>



          </div>



          <div className="advisory-panel">



            {/* Advisory header */}



            <div className="advisory-header">



              <div>



                <div className="advisory-id">



                  {selectedAlertId}



                </div>



                <h2>



                  {selectedRegion}



                </h2>



                <p>



                  Active warning • valid until{" "}



                  {getValue(



                    selectedAlert,



                    "validUntil",



                    "valid_until",



                    "expires"



                  )}



                </p>



                <p className="alerts-live-status">



                  {selectedLiveWeather



                    ? `Live weather: ${liveCurrentTemperature ?? "—"}°C · Humidity: ${liveCurrentHumidity ?? "—"}%${liveFeelsLike != null ? ` · Feels like: ${liveFeelsLike}°C` : ""}`



                    : "Live weather is not available for this region."}



                  {formattedLiveUpdate



                    ? ` · Updated ${formattedLiveUpdate} IST`



                    : ""}



                </p>



              </div>



              <SeverityBadge>



                {getValue(



                  selectedAlert,



                  "severity",



                  "level"



                )}



              </SeverityBadge>



            </div>



            {/* Warning facts */}



            <ul className="warning-facts">



              <li>



                Peak maximum temperature{" "}



                {getValue(



                  selectedAlert,



                  "expectedMax",



                  "expected_max",



                  "maxTemperature"



                )}



              </li>



              <li>



                Current region:{" "}



                {selectedRegion}



              </li>



              <li>



                Live temperature:{" "}



                {liveCurrentTemperature != null



                  ? `${liveCurrentTemperature}°C`



                  : "Unavailable"}



              </li>



              <li>



                Live relative humidity:{" "}



                {liveCurrentHumidity != null



                  ? `${liveCurrentHumidity}%`



                  : "Unavailable"}



              </li>



              <li>



                Heatwave warning remains in force.



              </li>



            </ul>



            {/* Stakeholders */}



            <div className="stakeholder-tabs">



              {stakeholders.map(



                (stakeholder) => (



                  <button



                    key={stakeholder.id}



                    className={



                      selectedStakeholder ===



                      stakeholder.id



                        ? "stakeholder-tab active"



                        : "stakeholder-tab"



                    }



                    onClick={() =>



                      setSelectedStakeholder(



                        stakeholder.id



                      )



                    }



                  >



                    <strong>



                      {stakeholder.name}



                    </strong>



                    <span>



                      {stakeholder.description}



                    </span>



                  </button>



                )



              )}



            </div>



            {/* Advisory content */}



            <div className="advisory-content">



              <div className="advisory-label">



                <span>



                  ●



                </span>



                ADVISORY —{" "}



                {



                  stakeholders.find(



                    (item) =>



                      item.id ===



                      selectedStakeholder



                  )?.name



                }



              </div>



              <h3>



                {advisoryTitle}



              </h3>



              {advisoryDescription !== "—" && (



                <p className="advisory-description">



                  {advisoryDescription}



                </p>



              )}



              {actionList.length > 0 && (



                <ul>



                  {actionList.map(



                    (action, index) => (



                      <li key={index}>



                        {action}



                      </li>



                    )



                  )}



                </ul>



              )}



              {actionList.length === 0 && (



                <ul>



                  <li>



                    Follow the heatwave guidance



                    issued for {selectedRegion}.



                  </li>



                  <li>



                    Avoid unnecessary exposure during



                    peak afternoon temperatures.



                  </li>



                  <li>



                    Follow official local warnings and



                    emergency instructions.



                  </li>



                </ul>



              )}



              <div className="advisory-placeholder">

                {advisorySourceLabel} These recommendations are general precautions, not an official warning. Follow official local alerts and medical guidance.

              </div>



            </div>



          </div>



        </section>



      </div>



    </div>



  );



}



export default Alerts;
