export default function SeverityBadge({ children }) {
  const value = String(children).toLowerCase();

  let className = "badge";

  if (value.includes("extreme")) className += " extreme";
  else if (value.includes("severe")) className += " severe";
  else if (value.includes("high")) className += " high";
  else if (value.includes("moderate")) className += " moderate";
  else if (value.includes("low")) className += " low";

  return <span className={className}>{children}</span>;
}