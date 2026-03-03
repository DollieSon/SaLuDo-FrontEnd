import React from 'react';
import './StatusChangeDialog.css';

interface StatusChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (newStatus: string, reason?: string) => Promise<void>;
  currentStatus: string;
  candidateName: string;
  availableStatuses: Array<{
    value: string;
    label: string;
    color: string;
    requiresReason?: boolean;
  }>;
  loading?: boolean;
}

export const StatusChangeDialog: React.FC<StatusChangeDialogProps> = ({
  isOpen,
  onClose,
  onStatusChange,
  currentStatus,
  candidateName,
  availableStatuses,
  loading = false
}) => {
  const [selectedStatus, setSelectedStatus] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');

  const selectedStatusInfo = availableStatuses.find(s => s.value === selectedStatus);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedStatus('');
      setReason('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedStatus) {
      setError('Please select a status');
      return;
    }

    if (selectedStatusInfo?.requiresReason && !reason.trim()) {
      setError('Please provide a reason for this status change');
      return;
    }

    try {
      await onStatusChange(selectedStatus, reason.trim() || undefined);
      onClose();
    } catch (err) {
      setError('Failed to update status. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="status-dialog-overlay" onClick={onClose}>
      <div className="status-dialog-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="status-dialog-header">
          <div className="status-dialog-icon">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="status-dialog-title-section">
            <h3 className="status-dialog-title">Change Candidate Status</h3>
            <p className="status-dialog-subtitle">
              Update status for <strong>{candidateName}</strong>
            </p>
            <div className="status-dialog-current">
              Current: <span className="status-dialog-badge">{currentStatus}</span>
            </div>
          </div>
          <button className="status-dialog-close" onClick={onClose} disabled={loading}>
            ×
          </button>
        </div>

        {/* Body */}
        <div className="status-dialog-body">
          <label className="status-dialog-label">Select New Status</label>
          <div className="status-dialog-options">
            {availableStatuses
              .filter(status => status.value !== currentStatus)
              .map((status) => (
                <label
                  key={status.value}
                  className={`status-dialog-option ${
                    selectedStatus === status.value ? 'selected' : ''
                  } ${loading ? 'disabled' : ''}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={selectedStatus === status.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    disabled={loading}
                  />
                  <div className="status-dialog-option-content">
                    <div 
                      className="status-dialog-option-indicator" 
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <div className="status-dialog-option-text">
                      <span className="status-dialog-option-label">{status.label}</span>
                      {status.requiresReason && (
                        <span className="status-dialog-option-note">Reason required</span>
                      )}
                    </div>
                    {selectedStatus === status.value && (
                      <div className="status-dialog-option-check">✓</div>
                    )}
                  </div>
                </label>
              ))}
          </div>

          {/* Reason Input - Always show, but only required for certain statuses */}
          {selectedStatus && (
            <div className="status-dialog-reason">
              <label htmlFor="reason" className="status-dialog-label">
                Reason for Change {selectedStatusInfo?.requiresReason && <span className="required">*</span>}
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="status-dialog-textarea"
                placeholder={
                  selectedStatusInfo?.requiresReason
                    ? "Please provide a detailed reason for this status change..."
                    : "Optionally provide a reason for this status change..."
                }
                disabled={loading}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="status-dialog-error">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="status-dialog-footer">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="status-dialog-btn status-dialog-btn-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedStatus}
            className="status-dialog-btn status-dialog-btn-submit"
          >
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
};
