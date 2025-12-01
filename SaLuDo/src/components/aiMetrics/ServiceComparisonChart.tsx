import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ServiceBreakdown } from "../../types/aiMetrics";
import { SERVICE_DISPLAY_NAMES } from "../../types/aiMetrics";

interface ServiceComparisonChartProps {
  data: ServiceBreakdown[];
  metric: "calls" | "latency" | "cost";
}

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

const formatValue = (value: number, metric: string): string => {
  switch (metric) {
    case "calls":
      return value.toLocaleString();
    case "latency":
      return `${value.toFixed(0)}ms`;
    case "cost":
      return `$${value.toFixed(4)}`;
    default:
      return value.toString();
  }
};

export const ServiceComparisonChart = ({ data, metric }: ServiceComparisonChartProps) => {
  if (!data || data.length === 0) {
    return <div className="empty-state">No service data available</div>;
  }

  const chartData = data.map((item) => ({
    name: SERVICE_DISPLAY_NAMES[item.service],
    value:
      metric === "calls"
        ? item.calls
        : metric === "latency"
        ? item.avgLatencyMs
        : item.totalCost,
  }));

  const metricLabel =
    metric === "calls"
      ? "Total Calls"
      : metric === "latency"
      ? "Avg Latency (ms)"
      : "Total Cost ($)";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => formatValue(v, metric)}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: "#374151" }}
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <Tooltip
          formatter={(value: number) => [formatValue(value, metric), metricLabel]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
