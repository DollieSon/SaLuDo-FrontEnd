import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { SystemWideTimeAnalytics } from '../types/CandidateApiTypes';
import { CandidateApiClient } from '../clients/CandidateApiClient';
import { getTimeColorHex } from '../utils/timeFormatters';
import '../../src/components/css/TimeAnalytics.css';

const TimeAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<SystemWideTimeAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CandidateApiClient.getSystemWideTimeAnalytics();
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading system-wide analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-header">
          <span className="error-icon"></span>
          <h3>Error Loading Analytics</h3>
        </div>
        <p className="error-message">{error}</p>
        <button onClick={loadAnalytics} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No analytics data available</p>
      </div>
    );
  }

  // Prepare average time chart data from conversionFunnel (includes all active stages)
  const avgTimeChartData = analytics.conversionFunnel
    .filter(stage => stage.candidateCount > 0) // Only show stages with candidates
    .map(stage => ({
      name: stage.status ? stage.status.replace(/_/g, ' ') : 'Unknown',
      avgHours: stage.averageDaysInStage * 24, // Convert days to hours for better precision
      avgDays: stage.averageDaysInStage,
      count: stage.candidateCount,
      color: getTimeColorHex(stage.averageDaysInStage * 24 * 60 * 60 * 1000) // Convert to ms
    }))
    .sort((a, b) => b.avgDays - a.avgDays); // Sort by average days descending

  // If we have only a few bars, increase gaps and padding to avoid clustering to the edges
  const isSparse = avgTimeChartData.length <= 3;

  // Prepare bottleneck data (stages with longest average times)
  const bottleneckData = [...analytics.bottleneckStages]
    .slice(0, 5)
    .map(stage => ({
      name: stage.status ? stage.status.replace(/_/g, ' ') : 'Unknown',
      avgDays: stage.averageDays,
      count: stage.candidatesAffected,
      color: getTimeColorHex(stage.averageDays * 24 * 60 * 60 * 1000) // Convert to ms
    }));

  return (
    <div className="time-analytics-dashboard">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-header-content">
          <h1>Time Analytics Dashboard</h1>
          <p>System-wide recruitment pipeline performance</p>
        </div>
        <div className="analytics-header-actions">
          <button onClick={loadAnalytics} className="refresh-button">
            Refresh Data
          </button>
          {lastUpdated && (
            <p className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        {/* Total Candidates */}
        <div className="summary-card blue">
          <div className="summary-card-header">
            <h3>Total Candidates</h3>
            <span className="summary-card-icon"></span>
          </div>
          <div className="summary-card-value">{analytics.totalCandidates}</div>
          <p className="summary-card-subtitle">In process</p>
        </div>

        {/* Active Stages */}
        <div className="summary-card green">
          <div className="summary-card-header">
            <h3>Active Stages</h3>
            <span className="summary-card-icon"></span>
          </div>
          <div className="summary-card-value">
            {analytics.conversionFunnel.filter(s => s.candidateCount > 0).length}
          </div>
          <p className="summary-card-subtitle">Pipeline stages</p>
        </div>

        {/* Stuck Candidates */}
        <div className="summary-card orange">
          <div className="summary-card-header">
            <h3>Stuck Candidates</h3>
            <span className="summary-card-icon"></span>
          </div>
          <div className="summary-card-value">{analytics.stuckCandidates.length}</div>
          <p className="summary-card-subtitle">Need attention</p>
        </div>

        {/* Avg Process Time */}
        <div className="summary-card purple">
          <div className="summary-card-header">
            <h3>Avg Time to Hire</h3>
            <span className="summary-card-icon"></span>
          </div>
          <div className="summary-card-value">
            {Math.round(analytics.averageTimeToHire)}
          </div>
          <p className="summary-card-subtitle">Days from start to hire</p>
        </div>
      </div>

      {/* Average Time by Stage Chart */}
      <div className="charts-section">
        <h2>Average Time by Stage</h2>
        {avgTimeChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={500}>
            <BarChart 
              data={avgTimeChartData}
              margin={{ top: 30, right: 50, left: 60, bottom: 100 }}
              barCategoryGap={isSparse ? '40%' : '15%'}
              barGap={isSparse ? 10 : 4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={120}
                interval={0}
                padding={{ left: 30, right: 30 }}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 14 } }}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                domain={[0, 'auto']}
                allowDecimals={false}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900">{data.name}</p>
                        <p className="text-sm text-gray-600">
                          Avg Time: {data.avgDays.toFixed(1)} days ({data.avgHours.toFixed(1)} hours)
                        </p>
                        <p className="text-sm text-gray-600">
                          Candidates: {data.count}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="avgHours" radius={[8, 8, 0, 0]} maxBarSize={isSparse ? 100 : 60}>
                {avgTimeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No stage data available</p>
          </div>
        )}
      </div>

      {/* Bottlenecks and Stuck Candidates */}
      <div className="two-column-grid">
        {/* Top Bottlenecks */}
        <div className="bottlenecks-section">
          <h2>Top 5 Bottlenecks</h2>
          <div>
            {bottleneckData.map((stage, index) => (
              <div key={index} className="bottleneck-item">
                <div className="bottleneck-header">
                  <span className="bottleneck-name">{stage.name}</span>
                  <span className="bottleneck-rank">#{index + 1}</span>
                </div>
                <div className="bottleneck-metrics">
                  <span className="bottleneck-time" style={{ color: stage.color }}>
                    {stage.avgDays.toFixed(1)} days
                  </span>
                  <span className="bottleneck-count">
                    {stage.count} candidate{stage.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stuck Candidates Table */}
        <div className="stuck-candidates-section">
          <h2>Stuck Candidates</h2>
          
          {analytics.stuckCandidates.length > 0 ? (
            <div className="stuck-table-container">
              <table className="stuck-candidates-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Stage</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.stuckCandidates.slice(0, 10).map((candidate, index) => (
                    <tr key={index}>
                      <td className="font-medium text-gray-900">
                        {candidate.candidateName}
                      </td>
                      <td className="text-gray-600">
                        {candidate.status ? candidate.status.replace(/_/g, ' ') : 'Unknown'}
                      </td>
                      <td>
                        <span className="stuck-badge">
                          {candidate.daysInStage} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {analytics.stuckCandidates.length > 10 && (
                <div className="text-center py-3 text-sm text-gray-500 border-t">
                  +{analytics.stuckCandidates.length - 10} more candidates
                </div>
              )}
            </div>
          ) : (
            <div className="no-stuck-candidates">
              <p className="no-stuck-candidates-icon"></p>
              <p>No stuck candidates!</p>
              <p>All candidates are progressing well</p>
            </div>
          )}
        </div>
      </div>

      {/* Stage Details Table */}
      <div className="stage-details-section">
        <h2>Stage Details</h2>
        <div className="stage-table-container">
          <table className="stage-details-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Candidates</th>
                <th>Avg Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.conversionFunnel.map((stage, index) => {
                const status = stage.averageDaysInStage < 3 ? 'fast' : stage.averageDaysInStage < 7 ? 'normal' : stage.averageDaysInStage < 10 ? 'slow' : 'critical';

                return (
                  <tr key={index}>
                    <td className="font-medium text-gray-900">
                      {stage.status ? stage.status.replace(/_/g, ' ') : 'Unknown'}
                    </td>
                    <td className="text-gray-600">
                      {stage.candidateCount}
                    </td>
                    <td className="font-medium text-gray-900">
                      {stage.averageDaysInStage.toFixed(1)} days
                    </td>
                    <td>
                      <span className={`status-badge ${status}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <span className="info-banner-icon"></span>
        <div className="info-banner-content">
          <h3>Analytics Information</h3>
          <p>
            This dashboard provides system-wide insights into your recruitment pipeline. 
            Data is cached for 15 minutes for optimal performance. Click "Refresh Data" to update manually.
            Candidates are considered "stuck" if they remain in a stage for more than 7 days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimeAnalyticsDashboard;
