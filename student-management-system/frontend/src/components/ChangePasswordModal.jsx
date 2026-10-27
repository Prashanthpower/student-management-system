import { useState } from 'react';
import { api } from '../api/client';

export default function ChangePasswordModal({ isOpen, onClose, onSuccess }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onSuccess) onSuccess('Password updated successfully!');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleCancel}>
      <div className="modal-card modern-popup-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">🔒</span>
            <div>
              <h3>Change Password</h3>
              <p className="modal-subtitle">Enter your current password and choose a secure new password</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={handleCancel}>×</button>
        </div>

        {error && (
          <div className="modal-error-alert">
            <span>⚠️</span> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <div className="label-with-action">
              <label htmlFor="modal-current-password">Current Password *</label>
              <button
                type="button"
                className="toggle-password-link"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="modal-current-password"
              type={showCurrent ? 'text' : 'password'}
              required
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <div className="label-with-action">
              <label htmlFor="modal-new-password">New Password *</label>
              <button
                type="button"
                className="toggle-password-link"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="modal-new-password"
              type={showNew ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-confirm-password">Confirm New Password *</label>
            <input
              id="modal-confirm-password"
              type="password"
              required
              minLength={6}
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="modal-button-row">
            <button type="button" className="cancel-button" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
