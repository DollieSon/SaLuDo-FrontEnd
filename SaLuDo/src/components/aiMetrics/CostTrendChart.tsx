import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DailyCostItem } from "../../types/aiMetrics";

interface CostTrendChartProps {
  data: DailyCostItem[];
}

const formatCurrency = (value: number): string => {
  return `$${value.toFixed(4)}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const CostTrendChart = ({ data }: CostTrendChartProps) => {
  if (!data || data.length === 0) {
    return <div className="empty-state">No cost data available</div>;
  }

  const chartData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12, fill: "#6b7280" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e7eb" }}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatCurrency(value),
            name === "inputCost" ? "Input Cost" : "Output Cost",
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
            value === "inputCost" ? "Input Cost" : "Output Cost"
          }
        />
        <Area
          type="monotone"
          dataKey="inputCost"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorInput)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="outputCost"
          stroke="#8b5cf6"
          fillOpacity={1}
          fill="url(#colorOutput)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
