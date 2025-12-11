// AI Service Types - matches backend AIServiceType enum
export type AIServiceType =
  | "RESUME_PARSING"
  | "JOB_ANALYSIS"
  | "TRANSCRIPT_ANALYSIS"
  | "PREDICTIVE_INSIGHTS";

// Error Categories
export type AIErrorCategory =
  | "RATE_LIMIT"
  | "INVALID_RESPONSE"
  | "TIMEOUT"
  | "API_ERROR"
  | "PARSE_ERROR"
  | "UNKNOWN";

// Alert Types
export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type AIAlertType =
  | "HIGH_ERROR_RATE"
  | "HIGH_LATENCY"
  | "COST_SPIKE"
  | "TOKEN_LIMIT_WARNING";

// Token Usage
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// Cost Estimate
export interface CostEstimate {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

// Single Metrics Entry
export interface AIMetricsEntry {
  _id: string;
  service: AIServiceType;
  timestamp: string;
  latencyMs: number;
  tokens: TokenUsage;
  cost: CostEstimate;
  success: boolean;
  errorCategory?: AIErrorCategory;
  errorMessage?: string;
  candidateId?: string;
  jobId?: string;
  userId?: string;
  modelVersion?: string;
}

// Feedback Entry
export interface AIFeedback {
  _id: string;
  metricsId: string;
  service: AIServiceType;
  rating: 1 | 2 | 3 | 4 | 5;
  feedbackType: "ACCURATE" | "INACCURATE" | "INCOMPLETE" | "IRRELEVANT" | "OTHER";
  comment?: string;
  submittedBy: string;
  submittedAt: string;
  candidateId?: string;
  jobId?: string;
}

// Alert Entry
export interface AIAlert {
  _id: string;
  alertId: string;
  type: AIAlertType;
  severity: AlertSeverity;
  service: AIServiceType;
  message: string;
  threshold: number;
  currentValue: number;
  triggeredAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

// Backend Dashboard Response (raw from API)
export interface BackendDashboardResponse {
  aggregation: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    avgTokensPerRequest: number;
    totalCostUsd: number;
    latencyAvg: number;
    latencyP50: number;
    latencyP90: number;
    latencyP95: number;
    latencyP99: number;
    avgFeedbackRating: number;
    byService: Record<AIServiceType, {
      requests: number;
      successRate: number;
      avgLatency: number;
      totalCost: number;
      avgRating: number;
    }>;
    errorsByCategory: Record<AIErrorCategory, number>;
  };
  dailyTrends: Array<{
    date: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalCostUsd: number;
    avgLatency: number;
  }>;
  recentErrors: Array<{
    service: AIServiceType;
    errorCategory: AIErrorCategory;
    errorMessage: string;
    timestamp: string;
  }>;
  serviceComparison: Record<AIServiceType, {
    requests: number;
    successRate: number;
    avgLatency: number;
    avgCost: number;
    avgRating: number;
  }>;
  dateRange: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

// Transformed Dashboard Data (for frontend use)
export interface DashboardData {
  overview: {
    totalCalls: number;
    successRate: number;
    totalTokens: number;
    totalCost: number;
    avgLatencyMs: number;
  };
  byService: ServiceBreakdown[];
  recentErrors: RecentError[];
  hourlyTrend: HourlyTrend[];
}

export interface ServiceBreakdown {
  service: AIServiceType;
  calls: number;
  successRate: number;
  avgLatencyMs: number;
  totalCost: number;
}

export interface RecentError {
  service: AIServiceType;
  errorCategory: AIErrorCategory;
  errorMessage: string;
  timestamp: string;
}

export interface HourlyTrend {
  hour: string;
  calls: number;
  errors: number;
  avgLatency: number;
}

// Service Performance Response
export interface ServicePerformanceData {
  service: AIServiceType;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    successRate: number;
    avgLatencyMs: number;
    p50LatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
    totalTokens: number;
    avgTokensPerCall: number;
    totalCost: number;
    avgCostPerCall: number;
  };
  errorBreakdown: ErrorBreakdownItem[];
  dailyTrend: DailyTrendItem[];
}

export interface ErrorBreakdownItem {
  category: AIErrorCategory;
  count: number;
  percentage: number;
}

export interface DailyTrendItem {
  date: string;
  calls: number;
  errors: number;
  avgLatency: number;
  cost: number;
}

// Cost Analysis Response
export interface CostAnalysisData {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalCost: number;
    totalInputCost: number;
    totalOutputCost: number;
    avgDailyCost: number;
    projectedMonthlyCost: number;
  };
  byService: ServiceCostItem[];
  dailyCosts: DailyCostItem[];
}

