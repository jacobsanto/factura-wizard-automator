
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForTokens, storeTokens } from "@/services/google";
import { useToast } from "@/hooks/use-toast";

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  
  useEffect(() => {
    const processAuthCode = async () => {
      try {
        // Get the auth code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");
        
        console.log("OAuth callback received. Code exists:", !!code, "Error:", error || "none");
        
        if (error) {
          console.error("Authentication error:", error);
          setStatus("error");
          toast({
            title: "Σφάλμα σύνδεσης",
            description: "Η σύνδεση με το Google απέτυχε.",
            variant: "destructive",
          });
          setTimeout(() => navigate("/"), 3000);
          return;
        }
        
        if (!code) {
          console.error("No authentication code received");
          setStatus("error");
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
              <p className="text-gray-600">Προέκυψε σφάλμα κατά τη σύνδεση. Ανακατεύθυνση στην αρχική σελίδα...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
