import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForTokens, storeTokens } from "@/services/google";
import { useToast } from "@/hooks/use-toast";
import { GOOGLE_REDIRECT_URI } from "@/env";

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorDetails, setErrorDetails] = useState<string>("");
  
  useEffect(() => {
    const processAuthCode = async () => {
      try {
        // Get the auth code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");
        
        console.log("OAuth callback received:");
        console.log("- Code exists:", !!code);
        console.log("- Error:", error || "none");
        console.log("- Full URL:", window.location.href);
        console.log("- Current Origin:", window.location.origin);
        console.log("- Expected redirect URI:", GOOGLE_REDIRECT_URI);
        console.log("- Match?", window.location.origin + "/oauth2callback" === GOOGLE_REDIRECT_URI);
        
        if (error) {
          console.error("Authentication error:", error);
          setStatus("error");
          setErrorDetails(`Error: ${error}`);
          toast({
            title: "Σφάλμα σύνδεσης",
            description: `Η σύνδεση με το Google απέτυχε: ${error}`,
            variant: "destructive",
          });
          
          // If the error is redirect_uri_mismatch, provide more detailed information
          if (error.includes("redirect_uri_mismatch") || urlParams.get("error_description")?.includes("redirect_uri_mismatch")) {
            setErrorDetails(`Σφάλμα: redirect_uri_mismatch. Η διεύθυνση ανακατεύθυνσης που χρησιμοποιήθηκε (${window.location.origin}/oauth2callback) δεν έχει εγκριθεί στο Google Cloud Console.`);
          }
          
          setTimeout(() => navigate("/"), 5000);
          return;
        }
        
        if (!code) {
          console.error("No authentication code received");
          setStatus("error");
          setErrorDetails("No authentication code received");
          toast({
            title: "Σφάλμα σύνδεσης",
            description: "Δεν ελήφθη κωδικός πιστοποίησης.",
            variant: "destructive",
          });
          setTimeout(() => navigate("/"), 3000);
          return;
        }
        
        // Exchange the code for tokens
        console.log("Attempting to exchange code for tokens...");
        const tokens = await exchangeCodeForTokens(code);
        console.log("Token exchange result:", tokens ? "Successful" : "Failed");
        
        if (!tokens) {
          setStatus("error");
          setErrorDetails("Failed to exchange code for tokens");
          toast({
            title: "Σφάλμα σύνδεσης",
            description: "Δεν ήταν δυνατή η ανταλλαγή του κωδικού για tokens.",
            variant: "destructive",
          });
          setTimeout(() => navigate("/"), 3000);
          return;
        }
        
        // Store the tokens
        storeTokens(tokens);
        
        // Fetch user info from Google API
        try {
          console.log("Fetching user info with access token");
          const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });
          
          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            console.log("✅ User Info received:", userInfo.email);
            
            // Store user info in localStorage
            localStorage.setItem("google_user", JSON.stringify(userInfo));
            // Also store in the "user" key for compatibility with other components
            localStorage.setItem("user", JSON.stringify(userInfo));
          } else {
            console.error("Failed to fetch user info:", await userInfoResponse.text());
            // Get the status code and content of the error response
            console.error(`Status: ${userInfoResponse.status}, StatusText: ${userInfoResponse.statusText}`);
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
          // Continue with the flow even if user info fetch fails
        }
        
        // Signal success
        setStatus("success");
        toast({
          title: "Επιτυχής σύνδεση",
          description: "Συνδεθήκατε επιτυχώς στο Google.",
        });
        
        // Redirect to home page
        setTimeout(() => navigate("/"), 1500);
      } catch (error) {
        console.error("Error processing OAuth callback:", error);
        setErrorDetails(error instanceof Error ? error.message : String(error));
        setStatus("error");
        toast({
          title: "Σφάλμα σύνδεσης",
          description: "Προέκυψε σφάλμα κατά την επεξεργασία της απάντησης σύνδεσης.",
          variant: "destructive",
        });
        setTimeout(() => navigate("/"), 3000);
      }
    };
    
    processAuthCode();
  }, [navigate, toast]);
  
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
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
