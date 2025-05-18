
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebugMode } from "@/hooks/useDebugMode";
import { AuthErrorMessage } from "@/components/login/AuthErrorMessage";
import { DebugPanel } from "@/components/login/DebugPanel";
import { DevModeToggle } from "@/components/login/DevModeToggle";
import { useLoginHandler } from "@/hooks/useLoginHandler";

const Login: React.FC = () => {
  const {
    isLoading,
    authError,
    handleSignIn,
    testGoogleConnection
  } = useLoginHandler();
  const {
    showDebug,
    handleClearLocalStorage
  } = useDebugMode();
  
  return <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Background image with opacity */}
      <div style={{
      backgroundImage: `url('/lovable-uploads/374fd195-a90b-4dc1-ab99-5df46f383f45.png')`,
      opacity: '0.35'
    }} className="absolute inset-0 bg-cover bg-center z-0 opacity-35 "></div>
      
      {/* Content with relative z-index to appear above the background */}
      <Card className="w-full max-w-md shadow-lg z-10 bg-white/95">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <img alt="Factura Automations Logo" src="/lovable-uploads/fd2ba1a1-1352-49ce-910a-79da80c70fe9.png" className="logo-debug-trigger h-16 w-auto mb-4 cursor-pointer object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Αυτοματισμός Παραστατικών
          </CardTitle>
          <CardDescription className="text-gray-500">
            Συνδεθείτε για να συνεχίσετε
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Google Sign In Button with enhanced description */}
          <div className="my-6">
            <Button onClick={handleSignIn} className="w-full flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-6" disabled={isLoading} type="button">
              <div className="flex-shrink-0 mr-1">
                <div className="google-icon-wrapper w-5 h-5 bg-white flex items-center justify-center rounded-full">
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </g>
                  </svg>
                </div>
              </div>
              <span className="text-base font-medium">
                {isLoading ? 'Σύνδεση με Google...' : 'Σύνδεση με Google'}
              </span>
            </Button>
          </div>
          
          {/* Permission information */}
          <div className="text-xs text-gray-500 mt-2">
            <h3 className="font-medium text-gray-700 mb-1">Η εφαρμογή θα έχει πρόσβαση:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Στα emails σας (για ανάκτηση παραστατικών)</li>
              <li>Στο Google Drive (για αποθήκευση αρχείων)</li>
              <li>Στα Google Sheets (για καταχώρηση δεδομένων)</li>
              <li>Στο Ημερολόγιο (για προβολή γεγονότων)</li>
              <li>Στις Επαφές (για πρόσβαση στοιχείων επικοινωνίας)</li>
            </ul>
          </div>
          
          {/* Test connection button (only in debug mode) */}
          {showDebug && <Button onClick={testGoogleConnection} className="w-full bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300" type="button">
              Test Google Connection
            </Button>}
          
          {/* DevMode Toggle */}
          <DevModeToggle />
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          {/* Error message display */}
          <AuthErrorMessage error={authError} />
          
          {/* Debug panel */}
          {showDebug && <DebugPanel handleClearLocalStorage={handleClearLocalStorage} />}
        </CardFooter>
      </Card>
    </div>;
};

export default Login;
