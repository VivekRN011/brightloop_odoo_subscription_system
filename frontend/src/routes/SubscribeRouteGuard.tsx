import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Route guard that prevents anonymous visitors from accessing subscription workflows
 * without being logged in as an authenticated Customer.
 * If authenticated as Customer, forwards them to the Customer Portal Catalog.
 * If not authenticated, redirects to Login with redirect back to the catalog.
 */
export const SubscribeRouteGuard: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || role !== 'CUSTOMER') {
    const targetUrl = location.search ? `/portal/catalog${location.search}` : '/portal/catalog';
    return <Navigate to={`/login?redirect=${encodeURIComponent(targetUrl)}`} replace />;
  }

  return <Navigate to={`/portal/catalog${location.search}`} replace />;
};

