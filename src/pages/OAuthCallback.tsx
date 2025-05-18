import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { exchangeCodeForTokens, storeTokens } from "@/services/google";
import { useToast } from "@/hooks/use-toast";
import { GOOGLE_REDIRECT_URI } from "@/env";

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  
  // Add a function to log processing steps with timestamps
  const logStep = (step: string) => {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:MM:SS.sss format
    const logEntry = `${timestamp} - ${step}`;
    console.log(logEntry);
    setProcessingSteps(prev => [...prev, logEntry]);
  };

  const safeNavigate = (path: string, delay: number) => {
    if (location.pathname === "/oauth2callback") {
      logStep(`Safe navigation to ${path} with ${delay}ms delay`);
      setTimeout(() => navigate(path), delay);
    } else {
      logStep(`Navigation skipped - already navigated away from OAuth callback`);
    }
  };
  
  useEffect(() => {
    const processAuthCode = async () => {
      try {
        logStep("OAuth callback page loaded");
        
        // Get the auth code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");
        
        logStep("OAuth callback parameters processed");
        logStep(`- Code exists: ${!!code}`);
        logStep(`- Error: ${error || "none"}`);
        logStep(`- Full URL: ${window.location.href}`);
        logStep(`- Current Origin: ${window.location.origin}`);
        logStep(`- Expected redirect URI: ${GOOGLE_REDIRECT_URI}`);
        
        if (error) {
          logStep(`Authentication error received: ${error}`);
          setStatus("error");
          setErrorDetails(`Error: ${error}`);
          toast({
            title: "Σφάλμα σύνδεσης",
            description: `Η σύνδεση με το Google απέτυχε: ${error}`,
            variant: "destructive",
          });
          
          // If the error is redirect_uri_mismatch, provide more detailed information
          if (error.includes("redirect_uri_mismatch") || urlParams.get("error_description")?.includes("redirect_uri_mismatch")) {
            const detailedError = `Σφάλμα: redirect_uri_mismatch. Η διεύθυνση ανακατεύθυνσης που χρησιμοποιήθηκε (${window.location.origin}/oauth2callback) δεν έχει εγκριθεί στο Google Cloud Console.`;
            setErrorDetails(detailedError);
            logStep(detailedError);
          }
          
          safeNavigate("/", 5000);
          return;
        }
        
        if (!code) {
          logStep("No authentication code received");
          setStatus("error");
          setErrorDetails("No authentication code received");
          toast({
            title: "Σφάλμα σύνδεσης",
            description: "Δεν ελήφθη κωδικός πιστοποίησης.",
            variant: "destructive",
          });
          safeNavigate("/", 3000);
          return;
        }
        
        // Exchange the code for tokens
        logStep("Attempting to exchange code for tokens...");
        const tokens = await exchangeCodeForTokens(code);
        logStep(`Token exchange result: ${tokens ? "Successful" : "Failed"}`);
        
        if (!tokens) {
          logStep("Failed to exchange code for tokens");
          setStatus("error");
          setErrorDetails("Failed to exchange code for tokens");
          toast({
            title: "Σφάλμα σύνδεσης",
            description: "Δεν ήταν δυνατή η ανταλλαγή του κωδικού για tokens.",
            variant: "destructive",
          });
          safeNavigate("/", 3000);
          return;
        }
        
        // Store the tokens
        logStep("Storing tokens");
        storeTokens(tokens);
        
        // Fetch user info from Google API
        try {
          logStep("Fetching user info with access token");
          const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });
          
          logStep(`User info response status: ${userInfoResponse.status}`);
          
          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            logStep(`User Info received for: ${userInfo.email}`);
            
            // Store user info in localStorage
            localStorage.setItem("google_user", JSON.stringify(userInfo));
            // Also store in the "user" key for compatibility with other components
            localStorage.setItem("user", JSON.stringify(userInfo));
          } else {
            const responseText = await userInfoResponse.text();
            logStep(`Failed to fetch user info: ${responseText}`);
            logStep(`Status: ${userInfoResponse.status}, StatusText: ${userInfoResponse.statusText}`);
          }
        } catch (error) {
          logStep(`Error fetching user info: ${error instanceof Error ? error.message : String(error)}`);
          // Continue with the flow even if user info fetch fails
        }
        
        // Signal success
        setStatus("success");
        logStep("Authentication successful");
        toast({
          title: "Επιτυχής σύνδεση",
          description: "Συνδεθήκατε επιτυχώς στο Google.",
        });
        
        // Redirect to home page with safe navigation
        logStep("Redirecting to home page");
        safeNavigate("/home", 1500);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logStep(`Error processing OAuth callback: ${errorMessage}`);
        setErrorDetails(errorMessage);
        setStatus("error");
        toast({
          title: "Σφάλμα σύνδεσης",
          description: "Προέκυψε σφάλμα κατά την επεξεργασία της απάντησης σύνδεσης.",
          variant: "destructive",
        });
        safeNavigate("/", 3000);
      }
    };
    
    processAuthCode();
  }, [navigate, toast, location.pathname]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-semibold mb-2">Επεξεργασία σύνδεσης...</h2>
              <p className="text-gray-600">Παρακαλώ περιμένετε καθώς ολοκληρώνουμε τη σύνδεσή σας.</p>
            </>
          )}
          
          {status === "success" && (
            <>
              <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-2xl font-semibold mb-2">Επιτυχής σύνδεση!</h2>
              <p className="text-gray-600">Ανακατεύθυνση στην αρχική σελίδα...</p>
            </>
          )}
          
          {status === "error" && (
            <>
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h2 className="text-2xl font-semibold mb-2">Σφάλμα σύνδεσης</h2>
              <p className="text-gray-600 mb-2">Προέκυψε σφάλμα κατά τη σύνδεση. Ανακατεύθυνση στην αρχική σελίδα...</p>
              {errorDetails && (
                <p className="text-sm text-red-500 mt-2 p-2 bg-red-50 rounded">
                  {errorDetails}
                </p>
              )}
            </>
          )}
          
          {/* Debug processing steps */}
          {processingSteps.length > 0 && (
            <div className="mt-6 p-3 text-left bg-gray-100 rounded text-xs max-h-60 overflow-y-auto border border-gray-300">
              <h5 className="font-bold mb-2 text-center">Processing Log</h5>
              <ul className="space-y-1">
                {processingSteps.map((step, index) => (
                  <li key={index} className="font-mono">{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
