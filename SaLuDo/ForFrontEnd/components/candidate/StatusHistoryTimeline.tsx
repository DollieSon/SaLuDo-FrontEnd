import React from 'react';
import { StatusHistoryEntry } from '../../types/CandidateApiTypes';
import { formatTimelineDate, formatDuration } from '../../utils/timeFormatters';
import './StatusHistoryTimeline.css';

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
      <div className={`history-empty-state ${className}`}>
        <div className="empty-state-icon">
          <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="empty-state-text">No status history available</p>
        <p className="empty-state-subtext">Status changes will appear here</p>
      </div>
    );
  }

  // Sort by date (newest first)
  const sortedHistory = [...statusHistory].sort((a, b) => 
    new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      FOR_REVIEW: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>,
      PAPER_SCREENING: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/></svg>,
      EXAM: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>,
      HR_INTERVIEW: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>,
      TECHNICAL_INTERVIEW: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>,
      FINAL_INTERVIEW: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>,
      FOR_JOB_OFFER: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd"/></svg>,
      OFFER_EXTENDED: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>,
      HIRED: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>,
      REJECTED: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>,
      WITHDRAWN: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/></svg>,
      ON_HOLD: <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
    };
    return iconMap[status] || <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>;
  };

  const getStatusColorHex = (status: string): string => {
    const colorMap: Record<string, string> = {
      FOR_REVIEW: '#3b82f6',
      PAPER_SCREENING: '#6366f1',
      EXAM: '#06b6d4',
      HR_INTERVIEW: '#0ea5e9',
      TECHNICAL_INTERVIEW: '#2563eb',
      FINAL_INTERVIEW: '#8b5cf6',
      FOR_JOB_OFFER: '#a855f7',
      OFFER_EXTENDED: '#d946ef',
      HIRED: '#10b981',
      REJECTED: '#ef4444',
      WITHDRAWN: '#6b7280',
      ON_HOLD: '#f59e0b'
    };
    return colorMap[status] || '#6b7280';
  };

  const calculateDuration = (index: number): string | null => {
    if (index === 0) return null; // Most recent status, no duration yet
    
    const current = new Date(sortedHistory[index].changedAt);
    const previous = new Date(sortedHistory[index - 1].changedAt);
    const durationMs = previous.getTime() - current.getTime();
    
    return formatDuration(durationMs);
  };

  return (
    <div className={`history-timeline-container ${className}`}>
      <div className="timeline-wrapper">
        {/* Timeline line */}
        <div className="timeline-line"></div>

        {/* Timeline items */}
        <div className="timeline-items">
          {sortedHistory.map((entry, index) => {
            const duration = calculateDuration(index);
            const isLatest = index === 0;
            const statusColor = getStatusColorHex(entry.status);
            
            return (
              <div key={entry.historyId} className="timeline-item">
                {/* Timeline node */}
                <div 
                  className={`timeline-node ${isLatest ? 'active' : ''}`}
                  style={{ '--node-color': statusColor } as React.CSSProperties}
                >
                  <div className="node-icon" style={{ color: statusColor }}>
                    {getStatusIcon(entry.status)}
                  </div>
                  {isLatest && <div className="node-pulse"></div>}
                </div>

                {/* Content card */}
                <div className={`timeline-card ${isLatest ? 'latest' : ''}`}>
                  {/* Card header */}
                  <div className="card-header">
                    <div className="card-status-section">
                      <div 
                        className="status-badge"
                        style={{ 
                          backgroundColor: `${statusColor}15`,
                          color: statusColor,
                          borderColor: `${statusColor}40`
                        }}
                      >
                        <div className="badge-icon" style={{ color: statusColor }}>
                          {getStatusIcon(entry.status)}
                        </div>
                        <span className="badge-text">
                          {entry.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {entry.previousStatus && (
                        <div className="status-transition">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          <span>From {entry.previousStatus.replace(/_/g, ' ')}</span>
                        </div>
                      )}
                    </div>

                    {duration && (
                      <div className="card-duration">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="duration-content">
                          <span className="duration-value">{duration}</span>
                          <span className="duration-label">in stage</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card metadata */}
                  <div className="card-metadata">
                    <div className="metadata-user">
                      <div className="user-avatar">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div className="user-info">
                        <span className="user-name">{entry.changedByName || 'Unknown User'}</span>
                        {entry.changedByEmail && (
                          <span className="user-email">{entry.changedByEmail}</span>
                        )}
                      </div>
                    </div>
                    <div className="metadata-time">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatTimelineDate(entry.changedAt)}</span>
                    </div>
                  </div>

                  {/* Reason section */}
                  {entry.reason && (
                    <div className="card-reason">
                      <div className="reason-label">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span>Reason</span>
                      </div>
                      <p className="reason-text">{entry.reason}</p>
                    </div>
                  )}

                  {/* Notes section */}
                  {entry.notes && (
                    <div className="card-notes">
                      <div className="notes-label">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Notes</span>
                      </div>
                      <p className="notes-text">{entry.notes}</p>
                    </div>
                  )}

                  {/* Card footer badges */}
                  {(entry.isAutomated || entry.source) && (
                    <div className="card-footer">
                      {entry.isAutomated && (
                        <span className="footer-badge automated">
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                          </svg>
                          Automated
                        </span>
                      )}
                      {entry.source && (
                        <span className="footer-badge source">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {entry.source}
                        </span>
                      )}
                    </div>
                  )}
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
