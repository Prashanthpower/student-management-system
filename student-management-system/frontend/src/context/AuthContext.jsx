import { createContext, useContext, useEffect, useState } from 'react';
import { api, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const profile = await api.getMe();
        const updatedUser = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          role: profile.role,
          studentId: profile.studentId,
          studentName: profile.studentName,
          department: profile.department,
          year: profile.year,
        };
        setUser(updatedUser);
        setStoredUser(updatedUser);
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, []);

  async function login(username, password) {
    const data = await api.login({ username, password });
    const authUser = {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role,
      studentId: data.studentId,
      studentName: data.studentName,
    };

    setToken(data.token);
    setUser(authUser);
    setStoredToken(data.token);
    setStoredUser(authUser);
    return authUser;
  }

  function logout() {
    setUser(null);
    setToken(null);
    setStoredToken(null);
    setStoredUser(null);
    try {
      if (window.location.hash) {
        window.location.hash = '';
      }
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      window.location.hash = '';
    }
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ROLE_ADMIN',
    isStudent: user?.role === 'ROLE_STUDENT',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
