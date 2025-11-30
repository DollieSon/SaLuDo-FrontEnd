/**
 * CandidateScoreSection Component
 * Displays predictive success score, history, and AI insights on the candidate profile
 */

import React, { useEffect, useState } from 'react';
import { usePredictiveScore } from '../../hooks/usePredictiveScore';
import { PredictiveScoreCard } from './PredictiveScoreCard';
import { ScoreHistoryChart } from './ScoreHistoryChart';
import { AIInsightsCard } from './AIInsightsCard';
import { jobsApi } from '../../utils/api';
import '../css/PredictiveScore.css';

interface CandidateScoreSectionProps {
  candidateId: string;
  candidateName: string;
}

interface Job {
  _id: string;
  jobName: string;
}

export const CandidateScoreSection: React.FC<CandidateScoreSectionProps> = ({
  candidateId,
  candidateName,
}) => {
  // State for job selection
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Use the predictive score hook
  const {
    score,
    history,
    insights,
    isCalculating,
    isLoadingHistory,
    isGeneratingInsights,
    error,
    insightsError,
    calculateScore,
    fetchHistory,
    generateInsights,
    fetchInsights,
  } = usePredictiveScore({
    candidateId,
    jobId: selectedJobId || undefined,
    autoCalculate: false,
    autoFetchHistory: true,
  });

  // Fetch available jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoadingJobs(true);
        const response = await jobsApi.getAllJobs();
        if (response.success) {
          setJobs(response.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setIsLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch existing insights on mount
  useEffect(() => {
    if (candidateId) {
      fetchInsights();
    }
  }, [candidateId, fetchInsights]);

  // Handle job selection change
  const handleJobChange = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  // Calculate score for selected context
  const handleCalculateScore = async () => {
    await calculateScore(selectedJobId || undefined);
  };

  // Generate AI insights
  const handleGenerateInsights = async () => {
    await generateInsights(selectedJobId || undefined);
  };

  return (
    <div className="candidate-score-section">
      <div className="score-section-header">
        <h3 className="score-section-title">Predictive Success Score</h3>
        
        {/* Job selector */}
        <div className="score-job-selector">
          <label htmlFor="score-job-select">Score Context:</label>
          <select
            id="score-job-select"
            value={selectedJobId}
            onChange={(e) => handleJobChange(e.target.value)}
            disabled={isLoadingJobs}
          >
            <option value="">General Assessment</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.jobName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="score-section-content">
        {/* Left side - AI Insights */}
        <div className="score-section-primary">
          <AIInsightsCard
            insights={insights}
            isLoading={isGeneratingInsights}
            error={insightsError}
            onGenerate={handleGenerateInsights}
            candidateName={candidateName}
          />
        </div>

        {/* Right side - Score Card and History */}
        <div className="score-section-secondary">
          {/* Main Score Card */}
          <PredictiveScoreCard
            score={score}
            isLoading={isCalculating}
            error={error}
            showBreakdown={true}
            showFactors={true}
            onCalculate={handleCalculateScore}
            onRefresh={handleCalculateScore}
          />

          {/* Score History */}
          <ScoreHistoryChart
            history={history}
            isLoading={isLoadingHistory}
            showList={true}
            maxListItems={3}
            onRefresh={fetchHistory}
          />
        </div>
      </div>

      <style>{`
        .candidate-score-section {
          margin-top: 2rem;
          padding: 0 2rem;
        }
        
        .score-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .score-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        
        .score-job-selector {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .score-job-selector label {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }
        
        .score-job-selector select {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #1e293b;
          background: white;
          cursor: pointer;
          min-width: 200px;
        }
        
        .score-job-selector select:focus {
          outline: none;
          border-color: #E30022;
          box-shadow: 0 0 0 2px rgba(227, 0, 34, 0.1);
        }
        
        .score-section-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        
        .score-section-primary {
          grid-column: 1;
        }
        
        .score-section-secondary {
          grid-column: 2;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        @media (max-width: 1200px) {
          .score-section-content {
            grid-template-columns: 1fr;
          }
          
          .score-section-primary,
          .score-section-secondary {
            grid-column: 1;
          }
        }
        
        @media (max-width: 640px) {
          .candidate-score-section {
            padding: 0 1rem;
          }
          
          .score-section-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .score-job-selector {
            width: 100%;
          }
          
          .score-job-selector select {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CandidateScoreSection;
