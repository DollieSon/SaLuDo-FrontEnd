/**
 * Predictive Success Score Types
 * Types for candidate scoring, weights, and AI insights
 */

// Scoring weight configuration
export interface ScoringWeights {
  skillMatch: number;      // 0-100, default 35
  personalityFit: number;  // 0-100, default 25
  experience: number;      // 0-100, default 20
  education: number;       // 0-100, default 10
  profileQuality: number;  // 0-100, default 10
}

// Scoring modifiers for adjustments
export interface ScoringModifiers {
  certificationBonus: number;         // 0-20, bonus per certification
  maxCertificationBonus: number;      // 0-30, cap on certification bonus
  yearsExperienceMultiplier: number;  // 0.5-2, experience weight
  educationLevelBonus: Record<string, number>;  // Bonus by degree level
  recentActivityBonus: number;        // 0-10, bonus for recent updates
  skillEvidenceBonus: number;         // 0-15, bonus for skill evidence
}

// Personality category weights
export interface PersonalityCategoryWeights {
  cognitiveAndProblemSolving: number;
  communicationAndTeamwork: number;
  workEthicAndReliability: number;
  growthAndLeadership: number;
  cultureAndPersonalityFit: number;
  bonusTraits: number;
}

// Complete scoring preferences
export interface ScoringPreferences {
  settingsId?: string;
  jobId?: string | null;  // null = global settings
  weights: ScoringWeights;
  modifiers: ScoringModifiers;
  personalityCategoryWeights: PersonalityCategoryWeights;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Score breakdown by category
export interface ScoreBreakdown {
  skillMatch: number;
  personalityFit: number;
  experience: number;
  education: number;
  profileQuality: number;
  certificationBonus: number;
  totalBeforeNormalization: number;
}

// Individual score history entry
export interface ScoreHistoryEntry {
  score: number;
  breakdown: ScoreBreakdown;
  jobId?: string;
  jobTitle?: string;
  calculatedAt: string;
  calculatedBy?: string;
  weightsUsed: ScoringWeights;
}

// Skill match detail
export interface SkillMatchDetail {
  skillId: string;
  skillName: string;
  candidateScore: number;
  requiredLevel?: number;
  matchPercentage: number;
  hasEvidence: boolean;
}

// Personality score detail
export interface PersonalityDetail {
  category: string;
  score: number;
  weight: number;
  weightedScore: number;
}

// Score confidence indicators
export interface ScoreConfidence {
  level: 'high' | 'medium' | 'low';
  factors: string[];
}

// Contributing factors
export interface ContributingFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  value: string;
  contribution: number;
}

// AI-generated insights
export interface CandidateAIInsights {
  summary: string;
  strengths: string[];
  areasForDevelopment: string[];
  cultureFitAssessment: string;
  recommendations: string[];
  generatedAt: string;
  generatedBy?: string;
}

// Complete predictive score result
export interface PredictiveScoreResult {
  candidateId: string;
  candidateName: string;
  jobId?: string;
  jobTitle?: string;
  overallScore: number;
  breakdown: ScoreBreakdown;
  confidence: ScoreConfidence;
  factors: ContributingFactor[];
  skillMatchDetails: SkillMatchDetail[];
  personalityDetails: PersonalityDetail[];
  calculatedAt: string;
  weightsUsed: ScoringWeights;
}

// API response types
export interface ScoringSettingsResponse {
  success: boolean;
  message?: string;
  settings: ScoringPreferences;
  isJobSpecific?: boolean;
  effectiveSettings?: ScoringPreferences;
}

export interface PredictiveScoreResponse {
  success: boolean;
  message?: string;
  score: PredictiveScoreResult;
}

export interface ScoreHistoryResponse {
  success: boolean;
  message?: string;
  history: ScoreHistoryEntry[];
  candidateId: string;
  totalEntries: number;
}

export interface AIInsightsResponse {
  success: boolean;
  message?: string;
  insights: CandidateAIInsights;
  candidateId: string;
}

// Default values
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  skillMatch: 35,
  personalityFit: 25,
  experience: 20,
  education: 10,
  profileQuality: 10,
};

export const DEFAULT_PERSONALITY_CATEGORY_WEIGHTS: PersonalityCategoryWeights = {
  cognitiveAndProblemSolving: 20,
  communicationAndTeamwork: 25,
  workEthicAndReliability: 20,
  growthAndLeadership: 15,
  cultureAndPersonalityFit: 15,
  bonusTraits: 5,
};

// Validation helpers
export const validateScoringWeights = (weights: ScoringWeights): { valid: boolean; error?: string } => {
  const total = weights.skillMatch + weights.personalityFit + weights.experience + 
                weights.education + weights.profileQuality;
  
  if (total !== 100) {
    return { valid: false, error: `Weights must sum to 100. Current total: ${total}` };
  }
  
  const values = Object.values(weights);
  if (values.some(v => v < 0 || v > 100)) {
    return { valid: false, error: 'Each weight must be between 0 and 100' };
  }
  
  return { valid: true };
};

export const validatePersonalityCategoryWeights = (weights: PersonalityCategoryWeights): { valid: boolean; error?: string } => {
  const total = weights.cognitiveAndProblemSolving + weights.communicationAndTeamwork +
                weights.workEthicAndReliability + weights.growthAndLeadership +
                weights.cultureAndPersonalityFit + weights.bonusTraits;
  
  if (total !== 100) {
    return { valid: false, error: `Personality weights must sum to 100. Current total: ${total}` };
  }
  
  return { valid: true };
};

// Score color helpers
export const getScoreColor = (score: number): string => {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#eab308'; // yellow
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
};

export const getScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
};

export const getConfidenceColor = (level: ScoreConfidence['level']): string => {
  switch (level) {
    case 'high': return '#22c55e';
    case 'medium': return '#eab308';
    case 'low': return '#ef4444';
  }
};
