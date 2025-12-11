import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SERVICE_DISPLAY_NAMES, AIServiceType } from "../../types/aiMetrics";

interface ServiceLatencyChartProps {
  perServiceTrends: Record<AIServiceType, Array<{ date: string; avgLatency: number }>>;
}

const SERVICE_COLORS: Record<AIServiceType, string> = {
  RESUME_PARSING: "#3b82f6",
  JOB_ANALYSIS: "#10b981",
  TRANSCRIPT_ANALYSIS: "#f59e0b",
  PREDICTIVE_INSIGHTS: "#ef4444",
};

const ServiceLatencyChart: React.FC<ServiceLatencyChartProps> = ({ perServiceTrends }) => {
  // Transform data for Recharts
  const dateSet = new Set<string>();
  Object.values(perServiceTrends).forEach((trends) => {
    trends.forEach((trend) => {
      const date = typeof trend.date === "string" ? trend.date : new Date(trend.date).toISOString();
      dateSet.add(date.split("T")[0]);
    });
  });

  const sortedDates = Array.from(dateSet).sort();

  const chartData = sortedDates.map((date) => {
    const dataPoint: any = { date };

    Object.entries(perServiceTrends).forEach(([service, trends]) => {
      const trend = trends.find((t) => {
        const tDate = typeof t.date === "string" ? t.date : new Date(t.date).toISOString();
        return tDate.split("T")[0] === date;
      });
      dataPoint[service] = trend ? trend.avgLatency : null;
    });

    return dataPoint;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          }}
        />
        <YAxis
          label={{ value: "Latency (ms)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(0)}ms`, ""]}
          labelFormatter={(label) => {
            const date = new Date(label);
            return date.toLocaleDateString();
          }}
        />
        <Legend
          formatter={(value) => SERVICE_DISPLAY_NAMES[value as AIServiceType] || value}
        />
        {Object.keys(perServiceTrends).map((service) => (
          <Line
            key={service}
            type="monotone"
            dataKey={service}
            stroke={SERVICE_COLORS[service as AIServiceType]}
            name={service}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ServiceLatencyChart;
