import apiClient from "./apiClient";
import type {
  DashboardData,
  BackendDashboardResponse,
  ServiceBreakdown,
  ServicePerformanceData,
  CostAnalysisData,
  TokenStatsData,
  LatencyStatsData,
  FeedbackStatsData,
  AIAlert,
  AlertConfigData,
  AIServiceType,
  DateRangeOption,
} from "../types/aiMetrics";
import type {
  DashboardWithTrendsResponse,
  ComparisonType,
  SeasonalityAnalysisData,
  QualityTrendsData,
} from "../types/aiTrends";

// Helper to convert date range to days
const dateRangeToDays = (range: DateRangeOption): number => {
  const mapping: Record<DateRangeOption, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
  };
  return mapping[range];
};

// Transform backend response to frontend format
const transformDashboardData = (backend: BackendDashboardResponse): DashboardData => {
  const { aggregation, recentErrors, dailyTrends } = backend;
  
  // Transform byService from Record to Array
  const byService: ServiceBreakdown[] = Object.entries(aggregation?.byService || {}).map(
    ([service, data]) => ({
      service: service as AIServiceType,
      calls: data.requests || 0,
      successRate: data.successRate || 0,
      avgLatencyMs: data.avgLatency || 0,
      totalCost: data.totalCost || 0,
    })
  );

  // Transform daily trends to hourly (or keep as daily)
  const hourlyTrend = (dailyTrends || []).map((day) => ({
    hour: day.date,
    calls: day.totalRequests || 0,
    errors: day.failedRequests || 0,
    avgLatency: day.avgLatency || 0,
  }));

  // Calculate total tokens from input + output
  const totalTokens = (aggregation?.totalInputTokens || 0) + (aggregation?.totalOutputTokens || 0);

  return {
    overview: {
      totalCalls: aggregation?.totalRequests || 0,
      successRate: aggregation?.totalRequests > 0
        ? ((aggregation?.successfulRequests || 0) / aggregation.totalRequests) * 100
        : 0,
      totalTokens: totalTokens,
      totalCost: aggregation?.totalCostUsd || 0,
      avgLatencyMs: aggregation?.latencyAvg || 0,
    },
    byService,
    recentErrors: (recentErrors || []).map((err) => ({
      service: err.service,
      errorCategory: err.errorCategory,
      errorMessage: err.errorMessage || "Unknown error",
      timestamp: err.timestamp,
    })),
    hourlyTrend,
  };
};

// Dashboard Overview
export const fetchDashboardData = async (
  dateRange: DateRangeOption = "30d"
): Promise<DashboardData> => {
  const days = dateRangeToDays(dateRange);
  const response = await apiClient.get<{ success: boolean; data: BackendDashboardResponse }>(
    `/ai-metrics/dashboard?range=${days}d`
  );
  return transformDashboardData(response.data.data);
};

// Service-specific Performance
export const fetchServicePerformance = async (
  service: AIServiceType,
  dateRange: DateRangeOption = "30d"
): Promise<ServicePerformanceData> => {
  const days = dateRangeToDays(dateRange);
  const response = await apiClient.get<{ success: boolean; data: ServicePerformanceData }>(
    `/ai-metrics/service/${service}?range=${days}d`
  );
  return response.data.data;
};

// Backend Cost Response
interface BackendCostResponse {
  totalCost: number;
  avgCostPerRequest: number;
  byService: Record<AIServiceType, { totalCost: number; avgCost: number; requests: number }>;
  dailyCosts: Array<{ date: string; cost: number }>;
  projectedMonthlyCost: number;
  dateRange: { days: number; startDate: string; endDate: string };
}

// Cost Analysis
export const fetchCostAnalysis = async (
  dateRange: DateRangeOption = "30d"
): Promise<CostAnalysisData> => {
  const days = dateRangeToDays(dateRange);
  const response = await apiClient.get<{ success: boolean; data: BackendCostResponse }>(
    `/ai-metrics/costs?range=${days}d`
  );
  
  const backend = response.data.data;
  const daysInRange = backend.dailyCosts.length || 1;
  
  return {
    period: {
      start: backend.dateRange?.startDate || new Date().toISOString(),
      end: backend.dateRange?.endDate || new Date().toISOString(),
    },
    summary: {
      totalCost: backend.totalCost,
      totalInputCost: backend.totalCost * 0.2, // Estimate: 20% input, 80% output
      totalOutputCost: backend.totalCost * 0.8,
      avgDailyCost: backend.totalCost / daysInRange,
      projectedMonthlyCost: backend.projectedMonthlyCost,
    },
    byService: Object.entries(backend.byService).map(([service, data]) => ({
      service: service as AIServiceType,
      totalCost: data.totalCost,
      inputCost: data.totalCost * 0.2,
      outputCost: data.totalCost * 0.8,
      percentage: backend.totalCost > 0 ? (data.totalCost / backend.totalCost) * 100 : 0,
    })),
    dailyCosts: backend.dailyCosts.map((day) => ({
      date: day.date,
      totalCost: day.cost,
      inputCost: day.cost * 0.2,
      outputCost: day.cost * 0.8,
    })),
  };
};

