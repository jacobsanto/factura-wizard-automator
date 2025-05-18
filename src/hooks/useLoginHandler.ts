
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { getGoogleAuthUrl } from "@/services/google";
import { useToast } from "@/hooks/use-toast";
import { GOOGLE_REDIRECT_URI } from "@/env";

export function useLoginHandler() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();
  
  const handleSignIn = () => {
    // Only proceed if we're not coming from the oauth callback
    if (location.pathname === "/oauth2callback") {
      console.log("Login: Preventing sign-in redirect loop from OAuth callback");
      toast({
        variant: "destructive",
        title: "Προσοχή",
        description: "Αποτροπή βρόχου ανακατεύθυνσης. Παρακαλώ περιμένετε."
      });
      return;
    }
    
    setIsLoading(true);
    console.log("Sign in button clicked at", new Date().toISOString());
    setAuthError(null);
    
    try {
      console.log("Login: Initiating Google sign-in flow...");
      console.log("Login: Browser user agent:", navigator.userAgent);
      
      // Get the Google Auth URL
      const authUrl = getGoogleAuthUrl();
      console.log("Login: Generated auth URL, preparing to redirect...");
      console.log("Login: Redirect URI being used:", GOOGLE_REDIRECT_URI);
      
      // Add a short delay before redirecting to ensure logs are visible
      // and to avoid potential rapid navigation issues
      setTimeout(() => {
        try {
          console.log("Login: Redirecting to Google at", new Date().toISOString());
          window.location.href = authUrl;
        } catch (redirectError) {
          console.error("Login: Error during redirect:", redirectError);
          setAuthError(`Redirect error: ${redirectError instanceof Error ? redirectError.message : String(redirectError)}`);
          setIsLoading(false);
          toast({
            variant: "destructive",
            title: "Σφάλμα",
            description: "Προέκυψε σφάλμα κατά την ανακατεύθυνση. Παρακαλώ δοκιμάστε ξανά."
          });
        }
      }, 1000);
    } catch (error) {
      console.error("Login: Error generating Google auth URL:", error);
      setAuthError(`URL generation error: ${error instanceof Error ? error.message : String(error)}`);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Προέκυψε σφάλμα κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά."
      });
    }
  };
  
  const testGoogleConnection = () => {
    setAuthError(null);
    const startTime = Date.now();
    console.log("Testing connection to accounts.google.com...");
    
    // Create an image element to test if Google can be reached
    const img = new Image();
    img.onload = () => {
      const duration = Date.now() - startTime;
      console.log(`Connection to Google successful (${duration}ms)`);
      toast({
        title: "Επιτυχής Σύνδεση",
        description: `Η σύνδεση με το Google είναι εφικτή (${duration}ms).`
      });
    };
    
    img.onerror = (error) => {
      const duration = Date.now() - startTime;
      console.error(`Failed to connect to Google (${duration}ms)`, error);
      setAuthError(`Failed to connect to Google after ${duration}ms`);
      toast({
        variant: "destructive",
        title: "Σφάλμα Σύνδεσης",
        description: "Δεν είναι δυνατή η σύνδεση με το accounts.google.com. Ελέγξτε τη σύνδεσή σας στο διαδίκτυο."
      });
    };
    
    // Use a Google favicon to test connection
    img.src = "https://www.google.com/favicon.ico?" + new Date().getTime();
  };

  return {
    isLoading,
    authError,
    handleSignIn,
    testGoogleConnection,
    setAuthError
  };
}
