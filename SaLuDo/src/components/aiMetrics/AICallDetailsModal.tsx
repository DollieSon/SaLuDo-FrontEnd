import { AIMetricsEntry, SERVICE_DISPLAY_NAMES, ERROR_CATEGORY_NAMES } from "../../types/aiMetrics";
import "../css/AIMetrics.css";

interface AICallDetailsModalProps {
  call: AIMetricsEntry;
  onClose: () => void;
}

const AICallDetailsModal: React.FC<AICallDetailsModalProps> = ({ call, onClose }) => {
  const formatCurrency = (value: number): string => `$${value.toFixed(6)}`;
  const formatNumber = (value: number): string => value.toLocaleString();
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>AI Call Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Basic Info */}
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Metrics ID:</span>
                <span className="detail-value">{call.metricsId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Service:</span>
                <span className="detail-value">{SERVICE_DISPLAY_NAMES[call.service]}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Timestamp:</span>
                <span className="detail-value">{formatDate(call.timestamp)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`detail-value ${call.success ? "success" : "error"}`}>
                  {call.success ? "Success" : "Failed"}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="detail-section">
            <h3>Performance</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Latency:</span>
                <span className="detail-value">{call.latencyMs.toFixed(0)}ms</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Retry Count:</span>
                <span className="detail-value">{call.retryCount}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Parse Success:</span>
                <span className={`detail-value ${call.parseSuccess ? "success" : "warning"}`}>
                  {call.parseSuccess ? "Yes" : "No"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fallback Used:</span>
                <span className={`detail-value ${call.fallbackUsed ? "warning" : "success"}`}>
                  {call.fallbackUsed ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Token Usage */}
          <div className="detail-section">
            <h3>Token Usage</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Input Tokens:</span>
                <span className="detail-value">{formatNumber(call.tokenUsage.inputTokens)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Output Tokens:</span>
                <span className="detail-value">{formatNumber(call.tokenUsage.outputTokens)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Tokens:</span>
                <span className="detail-value">{formatNumber(call.tokenUsage.totalTokens)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Input/Output Ratio:</span>
                <span className="detail-value">
                  {call.tokenUsage.totalTokens > 0
                    ? ((call.tokenUsage.inputTokens / call.tokenUsage.totalTokens) * 100).toFixed(1)
                    : 0}
                  % / 
                  {call.tokenUsage.totalTokens > 0
                    ? ((call.tokenUsage.outputTokens / call.tokenUsage.totalTokens) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="detail-section">
            <h3>Cost Breakdown</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Input Cost:</span>
                <span className="detail-value">{formatCurrency(call.costEstimate.inputCostUsd)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Output Cost:</span>
                <span className="detail-value">{formatCurrency(call.costEstimate.outputCostUsd)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Cost:</span>
                <span className="detail-value">{formatCurrency(call.costEstimate.totalCostUsd)}</span>
              </div>
            </div>
          </div>

          {/* Content Length */}
          <div className="detail-section">
            <h3>Content Length</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Input Length:</span>
                <span className="detail-value">{formatNumber(call.inputLength)} chars</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Output Length:</span>
                <span className="detail-value">{formatNumber(call.outputLength)} chars</span>
              </div>
            </div>
          </div>

          {/* Associated Resources */}
          {(call.candidateId || call.jobId || call.userId) && (
            <div className="detail-section">
              <h3>Associated Resources</h3>
              <div className="detail-grid">
                {call.candidateId && (
                  <div className="detail-item">
                    <span className="detail-label">Candidate ID:</span>
                    <span className="detail-value">{call.candidateId}</span>
                  </div>
                )}
                {call.jobId && (
                  <div className="detail-item">
                    <span className="detail-label">Job ID:</span>
                    <span className="detail-value">{call.jobId}</span>
                  </div>
                )}
                {call.userId && (
                  <div className="detail-item">
                    <span className="detail-label">User ID:</span>
                    <span className="detail-value">{call.userId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Details */}
          {!call.success && (call.errorCategory || call.errorMessage) && (
            <div className="detail-section error-section">
              <h3>Error Details</h3>
              <div className="detail-grid">
                {call.errorCategory && (
                  <div className="detail-item">
                    <span className="detail-label">Error Category:</span>
                    <span className="detail-value error">
                      {ERROR_CATEGORY_NAMES[call.errorCategory]}
                    </span>
                  </div>
                )}
                {call.errorMessage && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Error Message:</span>
                    <span className="detail-value error">{call.errorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AICallDetailsModal;
