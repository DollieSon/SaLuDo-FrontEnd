import React from 'react';
import { AuditLogEntry } from '../types/audit';
import './css/AuditLogDetailModal.css';

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLogEntry | null;
}

const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  isOpen,
  onClose,
  log,
}) => {
  if (!isOpen || !log) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      iso: date.toISOString(),
    };
  };

  const formattedTime = formatDate(log.timestamp);

  return (
    <div className="audit-modal-overlay" onClick={onClose}>
      <div className="audit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="audit-modal-header">
          <h2>Audit Log Details</h2>
          <button className="audit-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="audit-modal-body">
          {/* Event Information Section */}
          <section className="audit-section">
            <h3>Event Information</h3>
            <div className="audit-info-grid">
              <div className="audit-info-item">
                <label>Event Type:</label>
                <span className="event-type-badge">{log.eventType}</span>
              </div>
              <div className="audit-info-item">
                <label>Severity:</label>
                <span className={`severity-badge severity-${log.severity.toLowerCase()}`}>
                  {log.severity}
                </span>
              </div>
              <div className="audit-info-item">
                <label>Status:</label>
                <span className={`status-badge ${log.success ? 'status-success' : 'status-failure'}`}>
                  {log.success ? 'Success' : 'Failure'}
                </span>
              </div>
              {log.duration !== undefined && (
                <div className="audit-info-item">
                  <label>Duration:</label>
                  <span>{log.duration}ms</span>
                </div>
              )}
            </div>
          </section>

          {/* Timestamp Section */}
          <section className="audit-section">
            <h3>Timestamp</h3>
            <div className="audit-info-grid">
              <div className="audit-info-item">
                <label>Date:</label>
                <span>{formattedTime.date}</span>
              </div>
              <div className="audit-info-item">
                <label>Time:</label>
                <span>{formattedTime.time}</span>
              </div>
              <div className="audit-info-item full-width">
                <label>ISO 8601:</label>
                <span className="mono-text">{formattedTime.iso}</span>
              </div>
            </div>
          </section>

          {/* User Information Section */}
          <section className="audit-section">
            <h3>User Information</h3>
            <div className="audit-info-grid">
              {(log.userEmail || log.userId) && (
                <div className="audit-info-item full-width">
                  <label>Performed By:</label>
                  <div className="user-identity">
                    {log.userEmail && (
                      <span className="user-email-display">{log.userEmail}</span>
                    )}
                    {log.userId && (
                      <span className="user-id-display">ID: {log.userId}</span>
                    )}
                  </div>
                </div>
              )}
              {log.targetUserId && (
                <div className="audit-info-item full-width">
                  <label>Target User:</label>
                  <div className="user-identity">
                    <span className="user-id-display">ID: {log.targetUserId}</span>
                    {(() => {
                      const targetEmail = log.details.metadata?.targetUserEmail;
                      return targetEmail && typeof targetEmail === 'string' ? (
                        <span className="user-email-display">{targetEmail}</span>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
              {log.sessionId && (
                <div className="audit-info-item full-width">
                  <label>Session ID:</label>
                  <span className="mono-text">{log.sessionId}</span>
                </div>
              )}
            </div>
          </section>

          {/* Network Information Section */}
          <section className="audit-section">
            <h3>Network Information</h3>
            <div className="audit-info-grid">
              <div className="audit-info-item">
                <label>IP Address:</label>
                <span className="mono-text">{log.ipAddress || 'N/A'}</span>
              </div>
              {log.location && (
                <>
                  {log.location.country && (
                    <div className="audit-info-item">
                      <label>Country:</label>
                      <span>{log.location.country}</span>
                    </div>
                  )}
                  {log.location.city && (
                    <div className="audit-info-item">
                      <label>City:</label>
                      <span>{log.location.city}</span>
                    </div>
                  )}
                  {log.location.timezone && (
                    <div className="audit-info-item">
                      <label>Timezone:</label>
                      <span>{log.location.timezone}</span>
                    </div>
                  )}
                </>
              )}
              {log.userAgent && (
                <div className="audit-info-item full-width">
                  <label>User Agent:</label>
                  <span className="user-agent-text">{log.userAgent}</span>
                </div>
              )}
            </div>
          </section>

          {/* Action Details Section */}
          <section className="audit-section">
            <h3>Action Details</h3>
            <div className="audit-info-grid">
              <div className="audit-info-item full-width">
                <label>Action:</label>
                <span>{log.details.action}</span>
              </div>
              {log.details.resource && (
                <div className="audit-info-item">
                  <label>Resource:</label>
                  <span>{log.details.resource}</span>
                </div>
              )}
              {log.details.resourceId && (
                <div className="audit-info-item">
                  <label>Resource ID:</label>
                  <span className="mono-text">{log.details.resourceId}</span>
                </div>
              )}
              {log.details.error && (
                <div className="audit-info-item full-width">
                  <label>Error:</label>
                  <span className="error-text">{log.details.error}</span>
                </div>
              )}
            </div>
          </section>

          {/* Change Set Section */}
          {(log.details.oldValue !== undefined || log.details.newValue !== undefined) && (
            <section className="audit-section">
              <h3>Change Set</h3>
              <div className="audit-change-set">
                {log.details.oldValue !== undefined && (
                  <div className="change-block">
                    <label>Old Value:</label>
                    <pre className="code-block">
                      {JSON.stringify(log.details.oldValue, null, 2)}
                    </pre>
                  </div>
                )}
                {log.details.newValue !== undefined && (
                  <div className="change-block">
                    <label>New Value:</label>
                    <pre className="code-block">
                      {JSON.stringify(log.details.newValue, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Metadata Section */}
          {log.details.metadata && Object.keys(log.details.metadata).length > 0 && (
            <section className="audit-section">
              <h3>Metadata</h3>
              <pre className="code-block">
                {JSON.stringify(log.details.metadata, null, 2)}
              </pre>
            </section>
          )}

          {/* Log ID Section */}
          <section className="audit-section">
            <h3>Log Record</h3>
            <div className="audit-info-grid">
              <div className="audit-info-item full-width">
                <label>Log ID:</label>
                <span className="mono-text">{log._id}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="audit-modal-footer">
          <button className="audit-btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailModal;
