
import { useState, useEffect } from "react";
import { getValidAccessToken, checkAndFixAuthState, forceResetAuthState } from "@/services/google";
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
        checkAndFixAuthState();
        
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
  }, []);
  
  const handleSignOut = async () => {
    try {
      forceResetAuthState();
      setIsAuthenticated(false);
      toast({
        title: "Αποσύνδεση",
        description: "Αποσυνδεθήκατε από το Google Drive",
      });
    } catch (error) {
      console.error("Error signing out from Drive:", error);
      setAuthError("Σφάλμα κατά την αποσύνδεση από το Google Drive");
    }
  };
  
  const handleForcedRefresh = async () => {
    try {
      forceResetAuthState();
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
