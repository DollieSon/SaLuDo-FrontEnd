import { useState, useEffect } from "react";
import { QualityScoreCard } from "./QualityScoreCard";
import { TrendIndicator } from "./TrendIndicator";
import { fetchQualityTrends } from "../../utils/aiMetricsApi";
import type { QualityTrendsData } from "../../types/aiTrends";
import type { DateRangeOption, AIServiceType } from "../../types/aiMetrics";
import { SERVICE_DISPLAY_NAMES } from "../../types/aiMetrics";

interface QualityTrendsViewProps {
  dateRange: DateRangeOption;
}

export const QualityTrendsView = ({ dateRange }: QualityTrendsViewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QualityTrendsData | null>(null);
  const [selectedService, setSelectedService] = useState<AIServiceType | undefined>(undefined);

  useEffect(() => {
    loadQualityTrends();
  }, [dateRange, selectedService]);

  const loadQualityTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchQualityTrends(dateRange, selectedService);
      setData(result);
    } catch (err) {
      console.error("Failed to load quality trends:", err);
      setError(err instanceof Error ? err.message : "Failed to load quality trends");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading quality trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error: {error}</p>
        <button onClick={loadQualityTrends} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="empty-state">No quality data available</div>;
  }

  const { overall, byService, insights, recommendations } = data;

  return (
    <div className="quality-trends-view">
      {/* Service Filter */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "flex", flexDirection: "column", fontSize: "0.85rem", color: "#5f6c80", gap: "0.25rem", maxWidth: "300px" }}>
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
      </div>

      {/* Overall Quality */}
      <div style={{ marginBottom: "2rem" }}>
        <QualityScoreCard qualityScore={overall} title="Overall Quality Score" />
      </div>

      {/* By Service */}
      <div className="chart-section" style={{ marginBottom: "2rem" }}>
        <h3>Quality by Service</h3>
        <div className="metrics-overview">
          {Object.entries(byService).map(([service, score]) => (
            <div
              key={service}
              className="metric-card"
              style={{
                borderLeft: `4px solid ${
                  score.score >= 90
                    ? "#10b981"
                    : score.score >= 75
                    ? "#3b82f6"
                    : score.score >= 50
                    ? "#f59e0b"
                    : "#ef4444"
                }`,
              }}
            >
              <p className="label">{SERVICE_DISPLAY_NAMES[service as AIServiceType]}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <h3 className="value" style={{ margin: 0 }}>
                  {score.score.toFixed(0)}
                </h3>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                  {score.band}
                </span>
                <TrendIndicator trend={score.trend} showPercentage={false} />
              </div>
              <div className="subtext">
                <div>Edit: {score.avgEditPercentage.toFixed(1)}%</div>
                <div>Feedback: {score.feedbackCount}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="chart-section" style={{ marginBottom: "2rem" }}>
          <h3>Insights</h3>
          <ul style={{ margin: 0, paddingLeft: "1.5rem", lineHeight: "1.8" }}>
            {insights.map((insight, idx) => (
              <li key={idx} style={{ color: "#4b5563" }}>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="chart-section">
          <h3>Recommendations</h3>
          <ul style={{ margin: 0, paddingLeft: "1.5rem", lineHeight: "1.8" }}>
            {recommendations.map((rec, idx) => (
              <li key={idx} style={{ color: "#4b5563", fontWeight: 500 }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
