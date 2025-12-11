import { useCallback, useEffect, useState } from "react";
import "./css/AIMetrics.css";
import {
  CostTrendChart,
  LatencyChart,
  TrendsView,
  SeasonalityView,
  QualityTrendsView,
  AICallsHistory,
  ServiceLatencyChart,
} from "./aiMetrics";
import {
  fetchDashboardData,
  fetchCostAnalysis,
  fetchLatencyStats,
  fetchActiveAlerts,
  acknowledgeAlert,
  exportToCsv,
} from "../utils/aiMetricsApi";
import type {
  DashboardData,
  CostAnalysisData,
  LatencyStatsData,
  AIAlert,
  DateRangeOption,
} from "../types/aiMetrics";
import { SERVICE_DISPLAY_NAMES, ERROR_CATEGORY_NAMES } from "../types/aiMetrics";

type TabType = "overview" | "costs" | "performance" | "trends" | "seasonality" | "quality" | "history";

const AIMetricsDashboard = () => {
  // State
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [dateRange, setDateRange] = useState<DateRangeOption>("30d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [costData, setCostData] = useState<CostAnalysisData | null>(null);
  const [latencyData, setLatencyData] = useState<LatencyStatsData | null>(null);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);

  // Auto-refresh state
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [nextRefreshIn, setNextRefreshIn] = useState(60);

  // Fetch all data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashboardRes, costRes, latencyRes, alertsRes] =
        await Promise.all([
          fetchDashboardData(dateRange),
          fetchCostAnalysis(dateRange),
          fetchLatencyStats(dateRange),
          fetchActiveAlerts(),
        ]);

      setDashboard(dashboardRes);
      setCostData(costRes);
      setLatencyData(latencyRes);
      setAlerts(alertsRes);
      setLastRefresh(new Date());
      setNextRefreshIn(60);
    } catch (err) {
      console.error("Failed to load AI metrics:", err);
      setError(err instanceof Error ? err.message : "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh countdown
  useEffect(() => {
    const countdown = setInterval(() => {
      setNextRefreshIn((prev) => {
        if (prev <= 1) {
          loadData();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [loadData]);

  // Handle alert acknowledgment
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.alertId !== alertId));
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
      setError("Failed to acknowledge alert. Please try again.");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Export functionality
  const handleExport = () => {
    if (!dashboard) return;

    const exportData = dashboard.byService.map((service) => ({
      service: SERVICE_DISPLAY_NAMES[service.service],
      totalCalls: service.calls,
      successRate: `${service.successRate.toFixed(1)}%`,
      avgLatencyMs: service.avgLatencyMs.toFixed(0),
      totalCost: `$${service.totalCost.toFixed(4)}`,
    }));

    exportToCsv(exportData, "ai_metrics_report");
  };

  // Format helpers
  const formatCurrency = (value: number | undefined): string => 
    `$${(value ?? 0).toFixed(4)}`;
  const formatPercent = (value: number | undefined): string => 
    `${(value ?? 0).toFixed(1)}%`;
  const formatNumber = (value: number | undefined): string => 
    (value ?? 0).toLocaleString();
  const formatLatency = (value: number | undefined): string => 
    `${(value ?? 0).toFixed(0)}ms`;

  const getSuccessRateClass = (rate: number | undefined): string => {
    const r = rate ?? 0;
    if (r >= 95) return "high";
    if (r >= 80) return "medium";
    return "low";
  };

  // Safe accessors for dashboard data
  const overview = dashboard?.overview ?? {
    totalCalls: 0,
    successRate: 0,
    totalTokens: 0,
    totalCost: 0,
    avgLatencyMs: 0,
  };
  const byService = dashboard?.byService ?? [];
  const recentErrors = dashboard?.recentErrors ?? [];

  return (
    <div className="candidate-list">
      {/* Header */}
      <div className="ai-metrics-header">
        <div>
          <h2>AI Performance Metrics</h2>
          <p>Monitor Gemini API usage, costs, and performance</p>
        </div>
        <div className="header-controls">
          <div className="auto-refresh-indicator">
            <span className="dot" />
            <span>Refreshes in {nextRefreshIn}s</span>
          </div>
          <label>
            <span>Date Range</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </label>
          <button
            className="refresh-btn"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="export-btn" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadData}>Retry</button>
        </div>
      )}

      {/* Tabs */}
      <div className="metrics-tabs">
        <button
          className={`metrics-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`metrics-tab ${activeTab === "costs" ? "active" : ""}`}
          onClick={() => setActiveTab("costs")}
        >
          Costs
        </button>
        <button
          className={`metrics-tab ${activeTab === "performance" ? "active" : ""}`}
          onClick={() => setActiveTab("performance")}
        >
          Performance
        </button>
        <button
          className={`metrics-tab ${activeTab === "trends" ? "active" : ""}`}
          onClick={() => setActiveTab("trends")}
        >
          Trends
        </button>
        <button
          className={`metrics-tab ${activeTab === "seasonality" ? "active" : ""}`}
          onClick={() => setActiveTab("seasonality")}
        >
          Seasonality
        </button>
        <button
          className={`metrics-tab ${activeTab === "quality" ? "active" : ""}`}
          onClick={() => setActiveTab("quality")}
        >
          Quality
        </button>
        <button
          className={`metrics-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Call History
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* Overview Cards */}
          <div className="metrics-overview">
            <div className="metric-card">
              <p className="label">Total API Calls</p>
              <p className="value">{formatNumber(overview.totalCalls)}</p>
              <span className="subtext">In selected period</span>
            </div>
            <div
              className={`metric-card ${
                overview.successRate >= 95
                  ? "success"
                  : overview.successRate >= 80
                  ? "warning"
                  : "danger"
              }`}
            >
              <p className="label">Success Rate</p>
              <p className="value">{formatPercent(overview.successRate)}</p>
              <span className="subtext">Successful / Total</span>
            </div>
            <div className="metric-card info">
              <p className="label">Total Tokens</p>
              <p className="value">{formatNumber(overview.totalTokens)}</p>
              <span className="subtext">Input + Output</span>
            </div>
            <div className="metric-card">
              <p className="label">Total Cost</p>
              <p className="value">{formatCurrency(overview.totalCost)}</p>
              <span className="subtext">Estimated spend</span>
            </div>
            <div className="metric-card">
              <p className="label">Avg Latency</p>
              <p className="value">{formatLatency(overview.avgLatencyMs)}</p>
              <span className="subtext">Response time</span>
            </div>
          </div>

          {/* Service Breakdown Table */}
          <div className="service-breakdown">
            <h3>Service Breakdown</h3>
            {byService.length === 0 ? (
              <div className="empty-state">No service data available yet</div>
            ) : (
            <table className="service-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Calls</th>
                  <th>Success Rate</th>
                  <th>Avg Latency</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {byService.map((service) => (
                  <tr key={service.service}>
                    <td className="service-name">
                      {SERVICE_DISPLAY_NAMES[service.service] || service.service}
                    </td>
                    <td>{formatNumber(service.calls)}</td>
                    <td>
                      <span
                        className={`success-rate ${getSuccessRateClass(
                          service.successRate
                        )}`}
                      >
                        {formatPercent(service.successRate)}
                      </span>
                    </td>
                    <td>{formatLatency(service.avgLatencyMs)}</td>
                    <td>{formatCurrency(service.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>

          {/* Service Comparison Chart */}
         
          {/* Recent Errors */}
          {recentErrors.length > 0 && (
            <div className="recent-errors">
              <h3>Recent Errors</h3>
              <div className="error-list">
                {recentErrors.slice(0, 5).map((error, idx) => (
                  <div key={idx} className="error-item">
                    <span className="service">
                      {SERVICE_DISPLAY_NAMES[error.service]}
                    </span>
                    <span className="error-category-badge">
                      {ERROR_CATEGORY_NAMES[error.errorCategory]}
                    </span>
                    <span className="message">{error.errorMessage}</span>
                    <span className="timestamp">
                      {new Date(error.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Costs Tab */}
      {activeTab === "costs" && costData && (
        <>
          {/* Cost Summary Cards */}
          <div className="cost-breakdown">
            <div className="cost-card">
              <p className="label">Total Cost</p>
              <p className="value">{formatCurrency(costData.summary.totalCost)}</p>
              <div className="breakdown">
                <span>Input: {formatCurrency(costData.summary.totalInputCost)}</span>
                <span>Output: {formatCurrency(costData.summary.totalOutputCost)}</span>
              </div>
            </div>
            <div className="cost-card">
              <p className="label">Daily Average</p>
              <p className="value">{formatCurrency(costData.summary.avgDailyCost)}</p>
              <span className="subtext">Per day in period</span>
            </div>
            <div className="cost-card">
              <p className="label">Projected Monthly</p>
              <p className="value">
                {formatCurrency(costData.summary.projectedMonthlyCost)}
              </p>
              <span className="subtext">Based on current usage</span>
            </div>
          </div>

          {/* Cost Trend Chart */}
          <div className="chart-section">
            <h3>Cost Trend</h3>
            <div className="chart-container">
              <CostTrendChart data={costData.dailyCosts} />
            </div>
          </div>
        </>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && latencyData && (
        <>
          {/* Latency Summary Cards */}
          <div className="metrics-overview">
            <div className="metric-card">
              <p className="label">Average Latency</p>
              <p className="value">{formatLatency(latencyData.overall.avgLatencyMs)}</p>
              <span className="subtext">Mean response time</span>
            </div>
            <div className="metric-card">
              <p className="label">P50 Latency</p>
              <p className="value">{formatLatency(latencyData.overall.p50LatencyMs)}</p>
              <span className="subtext">50th percentile</span>
            </div>
            <div className="metric-card warning">
              <p className="label">P95 Latency</p>
              <p className="value">{formatLatency(latencyData.overall.p95LatencyMs)}</p>
              <span className="subtext">95th percentile</span>
            </div>
            <div className="metric-card danger">
              <p className="label">P99 Latency</p>
              <p className="value">{formatLatency(latencyData.overall.p99LatencyMs)}</p>
              <span className="subtext">99th percentile</span>
            </div>
            <div className="metric-card">
              <p className="label">Min / Max</p>
              <p className="value">
                {formatLatency(latencyData.overall.minLatencyMs)} /{" "}
                {formatLatency(latencyData.overall.maxLatencyMs)}
              </p>
              <span className="subtext">Range</span>
            </div>
          </div>

          {/* Latency Chart */}
          <div className="chart-section">
            <h3>Latency Over Time (Overall)</h3>
            <div className="chart-container">
              <LatencyChart data={latencyData.hourlyLatency} />
            </div>
          </div>

          {/* Per-Service Latency Chart */}
          <div className="chart-section">
            <h3>Latency Over Time (By Service)</h3>
            <div className="chart-container">
              <ServiceLatencyChart perServiceTrends={latencyData.perServiceTrends} />
            </div>
          </div>

          {/* Latency by Service Table */}
          <div className="service-breakdown">
            <h3>Latency by Service</h3>
            <table className="service-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Average</th>
                  <th>P50</th>
                  <th>P95</th>
                  <th>P99</th>
                </tr>
              </thead>
              <tbody>
                {latencyData.byService.map((service) => (
                  <tr key={service.service}>
                    <td className="service-name">
                      {SERVICE_DISPLAY_NAMES[service.service] || service.service || "Unknown"}
                    </td>
                    <td>{formatLatency(service.avgLatencyMs)}</td>
                    <td>{formatLatency(service.p50LatencyMs)}</td>
                    <td>{formatLatency(service.p95LatencyMs)}</td>
                    <td>{formatLatency(service.p99LatencyMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Trends Tab */}
      {activeTab === "trends" && (
        <TrendsView dateRange={dateRange} />
      )}

      {/* Seasonality Tab */}
      {activeTab === "seasonality" && (
        <SeasonalityView dateRange={dateRange} />
      )}

      {/* Quality Tab */}
      {activeTab === "quality" && (
        <QualityTrendsView dateRange={dateRange} />
      )}

      {/* Call History Tab */}
      {activeTab === "history" && (
        <AICallsHistory dateRange={dateRange} />
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h3>
            Active Alerts <span className="alert-count">{alerts.length}</span>
          </h3>
          <div className="alerts-list">
            {alerts.map((alert, index) => (
              <div
                key={alert._id || index}
                className={`alert-item severity-${(alert.severity || 'info').toLowerCase()}`}
              >
                <div className="alert-content">
                  <h4>{(alert.type || 'UNKNOWN').replace(/_/g, " ")}</h4>
                  <p>{alert.message || 'No message'}</p>
                  <div className="alert-meta">
                    <span>Service: {SERVICE_DISPLAY_NAMES[alert.service] || alert.service || 'Unknown'}</span>
                    <span>
                      Triggered: {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleString() : 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="alert-actions">
                  <button onClick={() => handleAcknowledgeAlert(alert.alertId)}>
                    Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "1rem", color: "#9ca3af" }}>
        <small>Last updated: {lastRefresh.toLocaleString()}</small>
      </div>
    </div>
  );
};

export default AIMetricsDashboard;
