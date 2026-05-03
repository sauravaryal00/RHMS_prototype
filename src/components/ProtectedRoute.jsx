import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Pass the message via router state - much more stable
    return <Navigate to="/login" state={{ from: location, message: 'Access Denied: Please login to enter the Secure Zone.' }} replace />;
  }

  return children;
};

export default ProtectedRoute;
