import React, { useState } from 'react';
import '../styles/Modal.css';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  userName: string;
  userEmail: string;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userEmail
}) => {
  const [confirmEmail, setConfirmEmail] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verify email matches
    if (confirmEmail !== userEmail) {
      setError('Email does not match. Please type the exact email address.');
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(reason || undefined);
      // Reset form
      setConfirmEmail('');
      setReason('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setConfirmEmail('');
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="password-modal-overlay" onClick={handleClose}>
      <div className="password-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="password-modal-header">
          <h2>Reset User Password</h2>
          <button
            className="password-modal-close"
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="password-reset-form">
          <div className="password-warning-box">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <h3>Security Warning</h3>
              <p>
                This action will generate a new temporary password for <strong>{userName}</strong> and email it to them.
              </p>
              <ul>
                <li>The user's current password will be invalidated immediately</li>
                <li>A temporary password will be sent to <strong>{userEmail}</strong></li>
                <li>The user must change the password on their next login</li>
                <li>This action will be logged in the audit trail</li>
              </ul>
            </div>
          </div>

          <div className="password-form-group">
            <label>Reason for Password Reset (Optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., User forgot password, security concern, etc."
              rows={3}
              disabled={isLoading}
              className="reason-textarea"
            />
            <small>This reason will be included in the audit log and notification to the user</small>
          </div>

          <div className="password-form-group">
            <label>Confirm by Typing User's Email *</label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={userEmail}
              required
              disabled={isLoading}
              autoComplete="off"
            />
            <small>Type <strong>{userEmail}</strong> to confirm</small>
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
              className="password-btn-danger"
              disabled={isLoading || confirmEmail !== userEmail}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password & Send Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
