import { regions } from "../data/mockData";
import SeverityBadge from "./SeverityBadge";

export default function RegionalTable({ limit }) {
  const data = limit ? regions.slice(0, limit) : regions;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>REGION</th>
            <th>MAX TEMP</th>
            <th>DEPARTURE</th>
            <th>STATUS</th>
            <th>SEVERITY</th>
            <th>RISK</th>
            <th>TREND</th>
          </tr>
        </thead>

        <tbody>
          {data.map((region) => (
            <tr key={region.name}>
              <td>
                <strong>{region.name}</strong>
                <small>{region.state}</small>
              </td>

              <td>{region.temperature.toFixed(1)}°C</td>

              <td
                className={
                  region.departure >= 3 ? "danger-text" : "muted-text"
                }
              >
                +{region.departure.toFixed(1)}°C
              </td>

              <td>
                <SeverityBadge>{region.status}</SeverityBadge>
              </td>

              <td>
                <SeverityBadge>{region.severity}</SeverityBadge>
              </td>

              <td>
                <SeverityBadge>{region.risk}</SeverityBadge>
              </td>

              <td className="trend">
                {region.trend === "up"
                  ? "↗"
                  : region.trend === "down"
                  ? "↘"
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}