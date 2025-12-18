import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import type { DayOfWeekPattern } from "../../types/aiTrends";

interface SeasonalityChartProps {
  data: DayOfWeekPattern[];
  metric: "requestCount" | "avgErrorRate" | "avgLatency";
}

const METRIC_CONFIG = {
  requestCount: {
    label: "Request Count",
    color: "#3b82f6",
    formatter: (v: number) => v.toLocaleString(),
  },
  avgErrorRate: {
    label: "Error Rate (%)",
    color: "#ef4444",
    formatter: (v: number) => `${v.toFixed(1)}%`,
  },
  avgLatency: {
    label: "Avg Latency (ms)",
    color: "#8b5cf6",
    formatter: (v: number) => `${v.toFixed(0)}ms`,
  },
};

export const SeasonalityChart = ({ data, metric }: SeasonalityChartProps) => {
  if (!data || data.length === 0) {
    return <div className="empty-state">No seasonality data available</div>;
  }

  const config = METRIC_CONFIG[metric];
  const chartData = data.map((day) => ({
    dayName: day.dayName,
    value: day.metrics[metric],
    deviation: day.deviation[
      metric === "requestCount"
        ? "requestDeviation"
        : metric === "avgErrorRate"
        ? "errorRateDeviation"
        : "latencyDeviation"
    ],
  }));

  // Color bars based on deviation (red for high positive, green for negative)
  const getBarColor = (deviation: number) => {
    if (deviation > 10) return "#ef4444"; // High deviation - red
    if (deviation < -10) return "#10b981"; // Low deviation - green
    return config.color; // Normal - default color
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="dayName"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tickFormatter={config.formatter}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <Tooltip
          formatter={(value: number) => [config.formatter(value), config.label]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
        <Legend formatter={() => config.label} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.deviation)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
