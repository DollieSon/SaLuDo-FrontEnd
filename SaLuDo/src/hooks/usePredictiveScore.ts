/**
 * usePredictiveScore Hook
 * React hook for managing predictive success scores for candidates
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { predictiveScoreApi, scoringSettingsApi } from '../utils/scoringApi';
import {
  PredictiveScoreResult,
  ScoreHistoryEntry,
  CandidateAIInsights,
  ScoringPreferences,
} from '../types/scoring';

interface UsePredictiveScoreOptions {
  candidateId: string;
  jobId?: string;
  autoCalculate?: boolean;  // Auto-calculate on mount
  autoFetchHistory?: boolean;  // Auto-fetch history on mount
}

interface UsePredictiveScoreReturn {
  // Score data
  score: PredictiveScoreResult | null;
  history: ScoreHistoryEntry[];
  insights: CandidateAIInsights | null;
  settings: ScoringPreferences | null;
  
  // Loading states
  isCalculating: boolean;
  isLoadingHistory: boolean;
  isGeneratingInsights: boolean;
  isLoadingSettings: boolean;
  
  // Error states
  error: string | null;
  historyError: string | null;
  insightsError: string | null;
  settingsError: string | null;
  
  // Actions
  calculateScore: (jobId?: string) => Promise<PredictiveScoreResult | null>;
  fetchHistory: (limit?: number) => Promise<void>;
  generateInsights: (jobId?: string) => Promise<CandidateAIInsights | null>;
  fetchInsights: () => Promise<void>;
  fetchSettings: (jobId?: string) => Promise<void>;
  clearError: () => void;
  refresh: () => Promise<void>;
}

export const usePredictiveScore = ({
  candidateId,
  jobId,
  autoCalculate = false,
  autoFetchHistory = false,
}: UsePredictiveScoreOptions): UsePredictiveScoreReturn => {
  // Score state
  const [score, setScore] = useState<PredictiveScoreResult | null>(null);
  const [history, setHistory] = useState<ScoreHistoryEntry[]>([]);
  const [insights, setInsights] = useState<CandidateAIInsights | null>(null);
  const [settings, setSettings] = useState<ScoringPreferences | null>(null);
  
  // Loading states
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Track if mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Calculate predictive score for the candidate
   */
  const calculateScore = useCallback(async (overrideJobId?: string): Promise<PredictiveScoreResult | null> => {
    if (!candidateId) {
      setError('Candidate ID is required');
      return null;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const result = await predictiveScoreApi.calculateScore(
        candidateId,
        overrideJobId || jobId
      );

      if (isMountedRef.current) {
        if (result.success) {
          setScore(result.score);
          return result.score;
        } else {
          setError('Failed to calculate score');
          return null;
        }
      }
      return null;
    } catch (err: any) {
      if (isMountedRef.current) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to calculate score';
        setError(errorMessage);
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsCalculating(false);
      }
    }
  }, [candidateId, jobId]);

  /**
   * Fetch score history
   */
  const fetchHistory = useCallback(async (limit?: number): Promise<void> => {
    if (!candidateId) {
      setHistoryError('Candidate ID is required');
      return;
    }

    setIsLoadingHistory(true);
    setHistoryError(null);

    try {
      const result = await predictiveScoreApi.getScoreHistory(candidateId, limit);

      if (isMountedRef.current) {
        if (result.success) {
          setHistory(result.history);
        } else {
          setHistoryError('Failed to fetch score history');
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch history';
        setHistoryError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingHistory(false);
      }
    }
  }, [candidateId]);

  /**
   * Generate AI insights for the candidate
   */
  const generateInsights = useCallback(async (overrideJobId?: string): Promise<CandidateAIInsights | null> => {
    if (!candidateId) {
      setInsightsError('Candidate ID is required');
      return null;
    }

    setIsGeneratingInsights(true);
    setInsightsError(null);

    try {
      const result = await predictiveScoreApi.generateInsights(
        candidateId,
        overrideJobId || jobId
      );

      if (isMountedRef.current) {
        if (result.success) {
          setInsights(result.insights);
          return result.insights;
        } else {
          setInsightsError('Failed to generate insights');
          return null;
        }
      }
      return null;
    } catch (err: any) {
      if (isMountedRef.current) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to generate insights';
        setInsightsError(errorMessage);
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsGeneratingInsights(false);
      }
    }
  }, [candidateId, jobId]);

  /**
   * Fetch existing insights (without generating new ones)
   */
  const fetchInsights = useCallback(async (): Promise<void> => {
    if (!candidateId) {
      setInsightsError('Candidate ID is required');
      return;
    }

    setIsGeneratingInsights(true);
    setInsightsError(null);

    try {
      const result = await predictiveScoreApi.getInsights(candidateId);

      if (isMountedRef.current) {
        if (result.success) {
          setInsights(result.insights);
        } else {
          setInsightsError('Failed to fetch insights');
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        // 404 is expected if no insights exist yet
        if (err.response?.status !== 404) {
          const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch insights';
          setInsightsError(errorMessage);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsGeneratingInsights(false);
      }
    }
  }, [candidateId]);

  /**
   * Fetch scoring settings
   */
  const fetchSettings = useCallback(async (overrideJobId?: string): Promise<void> => {
    setIsLoadingSettings(true);
    setSettingsError(null);

    try {
      const targetJobId = overrideJobId || jobId;
      
      const result = targetJobId
        ? await scoringSettingsApi.getJobSettings(targetJobId)
        : await scoringSettingsApi.getGlobalSettings();

      if (isMountedRef.current) {
        if (result.success) {
          // Use effective settings if available (for job-specific queries)
          const effectiveSettings = 'effectiveSettings' in result 
            ? (result as { effectiveSettings: ScoringPreferences }).effectiveSettings 
            : result.data;
          setSettings(effectiveSettings);
        } else {
          setSettingsError('Failed to fetch settings');
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch settings';
        setSettingsError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingSettings(false);
      }
    }
  }, [jobId]);

  /**
   * Clear all errors
   */
  const clearError = useCallback(() => {
    setError(null);
    setHistoryError(null);
    setInsightsError(null);
    setSettingsError(null);
  }, []);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all([
      calculateScore(),
      fetchHistory(),
      fetchInsights(),
    ]);
  }, [calculateScore, fetchHistory, fetchInsights]);

  // Auto-calculate on mount if enabled
  useEffect(() => {
    if (autoCalculate && candidateId) {
      calculateScore();
    }
  }, [autoCalculate, candidateId, calculateScore]);

  // Auto-fetch history on mount if enabled
  useEffect(() => {
    if (autoFetchHistory && candidateId) {
      fetchHistory();
    }
  }, [autoFetchHistory, candidateId, fetchHistory]);

  return {
    // Data
    score,
    history,
    insights,
    settings,
    
    // Loading states
    isCalculating,
    isLoadingHistory,
    isGeneratingInsights,
    isLoadingSettings,
    
    // Error states
    error,
    historyError,
    insightsError,
    settingsError,
    
    // Actions
    calculateScore,
    fetchHistory,
    generateInsights,
    fetchInsights,
    fetchSettings,
    clearError,
    refresh,
  };
};

export default usePredictiveScore;
