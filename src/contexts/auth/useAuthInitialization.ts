
import { useEffect } from "react";
import { useUserInfo } from "./useUserInfo";
import { 
  getStoredTokens,
  getValidAccessToken
} from "@/services/google";
import { EnhancedDriveService } from "@/services/drive";
import { GmailService } from "@/services/gmail";
import { SheetsService } from "@/services/SheetsService";
import { GoogleServiceStatus } from "@/types";

type AuthInitializationProps = {
  setIsAuthenticated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setUser: (user: any) => void;
  setServiceStatus: (status: GoogleServiceStatus) => void;
};

export const useAuthInitialization = ({
  setIsAuthenticated,
  setIsLoading,
  setUser,
  setServiceStatus
}: AuthInitializationProps) => {
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
  }, [setIsAuthenticated, setIsLoading, setUser, setServiceStatus, extractUserInfo]);
};
