
import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getGoogleAuthUrl } from "@/services/google";
import { useToast } from "@/hooks/use-toast";
import { GOOGLE_REDIRECT_URI } from "@/env";

export function useLoginHandler() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();
  
  const logStep = useCallback((step: string) => {
    console.log(`Login: ${step}`);
    return step;
  }, []);

  const handleSignIn = useCallback(() => {
    // Only proceed if we're not coming from the oauth callback
    if (location.pathname === "/oauth2callback") {
      logStep("Preventing sign-in redirect loop from OAuth callback");
      toast({
        variant: "destructive",
        title: "Προσοχή",
        description: "Αποτροπή βρόχου ανακατεύθυνσης. Παρακαλώ περιμένετε."
      });
      return;
    }
    
    setIsLoading(true);
    logStep(`Sign in button clicked at ${new Date().toISOString()}`);
    setAuthError(null);
    
    try {
      logStep("Initiating Google sign-in flow...");
      logStep(`Browser user agent: ${navigator.userAgent}`);
      
      // Get the Google Auth URL
      const authUrl = getGoogleAuthUrl();
      logStep("Generated auth URL, preparing to redirect...");
      logStep(`Redirect URI being used: ${GOOGLE_REDIRECT_URI}`);
      
      // Add a short delay before redirecting to ensure logs are visible
      // and to avoid potential rapid navigation issues
      setTimeout(() => {
        try {
          logStep(`Redirecting to Google at ${new Date().toISOString()}`);
          window.location.href = authUrl;
        } catch (redirectError) {
          const errorMessage = redirectError instanceof Error 
            ? redirectError.message 
            : String(redirectError);
            
          logStep(`Error during redirect: ${errorMessage}`);
          setAuthError(`Redirect error: ${errorMessage}`);
          setIsLoading(false);
          
          toast({
            variant: "destructive",
            title: "Σφάλμα",
            description: "Προέκυψε σφάλμα κατά την ανακατεύθυνση. Παρακαλώ δοκιμάστε ξανά."
          });
        }
      }, 1000);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      logStep(`Error generating Google auth URL: ${errorMessage}`);
      setAuthError(`URL generation error: ${errorMessage}`);
      setIsLoading(false);
      
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Προέκυψε σφάλμα κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά."
      });
    }
  }, [location.pathname, toast, logStep]);
  
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
