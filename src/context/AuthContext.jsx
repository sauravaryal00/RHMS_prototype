import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 Hours in milliseconds

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('rhms_user');
    const timestamp = localStorage.getItem('rhms_login_time');
    
    if (saved && timestamp) {
      const isExpired = Date.now() - parseInt(timestamp) > SESSION_DURATION;
      if (!isExpired) return JSON.parse(saved);
      else {
        localStorage.removeItem('rhms_user');
        localStorage.removeItem('rhms_login_time');
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [authMessage, setAuthMessage] = useState('');

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('rhms_user', JSON.stringify(userData));
    localStorage.setItem('rhms_login_time', Date.now().toString());
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.clear();
  };

  // Auto-logout check every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const timestamp = localStorage.getItem('rhms_login_time');
      if (timestamp && Date.now() - parseInt(timestamp) > SESSION_DURATION) {
        logout();
        setAuthMessage('Session expired. Please login again.');
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, authMessage, setAuthMessage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
