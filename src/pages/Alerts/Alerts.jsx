import { useEffect, useState } from "react";

import {
  getAlerts,
  getAdvisories,
} from "../../services/api";

import SeverityBadge from "../../components/SeverityBadge/SeverityBadge";

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

  const [advisories, setAdvisories] = useState([]);

  const [selectedAlert, setSelectedAlert] =
    useState(null);

  const [selectedStakeholder, setSelectedStakeholder] =
    useState("citizen");


  useEffect(() => {

    Promise.all([
      getAlerts(),
      getAdvisories(),
    ])

      .then(([alertsData, advisoriesData]) => {

        const loadedAlerts =
          Array.isArray(alertsData)
            ? alertsData
            : alertsData?.alerts || [];

        const loadedAdvisories =
          Array.isArray(advisoriesData)
            ? advisoriesData
            : advisoriesData?.advisories || [];

        setAlerts(loadedAlerts);

        setAdvisories(loadedAdvisories);

        if (loadedAlerts.length > 0) {
          setSelectedAlert(loadedAlerts[0]);
        }

      })

      .catch((error) => {

        console.error(
          "Alerts data error:",
          error
        );

      });

  }, []);


  if (!selectedAlert) {

    return (
      <div className="page">

        <div className="page-placeholder">

          <h2>
            Loading alerts...
          </h2>

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


  /*
   * Find advisory for the currently
   * selected alert + stakeholder.
   */

  const matchingAdvisory =
    advisories.find((item) => {

      const advisoryAlert =
        getValue(
          item,
          "alertId",
          "alert_id",
          "warningId"
        );

      const advisoryStakeholder =
        getValue(
          item,
          "stakeholder",
          "audience",
          "type"
        )
          ?.toString()
          .toLowerCase();


      const stakeholderMatches =
        advisoryStakeholder ===
          selectedStakeholder ||
        advisoryStakeholder ===
          stakeholders.find(
            (s) =>
              s.id === selectedStakeholder
          )?.name.toLowerCase();


      const alertMatches =
        advisoryAlert ===
        selectedAlertId;


      return (
        alertMatches &&
        stakeholderMatches
      );

    });


  /*
   * Fallback advisory if the JSON does not
   * contain stakeholder-specific data yet.
   */

  const advisory =
    matchingAdvisory ||
    advisories.find((item) => {

      const region =
        getValue(
          item,
          "region",
          "location"
        );

      return (
        region === selectedRegion
      );

    }) ||
    advisories[0] ||
    null;


  const advisoryTitle =
    advisory
      ? getValue(
          advisory,
          "title",
          "heading",
          "message"
        )
      : "Advisory unavailable";


  const advisoryDescription =
    advisory
      ? getValue(
          advisory,
          "description",
          "text",
          "content"
        )
      : "No advisory information is available.";


  const advisoryActions =
    advisory
      ? getValue(
          advisory,
          "actions",
          "recommendations",
          "guidance"
        )
      : [];


  const actionList =
    Array.isArray(advisoryActions)
      ? advisoryActions
      : advisoryActions
        ? [advisoryActions]
        : [];


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

            <h3>
              Active warnings
            </h3>

            <span>
              {alerts.length} in force
            </span>

          </div>


          <div className="alerts-list">

            {alerts.map((alert, index) => {

              const alertId =
                getValue(
                  alert,
                  "id",
                  "alertId",
                  "code"
                );


              const title =
                getValue(
                  alert,
                  "title",
                  "name",
                  "type"
                );


              const severity =
                getValue(
                  alert,
                  "severity",
                  "level"
                );


              const description =
                getValue(
                  alert,
                  "description",
                  "message",
                  "text"
                );


              const region =
                getValue(
                  alert,
                  "region",
                  "location"
                );


              const expectedMax =
                getValue(
                  alert,
                  "expectedMax",
                  "expected_max",
                  "maxTemperature"
                );


              const validUntil =
                getValue(
                  alert,
                  "validUntil",
                  "valid_until",
                  "expires"
                );


              const isSelected =
                selectedAlert === alert;


              return (

                <button
                  key={
                    alertId !== "—"
                      ? alertId
                      : `${region}-${index}`
                  }

                  className={
                    isSelected
                      ? "alert-list-card selected"
                      : "alert-list-card"
                  }

                  onClick={() => {

                    setSelectedAlert(alert);

                    setSelectedStakeholder(
                      "citizen"
                    );

                  }}

                >

                  <div className="alert-card-top">

                    <div>

                      <div className="alert-title">
                        {title}
                      </div>

                      <div className="alert-id">
                        {alertId}
                      </div>

                    </div>


                    <SeverityBadge>
                      {severity}
                    </SeverityBadge>

                  </div>


                  <p className="alert-description">
                    {description}
                  </p>


                  <div className="alert-meta">

                    <span>

                      <small>
                        Region
                      </small>

                      <strong>
                        {region}
                      </strong>

                    </span>


                    <span>

                      <small>
                        Expected max
                      </small>

                      <strong>
                        {expectedMax}
                      </strong>

                    </span>


                    <span>

                      <small>
                        Valid until
                      </small>

                      <strong>
                        {validUntil}
                      </strong>

                    </span>

                  </div>


                  <div className="alert-card-action">

                    {isSelected
                      ? "Showing advisory"
                      : "View advisory"}

                  </div>

                </button>

              );

            })}

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

                In the final system, this text will
                be generated per stakeholder by the
                AI/ML layer using validated forecast
                output.

              </div>

            </div>

          </div>

        </section>

      </div>

    </div>

  );

}


export default Alerts;