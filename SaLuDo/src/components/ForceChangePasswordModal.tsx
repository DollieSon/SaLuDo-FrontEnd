import React, { useState } from 'react';
import '../styles/Modal.css';

interface ForceChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  userName: string;
  userEmail: string;
}

const ForceChangePasswordModal: React.FC<ForceChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userEmail
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const expectedText = 'FORCE CHANGE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verify confirmation text matches
    if (confirmText !== expectedText) {
      setError(`Please type "${expectedText}" exactly to confirm`);
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(reason || undefined);
      // Reset form
      setConfirmText('');
      setReason('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to force password change');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setConfirmText('');
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="password-modal-overlay" onClick={handleClose}>
      <div className="password-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="password-modal-header">
          <h2>Force Password Change</h2>
          <button
            className="password-modal-close"
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="password-reset-form">
          <div className="password-info-box">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <h3>Password Change Requirement</h3>
              <p>
                This action will require <strong>{userName}</strong> to change their password on their next login.
              </p>
              <ul>
                <li>The user's current password remains valid until they login</li>
                <li>Upon next login, they will be prompted to set a new password</li>
                <li>They cannot access the system until the password is changed</li>
                <li>A notification will be sent to <strong>{userEmail}</strong></li>
                <li>This action will be logged in the audit trail</li>
              </ul>
            </div>
          </div>

          <div className="password-form-group">
            <label>Reason for Requiring Password Change (Optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Security policy compliance, password exposure risk, routine security update, etc."
              rows={3}
              disabled={isLoading}
              className="reason-textarea"
            />
            <small>This reason will be included in the audit log and notification to the user</small>
          </div>

          <div className="password-form-group">
            <label>Type "<strong>{expectedText}</strong>" to Confirm *</label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedText}
              required
              disabled={isLoading}
              autoComplete="off"
            />
            <small>Type exactly: <strong>{expectedText}</strong></small>
          </div>

          {error && (
            <div className="password-error-message">
              {error}
            </div>
          )}

          <div className="password-form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="password-btn-cancel"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="password-btn-warning"
              disabled={isLoading || confirmText !== expectedText}
            >
              {isLoading ? 'Processing...' : 'Force Password Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForceChangePasswordModal;
