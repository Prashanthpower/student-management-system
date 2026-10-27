import { useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import NotificationBanner from '../../components/NotificationBanner';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import EditProfileModal from '../../components/EditProfileModal';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [showPassModal, setShowPassModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSaveProfile(newName) {
    if (user?.role === 'ROLE_STUDENT') {
      await api.updateStudentProfile({ name: newName });
    }
    setSuccess('Profile display name updated successfully.');
  }

  return (
    <div className="module-container">
      <NotificationBanner
        error={error}
        success={success}
        onClearError={() => setError('')}
        onClearSuccess={() => setSuccess('')}
      />

      <div className="profile-center-layout">
        <section className="table-card modern-profile-card">
          <div className="profile-card-top-banner">
            <div className="profile-card-avatar">
              {(user?.studentName || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="profile-card-body">
            <div className="profile-card-identity">
              <h2>{user?.studentName || user?.username}</h2>
              <span className={`role-pill ${user?.role === 'ROLE_ADMIN' ? 'role-admin' : 'role-student'}`}>
                {user?.role === 'ROLE_ADMIN' ? '🛡️ Administrator' : '🎓 Enrolled Student'}
              </span>
            </div>

            <div className="profile-detail-grid single-col-gap">
              <div className="detail-item">
                <span className="detail-label">System Username</span>
                <span className="detail-value"><strong>{user?.username}</strong></span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Institutional Email</span>
                <span className="detail-value">{user?.email || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Account Status</span>
                <span className="detail-value">
                  <span className="status-badge badge-present">Active &amp; Verified</span>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Security Protocol</span>
                <span className="detail-value">Spring Security 7 + BCrypt Encrypted</span>
              </div>
            </div>

            {/* Clean action buttons instead of open form clutter */}
            <div className="profile-action-buttons">
              {user?.role === 'ROLE_STUDENT' && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowEditModal(true)}
                >
                  ✏️ Edit Profile
                </button>
              )}
              <button
                type="button"
                className="primary-button"
                onClick={() => setShowPassModal(true)}
              >
                🔒 Change Password
              </button>
            </div>

            {/* Logout session button inside My Account tab */}
            <div className="profile-logout-section">
              <div className="profile-logout-info">
                <h4>Account Session</h4>
                <p>Securely end your console session on this device</p>
              </div>
              <button
                type="button"
                className="logout-action-btn"
                onClick={logout}
                title="Sign Out"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </section>
      </div>

      <ChangePasswordModal
        isOpen={showPassModal}
        onClose={() => setShowPassModal(false)}
        onSuccess={(msg) => setSuccess(msg)}
      />

      {user?.role === 'ROLE_STUDENT' && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={{ name: user?.studentName, email: user?.email }}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
