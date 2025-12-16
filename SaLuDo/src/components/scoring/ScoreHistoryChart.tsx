/**
 * ScoreHistoryChart Component
 * Displays score history over time using a line chart
 */

import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ScoreHistoryEntry, getScoreColor, getScoreLabel } from '../../types/scoring';
import '../css/PredictiveScore.css';

interface ScoreHistoryChartProps {
  history: ScoreHistoryEntry[];
  isLoading?: boolean;
  showList?: boolean;
  maxListItems?: number;
  onRefresh?: () => void;
}

interface ChartDataPoint {
  date: string;
  fullDate: string;
  score: number;
  jobTitle?: string;
  scoringSettingsName?: string;
  color: string;
  originalEntry: ScoreHistoryEntry; // Reference to original entry for modal
}

// Score Detail Modal Component
const ScoreDetailModal: React.FC<{
  entry: ScoreHistoryEntry;
  onClose: () => void;
}> = ({ entry, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="score-modal-overlay" onClick={onClose}>
      <div className="score-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="score-modal-header">
          <h3>Score Details</h3>
          <button className="score-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="score-modal-body">
          {/* Main Score */}
          <div className="score-modal-main-score">
            <div
              className="score-modal-score-value"
              style={{ color: getScoreColor(entry.overallScore ?? 0) }}
            >
              {(entry.overallScore ?? 0).toFixed(1)}
            </div>
            <div className="score-modal-score-label">
              {getScoreLabel(entry.overallScore ?? 0)}
            </div>
          </div>

          {/* Metadata */}
          <div className="score-modal-meta">
            <div className="score-modal-meta-item">
              <span className="meta-label">Date:</span>
              <span className="meta-value">{formatDate(entry.calculatedAt)}</span>
            </div>
            {entry.scoringSettingsName && (
              <div className="score-modal-meta-item">
                <span className="meta-label">Scoring Settings:</span>
                <span className="meta-value">{entry.scoringSettingsName}</span>
              </div>
            )}
            {entry.jobTitle && (
              <div className="score-modal-meta-item">
                <span className="meta-label">Job:</span>
                <span className="meta-value">{entry.jobTitle}</span>
              </div>
            )}
            {entry.confidence != null && (
              <div className="score-modal-meta-item">
                <span className="meta-label">Confidence:</span>
                <span className="meta-value">{entry.confidence}%</span>
              </div>
            )}
          </div>

          {/* Breakdown */}
          {entry.breakdown && (
            <div className="score-modal-breakdown">
              <h4>Score Breakdown</h4>
              <div className="breakdown-grid">
                <div className="breakdown-item-modal">
                  <span className="breakdown-label-modal">Skill Match</span>
                  <span className="breakdown-value-modal">
                    {entry.breakdown.skillMatch?.toFixed(1) ?? 'N/A'}
                  </span>
                </div>
                <div className="breakdown-item-modal">
                  <span className="breakdown-label-modal">Personality Fit</span>
                  <span className="breakdown-value-modal">
                    {entry.breakdown.personalityFit?.toFixed(1) ?? 'N/A'}
                  </span>
                </div>
                <div className="breakdown-item-modal">
                  <span className="breakdown-label-modal">Experience</span>
                  <span className="breakdown-value-modal">
                    {entry.breakdown.experience?.toFixed(1) ?? 'N/A'}
                  </span>
                </div>
                <div className="breakdown-item-modal">
                  <span className="breakdown-label-modal">Education</span>
                  <span className="breakdown-value-modal">
                    {entry.breakdown.education?.toFixed(1) ?? 'N/A'}
                  </span>
                </div>
                <div className="breakdown-item-modal">
                  <span className="breakdown-label-modal">Profile Quality</span>
                  <span className="breakdown-value-modal">
                    {entry.breakdown.profileQuality?.toFixed(1) ?? 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Weights Used */}
          {entry.weightsUsed && (
            <div className="score-modal-weights">
              <h4>Weights Used</h4>
              <div className="weights-grid">
                <div className="weight-item-modal">
                  <span className="weight-label-modal">Skills</span>
                  <span className="weight-value-modal">{entry.weightsUsed.skillMatch}%</span>
                </div>
                <div className="weight-item-modal">
                  <span className="weight-label-modal">Personality</span>
                  <span className="weight-value-modal">{entry.weightsUsed.personalityFit}%</span>
                </div>
                <div className="weight-item-modal">
                  <span className="weight-label-modal">Experience</span>
                  <span className="weight-value-modal">{entry.weightsUsed.experience}%</span>
                </div>
                <div className="weight-item-modal">
                  <span className="weight-label-modal">Education</span>
                  <span className="weight-value-modal">{entry.weightsUsed.education}%</span>
                </div>
                <div className="weight-item-modal">
                  <span className="weight-label-modal">Profile</span>
                  <span className="weight-value-modal">{entry.weightsUsed.profileQuality}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom tooltip component
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartDataPoint;
    return (
      <div className="score-history-tooltip">
        <div className="score-history-tooltip-label">{data.fullDate}</div>
        <div className="score-history-tooltip-value">{data.score.toFixed(1)}</div>
        {data.jobTitle && (
          <div className="score-history-tooltip-job">{data.jobTitle}</div>
        )}
        {data.scoringSettingsName && (
          <div className="score-history-tooltip-settings">{data.scoringSettingsName}</div>
        )}
      </div>
    );
  }
  return null;
};

export const ScoreHistoryChart: React.FC<ScoreHistoryChartProps> = ({
  history,
  isLoading = false,
  showList = true,
  maxListItems = 5,
  onRefresh,
}) => {
  const [selectedEntry, setSelectedEntry] = useState<ScoreHistoryEntry | null>(null);

  // Transform history data for the chart
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!history || history.length === 0) return [];
    return history
      .slice()
      .sort((a, b) => new Date(a.calculatedAt).getTime() - new Date(b.calculatedAt).getTime())
      .filter((entry) => entry.overallScore != null && !isNaN(entry.overallScore))
      .map((entry) => ({
        date: new Date(entry.calculatedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        fullDate: new Date(entry.calculatedAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        score: entry.overallScore ?? 0,
        jobTitle: entry.jobTitle,
        scoringSettingsName: entry.scoringSettingsName,
        color: getScoreColor(entry.overallScore ?? 0),
        originalEntry: entry,
      }));
  }, [history]);

  // Handle chart data point click
  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedData = data.activePayload[0].payload as ChartDataPoint;
      if (clickedData.originalEntry) {
        setSelectedEntry(clickedData.originalEntry);
      }
    }
  };

  // Calculate average score
  const averageScore = useMemo(() => {
    if (!history || history.length === 0) return 0;
    const validScores = history.filter(entry => entry.overallScore != null && !isNaN(entry.overallScore));
    if (validScores.length === 0) return 0;
    return validScores.reduce((sum, entry) => sum + (entry.overallScore ?? 0), 0) / validScores.length;
  }, [history]);

  // Get score trend
  const trend = useMemo(() => {
    if (!history || history.length < 2) return null;
    
    const sorted = [...history]
      .filter(entry => entry.overallScore != null && !isNaN(entry.overallScore))
      .sort(
        (a, b) => new Date(a.calculatedAt).getTime() - new Date(b.calculatedAt).getTime()
      );
    
    if (sorted.length < 2) return null;
    
    const first = sorted[0].overallScore ?? 0;
    const last = sorted[sorted.length - 1].overallScore ?? 0;
    const diff = last - first;
    
    if (Math.abs(diff) < 2) return { direction: 'stable', value: diff };
    return { direction: diff > 0 ? 'up' : 'down', value: diff };
  }, [history]);

  // Format date for list
  const formatListDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Empty state
  if ((!history || history.length === 0) && !isLoading) {
    return (
      <div className="score-history-container">
        <div className="score-history-header">
          <h3 className="score-history-title">Score History</h3>
          {onRefresh && (
            <button className="score-action-btn" onClick={onRefresh}>
              Refresh
            </button>
          )}
        </div>
        <div className="score-history-empty">
          <p>No score history available yet.</p>
          <p>Scores will appear here after calculations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="score-history-container">
      {/* Modal */}
      {selectedEntry && (
        <ScoreDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}

      {/* Header */}
      <div className="score-history-header">
        <h3 className="score-history-title">
          Score History
          {trend && (
            <span style={{ 
              marginLeft: '0.75rem',
              fontSize: '0.75rem',
              color: trend.direction === 'up' ? '#22c55e' : trend.direction === 'down' ? '#ef4444' : '#64748b',
              fontWeight: 500,
            }}>
              {trend.direction === 'up' ? '+' : ''}{trend.value.toFixed(1)} pts
            </span>
          )}
        </h3>
        {onRefresh && (
          <button 
            className="score-action-btn" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="score-history-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={handleChartClick}
              style={{ cursor: 'pointer' }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={averageScore}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{
                  value: `Avg: ${averageScore.toFixed(1)}`,
                  position: 'right',
                  fontSize: 10,
                  fill: '#94a3b8',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#E30022"
                strokeWidth={2}
                dot={{
                  fill: '#E30022',
                  strokeWidth: 2,
                  stroke: '#ffffff',
                  r: 4,
                  cursor: 'pointer',
                  onClick: (_: any, payload: any) => {
                    if (payload && payload.payload && payload.payload.originalEntry) {
                      setSelectedEntry(payload.payload.originalEntry);
                    }
                  },
                }}
                activeDot={{
                  r: 6,
                  fill: '#E30022',
                  stroke: '#ffffff',
                  strokeWidth: 3,
                  cursor: 'pointer',
                  onClick: (_: any, payload: any) => {
                    if (payload && payload.payload && payload.payload.originalEntry) {
                      setSelectedEntry(payload.payload.originalEntry);
                    }
                  },
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Single data point display */}
      {chartData.length === 1 && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '2rem',
          color: '#64748b'
        }}>
          <div style={{ 
            fontSize: '3rem', 
            fontWeight: 700, 
            color: getScoreColor(chartData[0].score) 
          }}>
            {chartData[0].score.toFixed(1)}
          </div>
          <p style={{ marginTop: '0.5rem' }}>First score recorded on {chartData[0].fullDate}</p>
        </div>
      )}

      {/* History List */}
      {showList && history.length > 0 && (
        <div className="score-history-list">
          <h4 className="history-list-title">Recent Scores</h4>
          {history
            .slice()
            .sort((a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime())
            .slice(0, maxListItems)
            .map((entry, index) => (
              <div 
                key={index} 
                className="history-item history-item-clickable"
                onClick={() => setSelectedEntry(entry)}
                title="Click to view details"
              >
                <div className="history-item-info">
                  <span className="history-item-date">{formatListDate(entry.calculatedAt)}</span>
                  {entry.jobTitle && (
                    <span className="history-item-job">{entry.jobTitle}</span>
                  )}
                </div>
                <span
                  className="history-item-score"
                  style={{ color: getScoreColor(entry.overallScore ?? 0) }}
                >
                  {(entry.overallScore ?? 0).toFixed(1)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ScoreHistoryChart;

