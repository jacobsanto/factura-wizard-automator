
import { useState, useEffect } from "react";
import { getValidAccessToken, checkAndFixAuthState, forceResetAuthState, getStoredTokens } from "@/services/google";
import { isDriveReady } from "@/helpers/driveHelpers";
import { useToast } from "@/hooks/use-toast";

export const useDriveAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // First fix potential auth state issues
        await checkAndFixAuthState();
        
        // Check if we have a valid token
        const accessToken = await getValidAccessToken();
        
        // If no access token, user is not authenticated
        if (!accessToken) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // Check if Drive service is ready
        const driveReady = await isDriveReady();
        setIsAuthenticated(driveReady);
        
        if (!driveReady) {
          console.log("Drive authentication status: Not authenticated");
          // Don't show error toast here, just update the state
        } else {
          console.log("Drive authentication status: Authenticated");
        }
      } catch (error) {
        console.error("Error checking Drive authentication:", error);
        setAuthError("Σφάλμα κατά τον έλεγχο της σύνδεσης με το Google Drive");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for token changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'google_tokens') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const handleSignOut = async () => {
    try {
      console.log("Logout: Starting sign-out process...");
      
      // Revoke Google access token if we have one
      const tokens = await getStoredTokens();
      if (tokens?.access_token) {
        try {
          console.log("Logout: Revoking Google access token...");
          await fetch(`https://oauth2.googleapis.com/revoke?token=${tokens.access_token}`, {
            method: 'POST',
            headers: {
              'Content-type': 'application/x-www-form-urlencoded'
            }
          });
          console.log("Logout: Token revoked successfully");
        } catch (revokeError) {
          console.error("Logout: Failed to revoke token:", revokeError);
          // Continue with logout even if revocation fails
        }
      }
      
      // Clear all local storage
      await forceResetAuthState();
      setIsAuthenticated(false);
      
      toast({
        title: "Αποσύνδεση",
        description: "Αποσυνδεθήκατε επιτυχώς",
      });
      
      // Navigate to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      
    } catch (error) {
      console.error("Logout: Error during sign-out:", error);
      setAuthError("Σφάλμα κατά την αποσύνδεση");
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Προέκυψε σφάλμα κατά την αποσύνδεση",
      });
    }
  };
  
  const handleForcedRefresh = async () => {
    try {
      await forceResetAuthState();
      window.location.reload();
    } catch (error) {
      console.error("Error forcing refresh:", error);
    }
  };
  
  return {
    isAuthenticated,
    isLoading,
    authError,
    handleSignOut,
    handleForcedRefresh
  };
};

export default useDriveAuth;
