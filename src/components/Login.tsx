
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseAuth } from "@/contexts/supabase/SupabaseAuthContext";
import { useDebugMode } from "@/hooks/useDebugMode";
import { AuthErrorMessage } from "@/components/login/AuthErrorMessage";
import { DebugPanel } from "@/components/login/DebugPanel";
import { DevModeToggle } from "@/components/DevModeToggle";

const Login: React.FC = () => {
  const { isLoading, signInWithGoogle } = useSupabaseAuth();
  const { showDebug, handleClearLocalStorage } = useDebugMode();
  
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google login error:", error);
      setAuthError("Προέκυψε σφάλμα κατά τη σύνδεση με Google. Παρακαλώ δοκιμάστε ξανά.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <img 
              alt="Arivia Group Logo" 
              src="/lovable-uploads/9e419dda-f61f-41e7-ac02-301a7ae32f6f.png" 
              className="logo-debug-trigger h-8 w-auto mb-4 cursor-pointer object-fill" 
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Αυτοματισμός Παραστατικών
          </CardTitle>
          <CardDescription className="text-gray-500">
            Συνδεθείτε για να συνεχίσετε
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Google Sign In Button - Now more prominent */}
          <div className="my-6">
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-6"
              disabled={isLoading}
              type="button"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v3.6h5.32c-0.51,2.21-2.63,3.8-5.32,3.8c-3.26,0-5.9-2.64-5.9-5.9 c0-3.26,2.64-5.9,5.9-5.9c1.38,0,2.66,0.48,3.64,1.28l2.54-2.54C16.27,3.33,14.25,2.5,12,2.5c-5.24,0-9.5,4.26-9.5,9.5 c0,5.24,4.26,9.5,9.5,9.5c5.52,0,9.14-3.89,9.14-9.36C21.14,11.77,21.21,11.42,21.35,11.1z" fill="#4285F4"></path>
                  <path d="M3.88,10.78L6.45,12.77C7.19,10.86,9.4,9.5,12,9.5c1.38,0,2.66,0.48,3.64,1.28l2.54-2.54 C16.27,6.33,14.25,5.5,12,5.5C8.39,5.5,5.26,7.68,3.88,10.78z" fill="#EA4335"></path>
                  <path d="M12,21.5c2.25,0,4.27-0.83,5.86-2.19l-2.74-2.12c-0.95,0.93-2.38,1.31-3.54,1.31 c-2.67,0-4.93-1.68-5.76-4.02L3.08,16.4C4.48,19.47,8,21.5,12,21.5z" fill="#34A853"></path>
                  <path d="M3.08,16.4l2.74-2.12c-0.17-0.48-0.27-1-0.27-1.53H3c0,0.56,0.08,1.12,0.23,1.65C3.23,14.4,3.08,16.4,3.08,16.4z" fill="#FBBC05"></path>
                </g>
              </svg>
              <span className="ml-2 text-base font-medium">{isLoading ? 'Σύνδεση με Google...' : 'Σύνδεση με Google'}</span>
            </Button>
          </div>
          
          {/* DevMode Toggle - Added here so it's accessible from the login screen */}
          <div className="mt-4 flex justify-center">
            <DevModeToggle />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          {/* Error message display */}
          <AuthErrorMessage error={authError} />
          
          {/* Debug panel */}
          {showDebug && <DebugPanel handleClearLocalStorage={handleClearLocalStorage} />}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
