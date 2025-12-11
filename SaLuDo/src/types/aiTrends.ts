/**
 * AI Trend Analysis Types
 * Frontend types for trend detection, seasonality patterns, and quality analysis
 */

import type { AIServiceType } from './aiMetrics';

// ============================================================================
// TREND ANALYSIS TYPES
// ============================================================================

// Trend Direction
export type TrendDirection = "improving" | "degrading" | "stable";

// Comparison Type
export type ComparisonType = "previous" | "year_ago";

// Quality Band
export type QualityBand = "Excellent" | "Good" | "Fair" | "Poor";

// Single Metric Trend
export interface MetricTrend {
  current: number;
  previous: number;
  change: number; // Percentage change
  changeAbs: number; // Absolute change
  direction: TrendDirection;
  isSignificant: boolean; // True if change > 15%
}

// Trend Comparison
export interface TrendComparison {
  period: {
    current: { startDate: string; endDate: string };
    previous: { startDate: string; endDate: string };
    comparisonType: ComparisonType;
  };
  metrics: {
    errorRate: MetricTrend;
    avgLatency: MetricTrend;
    totalCost: MetricTrend;
    avgRating: MetricTrend;
    requestCount: MetricTrend;
  };
  byService: Record<AIServiceType, {
    errorRate: MetricTrend;
    avgLatency: MetricTrend;
    cost: MetricTrend;
  }>;
  insights: string[];
}

// Dashboard With Trends Response
export interface DashboardWithTrendsResponse {
  current: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalCostUsd: number;
    latencyAvg: number;
    avgFeedbackRating: number;
    totalFeedbackCount: number;
  };
  previous?: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalCostUsd: number;
    latencyAvg: number;
    avgFeedbackRating: number;
    totalFeedbackCount: number;
  };
  trends?: TrendComparison;
  dateRange: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

// Day of Week Pattern
export interface DayOfWeekPattern {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  dayName: string;
  metrics: {
    requestCount: number;
    avgErrorRate: number;
    avgLatency: number;
    avgCost: number;
    successRate: number;
  };
  deviation: {
    errorRateDeviation: number;
    latencyDeviation: number;
    requestDeviation: number;
  };
}

// Seasonality Pattern
export interface SeasonalityPattern {
  dateRange: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };
  service?: AIServiceType;
  byDayOfWeek: DayOfWeekPattern[];
  weeklyAverages: {
    avgErrorRate: number;
    avgLatency: number;
    avgRequestCount: number;
    avgCost: number;
  };
  insights: string[];
  outliers: {
    highestErrorDay: string;
    lowestErrorDay: string;
    busiestDay: string;
    quietestDay: string;
  };
}

// Seasonality Analysis Response
export interface SeasonalityAnalysisData {
  patterns: SeasonalityPattern[];
  insights: string[];
  summary: {
    busiestDay: string;
    slowestDay: string;
    avgErrorRateVariance: number;
    avgLatencyVariance: number;
  };
  dateRange: {
    days: number;
    startDate: string;
    endDate: string;
  };
  service?: string;
}

// Quality Score
export interface QualityScore {
  score: number; // 0-100
  band: QualityBand;
  avgEditPercentage: number;
  deleteRate: number;
  feedbackCount: number;
}

// Quality Trend
export interface QualityTrend {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  overall: QualityScore & {
    trend: MetricTrend;
  };
  byService: Record<AIServiceType, QualityScore & {
    trend: MetricTrend;
  }>;
  insights: string[];
  recommendations: string[];
}

// Quality Trends Response
export interface QualityTrendsData extends QualityTrend {
  dateRange: {
    days: number;
    startDate: string;
    endDate: string;
  };
  service?: string;
}

// Display Helpers
export const QUALITY_BAND_COLORS: Record<QualityBand, string> = {
  Excellent: "#10b981", // green
  Good: "#3b82f6",      // blue
  Fair: "#f59e0b",      // yellow/orange
  Poor: "#ef4444",      // red
};

export const TREND_DIRECTION_ICONS: Record<TrendDirection, string> = {
  improving: "↑",
  degrading: "↓",
  stable: "→",
};

export const TREND_DIRECTION_COLORS: Record<TrendDirection, string> = {
  improving: "#10b981",
  degrading: "#ef4444",
  stable: "#6b7280",
};

export const QUALITY_BAND_DESCRIPTIONS: Record<QualityBand, string> = {
  Excellent: "AI outputs require minimal editing",
  Good: "AI outputs are generally accurate",
  Fair: "AI outputs require moderate editing",
  Poor: "AI outputs require significant editing",
};
