
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLoginHandler } from "@/hooks/useLoginHandler";
import { useDebugMode } from "@/hooks/useDebugMode";
import { AuthErrorMessage } from "@/components/login/AuthErrorMessage";
import { DebugPanel } from "@/components/login/DebugPanel";

const Login: React.FC = () => {
  const { isLoading, authError, handleSignIn, testGoogleConnection } = useLoginHandler();
  const { showDebug, handleClearLocalStorage } = useDebugMode();

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
          <Button 
            onClick={handleSignIn} 
            disabled={isLoading} 
            className="w-full bg-brand-blue hover:bg-blue-700"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Σύνδεση...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                </svg>
                <span>Σύνδεση με Google</span>
              </div>
            )}
          </Button>
          
          {/* Test connection button */}
          <Button 
            onClick={testGoogleConnection} 
            variant="outline" 
            className="w-full text-sm"
            disabled={isLoading}
          >
            Έλεγχος σύνδεσης με Google
          </Button>
          
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
