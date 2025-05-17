
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GoogleServiceStatus } from "@/types";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  serviceStatus: GoogleServiceStatus;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [serviceStatus, setServiceStatus] = useState<GoogleServiceStatus>({
    gmail: false,
    drive: false,
    sheets: false,
  });

  // Mock authentication for demo purposes
  const signIn = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would use Google's OAuth flow
      console.log("Starting Google authentication flow...");
      
      // Simulate successful authentication
      setTimeout(() => {
        setUser({
          name: "Demo User",
          email: "demo@example.com",
          picture: "https://via.placeholder.com/40",
        });
        setIsAuthenticated(true);
        setServiceStatus({
          gmail: true,
          drive: true,
          sheets: true,
        });
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Authentication error:", error);
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would revoke tokens and sign out
      setTimeout(() => {
        setUser(null);
        setIsAuthenticated(false);
        setServiceStatus({
          gmail: false,
          drive: false,
          sheets: false,
        });
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error("Sign out error:", error);
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would refresh the OAuth token
      setTimeout(() => {
        setIsLoading(false);
        console.log("Token refreshed");
      }, 500);
    } catch (error) {
      console.error("Token refresh error:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      // In a real implementation, this would check for valid tokens
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    };
    
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      serviceStatus,
      signIn,
      signOut,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
