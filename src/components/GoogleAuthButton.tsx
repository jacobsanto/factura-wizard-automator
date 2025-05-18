
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { getGoogleAuthUrl } from "@/services/google";
import { useSupabaseAuth } from "@/contexts/supabase/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";

interface GoogleAuthButtonProps {
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ 
  onSuccess,
  className = "",
  children
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { isAuthenticated } = useSupabaseAuth();
  const { toast } = useToast();
  
  const handleGoogleAuth = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Απαιτείται σύνδεση",
        description: "Παρακαλώ συνδεθείτε πρώτα με τον λογαριασμό σας για να συνεχίσετε.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsAuthenticating(true);
      
      // Get the Google Auth URL
      const authUrl = getGoogleAuthUrl();
      
      // Store the callback function ID in session storage
      if (onSuccess) {
        sessionStorage.setItem("google_auth_callback", "true");
      }
      
      // Redirect to Google auth
      window.location.href = authUrl;
    } catch (error) {
      console.error("Error starting Google authentication:", error);
      toast({
        title: "Σφάλμα",
        description: "Προέκυψε σφάλμα κατά την έναρξη της διαδικασίας σύνδεσης με το Google.",
        variant: "destructive",
      });
      setIsAuthenticating(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={`flex items-center justify-center gap-2 ${className}`}
      onClick={handleGoogleAuth}
      disabled={isAuthenticating}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 0, 0)">
          <path d="M21.35,11.1H12v3.6h5.32c-0.51,2.21-2.63,3.8-5.32,3.8c-3.26,0-5.9-2.64-5.9-5.9 c0-3.26,2.64-5.9,5.9-5.9c1.38,0,2.66,0.48,3.64,1.28l2.54-2.54C16.27,3.33,14.25,2.5,12,2.5c-5.24,0-9.5,4.26-9.5,9.5 c0,5.24,4.26,9.5,9.5,9.5c5.52,0,9.14-3.89,9.14-9.36C21.14,11.77,21.21,11.42,21.35,11.1z" fill="#4285F4"></path>
        </g>
      </svg>
      {children || (isAuthenticating ? 'Σύνδεση...' : 'Σύνδεση με Google')}
    </Button>
  );
};

export default GoogleAuthButton;
