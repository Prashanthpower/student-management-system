import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  
  function checkIsAdminRoute() {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash.startsWith('#admin/');
  }

  // Detect if URL indicates admin login strictly through URL (e.g. /admin or #admin)
  const [isAdminRoute, setIsAdminRoute] = useState(checkIsAdminRoute);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function handleLocationChange() {
      setIsAdminRoute(checkIsAdminRoute());
      setError('');
      setUsername('');
      setPassword('');
    }

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  function navigateToStudent(e) {
    if (e && e.preventDefault) e.preventDefault();
    try {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      window.location.hash = '';
    }
    setIsAdminRoute(false);
    setError('');
    setUsername('');
    setPassword('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both your login credential and password.');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        setError('Cannot reach backend server. Please verify Spring Boot is running on port 8080.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-card modern-auth-card">
        <div className="login-header">
          <div className={`login-brand-icon ${isAdminRoute ? 'admin-brand' : ''}`}>
            {isAdminRoute ? '🛡️' : '🎓'}
          </div>
          <h2>StudentHub</h2>
          <p className="login-subtitle">
            {isAdminRoute ? 'Administrator Management Console' : 'Student Academic Portal'}
          </p>
        </div>

        {error && (
          <div className="login-error-alert" role="alert">
            <span>⚠️</span> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="auth-username">
              {isAdminRoute ? 'Admin Username' : 'Student Registered Email'}
            </label>
            <input
              id="auth-username"
              type={isAdminRoute ? 'text' : 'email'}
              autoComplete={isAdminRoute ? 'username' : 'email'}
              placeholder={isAdminRoute ? 'Enter admin username' : 'Enter your registered email'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="label-with-action">
              <label htmlFor="auth-password">Password</label>
              <button
                type="button"
                className="toggle-password-link"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-submit-button" disabled={loading}>
            {loading ? 'Verifying...' : (isAdminRoute ? 'Sign in to Console' : 'Sign in to Student Portal')}
          </button>
        </form>

        {isAdminRoute && (
          <div className="auth-switch-footer">
            <a href="/" onClick={navigateToStudent} className="auth-switch-link">
              ← Return to Student Portal Login
            </a>
          </div>
        )}

        <div className="login-footer">
          <span>Protected with Spring Security 7 &amp; JWT</span>
        </div>
      </div>
    </div>
  );
}
