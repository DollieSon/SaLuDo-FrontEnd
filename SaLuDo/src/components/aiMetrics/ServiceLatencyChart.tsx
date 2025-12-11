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
  resume_parsing: "#8b5cf6",    // Purple
  job_analysis: "#10b981",      // Green
  transcript_analysis: "#f59e0b", // Orange
  predictive_insights: "#ef4444", // Red
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
          formatter={(value: number, name: string) => [
            `${value.toFixed(0)}ms`, 
            SERVICE_DISPLAY_NAMES[name as AIServiceType] || name
          ]}
          labelFormatter={(label) => {
            const date = new Date(label);
            return date.toLocaleDateString();
          }}
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
            activeDot={{ r: 4 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ServiceLatencyChart;
