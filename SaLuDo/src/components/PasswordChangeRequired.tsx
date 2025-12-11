import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../utils/api';
import '../styles/Modal.css';

const PasswordChangeRequired: React.FC = () => {
  const { mustChangePassword, accessToken, clearMustChangePassword, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  if (!mustChangePassword) return null;

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

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    // Validate not same as current
    if (currentPassword === newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await usersApi.changePassword(
        accessToken!,
        currentPassword,
        newPassword
      );

      if (response.success) {
        clearMustChangePassword();
        // Reset form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        alert('Password changed successfully! You can now access the system.');
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="password-modal-overlay" style={{ zIndex: 9999 }}>
      <div className="password-modal-content">
        <div className="password-modal-header">
          <h2>Password Change Required</h2>
        </div>

        <form onSubmit={handleSubmit} className="password-reset-form">
          <div className="password-warning-box">
            <div className="warning-icon">🔒</div>
            <div className="warning-content">
              <h3>Action Required</h3>
              <p>
                You must change your password before continuing. This requirement was set by an administrator for security purposes.
              </p>
              <p style={{ marginBottom: 0, fontSize: '12px', fontStyle: 'italic' }}>
                You cannot access the system until you set a new password.
              </p>
            </div>
          </div>

          <div className="password-form-group">
            <label>Current/Temporary Password *</label>
            <input
              type={showPasswords ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current or temporary password"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <div className="password-form-group">
            <label>New Password *</label>
            <input
              type={showPasswords ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            <small>
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </small>
          </div>

          <div className="password-form-group">
            <label>Confirm New Password *</label>
            <input
              type={showPasswords ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <div className="password-form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
                disabled={isLoading}
              />
              Show passwords
            </label>
          </div>

          {error && (
            <div className="password-error-message">
              {error}
            </div>
          )}

          <div className="password-form-actions">
            <button
              type="button"
              onClick={handleLogout}
              className="password-btn-cancel"
              disabled={isLoading}
            >
              Logout Instead
            </button>
            <button
              type="submit"
              className="password-btn-warning"
              disabled={isLoading}
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeRequired;
