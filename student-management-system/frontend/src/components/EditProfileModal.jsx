import { useState, useEffect } from 'react';

export default function EditProfileModal({ isOpen, onClose, profile, onSave }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || profile.username || '');
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a valid display name.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave(name.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modern-popup-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-icon-badge">✏️</span>
            <div>
              <h3>Edit Profile Information</h3>
              <p className="modal-subtitle">Update your personal display details</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="modal-error-alert">
            <span>⚠️</span> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="modal-profile-name">Full Name (Display Name) *</label>
            <input
              id="modal-profile-name"
              type="text"
              required
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {profile?.email && (
            <div className="form-group">
              <label>Registered Institutional Email</label>
              <input type="text" value={profile.email} disabled className="read-only-input" />
              <small className="field-hint">Email is locked to institutional records.</small>
            </div>
          )}

          {profile?.department && (
            <div className="form-group">
              <label>Academic Department</label>
              <input type="text" value={profile.department} disabled className="read-only-input" />
            </div>
          )}

          {profile?.year && (
            <div className="form-group">
              <label>Academic Year</label>
              <input type="text" value={`Year ${profile.year}`} disabled className="read-only-input" />
            </div>
          )}

          <div className="modal-button-row">
            <button type="button" className="cancel-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
