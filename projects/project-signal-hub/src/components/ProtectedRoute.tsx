
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/authStore";
import { useEmployeeStore } from "@/lib/employeeStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { fetchEmployees } = useEmployeeStore();
  const location = useLocation();
  
  // Ensure employees are loaded for proper authentication
  useEffect(() => {
    if (!isAuthenticated) {
      fetchEmployees();
    }
  }, [isAuthenticated, fetchEmployees]);
  
  if (!isAuthenticated) {
    // Redirect to login page with location information
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (adminOnly && !isAdmin) {
    // Redirect to home page if admin only but user is not admin
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}
