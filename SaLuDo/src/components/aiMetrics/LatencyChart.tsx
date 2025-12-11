import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { HourlyLatencyItem } from "../../types/aiMetrics";

interface LatencyChartProps {
  data: HourlyLatencyItem[];
}

const formatLatency = (value: number): string => {
  return `${value.toFixed(0)}ms`;
};

const formatHour = (hourStr: string): string => {
  const date = new Date(hourStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

export const LatencyChart = ({ data }: LatencyChartProps) => {
  if (!data || data.length === 0) {
    return <div className="empty-state">No latency data available</div>;
  }

  const chartData = data.map((item) => ({
    ...item,
    hour: formatHour(item.hour),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tickFormatter={formatLatency}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatLatency(value),
            name === "avgLatency" ? "Average" : "P95",
          ]}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
        <Legend
          formatter={(value) =>
            value === "avgLatency" ? "Average Latency" : "P95 Latency"
          }
        />
        <Line
          type="monotone"
          dataKey="avgLatency"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="p95Latency"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
