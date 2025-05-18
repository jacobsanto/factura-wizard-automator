import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getGoogleAuthUrl, checkAndFixAuthState, forceResetAuthState } from "@/services/google";
import { useToast } from "@/hooks/use-toast";
import { GOOGLE_REDIRECT_URI } from "@/env";
import { useLocation } from "react-router-dom";

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const location = useLocation();
  const {
    toast
  } = useToast();

  // Check URL for debug parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
      setShowDebug(true);
    }

    // Add a click counter for the logo to enable debug mode
    let clickCount = 0;
    const logoElement = document.querySelector('.logo-debug-trigger');
    if (logoElement) {
      logoElement.addEventListener('click', () => {
        clickCount++;
        if (clickCount >= 5) {
          setShowDebug(true);
          toast({
            title: "Debug Mode",
            description: "Debug mode enabled. Technical information is now visible."
          });
        }
      });
    }
  }, [toast]);

  // Fix any broken auth state on component mount
  useEffect(() => {
    const cleanupLocalStorage = () => {
      try {
        checkAndFixAuthState();
      } catch (error) {
        console.error("Login: Error cleaning up local storage:", error);
      }
    };
    cleanupLocalStorage();

    // Log OAuth configuration on component mount to help with debugging
    console.log("Login component mounted");
    console.log("- Current origin:", window.location.origin);
    console.log("- Current pathname:", window.location.pathname);
    console.log("- Configured redirect URI:", GOOGLE_REDIRECT_URI);
  }, []);

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

  const handleClearLocalStorage = () => {
    try {
      localStorage.clear();
      toast({
        title: "Επιτυχής Καθαρισμός",
        description: "Όλα τα τοπικά δεδομένα διαγράφηκαν επιτυχώς."
      });
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Προέκυψε σφάλμα κατά τον καθαρισμό των δεδομένων."
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

  return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <img alt="Arivia Group Logo" src="/lovable-uploads/9e419dda-f61f-41e7-ac02-301a7ae32f6f.png" className="logo-debug-trigger h-8 w-auto mb-4 cursor-pointer object-fill" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Αυτοματισμός Παραστατικών
          </CardTitle>
          <CardDescription className="text-gray-500">
            Συνδεθείτε με τον λογαριασμό Google Workspace για να συνεχίσετε
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">
              Το εργαλείο αυτό χρειάζεται πρόσβαση στο Gmail, Google Drive και Google Sheets για να λειτουργήσει.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button onClick={handleSignIn} disabled={isLoading} className="w-full bg-brand-blue hover:bg-blue-700">
            {isLoading ? <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Σύνδεση...</span>
              </div> : <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                </svg>
                <span>Σύνδεση με Google</span>
              </div>}
          </Button>
          
          {/* Show connection test button */}
          <Button 
            onClick={testGoogleConnection} 
            variant="outline" 
            className="w-full text-sm"
            disabled={isLoading}
          >
            Έλεγχος σύνδεσης με Google
          </Button>
          
          {/* Error message display */}
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              <p className="font-medium mb-1">Σφάλμα σύνδεσης:</p>
              <p>{authError}</p>
            </div>
          )}
          
          {/* Debug info and tools */}
          {showDebug && <div className="w-full mt-4 p-3 bg-gray-100 rounded text-xs border border-gray-300">
              <h5 className="font-bold mb-2 text-center text-gray-700">Debug Information</h5>
              <div className="space-y-2">
                <p><strong>Redirect URI:</strong> {GOOGLE_REDIRECT_URI}</p>
                <p><strong>Current Origin:</strong> {window.location.origin}</p>
                <p><strong>Current Path:</strong> {window.location.pathname}</p>
                <p><strong>Has Tokens:</strong> {localStorage.getItem("google_tokens") ? "Yes" : "No"}</p>
                <p><strong>Has User:</strong> {localStorage.getItem("google_user") ? "Yes" : "No"}</p>
                <p><strong>Browser:</strong> {navigator.userAgent}</p>
                <button onClick={handleClearLocalStorage} className="w-full mt-2 bg-red-100 text-red-700 hover:bg-red-200 py-1 rounded border border-red-300 text-sm">
                  Clear All Local Storage
                </button>
                <div className="text-center mt-2">
                  <a href="/?debug" className="text-blue-600 hover:underline">Reload with debug mode</a>
                </div>
              </div>
            </div>}
        </CardFooter>
      </Card>
    </div>;
};
export default Login;
