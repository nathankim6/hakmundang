import React from "react";
import { Navigate } from "react-router-dom";

const AccessGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hasAccess = localStorage.getItem("pcube_access") === "granted";
  if (!hasAccess) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default AccessGate;
