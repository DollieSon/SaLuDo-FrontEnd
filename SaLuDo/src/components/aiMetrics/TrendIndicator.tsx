import { TrendDirection, TREND_DIRECTION_COLORS, TREND_DIRECTION_ICONS } from "../../types/aiTrends";
import type { MetricTrend } from "../../types/aiTrends";

interface TrendIndicatorProps {
  trend: MetricTrend;
  showPercentage?: boolean;
  size?: "small" | "medium" | "large";
  inverse?: boolean; // If true, improving means decreasing (for errors, latency)
}

export const TrendIndicator = ({
  trend,
  showPercentage = true,
  size = "medium",
  inverse = false,
}: TrendIndicatorProps) => {
  // Adjust direction if inverse (e.g., for errors/latency, down is good)
  const displayDirection = inverse
    ? trend.direction === "improving"
      ? "degrading"
      : trend.direction === "degrading"
      ? "improving"
      : trend.direction
    : trend.direction;

  const color = TREND_DIRECTION_COLORS[displayDirection as TrendDirection];
  const icon = TREND_DIRECTION_ICONS[trend.direction as TrendDirection]; // Keep original icon

  const sizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  const iconSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <span
      className={`trend-indicator ${sizeClasses[size]}`}
      style={{ color, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
    >
      <span className={iconSizeClasses[size]} style={{ fontWeight: "bold" }}>
        {icon}
      </span>
      {showPercentage && (
        <span style={{ fontWeight: 600 }}>
          {Math.abs(trend.change).toFixed(1)}%
        </span>
      )}
    </span>
  );
};