// Backend Token Response
interface BackendTokenResponse {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  avgTokensPerRequest: number;
  byService: Record<AIServiceType, { input: number; output: number; total: number }>;
  estimatedPercentage: number;
  dateRange: { days: number; startDate: string; endDate: string };
}

// Token Usage Stats
export const fetchTokenStats = async (
  dateRange: DateRangeOption = "30d"
): Promise<TokenStatsData> => {
  const days = dateRangeToDays(dateRange);
  const response = await apiClient.get<{ success: boolean; data: BackendTokenResponse }>(
    `/ai-metrics/tokens?range=${days}d`
  );
  
  const backend = response.data.data;
  
  return {
    period: {
      start: backend.dateRange?.startDate || new Date().toISOString(),
      end: backend.dateRange?.endDate || new Date().toISOString(),
    },
    summary: {
      totalTokens: backend.totalTokens,
      totalInputTokens: backend.totalInputTokens,
      totalOutputTokens: backend.totalOutputTokens,
      avgTokensPerCall: backend.avgTokensPerRequest,
      avgInputTokensPerCall: backend.avgTokensPerRequest * 0.3,
      avgOutputTokensPerCall: backend.avgTokensPerRequest * 0.7,
    },
    byService: Object.entries(backend.byService).map(([service, data]) => ({
      service: service as AIServiceType,
      totalTokens: data.total,
      inputTokens: data.input,
      outputTokens: data.output,
      avgPerCall: backend.avgTokensPerRequest,
    })),
    dailyTokens: [], // Backend doesn't provide daily breakdown
  };
};

// Backend Latency Response
interface BackendLatencyResponse {
  average: number;
  min: number;
  max: number;
  percentiles: { p50: number; p90: number; p95: number; p99: number };
  byService: Record<AIServiceType, { avg: number; p50: number; p95: number; p99: number }>;
  trends: Array<{ date: string; avgLatency: number }>;
  perServiceTrends: Record<AIServiceType, Array<{ date: string; avgLatency: number }>>;
  dateRange: { days: number; startDate: string; endDate: string };
}

// Latency Stats
export const fetchLatencyStats = async (
  dateRange: DateRangeOption = "30d"
): Promise<LatencyStatsData> => {
  const days = dateRangeToDays(dateRange);
  const response = await apiClient.get<{ success: boolean; data: BackendLatencyResponse }>(
    `/ai-metrics/latency?range=${days}d`
  );
  
  const backend = response.data.data;
  
  return {
    period: {
      start: backend.dateRange?.startDate || new Date().toISOString(),
      end: backend.dateRange?.endDate || new Date().toISOString(),
    },
    overall: {
      avgLatencyMs: backend.average,
      minLatencyMs: backend.min || 0,
      maxLatencyMs: backend.max || 0,
      p50LatencyMs: backend.percentiles.p50,
      p95LatencyMs: backend.percentiles.p95,
      p99LatencyMs: backend.percentiles.p99,
    },
    byService: Object.entries(backend.byService).map(([service, data]) => ({
      service: service as AIServiceType,
      avgLatencyMs: data.avg,
      p50LatencyMs: data.p50 || data.avg,
      p95LatencyMs: data.p95,
      p99LatencyMs: data.p99 || data.p95,
    })),
    hourlyLatency: backend.trends.map((trend) => ({
      hour: trend.date,
      avgLatency: trend.avgLatency,
      p95Latency: backend.percentiles.p95,
    })),
    perServiceTrends: backend.perServiceTrends || {},
  };
};

// Feedback Stats
export const fetchFeedbackStats = async (
  dateRange: DateRangeOption = "30d"
): Promise<FeedbackStatsData> => {
  const days = dateRangeToDays(dateRange);
  const response = await apiClient.get<{ success: boolean; data: FeedbackStatsData }>(
    `/ai-metrics/feedback?range=${days}d`
  );
  return response.data.data;
};

