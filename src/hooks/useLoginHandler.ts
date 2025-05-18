
import { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/contexts/supabase/SupabaseAuthContext";

export function useLoginHandler() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();
  const { signInWithGoogle } = useSupabaseAuth();
  
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
      logStep("Initiating Google sign-in flow with Supabase...");
      signInWithGoogle().finally(() => setIsLoading(false));
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
        
      logStep(`Error during sign-in: ${errorMessage}`);
      setAuthError(`Sign-in error: ${errorMessage}`);
      setIsLoading(false);
      
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Προέκυψε σφάλμα κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά."
      });
    }
  }, [location.pathname, toast, logStep, signInWithGoogle]);
  
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
