import { useState, useEffect } from "react";
import { TrendComparisonCard } from "./TrendComparisonCard";
import { fetchDashboardWithTrends } from "../../utils/aiMetricsApi";
import type { DashboardWithTrendsResponse } from "../../types/aiTrends";
import type { DateRangeOption } from "../../types/aiMetrics";

interface TrendsViewProps {
  dateRange: DateRangeOption;
}

export const TrendsView = ({ dateRange }: TrendsViewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardWithTrendsResponse | null>(null);
  const [comparisonType, setComparisonType] = useState<"previous" | "year_ago" | "custom">("previous");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  useEffect(() => {
    // Don't auto-load for custom comparison without dates
    if (comparisonType === "custom" && (!customStartDate || !customEndDate)) {
      return;
    }
    loadTrends();
  }, [dateRange, comparisonType]);

  const loadTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      // Validate custom dates if comparison type is custom
      if (comparisonType === "custom") {
        if (!customStartDate || !customEndDate) {
          setError("Please select both start and end dates for custom comparison");
          setLoading(false);
          return;
        }
        if (new Date(customStartDate) >= new Date(customEndDate)) {
          setError("Start date must be before end date");
          setLoading(false);
          return;
        }
      }
      
      const result = await fetchDashboardWithTrends(
        dateRange, 
        comparisonType,
        customStartDate || undefined,
        customEndDate || undefined
      );
      setData(result);
    } catch (err) {
      console.error("Failed to load trends:", err);
      setError(err instanceof Error ? err.message : "Failed to load trends");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading trend analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error: {error}</p>
        <button onClick={loadTrends} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!data || !data.trends) {
    return <div className="empty-state">No trend data available</div>;
  }

  const { trends } = data;
  const { metrics } = trends;

  const formatCurrency = (value: number): string => `$${value.toFixed(4)}`;
  const formatPercent = (value: number): string => `${value.toFixed(1)}%`;
  const formatLatency = (value: number): string => `${value.toFixed(0)}ms`;
  const formatNumber = (value: number): string => value.toLocaleString();

  return (
    <div className="trends-view">
      {/* Comparison Toggle */}
      <div className="profile-tabs">
        <label style={{verticalAlign: "center"}}>
          Compare with:
        </label>
        <div
          style={{
            display: "inline-flex",
            gap: "0.5rem",
            padding: "0.25rem",
            background: "#f3f4f6",
            borderRadius: "12px",
          }}
        >
          <button
            className={`toggle-btn ${comparisonType === "previous" ? "active" : ""}`}
            onClick={() => setComparisonType("previous")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "8px",
              background: comparisonType === "previous" ? "#fff" : "transparent",
              color: comparisonType === "previous" ? "#1f2937" : "#6b7280",
              fontWeight: comparisonType === "previous" ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: comparisonType === "previous" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Previous Period
          </button>
          <button
            className={`toggle-btn ${comparisonType === "year_ago" ? "active" : ""}`}
            onClick={() => setComparisonType("year_ago")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "8px",
              background: comparisonType === "year_ago" ? "#fff" : "transparent",
              color: comparisonType === "year_ago" ? "#1f2937" : "#6b7280",
              fontWeight: comparisonType === "year_ago" ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: comparisonType === "year_ago" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Year Ago
          </button>
          <button
            className={`toggle-btn ${comparisonType === "custom" ? "active" : ""}`}
            onClick={() => setComparisonType("custom")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "8px",
              background: comparisonType === "custom" ? "#fff" : "transparent",
              color: comparisonType === "custom" ? "#1f2937" : "#6b7280",
              fontWeight: comparisonType === "custom" ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: comparisonType === "custom" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Custom Dates
          </button>
        </div>
      </div>

      {/* Custom Date Picker */}
      {comparisonType === "custom" && (
        <div style={{ 
          marginBottom: "1.5rem", 
          padding: "1rem", 
          background: "#f9fafb", 
          borderRadius: "12px",
          border: "1px solid #e5e7eb"
        }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.75rem" }}>
            Select comparison period:
          </p>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.875rem"
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.875rem"
                }}
              />
            </div>
            <button
              onClick={loadTrends}
              disabled={!customStartDate || !customEndDate}
              style={{
                padding: "0.5rem 1.25rem",
                background: (!customStartDate || !customEndDate) ? "#d1d5db" : "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: (!customStartDate || !customEndDate) ? "not-allowed" : "pointer",
                marginTop: "1.1rem"
              }}
            >
              Compare
            </button>
          </div>
        </div>
      )}

      {/* Key Metrics Comparison */}
      <div className="metrics-overview" style={{ marginBottom: "2rem" }}>
        <TrendComparisonCard
          title="Error Rate"
          current={metrics.errorRate.current}
          previous={metrics.errorRate.previous}
          trend={metrics.errorRate}
          formatter={formatPercent}
          inverse={true}
          icon="⚠️"
        />
        <TrendComparisonCard
          title="Avg Latency"
          current={metrics.avgLatency.current}
          previous={metrics.avgLatency.previous}
          trend={metrics.avgLatency}
          formatter={formatLatency}
          inverse={true}
          icon="⏱️"
        />
        <TrendComparisonCard
          title="Total Cost"
          current={metrics.totalCost.current}
          previous={metrics.totalCost.previous}
          trend={metrics.totalCost}
          formatter={formatCurrency}
          inverse={true}
          icon="💰"
        />
        <TrendComparisonCard
          title="Avg Rating"
          current={metrics.avgRating.current}
          previous={metrics.avgRating.previous}
          trend={metrics.avgRating}
          formatter={(v) => v.toFixed(2)}
          inverse={false}
          icon="⭐"
        />
        <TrendComparisonCard
          title="Request Count"
          current={metrics.requestCount.current}
          previous={metrics.requestCount.previous}
          trend={metrics.requestCount}
          formatter={formatNumber}
          inverse={false}
          icon="📊"
        />
      </div>

      {/* Insights Section */}
      {trends.insights && trends.insights.length > 0 && (
        <div className="chart-section" style={{ marginBottom: "2rem" }}>
          <h3>Key Insights</h3>
          <ul style={{ margin: 0, paddingLeft: "1.5rem", lineHeight: "1.8" }}>
            {trends.insights.map((insight, idx) => (
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
