/**
 * AIInsightsCard Component
 * Displays AI-generated insights about a candidate
 */

import React from 'react';
import { CandidateAIInsights } from '../../types/scoring';
import '../css/PredictiveScore.css';

interface AIInsightsCardProps {
  insights: CandidateAIInsights | null;
  isLoading?: boolean;
  error?: string | null;
  onGenerate?: () => void;
  candidateName?: string;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({
  insights,
  isLoading = false,
  error = null,
  onGenerate,
  candidateName,
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Error state
  if (error) {
    return (
      <div className="ai-insights-card">
        <div className="ai-insights-header">
          <h3 className="ai-insights-title">
            AI Insights
            <span className="ai-badge">AI</span>
          </h3>
        </div>
        <div className="score-error">
          <p className="score-error-message">{error}</p>
          {onGenerate && (
            <button className="ai-generate-btn" onClick={onGenerate}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty state - no insights yet
  if (!insights && !isLoading) {
    return (
      <div className="ai-insights-card">
        <div className="ai-insights-header">
          <h3 className="ai-insights-title">
            AI Insights
            <span className="ai-badge">AI</span>
          </h3>
        </div>
        <div className="score-empty">
          <p className="score-empty-message">
            Generate AI-powered insights to get a comprehensive analysis of 
            {candidateName ? ` ${candidateName}'s` : " this candidate's"} profile, strengths, and areas for development.
          </p>
          {onGenerate && (
            <button 
              className="ai-generate-btn" 
              onClick={onGenerate}
              disabled={isLoading}
            >
              Generate Insights
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="ai-insights-card">
        <div className="ai-insights-header">
          <h3 className="ai-insights-title">
            AI Insights
            <span className="ai-badge">AI</span>
          </h3>
        </div>
        <div className="score-empty">
          <p className="score-empty-message">
            Analyzing candidate profile with AI...
          </p>
          <div className="score-skeleton" style={{ 
            width: '200px', 
            height: '20px', 
            background: '#e2e8f0', 
            borderRadius: '4px',
            margin: '1rem auto'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights-card">
      {/* Header */}
      <div className="ai-insights-header">
        <h3 className="ai-insights-title">
          AI Insights
          <span className="ai-badge">AI</span>
        </h3>
        {onGenerate && (
          <button 
            className="ai-generate-btn" 
            onClick={onGenerate}
            disabled={isLoading}
          >
            Regenerate
          </button>
        )}
      </div>

      {/* Summary */}
      {insights?.summary && (
        <p className="ai-insights-summary">{insights.summary}</p>
      )}

      {/* Strengths */}
      {insights?.strengths && insights.strengths.length > 0 && (
        <div className="ai-insights-section">
          <h4 className="ai-section-title">Key Strengths</h4>
          <ul className="ai-section-list strengths">
            {insights.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Development */}
      {insights?.areasForDevelopment && insights.areasForDevelopment.length > 0 && (
        <div className="ai-insights-section">
          <h4 className="ai-section-title">Areas for Development</h4>
          <ul className="ai-section-list improvements">
            {insights.areasForDevelopment.map((area, index) => (
              <li key={index}>{area}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Culture Fit Assessment */}
      {insights?.cultureFitAssessment && (
        <div className="ai-insights-section">
          <h4 className="ai-section-title">Culture Fit</h4>
          <p className="ai-culture-text">{insights.cultureFitAssessment}</p>
        </div>
      )}

      {/* Recommendations */}
      {insights?.recommendations && insights.recommendations.length > 0 && (
        <div className="ai-insights-section">
          <h4 className="ai-section-title">Recommendations</h4>
          <ul className="ai-section-list">
            {insights.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      {insights?.generatedAt && (
        <div className="ai-insights-footer">
          Generated on {formatDate(insights.generatedAt)}
        </div>
      )}
    </div>
  );
};

export default AIInsightsCard;
