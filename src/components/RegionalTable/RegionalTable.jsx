import { useEffect, useState } from "react";

import { getRegions } from "../../services/api";

import SeverityBadge from "../SeverityBadge/SeverityBadge";

function RegionalTable() {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    getRegions()
      .then((data) => setRegions(data))
      .catch((error) => {
        console.error("Regional data error:", error);
      });
  }, []);

  if (regions.length === 0) {
    return (
      <div className="table-wrap">
        <p style={{ padding: "20px" }}>
          Loading regional data...
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">

      <table>

        <thead>
          <tr>
            <th>REGION</th>
            <th>TEMPERATURE</th>
            <th>NORMAL</th>
            <th>DEPARTURE</th>
            <th>RISK</th>
            <th>SEVERITY</th>
            <th>STATUS</th>
          </tr>
        </thead>

        <tbody>

          {regions.map((region) => (

            <tr key={region.name}>

              <td>
                <strong>
                  {region.name}
                </strong>

                <small>
                  {region.state}
                </small>
              </td>

              <td>
                {region.temperature}°C
              </td>

              <td>
                {region.normal}°C
              </td>

              <td>
                +{region.departure}°C
              </td>

              <td>
                <SeverityBadge>
                  {region.risk}
                </SeverityBadge>
              </td>

              <td>
                <SeverityBadge>
                  {region.severity}
                </SeverityBadge>
              </td>

              <td>
                {region.status}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default RegionalTable;