export interface ServiceCostItem {
  service: AIServiceType;
  totalCost: number;
  inputCost: number;
  outputCost: number;
  percentage: number;
}

export interface DailyCostItem {
  date: string;
  totalCost: number;
  inputCost: number;
  outputCost: number;
}

// Token Stats Response
export interface TokenStatsData {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalTokens: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    avgTokensPerCall: number;
    avgInputTokensPerCall: number;
    avgOutputTokensPerCall: number;
  };
  byService: ServiceTokenItem[];
  dailyTokens: DailyTokenItem[];
}

export interface ServiceTokenItem {
  service: AIServiceType;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  avgPerCall: number;
}

export interface DailyTokenItem {
  date: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
}

// Latency Stats Response
export interface LatencyStatsData {
  period: {
    start: string;
    end: string;
  };
  overall: {
    avgLatencyMs: number;
    minLatencyMs: number;
    maxLatencyMs: number;
    p50LatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
  };
  byService: ServiceLatencyItem[];
  hourlyLatency: HourlyLatencyItem[];
  perServiceTrends: Record<AIServiceType, Array<{ date: string; avgLatency: number }>>;
}

export interface ServiceLatencyItem {
  service: AIServiceType;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
}

export interface HourlyLatencyItem {
  hour: string;
  avgLatency: number;
  p95Latency: number;
}

// Feedback Stats Response
export interface FeedbackStatsData {
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalFeedback: number;
    avgRating: number;
    ratingDistribution: Record<string, number>;
  };
  byService: ServiceFeedbackItem[];
  byType: FeedbackTypeItem[];
  recentFeedback: AIFeedback[];
}

export interface ServiceFeedbackItem {
  service: AIServiceType;
  count: number;
  avgRating: number;
}

export interface FeedbackTypeItem {
  type: string;
  count: number;
  percentage: number;
}

// Alert Config Response
export interface AlertConfigData {
  errorRateThreshold: number;
  latencyThresholdMs: number;
  costSpikeThreshold: number;
  checkIntervalMinutes: number;
}

// Date Range Type
export type DateRangeOption = "7d" | "30d" | "90d" | "1y";

// Display Helpers
export const SERVICE_DISPLAY_NAMES: Record<AIServiceType, string> = {
  RESUME_PARSING: "Resume Parsing",
  JOB_ANALYSIS: "Job Analysis",
  TRANSCRIPT_ANALYSIS: "Transcript Analysis",
  PREDICTIVE_INSIGHTS: "Predictive Insights",
};

export const ERROR_CATEGORY_NAMES: Record<AIErrorCategory, string> = {
  RATE_LIMIT: "Rate Limit",
  INVALID_RESPONSE: "Invalid Response",
  TIMEOUT: "Timeout",
  API_ERROR: "API Error",
  PARSE_ERROR: "Parse Error",
  UNKNOWN: "Unknown",
};

export const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  INFO: "#3b82f6",
  WARNING: "#f59e0b",
  CRITICAL: "#ef4444",
};

// ============================================================================
// AI CALL HISTORY TYPES
// ============================================================================

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface CostEstimate {
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
}

export interface AIMetricsEntry {
  metricsId: string;
  timestamp: string;
  service: AIServiceType;
  latencyMs: number;
  tokenUsage: TokenUsage;
  costEstimate: CostEstimate;
  success: boolean;
  errorCategory?: AIErrorCategory;
  errorMessage?: string;
  candidateId?: string;
  jobId?: string;
  userId?: string;
  parseSuccess: boolean;
  fallbackUsed: boolean;
  outputLength: number;
  retryCount: number;
  inputLength: number;
}

export interface CallHistoryFilters {
  page?: number;
  limit?: number;
  service?: AIServiceType;
  success?: boolean;
  candidateId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CallHistoryResponse {
  entries: AIMetricsEntry[];
  pagination: PaginationInfo;
}
