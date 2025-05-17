
import { useState } from "react";
import { GoogleServiceStatus } from "@/types";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [serviceStatus, setServiceStatus] = useState<GoogleServiceStatus>({
    gmail: false,
    drive: false,
    sheets: false,
  });

  return {
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading,
    user,
    setUser,
    serviceStatus,
    setServiceStatus
  };
}
