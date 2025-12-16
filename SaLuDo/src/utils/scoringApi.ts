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
    data: ScoringPreferences;
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
    data: ScoringPreferences;
  }> => {
    const response = await apiClient.put('/settings/scoring', settings);
    return response.data;
  },

  /**
   * Get effective settings for a specific job (job-specific or global fallback)
   */
  getJobSettings: async (jobId: string): Promise<{
    success: boolean;
    data: ScoringPreferences;
    isJobSpecific: boolean;
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
    data: ScoringPreferences;
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
    data: ScoringPreferences;
    message: string;
  }> => {
    const response = await apiClient.post('/settings/scoring/reset');
    return response.data;
  },

  /**
   * Get default scoring values (for UI reference)
   */
  getDefaults: async (): Promise<{
    success: boolean;
    data: {
      weights: ScoringWeights;
      modifiers: ScoringModifiers;
      personalityCategoryWeights: PersonalityCategoryWeights;
    };
  }> => {
    const response = await apiClient.get('/settings/scoring/defaults');
    return response.data;
  },

  /**
   * Copy global settings to create job-specific settings
   */
  copyGlobalToJob: async (jobId: string): Promise<{
    success: boolean;
    data: ScoringPreferences;
    message: string;
  }> => {
    const response = await apiClient.post(`/settings/scoring/job/${jobId}/copy-from-global`);
    return response.data;
  },

  /**
   * Get list of jobs that have custom scoring settings
   */
  getJobsWithCustomSettings: async (): Promise<{
    success: boolean;
    data: string[];
    count: number;
  }> => {
    const response = await apiClient.get('/settings/scoring/jobs-with-custom');
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
    // Backend returns { success, data }, transform to { success, score }
    return {
      success: response.data.success,
      score: response.data.data
    };
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
    return {
      success: response.data.success,
      history: response.data.data || [],
      candidateId,
      totalEntries: response.data.count || 0
    };
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
    const url = jobId 
      ? `/candidates/${candidateId}/success-score/insights?jobId=${jobId}`
      : `/candidates/${candidateId}/success-score/insights`;
    const response = await apiClient.post(url);
    // Backend returns { success, data, message }, transform to expected format
    return {
      success: response.data.success,
      insights: response.data.data,
      candidateId
    };
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
    try {
      const response = await apiClient.get(`/candidates/${candidateId}/success-score/insights`);
      // Backend returns { success, data }, transform to expected format
      return {
        success: response.data.success,
        insights: response.data.data || null,
        candidateId
      };
    } catch (error: any) {
      // 404 means no insights exist yet - this is not an error
      if (error.response?.status === 404) {
        return {
          success: true,
          insights: null,
          candidateId
        };
      }
      // Re-throw other errors
      throw error;
    }
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
