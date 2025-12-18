/**
 * PredictiveScoreCard Component
 * Displays the predictive success score for a candidate with breakdown and confidence
 */

import React, { useMemo } from 'react';
import {
  PredictiveScoreResult,
  getScoreColor,
  getScoreLabel,
} from '../../types/scoring';
import '../css/PredictiveScore.css';

interface PredictiveScoreCardProps {
  score: PredictiveScoreResult | null;
  isLoading?: boolean;
  error?: string | null;
  compact?: boolean;
  showBreakdown?: boolean;
  showFactors?: boolean;
  onCalculate?: () => void;
  onRefresh?: () => void;
}

export const PredictiveScoreCard: React.FC<PredictiveScoreCardProps> = ({
  score,
  isLoading = false,
  error = null,
  compact = false,
  showBreakdown = true,
  showFactors = true,
  onCalculate,
  onRefresh,
}) => {
  // Calculate the SVG circle properties
  const circleSize = compact ? 70 : 100;
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const strokeDashoffset = useMemo(() => {
    if (!score) return circumference;
    const progress = score.overallScore / 100;
    return circumference * (1 - progress);
  }, [score, circumference]);

  const scoreColor = useMemo(() => {
    return score ? getScoreColor(score.overallScore) : '#e2e8f0';
  }, [score]);

  const scoreLabel = useMemo(() => {
    return score ? getScoreLabel(score.overallScore) : '';
  }, [score]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Breakdown colors
  const breakdownColors: Record<string, string> = {
    skillMatch: '#3b82f6',      // blue
    personalityFit: '#8b5cf6',  // purple
    experience: '#22c55e',      // green
    education: '#f59e0b',       // amber
    profileQuality: '#06b6d4',  // cyan
  };

  // Error state
  if (error) {
    return (
      <div className={`predictive-score-card ${compact ? 'compact' : ''}`}>
        <div className="score-error">
          <div className="score-error-icon">!</div>
          <p className="score-error-message">{error}</p>
          {onCalculate && (
            <button className="score-error-retry" onClick={onCalculate}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (!score && !isLoading) {
    return (
      <div className={`predictive-score-card ${compact ? 'compact' : ''}`}>
        <div className="score-empty">
          <p className="score-empty-message">
            No score calculated yet. Calculate the predictive success score to see how this candidate ranks.
          </p>
          {onCalculate && (
            <button 
              className="score-calculate-btn" 
              onClick={onCalculate}
              disabled={isLoading}
            >
              Calculate Score
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`predictive-score-card ${compact ? 'compact' : ''} ${isLoading ? 'loading' : ''}`}>
      {/* Header */}
      <div className="score-card-header">
        <div>
          <h3 className="score-card-title">Predictive Success Score</h3>
          {score?.jobTitle && (
            <p className="score-card-subtitle">For: {score.jobTitle}</p>
          )}
        </div>
        <div className="score-card-actions">
          {onRefresh && (
            <button 
              className="score-action-btn" 
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? 'Calculating...' : 'Refresh'}
            </button>
          )}
        </div>
      </div>

      {/* Main Score Display */}
      <div className="score-main-display">
        {/* Circular Score */}
        <div className={`score-circle ${compact ? 'compact' : ''}`}>
          <svg width={circleSize} height={circleSize}>
            <circle
              className="score-circle-bg"
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
            />
            <circle
              className="score-circle-progress"
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              style={{
                stroke: scoreColor,
                strokeDasharray: circumference,
                strokeDashoffset: isLoading ? circumference : strokeDashoffset,
              }}
            />
          </svg>
          <div className="scores-value">
            {isLoading ? (
              <span className="score-number score-skeleton">--</span>
            ) : (
              <>
                <span className="score-number" style={{ color: scoreColor }}>
                  {score ? Math.round(score.overallScore) : '--'}
                </span>
                <span className="score-label">Score</span>
              </>
            )}
          </div>
        </div>

        {/* Score Info */}
        <div className="score-info">
          <div className="score-status">
            <span className="score-status-label">{scoreLabel}</span>
            {score?.confidence && (
              <span className={`confidence-badge ${score.confidence.level}`}>
                <span className="confidence-dot"></span>
                {score.confidence.level} confidence
              </span>
            )}
          </div>
          {score && (
            <p className="score-meta">
              Last calculated: {formatDate(score.calculatedAt)}
            </p>
          )}
        </div>
      </div>

      {/* Breakdown Section */}
      {showBreakdown && score && !compact && (
        <div className="score-breakdown">
          <h4 className="breakdown-title">Score Breakdown</h4>
          <div className="breakdown-items">
            {[
              { key: 'skillMatch', label: 'Skill Match', value: score.breakdown.skillMatch },
              { key: 'personalityFit', label: 'Personality Fit', value: score.breakdown.personalityFit },
              { key: 'experience', label: 'Experience', value: score.breakdown.experience },
              { key: 'education', label: 'Education', value: score.breakdown.education },
              { key: 'profileQuality', label: 'Profile Quality', value: score.breakdown.profileQuality },
            ].map((item) => (
              <div key={item.key} className="breakdown-item">
                <span className="breakdown-label">{item.label}</span>
                <div className="breakdown-bar-container">
                  <div
                    className="breakdown-bar"
                    style={{
                      width: `${Math.min(100, Math.max(0, item.value))}%`,
                      backgroundColor: breakdownColors[item.key],
                    }}
                  />
                </div>
                <span className="breakdown-value">{item.value.toFixed(1)}</span>
              </div>
            ))}
            {score.breakdown.certificationBonus > 0 && (
              <div className="breakdown-item">
                <span className="breakdown-label">Certification Bonus</span>
                <div className="breakdown-bar-container">
                  <div
                    className="breakdown-bar"
                    style={{
                      width: `${Math.min(100, score.breakdown.certificationBonus * 10)}%`,
                      backgroundColor: '#ec4899',
                    }}
                  />
                </div>
                <span className="breakdown-value">+{score.breakdown.certificationBonus.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contributing Factors */}
      {showFactors && score?.factors && score.factors.length > 0 && !compact && (
        <div className="score-factors">
          <h4 className="factors-title">Key Factors</h4>
          <div className="factors-list">
            {score.factors.slice(0, 6).map((factor, index) => (
              <span
                key={index}
                className={`factor-tag ${factor.impact}`}
              >
                <span className="factor-icon">
                  {factor.impact === 'positive' ? '+' : factor.impact === 'negative' ? '-' : '~'}
                </span>
                {factor.factor}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveScoreCard;
