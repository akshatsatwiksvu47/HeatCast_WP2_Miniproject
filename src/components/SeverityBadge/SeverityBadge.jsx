import "./SeverityBadge.css";

function SeverityBadge({ children }) {
  const value = String(children).toLowerCase();

  let className = "badge";

  if (value === "extreme") {
    className += " extreme";
  } else if (value === "severe") {
    className += " severe";
  } else if (value === "high") {
    className += " high";
  } else if (value === "moderate") {
    className += " moderate";
  } else if (value === "low") {
    className += " low";
  }

  return (
    <span className={className}>
      {children}
    </span>
  );
}

export default SeverityBadge;