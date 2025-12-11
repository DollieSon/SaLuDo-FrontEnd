import { useState } from "react";
import { AIMetricsEntry, SERVICE_DISPLAY_NAMES, ERROR_CATEGORY_NAMES } from "../../types/aiMetrics";
import { submitFeedback } from "../../utils/aiMetricsApi";
import "../css/AIMetrics.css";

interface AICallDetailsModalProps {
  call: AIMetricsEntry;
  onClose: () => void;
}

const AICallDetailsModal: React.FC<AICallDetailsModalProps> = ({ call, onClose }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (value: number | undefined): string => `$${(value ?? 0).toFixed(6)}`;
  const formatNumber = (value: number | undefined): string => (value ?? 0).toLocaleString();
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await submitFeedback({
        metricsEntryId: call.metricsId,
        rating: rating as 1 | 2 | 3 | 4 | 5,
        serviceType: call.service,
        comments: feedbackText || undefined,
        isAccurate: rating >= 4
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
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
                <span className="detail-label">Prompt Tokens:</span>
                <span className="detail-value">{formatNumber(call.tokenUsage?.promptTokens)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Completion Tokens:</span>
                <span className="detail-value">{formatNumber(call.tokenUsage?.completionTokens)}</span>
              </div>
              {call.tokenUsage?.thoughtsTokens !== undefined && call.tokenUsage.thoughtsTokens > 0 && (
                <div className="detail-item">
                  <span className="detail-label">Thoughts Tokens:</span>
                  <span className="detail-value">{formatNumber(call.tokenUsage.thoughtsTokens)}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-label">Total Tokens:</span>
                <span className="detail-value">{formatNumber(call.tokenUsage?.totalTokens)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Prompt/Completion Ratio:</span>
                <span className="detail-value">
                  {(call.tokenUsage?.totalTokens ?? 0) > 0
                    ? (((call.tokenUsage?.promptTokens ?? 0) / (call.tokenUsage?.totalTokens ?? 1)) * 100).toFixed(1)
                    : 0}
                  % / 
                  {(call.tokenUsage?.totalTokens ?? 0) > 0
                    ? (((call.tokenUsage?.completionTokens ?? 0) / (call.tokenUsage?.totalTokens ?? 1)) * 100).toFixed(1)
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
                <span className="detail-value">{formatCurrency(call.costEstimate?.inputCostUsd)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Output Cost:</span>
                <span className="detail-value">{formatCurrency(call.costEstimate?.outputCostUsd)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Cost:</span>
                <span className="detail-value">{formatCurrency(call.costEstimate?.totalCostUsd)}</span>
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

          {/* Rating Section */}
          <div className="detail-section rating-section">
            <h3>Rate AI Output Quality</h3>
            {!submitted ? (
              <>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${
                        (hoverRating || rating) >= star ? "filled" : ""
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      disabled={submitting}
                    >
                      ★
                    </button>
                  ))}
                  <span className="rating-label">
                    {rating > 0 && (
                      <>
                        {rating === 1 && "Very Poor"}
                        {rating === 2 && "Poor"}
                        {rating === 3 && "Neutral"}
                        {rating === 4 && "Good"}
                        {rating === 5 && "Excellent"}
                      </>
                    )}
                  </span>
                </div>
                <div className="feedback-input">
                  <textarea
                    placeholder="Optional: Share your feedback about this AI output..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    disabled={submitting}
                    rows={3}
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button
                  className="btn-primary"
                  onClick={handleRatingSubmit}
                  disabled={submitting || rating === 0}
                >
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </>
            ) : (
              <div className="success-message">
                ✓ Thank you for your feedback!
              </div>
            )}
          </div>
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
