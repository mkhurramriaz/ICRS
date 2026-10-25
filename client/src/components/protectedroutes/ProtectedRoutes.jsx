import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userRole = (user?.role || '').toUpperCase();
      const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

      if (!userRole || !normalizedAllowed.includes(userRole)) {
        return <Navigate to="/" replace />;
      }
    } catch (e) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
