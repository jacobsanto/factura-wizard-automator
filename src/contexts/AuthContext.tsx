
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GoogleServiceStatus } from "@/types";
import { 
  getGoogleAuthUrl, 
  getStoredTokens, 
  clearTokens, 
  getValidAccessToken,
  refreshAccessToken
} from "@/services/google";
import { EnhancedDriveService } from "@/services/drive";
import { GmailService } from "@/services/GmailService";
import { SheetsService } from "@/services/SheetsService";
import jwt_decode from "jwt-decode";

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

interface GoogleUserInfo {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [serviceStatus, setServiceStatus] = useState<GoogleServiceStatus>({
    gmail: false,
    drive: false,
    sheets: false,
  });

  // Extract user information from ID token
  const extractUserInfo = (idToken: string): GoogleUserInfo | null => {
    try {
      const decoded = jwt_decode(idToken) as any;
      return {
        name: decoded.name || "Google User",
        email: decoded.email || "",
        picture: decoded.picture || "",
        sub: decoded.sub || ""
      };
    } catch (error) {
      console.error("Error decoding ID token:", error);
      return null;
    }
  };

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const tokens = getStoredTokens();
        
        if (!tokens) {
          setIsLoading(false);
          return;
        }
        
        // Try to get a valid access token
        const accessToken = await getValidAccessToken();
        
        if (accessToken) {
          // If we have a valid token, initialize services
          setIsAuthenticated(true);
          
          // Extract user info from ID token if available
          if (tokens.id_token) {
            const userInfo = extractUserInfo(tokens.id_token);
            if (userInfo) {
              setUser(userInfo);
            }
          } else {
            // Fallback for backward compatibility
            setUser({
              name: "Google User",
              email: "user@example.com",
              picture: "https://via.placeholder.com/40"
            });
          }
          
          // Initialize services
          const driveService = EnhancedDriveService.getInstance();
          const gmailService = GmailService.getInstance();
          const sheetsService = SheetsService.getInstance();
          
          const driveStatus = await driveService.initialize();
          const gmailStatus = await gmailService.initialize();
          const sheetsStatus = await sheetsService.initialize();
          
          setServiceStatus({
            drive: driveStatus,
            gmail: gmailStatus,
            sheets: sheetsStatus
          });
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const signIn = async () => {
    // Redirect to Google Auth
    window.location.href = getGoogleAuthUrl();
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      // Clear tokens
      clearTokens();
      
      // Reset state
      setIsAuthenticated(false);
      setUser(null);
      setServiceStatus({
        gmail: false,
        drive: false,
        sheets: false,
      });
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const tokens = getStoredTokens();
      if (!tokens || !tokens.refresh_token) {
        throw new Error("No refresh token available");
      }
      
      // Refresh the token
      await refreshAccessToken(tokens.refresh_token);
      
      // Re-initialize services
      const driveService = EnhancedDriveService.getInstance();
      const gmailService = GmailService.getInstance();
      const sheetsService = SheetsService.getInstance();
      
      const driveStatus = await driveService.initialize();
      const gmailStatus = await gmailService.initialize();
      const sheetsStatus = await sheetsService.initialize();
      
      setServiceStatus({
        drive: driveStatus,
        gmail: gmailStatus,
        sheets: sheetsStatus
      });
    } catch (error) {
      console.error("Error refreshing token:", error);
      
      // If refreshing fails, sign out
      await signOut();
    } finally {
      setIsLoading(false);
    }
  };

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
