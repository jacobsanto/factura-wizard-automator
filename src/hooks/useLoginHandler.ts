
import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { requestGoogleToken, waitForGoogleIdentityServices } from "@/services/googleAuth";

export function useLoginHandler() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const logStep = useCallback((step: string) => {
    console.log(`Login: ${step}`);
    return step;
  }, []);

  const handleSignIn = useCallback(async () => {
    setIsLoading(true);
    logStep(`Sign in button clicked at ${new Date().toISOString()}`);
    setAuthError(null);
    
    try {
      logStep("Waiting for Google Identity Services to load...");
      await waitForGoogleIdentityServices();
      
      logStep("Requesting Google access token...");
      const tokens = await requestGoogleToken();
      
      logStep("Access token received successfully");
      console.log("Token expiry:", new Date(tokens.expiry_date || 0).toISOString());
      
      toast({
        title: "Επιτυχής σύνδεση",
        description: "Έχετε συνδεθεί επιτυχώς με το Google."
      });
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/');
      }, 500);
      
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      logStep(`Error during sign-in: ${errorMessage}`);
      setAuthError(`Sign-in error: ${errorMessage}`);
      
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Προέκυψε σφάλμα κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά."
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, logStep, navigate]);
  
  const testGoogleConnection = useCallback(() => {
    setAuthError(null);
    const startTime = Date.now();
    logStep("Testing connection to accounts.google.com...");
    
    // Create an image element to test if Google can be reached
    const img = new Image();
    
    img.onload = () => {
      const duration = Date.now() - startTime;
      logStep(`Connection to Google successful (${duration}ms)`);
      toast({
        title: "Επιτυχής Σύνδεση",
        description: `Η σύνδεση με το Google είναι εφικτή (${duration}ms).`
      });
    };
    
    img.onerror = () => {
      const duration = Date.now() - startTime;
      logStep(`Failed to connect to Google (${duration}ms)`);
      setAuthError(`Failed to connect to Google after ${duration}ms`);
      toast({
        variant: "destructive",
        title: "Σφάλμα Σύνδεσης",
        description: "Δεν είναι δυνατή η σύνδεση με το accounts.google.com. Ελέγξτε τη σύνδεσή σας στο διαδίκτυο."
      });
    };
    
    // Use a Google favicon to test connection
    img.src = `https://www.google.com/favicon.ico?${new Date().getTime()}`;
  }, [toast, logStep]);

  return {
    isLoading,
    authError,
    handleSignIn,
    testGoogleConnection,
    setAuthError
  };
}
