
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForTokens } from "@/services/googleAuth";
import { toast } from "@/components/ui/use-toast";

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Completing authentication...");
  
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get the authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          console.error("No code found in OAuth callback URL");
          setStatus("Authentication failed: No authorization code received");
          toast({
            title: "Authentication Error",
            description: "No authorization code received from Google",
            variant: "destructive"
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        console.log("OAuth callback received with code, exchanging for tokens...");
        
        // Exchange the code for tokens
        const tokens = await exchangeCodeForTokens(code);
        
        if (!tokens) {
          console.error("Failed to exchange code for tokens");
          setStatus("Authentication failed: Could not exchange code for tokens");
          toast({
            title: "Authentication Error",
            description: "Could not complete the authentication process",
            variant: "destructive"
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        console.log("Successfully exchanged code for tokens, redirecting to app...");
        setStatus("Authentication successful! Redirecting...");
        
        // Show success message
        toast({
          title: "Authentication Successful",
          description: "You have successfully authenticated with Google"
        });
        
        // Redirect to home page
        setTimeout(() => navigate('/'), 1500);
      } catch (error) {
        console.error("Error handling OAuth callback:", error);
        setStatus(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        toast({
          title: "Authentication Error",
          description: "An error occurred during authentication",
          variant: "destructive"
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };
    
    handleOAuthCallback();
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <img 
            src="/lovable-uploads/eb8a966b-e206-44a4-9398-d5f242f5e9f4.png" 
            alt="Arivia Group Logo" 
            className="h-12 w-auto" 
          />
        </div>
        <div className="w-16 h-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-600">{status}</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
