import React, { useState } from 'react';
import '../styles/Modal.css';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { reason?: string; customPassword?: string }) => Promise<{ password: string }>;
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
  const [passwordOption, setPasswordOption] = useState<'generate' | 'custom'>('generate');
  const [customPassword, setCustomPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verify email matches
    if (confirmEmail !== userEmail) {
      setError('Email does not match. Please type the exact email address.');
      return;
    }

    // Validate custom password if selected
    if (passwordOption === 'custom') {
      const passwordError = validatePassword(customPassword);
      if (passwordError) {
        setError(passwordError);
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await onConfirm({
        reason: reason || undefined,
        customPassword: passwordOption === 'custom' ? customPassword : undefined
      });
      
      // Show the password to admin
      setGeneratedPassword(response.password);
      setCopySuccess(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDone = () => {
    // Reset form
    setConfirmEmail('');
    setReason('');
    setCustomPassword('');
    setPasswordOption('generate');
    setGeneratedPassword('');
    setError('');
    setCopySuccess(false);
    onClose();
  };

  const handleClose = () => {
    if (!isLoading && !generatedPassword) {
      setConfirmEmail('');
      setReason('');
      setCustomPassword('');
      setPasswordOption('generate');
      setError('');
      onClose();
    }
  };

  // If password has been generated/set, show success view
  if (generatedPassword) {
    return (
      <div className="password-modal-overlay" onClick={(e) => e.stopPropagation()}>
        <div className="password-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="password-modal-header">
            <h2>Password Reset Successful</h2>
            <button
              className="password-modal-close"
              onClick={handleDone}
            >
              ×
            </button>
          </div>

          <div className="password-success-content">
            <div className="password-info-box">
              <div className="info-icon">✅</div>
              <div className="info-content">
                <h3>New Password for {userName}</h3>
                <p>
                  The password has been reset successfully. Make sure to save this password as it will not be shown again.
                </p>
              </div>
            </div>

            <div className="password-display-box">
              <label>New Password:</label>
              <div className="password-display-field">
                <code className="password-display-text">{generatedPassword}</code>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="password-copy-btn"
                  title="Copy to clipboard"
                >
                  {copySuccess ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <small>User can log in with this password immediately. Password has been emailed to <strong>{userEmail}</strong></small>
            </div>

            <div className="password-form-actions">
              <button
                type="button"
                onClick={handleDone}
                className="password-btn-danger"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal form view
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
                This action will reset the password for <strong>{userName}</strong>.
              </p>
              <ul>
                <li>The user's current password will be invalidated immediately</li>
                <li>The new password will be sent to <strong>{userEmail}</strong></li>
                <li>You will be able to see and copy the new password</li>
                <li>This action will be logged in the audit trail</li>
              </ul>
            </div>
          </div>

          <div className="password-form-group">
            <label>Password Option *</label>
            <div className="password-option-group">
              <label className="password-option-label">
                <input
                  type="radio"
                  name="passwordOption"
                  value="generate"
                  checked={passwordOption === 'generate'}
                  onChange={(e) => setPasswordOption(e.target.value as 'generate' | 'custom')}
                  disabled={isLoading}
                />
                <span>Generate Random Password</span>
              </label>
              <label className="password-option-label">
                <input
                  type="radio"
                  name="passwordOption"
                  value="custom"
                  checked={passwordOption === 'custom'}
                  onChange={(e) => setPasswordOption(e.target.value as 'generate' | 'custom')}
                  disabled={isLoading}
                />
                <span>Set Custom Password</span>
              </label>
            </div>
          </div>

          {passwordOption === 'custom' && (
            <div className="password-form-group">
              <label>Custom Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="Enter custom password"
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-btn"
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <small>
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </small>
            </div>
          )}

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
              disabled={isLoading || confirmEmail !== userEmail || (passwordOption === 'custom' && !customPassword)}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
