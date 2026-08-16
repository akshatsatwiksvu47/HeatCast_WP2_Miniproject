export default function StatCard({ label, value, unit = "", subtext, tone }) {
  return (
    <div className={`stat-card ${tone || ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        <small>{unit}</small>
      </div>
      <div className="stat-subtext">{subtext}</div>
    </div>
  );
}