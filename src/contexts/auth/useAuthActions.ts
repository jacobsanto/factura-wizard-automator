
import { 
  getGoogleAuthUrl, 
  clearTokens, 
  refreshAccessToken,
  getStoredTokens
} from "@/services/google";
import { EnhancedDriveService } from "@/services/drive";
import { GmailService } from "@/services/gmail";
import { SheetsService } from "@/services/SheetsService";
import { GoogleServiceStatus } from "@/types";

type AuthActionsProps = {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setUser: (user: any) => void;
  setServiceStatus: (status: GoogleServiceStatus) => void;
};

export const useAuthActions = ({
  isAuthenticated,
  setIsAuthenticated,
  setIsLoading,
  setUser,
  setServiceStatus
}: AuthActionsProps) => {
  
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

  return {
    signIn,
    signOut,
    refreshToken
  };
};
