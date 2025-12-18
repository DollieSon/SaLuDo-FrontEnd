import React from 'react';
import { StatusHistoryEntry } from '../../types/CandidateApiTypes';
import { formatTimelineDate, formatDuration } from '../../utils/timeFormatters';

interface StatusHistoryTimelineProps {
  statusHistory: StatusHistoryEntry[];
  className?: string;
}

const StatusHistoryTimeline: React.FC<StatusHistoryTimelineProps> = ({ 
  statusHistory,
  className = ''
}) => {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p>No status history available</p>
      </div>
    );
  }

  // Sort by date (newest first)
  const sortedHistory = [...statusHistory].sort((a, b) => 
    new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, string> = {
      FOR_REVIEW: '📋',
      PAPER_SCREENING: '📄',
      EXAM: '✍️',
      HR_INTERVIEW: '👥',
      TECHNICAL_INTERVIEW: '💻',
      FINAL_INTERVIEW: '🎯',
      FOR_JOB_OFFER: '📝',
      OFFER_EXTENDED: '📧',
      HIRED: '✅',
      REJECTED: '❌',
      WITHDRAWN: '↩️',
      ON_HOLD: '⏸️'
    };
    return iconMap[status] || '📌';
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      FOR_REVIEW: 'bg-blue-100 text-blue-800 border-blue-300',
      PAPER_SCREENING: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      EXAM: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      HR_INTERVIEW: 'bg-sky-100 text-sky-800 border-sky-300',
      TECHNICAL_INTERVIEW: 'bg-blue-100 text-blue-900 border-blue-300',
      FINAL_INTERVIEW: 'bg-violet-100 text-violet-800 border-violet-300',
      FOR_JOB_OFFER: 'bg-purple-100 text-purple-800 border-purple-300',
      OFFER_EXTENDED: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
      HIRED: 'bg-green-100 text-green-800 border-green-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300',
      WITHDRAWN: 'bg-gray-100 text-gray-800 border-gray-300',
      ON_HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const calculateDuration = (index: number): string | null => {
    if (index === 0) return null; // Most recent status, no duration yet
    
    const current = new Date(sortedHistory[index].changedAt);
    const previous = new Date(sortedHistory[index - 1].changedAt);
    const durationMs = previous.getTime() - current.getTime();
    
    return formatDuration(durationMs);
  };

  return (
    <div className={`${className}`}>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

        {/* Timeline items */}
        <div className="space-y-6">
          {sortedHistory.map((entry, index) => {
            const duration = calculateDuration(index);
            const isLatest = index === 0;
            
            return (
              <div key={entry.historyId} className="relative pl-16">
                {/* Timeline dot */}
                <div className={`absolute left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isLatest ? 'bg-blue-500 border-blue-600' : 'bg-white border-gray-400'
                }`}>
                  {isLatest && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>

                {/* Content card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getStatusIcon(entry.status)}</span>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                        {entry.previousStatus && (
                          <div className="text-xs text-gray-500 mt-1">
                            From: {entry.previousStatus}
                          </div>
                        )}
                      </div>
                    </div>

                    {duration && (
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{duration}</div>
                        <div className="text-xs text-gray-500">in stage</div>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.changedByName || 'Unknown User'}</span>
                      {entry.changedByEmail && (
                        <span className="text-gray-400">({entry.changedByEmail})</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimelineDate(entry.changedAt)}
                    </div>
                  </div>

                  {/* Reason */}
                  {entry.reason && (
                    <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                      <div className="text-xs font-medium text-gray-700 mb-1">Reason:</div>
                      <div className="text-sm text-gray-900">{entry.reason}</div>
                    </div>
                  )}

                  {/* Notes */}
                  {entry.notes && (
                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="text-xs font-medium text-blue-700 mb-1">Notes:</div>
                      <div className="text-sm text-gray-900">{entry.notes}</div>
                    </div>
                  )}

                  {/* Source badge */}
                  <div className="flex items-center gap-2 mt-3">
                    {entry.isAutomated && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        🤖 Automated
                      </span>
                    )}
                    {entry.source && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {entry.source}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatusHistoryTimeline;
