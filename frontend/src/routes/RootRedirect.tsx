import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Smart Root Redirect component based on authentication and role
 */
export const RootRedirect: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role === 'CUSTOMER') {
    return <Navigate to="/portal" replace />;
  }
  return <Navigate to="/app/dashboard" replace />;
};

