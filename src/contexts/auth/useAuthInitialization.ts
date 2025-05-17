
import { useEffect } from "react";
import { useUserInfo } from "./useUserInfo";
import { 
  getStoredTokens,
  getValidAccessToken,
  checkAndFixAuthState
} from "@/services/google";
import { EnhancedDriveService } from "@/services/drive";
import { GmailService } from "@/services/gmail";
import { SheetsService } from "@/services/SheetsService";
import { GoogleServiceStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("AuthProvider: Checking authentication status...");
      setIsLoading(true);
      try {
        // First, check if auth state is valid or needs fixing
        const isAuthStateValid = checkAndFixAuthState();
        if (!isAuthStateValid) {
          console.log("AuthProvider: Auth state was invalid and has been reset");
          setIsLoading(false);
          return;
        }
        
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
          
          try {
            // Initialize services independently to avoid one failure affecting others
            let driveStatus = false;
            let gmailStatus = false;
            let sheetsStatus = false;
            
            try {
              const driveService = EnhancedDriveService.getInstance();
              driveStatus = await driveService.initialize();
              console.log("AuthProvider: Drive service initialized:", driveStatus);
            } catch (driveError) {
              console.error("AuthProvider: Error initializing Drive service:", driveError);
            }
            
            try {
              const gmailService = GmailService.getInstance();
              gmailStatus = await gmailService.initialize();
              console.log("AuthProvider: Gmail service initialized:", gmailStatus);
            } catch (gmailError) {
              console.error("AuthProvider: Error initializing Gmail service:", gmailError);
            }
            
            try {
              const sheetsService = SheetsService.getInstance();
              sheetsStatus = await sheetsService.initialize();
              console.log("AuthProvider: Sheets service initialized:", sheetsStatus);
            } catch (sheetsError) {
              console.error("AuthProvider: Error initializing Sheets service:", sheetsError);
            }
            
            setServiceStatus({
              drive: driveStatus,
              gmail: gmailStatus,
              sheets: sheetsStatus
            });
            
            // Show a warning if any service failed
            if (!driveStatus || !gmailStatus || !sheetsStatus) {
              toast({
                variant: "warning",
                title: "Προσοχή",
                description: "Ορισμένες υπηρεσίες δεν μπόρεσαν να αρχικοποιηθούν. Η εφαρμογή ενδέχεται να έχει περιορισμένη λειτουργικότητα.",
              });
            }
          } catch (servicesError) {
            console.error("AuthProvider: Error during services initialization:", servicesError);
            // Continue with authenticated state even if services fail
            toast({
              variant: "destructive",
              title: "Σφάλμα",
              description: "Προέκυψε σφάλμα κατά την αρχικοποίηση των υπηρεσιών.",
            });
          }
        } else {
          console.log("AuthProvider: Could not obtain valid access token");
          // Show a toast to inform the user that they need to re-login
          toast({
            variant: "destructive",
            title: "Σφάλμα Πιστοποίησης",
            description: "Η σύνδεσή σας έχει λήξει. Παρακαλώ συνδεθείτε ξανά.",
          });
        }
      } catch (error) {
        console.error("AuthProvider: Error checking authentication:", error);
        toast({
          variant: "destructive",
          title: "Σφάλμα Πιστοποίησης",
          description: "Προέκυψε σφάλμα κατά τον έλεγχο της πιστοποίησης.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [setIsAuthenticated, setIsLoading, setUser, setServiceStatus, extractUserInfo, toast]);
};
