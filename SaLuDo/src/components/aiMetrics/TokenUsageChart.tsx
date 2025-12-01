import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DailyTokenItem } from "../../types/aiMetrics";

interface TokenUsageChartProps {
  data: DailyTokenItem[];
}

const formatTokens = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const TokenUsageChart = ({ data }: TokenUsageChartProps) => {
  if (!data || data.length === 0) {
    return <div className="empty-state">No token data available</div>;
  }

  const chartData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tickFormatter={formatTokens}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatTokens(value),
            name === "inputTokens" ? "Input Tokens" : "Output Tokens",
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
            value === "inputTokens" ? "Input Tokens" : "Output Tokens"
          }
        />
        <Bar dataKey="inputTokens" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="outputTokens" fill="#a855f7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
