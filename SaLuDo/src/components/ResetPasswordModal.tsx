import React, { useState } from 'react';
import { validatePassword, getPasswordStrength, type PasswordValidationResult } from '../utils/passwordValidator';
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
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidationResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const handlePasswordChange = (value: string) => {
    setCustomPassword(value);
    if (value) {
      setPasswordValidation(validatePassword(value));
    } else {
      setPasswordValidation(null);
    }
  };

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 40) return '#ef4444'; // red
    if (strength < 70) return '#f59e0b'; // orange
    return '#10b981'; // green
  };

  const getPasswordStrengthLabel = (strength: number): string => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
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
      const validation = validatePassword(customPassword);
      if (!validation.isValid) {
        setError(validation.messages[0] || 'Password does not meet requirements');
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
    setPasswordValidation(null);
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
      setPasswordValidation(null);
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
                  onChange={(e) => handlePasswordChange(e.target.value)}
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

              {/* Password Strength Meter */}
              {customPassword && passwordValidation && (
                <div className="password-strength-container" style={{ marginTop: '8px' }}>
                  <div className="password-strength-bar-wrapper" style={{ 
                    width: '100%', 
                    height: '6px', 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      className="password-strength-bar" 
                      style={{
                        width: `${getPasswordStrength(customPassword)}%`,
                        height: '100%',
                        backgroundColor: getPasswordStrengthColor(getPasswordStrength(customPassword)),
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '4px',
                    fontSize: '12px'
                  }}>
                    <span style={{ 
                      color: getPasswordStrengthColor(getPasswordStrength(customPassword)),
                      fontWeight: 500
                    }}>
                      {getPasswordStrengthLabel(getPasswordStrength(customPassword))}
                    </span>
                    <span style={{ color: '#6b7280' }}>
                      {getPasswordStrength(customPassword)}% strong
                    </span>
                  </div>
                </div>
              )}

              {/* Password Requirements Checklist */}
              {customPassword && passwordValidation && (
                <div className="password-requirements" style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                    Password Requirements:
                  </div>
                  <ul style={{ 
                    listStyle: 'none', 
                    padding: 0, 
                    margin: 0,
                    fontSize: '12px'
                  }}>
                isLoading || 
                confirmEmail !== userEmail || 
                (passwordOption === 'custom' && (!customPassword || !passwordValidation?.isValid))
              
                    <li style={{ 
                      color: passwordValidation.requirements.minLength ? '#10b981' : '#6b7280',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{passwordValidation.requirements.minLength ? '✓' : '○'}</span>
                      At least 8 characters
                    </li>
                    <li style={{ 
                      color: passwordValidation.requirements.hasUpperCase ? '#10b981' : '#6b7280',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{passwordValidation.requirements.hasUpperCase ? '✓' : '○'}</span>
                      One uppercase letter
                    </li>
                    <li style={{ 
                      color: passwordValidation.requirements.hasLowerCase ? '#10b981' : '#6b7280',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{passwordValidation.requirements.hasLowerCase ? '✓' : '○'}</span>
                      One lowercase letter
                    </li>
                    <li style={{ 
                      color: passwordValidation.requirements.hasNumber ? '#10b981' : '#6b7280',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{passwordValidation.requirements.hasNumber ? '✓' : '○'}</span>
                      One number
                    </li>
                    <li style={{ 
                      color: passwordValidation.requirements.hasSpecialChar ? '#10b981' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{passwordValidation.requirements.hasSpecialChar ? '✓' : '○'}</span>
                      One special character
                    </li>
                  </ul>
                </div>
              )}

              {!customPassword && (
                <small>
                  Must be at least 8 characters with uppercase, lowercase, number, and special character
                </small>
              )}
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
