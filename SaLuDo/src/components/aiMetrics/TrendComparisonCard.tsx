import { TrendIndicator } from "./TrendIndicator";
import type { MetricTrend } from "../../types/aiTrends";

interface TrendComparisonCardProps {
  title: string;
  current: number;
  previous: number;
  trend: MetricTrend;
  formatter?: (value: number) => string;
  inverse?: boolean;
  icon?: string;
}

export const TrendComparisonCard = ({
  title,
  current,
  previous,
  trend,
  formatter = (v) => v.toFixed(2),
  inverse = false,
  icon,
}: TrendComparisonCardProps) => {
  return (
    <div className="metric-card trend-comparison-card">
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        {icon && <span style={{ fontSize: "1.25rem" }}>{icon}</span>}
        <p className="label" style={{ margin: 0 }}>
          {title}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}>
        <h3 className="value" style={{ margin: 0 }}>
          {formatter(current)}
        </h3>
        <TrendIndicator trend={trend} inverse={inverse} size="medium" />
      </div>
      <div className="subtext" style={{ marginTop: "0.5rem" }}>
        <span>Previous: {formatter(previous)}</span>
        {trend.isSignificant && (
          <span style={{ marginLeft: "0.5rem", fontWeight: 600 }}>
            • Significant change
          </span>
        )}
      </div>
    </div>
  );
};
