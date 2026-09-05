
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAccessCode } from '@/contexts/AccessCodeContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isAdmin } = useAccessCode();
  const location = useLocation();
  
  if (!isAuthenticated) {
    // We need to check if we're in a router context
    return <Navigate to="/access" replace state={{ from: location }} />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
