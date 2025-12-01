/**
 * Scoring Components Index
 * Export all predictive success score components
 */

export { PredictiveScoreCard } from './PredictiveScoreCard';
export { ScoreHistoryChart } from './ScoreHistoryChart';
export { AIInsightsCard } from './AIInsightsCard';
export { ScoringSettings } from './ScoringSettings';
export { CandidateScoreSection } from './CandidateScoreSection';

// Re-export types for convenience
export type {
  ScoringWeights,
  ScoringModifiers,
  PersonalityCategoryWeights,
  ScoringPreferences,
  ScoreBreakdown,
  ScoreHistoryEntry,
  SkillMatchDetail,
  PersonalityDetail,
  ScoreConfidence,
  ContributingFactor,
  CandidateAIInsights,
  PredictiveScoreResult,
} from '../../types/scoring';

// Re-export utilities
export {
  DEFAULT_SCORING_WEIGHTS,
  DEFAULT_PERSONALITY_CATEGORY_WEIGHTS,
  validateScoringWeights,
  validatePersonalityCategoryWeights,
  getScoreColor,
  getScoreLabel,
  getConfidenceColor,
} from '../../types/scoring';
