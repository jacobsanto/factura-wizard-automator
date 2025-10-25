
import React from "react";
import { Navigate } from "react-router-dom";
import Login from "@/components/Login";
import { useDevMode } from "@/contexts/DevModeContext";
import useDriveAuth from "@/hooks/useDriveAuth";

const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useDriveAuth();
  const { isDevMode } = useDevMode();

  // If already authenticated or in dev mode, redirect to dashboard
  if (!isLoading && (isAuthenticated || isDevMode)) {
    return <Navigate to="/" replace />;
  }

  return <Login />;
};

export default LoginPage;
