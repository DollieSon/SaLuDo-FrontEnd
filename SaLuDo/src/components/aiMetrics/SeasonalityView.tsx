import { useState, useEffect } from "react";
import { SeasonalityChart } from "./SeasonalityChart";
import { fetchSeasonalityAnalysis } from "../../utils/aiMetricsApi";
import type { SeasonalityAnalysisData } from "../../types/aiTrends";
import type { DateRangeOption, AIServiceType } from "../../types/aiMetrics";
import { SERVICE_DISPLAY_NAMES } from "../../types/aiMetrics";

interface SeasonalityViewProps {
  dateRange: DateRangeOption;
}

export const SeasonalityView = ({ dateRange }: SeasonalityViewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SeasonalityAnalysisData | null>(null);
  const [selectedService, setSelectedService] = useState<AIServiceType | undefined>(undefined);
  const [selectedMetric, setSelectedMetric] = useState<"requestCount" | "avgErrorRate" | "avgLatency">("requestCount");

  useEffect(() => {
    loadSeasonality();
  }, [dateRange, selectedService]);

  const loadSeasonality = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSeasonalityAnalysis(dateRange, selectedService);
      setData(result);
    } catch (err) {
      console.error("Failed to load seasonality:", err);
      setError(err instanceof Error ? err.message : "Failed to load seasonality data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading seasonality analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error: {error}</p>
        <button onClick={loadSeasonality} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!data || !data.patterns || data.patterns.length === 0) {
    return <div className="empty-state">No seasonality data available</div>;
  }

  const pattern = data.patterns[0];

  return (
    <div className="seasonality-view">
      {/* Controls */}
      <div className="seasonality-controls" style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column", fontSize: "0.85rem", color: "#5f6c80", gap: "0.25rem" }}>
          Service Filter
          <select
            value={selectedService || "all"}
            onChange={(e) => setSelectedService(e.target.value === "all" ? undefined : (e.target.value as AIServiceType))}
            style={{ padding: "0.5rem 0.75rem", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "0.9rem", background: "#fff" }}
          >
            <option value="all">All Services</option>
            {Object.entries(SERVICE_DISPLAY_NAMES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", fontSize: "0.85rem", color: "#5f6c80", gap: "0.25rem" }}>
          Metric
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as "requestCount" | "avgErrorRate" | "avgLatency")}
            style={{ padding: "0.5rem 0.75rem", borderRadius: "10px", border: "1px solid #d1d5db", fontSize: "0.9rem", background: "#fff" }}
          >
            <option value="requestCount">Request Count</option>
            <option value="avgErrorRate">Error Rate</option>
            <option value="avgLatency">Latency</option>
          </select>
        </label>
      </div>

      {/* Chart */}
      <div className="chart-section" style={{ marginBottom: "2rem" }}>
        <h3>Day of Week Patterns</h3>
        <div className="chart-container">
          <SeasonalityChart data={pattern.byDayOfWeek} metric={selectedMetric} />
        </div>
      </div>

      {/* Summary */}
      <div className="metrics-overview" style={{ marginBottom: "2rem" }}>
        <div className="metric-card">
          <p className="label">Busiest Day</p>
          <h3 className="value">{pattern.outliers.busiestDay}</h3>
        </div>
        <div className="metric-card">
          <p className="label">Quietest Day</p>
          <h3 className="value">{pattern.outliers.quietestDay}</h3>
        </div>
        <div className="metric-card">
          <p className="label">Highest Error Day</p>
          <h3 className="value">{pattern.outliers.highestErrorDay}</h3>
        </div>
        <div className="metric-card">
          <p className="label">Lowest Error Day</p>
          <h3 className="value">{pattern.outliers.lowestErrorDay}</h3>
        </div>
      </div>

      {/* Insights */}
      {pattern.insights && pattern.insights.length > 0 && (
        <div className="chart-section">
          <h3>Insights</h3>
          <ul style={{ margin: 0, paddingLeft: "1.5rem", lineHeight: "1.8" }}>
            {pattern.insights.map((insight, idx) => (
              <li key={idx} style={{ color: "#4b5563" }}>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