// Submit Feedback
export interface SubmitFeedbackParams {
  metricsId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedbackType: "ACCURATE" | "INACCURATE" | "INCOMPLETE" | "IRRELEVANT" | "OTHER";
  comment?: string;
}

export const submitFeedback = async (
  params: SubmitFeedbackParams
): Promise<void> => {
  await apiClient.post("/ai-metrics/feedback", params);
};

// Active Alerts
export const fetchActiveAlerts = async (): Promise<AIAlert[]> => {
  const response = await apiClient.get<{ success: boolean; data: AIAlert[] }>(
    "/ai-metrics/alerts"
  );
  return response.data.data;
};

// Acknowledge Alert
export const acknowledgeAlert = async (alertId: string): Promise<void> => {
  await apiClient.put(`/ai-metrics/alerts/${alertId}/acknowledge`);
};

// Alert Configuration
export const fetchAlertConfig = async (): Promise<AlertConfigData> => {
  const response = await apiClient.get<{ success: boolean; data: AlertConfigData }>(
    "/ai-metrics/alerts/config"
  );
  return response.data.data;
};

export const updateAlertConfig = async (
  config: Partial<AlertConfigData>
): Promise<AlertConfigData> => {
  const response = await apiClient.put<{ success: boolean; data: AlertConfigData }>(
    "/ai-metrics/alerts/config",
    config
  );
  return response.data.data;
};

// ============================================================================
// TREND ANALYSIS ENDPOINTS
// ============================================================================

/**
 * Fetch dashboard data with trend comparison
 */
export const fetchDashboardWithTrends = async (
  dateRange: DateRangeOption = "30d",
  comparisonType: ComparisonType = "previous",
  customStartDate?: string,
  customEndDate?: string
): Promise<DashboardWithTrendsResponse> => {
  const days = dateRangeToDays(dateRange);
  let url = `/ai-metrics/dashboard?range=${days}d&compare=${comparisonType}`;
  
  // Add custom date parameters if comparison type is custom
  if (comparisonType === "custom" && customStartDate && customEndDate) {
    url += `&customStart=${customStartDate}&customEnd=${customEndDate}`;
  }
  
  const response = await apiClient.get<{
    success: boolean;
    data: DashboardWithTrendsResponse;
  }>(url);
  return response.data.data;
};

/**
 * Fetch seasonality analysis (day-of-week patterns)
 */
export const fetchSeasonalityAnalysis = async (
  dateRange: DateRangeOption = "30d",
  service?: AIServiceType
): Promise<SeasonalityAnalysisData> => {
  const days = dateRangeToDays(dateRange);
  const serviceParam = service ? `&service=${service}` : "";
  const response = await apiClient.get<{
    success: boolean;
    data: SeasonalityAnalysisData;
  }>(`/ai-metrics/trends/seasonality?range=${days}d${serviceParam}`);
  return response.data.data;
};

/**
 * Fetch quality trends based on edit behavior
 */
export const fetchQualityTrends = async (
  dateRange: DateRangeOption = "30d",
  service?: AIServiceType | ""
): Promise<QualityTrendsData> => {
  const days = dateRangeToDays(dateRange);
  const serviceParam = (typeof service === "string" && service !== "") ? `&service=${service}` : "";
  const response = await apiClient.get<{
    success: boolean;
    data: QualityTrendsData;
  }>(`/ai-metrics/trends/quality?range=${days}d${serviceParam}`);
  return response.data.data;
};

// ============================================================================
// AI CALL HISTORY ENDPOINTS
// ============================================================================

/**
 * Fetch paginated AI call history with filters
 */
export const fetchCallHistory = async (
  filters: import("../types/aiMetrics").CallHistoryFilters = {}
): Promise<import("../types/aiMetrics").CallHistoryResponse> => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.service) params.append("service", filters.service);
  if (filters.success !== undefined) params.append("success", filters.success.toString());
  if (filters.candidateId) params.append("candidateId", filters.candidateId);
  if (filters.userId) params.append("userId", filters.userId);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate) params.append("endDate", filters.endDate);
  
  const queryString = params.toString();
  const response = await apiClient.get<{
    success: boolean;
    data: import("../types/aiMetrics").CallHistoryResponse;
  }>(`/ai-metrics/calls${queryString ? `?${queryString}` : ""}`);
  
  return response.data.data;
};

// Export utilities
export const exportToCsv = (data: Record<string, unknown>[], filename: string): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
          // Escape quotes and wrap in quotes if contains comma
          return stringValue.includes(",") || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        })
        .join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
