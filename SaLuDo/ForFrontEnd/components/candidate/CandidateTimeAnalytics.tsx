import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CandidateTimeAnalytics as TimeAnalyticsType, StatusHistoryEntry } from '../../types/CandidateApiTypes';
import { CandidateApiClient } from '../../clients/CandidateApiClient';
import { formatDuration, getTimeColorHex, getRelativeSpeed } from '../../utils/timeFormatters';
import StatusHistoryTimeline from './StatusHistoryTimeline';

interface CandidateTimeAnalyticsProps {
  candidateId: string;
  className?: string;
}

const CandidateTimeAnalytics: React.FC<CandidateTimeAnalyticsProps> = ({ 
  candidateId,
  className = ''
}) => {
  const [analytics, setAnalytics] = useState<TimeAnalyticsType | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [candidateId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both analytics and status history
      const [analyticsData, historyData] = await Promise.all([
        CandidateApiClient.getCandidateTimeAnalytics(candidateId),
        CandidateApiClient.getStatusHistory(candidateId)
      ]);
      
      setAnalytics(analyticsData);
      setStatusHistory(historyData.statusHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-600 text-xl"></span>
          <h3 className="text-lg font-semibold text-red-900">Error Loading Analytics</h3>
        </div>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={loadAnalytics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`text-center py-12 text-gray-500 ${className}`}>
        <p>No analytics data available</p>
      </div>
    );
  }

  // Prepare chart data from stage breakdown
  const chartData = analytics.stageBreakdown.map(stage => ({
    name: stage.status ? stage.status.replace(/_/g, ' ') : 'Unknown',
    duration: stage.durationMs / (1000 * 60 * 60), // Convert to hours
    durationMs: stage.durationMs,
    color: getTimeColorHex(stage.durationMs)
  }));

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Time Analytics</h2>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Time */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Time in Process</h3>
            <span className="text-2xl"></span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatDuration(analytics.totalTimeInProcess.durationMs)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Since application date
          </div>
        </div>

        {/* Current Stage */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Current Stage Duration</h3>
            <span className="text-2xl"></span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {formatDuration(analytics.timeInCurrentStage.durationMs)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              analytics.isStuck ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {analytics.isStuck ? 'Stuck' : 'Moving'}
            </span>
            <span className="text-sm text-gray-500">
              {getRelativeSpeed(analytics.timeInCurrentStage.durationMs)}
            </span>
          </div>
        </div>

        {/* Stage Changes */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Stage Changes</h3>
            <span className="text-2xl"></span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {analytics.totalStatusChanges}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {analytics.stageBreakdown.length} unique stages
          </div>
        </div>
      </div>

      {/* Stage Breakdown Chart */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Spent in Each Stage</h3>
        
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Duration']}
                labelFormatter={(label) => `Stage: ${label}`}
              />
              <Bar dataKey="duration" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No stage data available</p>
          </div>
        )}

        {/* Stage breakdown table */}
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Speed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.stageBreakdown.map((stage, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stage.status ? stage.status.replace(/_/g, ' ') : 'Unknown'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {formatDuration(stage.durationMs)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      getRelativeSpeed(stage.durationMs) === 'Fast' ? 'bg-green-100 text-green-800' :
                      getRelativeSpeed(stage.durationMs) === 'Normal' ? 'bg-blue-100 text-blue-800' :
                      getRelativeSpeed(stage.durationMs) === 'Slow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getRelativeSpeed(stage.durationMs)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status History Timeline */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History Timeline</h3>
        <StatusHistoryTimeline statusHistory={statusHistory} />
      </div>
    </div>
  );
};

export default CandidateTimeAnalytics;
