import { chartTemperatures } from "../data/mockData";

export default function TemperatureChart({ compact = false }) {
  const width = 760;
  const height = compact ? 190 : 250;

  const min = 34;
  const max = 46;

  const points = chartTemperatures.map((value, index) => {
    const x = (index / (chartTemperatures.length - 1)) * width;
    const y = height - ((value - min) / (max - min)) * (height - 30);
    return `${x},${y}`;
  });

  const areaPoints = `0,${height} ${points.join(" ")} ${width},${height}`;

  return (
    <div className="chart-wrap">
      <svg
        className="temperature-chart"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="heatFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff8a1f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff8a1f" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((line) => (
          <line
            key={line}
            x1="0"
            x2={width}
            y1={(height / 4) * line + 10}
            y2={(height / 4) * line + 10}
            stroke="#263342"
            strokeDasharray="3 5"
          />
        ))}

        <polygon points={areaPoints} fill="url(#heatFill)" />

        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#ff8a1f"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {chartTemperatures.map((value, index) => {
          const x = (index / (chartTemperatures.length - 1)) * width;
          const y = height - ((value - min) / (max - min)) * (height - 30);

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2.5"
              fill="#ff8a1f"
            />
          );
        })}
      </svg>

      <div className="chart-x-axis">
        {["D-14", "D-12", "D-10", "D-8", "D-6", "D-4", "D-2", "Today"].map(
          (item) => (
            <span key={item}>{item}</span>
          )
        )}
      </div>
    </div>
  );
}