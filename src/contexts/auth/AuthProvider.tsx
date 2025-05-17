
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuthState } from "./useAuthState";
import { useUserInfo } from "./useUserInfo";
import { AuthContextType } from "./types";
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { 
    isAuthenticated, 
    setIsAuthenticated,
    isLoading, 
    setIsLoading,
    user, 
    setUser,
    serviceStatus, 
    setServiceStatus 
  } = useAuthState();
  
  const { extractUserInfo } = useUserInfo();

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("AuthProvider: Checking authentication status...");
      setIsLoading(true);
      try {
        const tokens = getStoredTokens();
        
        if (!tokens) {
          console.log("AuthProvider: No tokens found in storage");
          setIsLoading(false);
          return;
        }
        
        console.log("AuthProvider: Tokens found, validating access token");
        // Try to get a valid access token
        const accessToken = await getValidAccessToken();
        
        if (accessToken) {
          console.log("AuthProvider: Valid access token obtained");
          // If we have a valid token, initialize services
          setIsAuthenticated(true);
          
          // Check for Google user info from direct API call first
          const storedGoogleUser = localStorage.getItem("google_user");
          if (storedGoogleUser) {
            try {
              const googleUserInfo = JSON.parse(storedGoogleUser);
              console.log("AuthProvider: Using Google API user info", googleUserInfo.email);
              setUser({
                name: googleUserInfo.name || "Google User",
                email: googleUserInfo.email || "user@example.com",
                picture: googleUserInfo.picture || "https://via.placeholder.com/40",
                sub: googleUserInfo.id || ""
              });
            } catch (error) {
              console.error("AuthProvider: Error parsing stored Google user info:", error);
              // Fall back to ID token or default user
            }
          } 
          // If no Google API user info, try with ID token
          else if (tokens.id_token) {
            const userInfo = extractUserInfo(tokens.id_token);
            if (userInfo) {
              console.log("AuthProvider: User info extracted from ID token", userInfo.email);
              setUser(userInfo);
            }
          } else {
            // Fallback for backward compatibility
            console.log("AuthProvider: No ID token found, using fallback user info");
            setUser({
              name: "Google User",
              email: "user@example.com",
              picture: "https://via.placeholder.com/40"
            });
          }
          
          // Initialize services
          console.log("AuthProvider: Initializing services");
          const driveService = EnhancedDriveService.getInstance();
          const gmailService = GmailService.getInstance();
          const sheetsService = SheetsService.getInstance();
          
          const driveStatus = await driveService.initialize();
          const gmailStatus = await gmailService.initialize();
          const sheetsStatus = await sheetsService.initialize();
          
          console.log("AuthProvider: Service status", { drive: driveStatus, gmail: gmailStatus, sheets: sheetsStatus });
          
          setServiceStatus({
            drive: driveStatus,
            gmail: gmailStatus,
            sheets: sheetsStatus
          });
        } else {
          console.log("AuthProvider: Could not obtain valid access token");
        }
      } catch (error) {
        console.error("AuthProvider: Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const signIn = async () => {
    console.log("AuthProvider: Initiating sign in process");
    // Redirect to Google Auth
    window.location.href = getGoogleAuthUrl();
  };

  const signOut = async () => {
    console.log("AuthProvider: Signing out user");
    setIsLoading(true);
    try {
      // Clear tokens
      clearTokens();
      
      // Clear Google user info
      localStorage.removeItem("google_user");
      
      // Reset state
      setIsAuthenticated(false);
      setUser(null);
      setServiceStatus({
        gmail: false,
        drive: false,
        sheets: false,
      });
      console.log("AuthProvider: User signed out successfully");
    } catch (error) {
      console.error("AuthProvider: Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    if (!isAuthenticated) {
      console.log("AuthProvider: Cannot refresh token, user not authenticated");
      return;
    }
    
    console.log("AuthProvider: Refreshing token");
    setIsLoading(true);
    try {
      const tokens = getStoredTokens();
      if (!tokens || !tokens.refresh_token) {
        console.error("AuthProvider: No refresh token available");
        throw new Error("No refresh token available");
      }
      
      // Refresh the token
      console.log("AuthProvider: Attempting to refresh token");
      await refreshAccessToken(tokens.refresh_token);
      
      // Re-initialize services
      console.log("AuthProvider: Reinitializing services after token refresh");
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
      console.log("AuthProvider: Token refreshed and services reinitialized successfully");
    } catch (error) {
      console.error("AuthProvider: Error refreshing token:", error);
      
      // If refreshing fails, sign out
      console.log("AuthProvider: Token refresh failed, signing out user");
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
