/**
 * ScoreHistoryChart Component
 * Displays score history over time using a line chart
 */

import React, { useMemo } from 'react';
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
import { ScoreHistoryEntry, getScoreColor } from '../../types/scoring';
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
  color: string;
}

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
  // Transform history data for the chart
  const chartData = useMemo((): ChartDataPoint[] => {
    return history
      .slice()
      .sort((a, b) => new Date(a.calculatedAt).getTime() - new Date(b.calculatedAt).getTime())
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
        score: entry.score,
        jobTitle: entry.jobTitle,
        color: getScoreColor(entry.score),
      }));
  }, [history]);

  // Calculate average score
  const averageScore = useMemo(() => {
    if (history.length === 0) return 0;
    return history.reduce((sum, entry) => sum + entry.score, 0) / history.length;
  }, [history]);

  // Get score trend
  const trend = useMemo(() => {
    if (history.length < 2) return null;
    
    const sorted = [...history].sort(
      (a, b) => new Date(a.calculatedAt).getTime() - new Date(b.calculatedAt).getTime()
    );
    
    const first = sorted[0].score;
    const last = sorted[sorted.length - 1].score;
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
  if (history.length === 0 && !isLoading) {
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
                }}
                activeDot={{
                  r: 6,
                  fill: '#E30022',
                  stroke: '#ffffff',
                  strokeWidth: 3,
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
              <div key={index} className="history-item">
                <div className="history-item-info">
                  <span className="history-item-date">{formatListDate(entry.calculatedAt)}</span>
                  {entry.jobTitle && (
                    <span className="history-item-job">{entry.jobTitle}</span>
                  )}
                </div>
                <span
                  className="history-item-score"
                  style={{ color: getScoreColor(entry.score) }}
                >
                  {entry.score.toFixed(1)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ScoreHistoryChart;
