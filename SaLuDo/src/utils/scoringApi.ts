/**
 * Predictive Score API Functions
 * API calls for scoring settings and candidate score calculations
 */

import apiClient from './apiClient';
import {
  ScoringPreferences,
  ScoringWeights,
  ScoringModifiers,
  PersonalityCategoryWeights,
  PredictiveScoreResult,
  ScoreHistoryEntry,
  CandidateAIInsights,
} from '../types/scoring';

// Get API URL for direct fetch calls if needed
const getApiUrl = (): string => {
  const envApiUrl = import.meta.env.VITE_API_URL;
  return envApiUrl || 'http://localhost:3000/api/';
};

export const apiUrl = getApiUrl();

/**
 * Scoring Settings API
 */
export const scoringSettingsApi = {
  /**
   * Get global scoring settings
   */
  getGlobalSettings: async (): Promise<{
    success: boolean;
    settings: ScoringPreferences;
  }> => {
    const response = await apiClient.get('/settings/scoring');
    return response.data;
  },

  /**
   * Update global scoring settings
   */
  updateGlobalSettings: async (settings: {
    weights?: Partial<ScoringWeights>;
    modifiers?: Partial<ScoringModifiers>;
    personalityCategoryWeights?: Partial<PersonalityCategoryWeights>;
    isActive?: boolean;
  }): Promise<{
    success: boolean;
    settings: ScoringPreferences;
  }> => {
    const response = await apiClient.put('/settings/scoring', settings);
    return response.data;
  },

  /**
   * Get effective settings for a specific job (job-specific or global fallback)
   */
  getJobSettings: async (jobId: string): Promise<{
    success: boolean;
    settings: ScoringPreferences;
    isJobSpecific: boolean;
    effectiveSettings: ScoringPreferences;
  }> => {
    const response = await apiClient.get(`/settings/scoring/job/${jobId}`);
    return response.data;
  },

  /**
   * Set job-specific scoring settings (override global)
   */
  setJobSettings: async (
    jobId: string,
    settings: {
      weights?: Partial<ScoringWeights>;
      modifiers?: Partial<ScoringModifiers>;
      personalityCategoryWeights?: Partial<PersonalityCategoryWeights>;
      isActive?: boolean;
    }
  ): Promise<{
    success: boolean;
    settings: ScoringPreferences;
  }> => {
    const response = await apiClient.put(`/settings/scoring/job/${jobId}`, settings);
    return response.data;
  },

  /**
   * Delete job-specific settings (revert to global)
   */
  deleteJobSettings: async (jobId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await apiClient.delete(`/settings/scoring/job/${jobId}`);
    return response.data;
  },

  /**
   * Reset global settings to defaults
   */
  resetToDefaults: async (): Promise<{
    success: boolean;
    settings: ScoringPreferences;
  }> => {
    const response = await apiClient.put('/settings/scoring', {
      weights: {
        skillMatch: 35,
        personalityFit: 25,
        experience: 20,
        education: 10,
        profileQuality: 10,
      },
      modifiers: {
        certificationBonus: 2,
        maxCertificationBonus: 10,
        yearsExperienceMultiplier: 1.0,
        educationLevelBonus: {
          'high_school': 0,
          'associate': 2,
          'bachelor': 5,
          'master': 8,
          'doctorate': 10,
        },
        recentActivityBonus: 5,
        skillEvidenceBonus: 5,
      },
      personalityCategoryWeights: {
        cognitiveAndProblemSolving: 20,
        communicationAndTeamwork: 25,
        workEthicAndReliability: 20,
        growthAndLeadership: 15,
        cultureAndPersonalityFit: 15,
        bonusTraits: 5,
      },
      isActive: true,
    });
    return response.data;
  },
};

/**
 * Predictive Score API
 */
export const predictiveScoreApi = {
  /**
   * Calculate predictive success score for a candidate
   * @param candidateId - The candidate ID
   * @param jobId - Optional job ID for job-specific scoring
   */
  calculateScore: async (
    candidateId: string,
    jobId?: string
  ): Promise<{
    success: boolean;
    score: PredictiveScoreResult;
  }> => {
    const params = jobId ? `?jobId=${jobId}` : '';
    const response = await apiClient.get(`/candidates/${candidateId}/success-score${params}`);
    return response.data;
  },

  /**
   * Get score history for a candidate
   * @param candidateId - The candidate ID
   * @param limit - Maximum number of history entries to return
   */
  getScoreHistory: async (
    candidateId: string,
    limit?: number
  ): Promise<{
    success: boolean;
    history: ScoreHistoryEntry[];
    candidateId: string;
    totalEntries: number;
  }> => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get(`/candidates/${candidateId}/success-score/history${params}`);
    return response.data;
  },

  /**
   * Generate AI insights for a candidate
   * @param candidateId - The candidate ID
   * @param jobId - Optional job ID for job-context insights
   */
  generateInsights: async (
    candidateId: string,
    jobId?: string
  ): Promise<{
    success: boolean;
    insights: CandidateAIInsights;
    candidateId: string;
  }> => {
    const body = jobId ? { jobId } : {};
    const response = await apiClient.post(`/candidates/${candidateId}/success-score/insights`, body);
    return response.data;
  },

  /**
   * Get existing AI insights for a candidate
   * @param candidateId - The candidate ID
   */
  getInsights: async (
    candidateId: string
  ): Promise<{
    success: boolean;
    insights: CandidateAIInsights | null;
    candidateId: string;
  }> => {
    const response = await apiClient.get(`/candidates/${candidateId}/success-score/insights`);
    return response.data;
  },

  /**
   * Calculate scores for multiple candidates (batch operation)
   * Useful for comparing candidates or updating a job's candidate list
   * @param candidateIds - Array of candidate IDs
   * @param jobId - Optional job ID for job-specific scoring
   */
  calculateBatchScores: async (
    candidateIds: string[],
    jobId?: string
  ): Promise<{
    success: boolean;
    scores: PredictiveScoreResult[];
  }> => {
    // Calculate scores in parallel with a concurrency limit
    const results = await Promise.all(
      candidateIds.map(id => predictiveScoreApi.calculateScore(id, jobId))
    );
    
    return {
      success: true,
      scores: results.filter(r => r.success).map(r => r.score),
    };
  },
};

export default {
  settings: scoringSettingsApi,
  score: predictiveScoreApi,
};
