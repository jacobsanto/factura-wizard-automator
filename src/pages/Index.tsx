
import React, { useState, useEffect } from "react";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { useSupabaseAuth } from "@/contexts/supabase/auth";
import { useDevMode } from "@/contexts/DevModeContext";
import Header from "@/components/Header";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import { forceResetAuthState } from "@/services/google";
import { testSupabaseConnection } from "@/utils/supabaseTest";
import { toast } from "@/components/ui/use-toast";

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const { isDevMode } = useDevMode();
  const [showHelp, setShowHelp] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean | null>(null);
  
  // Test Supabase connection on mount
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      const isConnected = await testSupabaseConnection();
      setSupabaseConnected(isConnected);
      
      if (isConnected) {
        toast({
          title: "Supabase Connected",
          description: "Successfully connected to Supabase project.",
          variant: "default",
        });
      } else {
        toast({
          title: "Supabase Connection Failed",
          description: "Could not connect to Supabase. Check your configuration.",
          variant: "destructive",
        });
      }
    };
    
    checkSupabaseConnection();
  }, []);
  
  // Add a timer to show the help button after a delay
  useEffect(() => {
    const helpTimer = setTimeout(() => {
      setShowHelp(true);
    }, 5000);
    
    return () => clearTimeout(helpTimer);
  }, []);

  // Check URL for debug parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
      setShowDebugInfo(true);
      console.log("Debug mode enabled via URL parameter");
    }
  }, []);
  
  // Add a manual reset function for stuck loading states
  const handleManualReset = () => {
    console.log("Manual reset triggered");
    forceResetAuthState();
  };
  
  // Show debug information for troubleshooting
  const renderDebugInfo = () => {
    if (!showDebugInfo) return null;
    
    return (
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <h4 className="font-bold mb-2">Debug Info:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Current URL: {window.location.href}</li>
          <li>Has Google Tokens: {localStorage.getItem("google_tokens") ? "Yes" : "No"}</li>
          <li>Has User Info: {localStorage.getItem("user") ? "Yes" : "No"}</li>
          <li>Loading State: {isLoading ? "Loading" : "Not Loading"}</li>
          <li>Auth State: {isAuthenticated ? "Authenticated" : "Not Authenticated"}</li>
          <li>Dev Mode: {isDevMode ? "Enabled" : "Disabled"}</li>
          <li>Supabase Connected: {supabaseConnected === null ? "Checking..." : supabaseConnected ? "Yes" : "No"}</li>
        </ul>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/eb8a966b-e206-44a4-9398-d5f242f5e9f4.png" 
              alt="Arivia Group Logo" 
              className="h-12 w-auto" 
            />
          </div>
          <div className="w-16 h-16 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Φόρτωση...</p>
          
          {/* Debug information */}
          {renderDebugInfo()}
          
          {/* Supabase connection status */}
          {supabaseConnected !== null && (
            <div className={`mt-4 p-2 rounded ${supabaseConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {supabaseConnected 
                ? "Supabase connection successful!" 
                : "Supabase connection failed. Check configuration."}
            </div>
          )}
          
          {/* Help button with improved visibility */}
          {showHelp && (
            <div className="mt-8 animate-fade-in">
              <p className="text-sm text-gray-500 mb-2">Εάν η φόρτωση καθυστερεί πολύ:</p>
              <button
                onClick={handleManualReset}
                className="text-sm px-4 py-2 bg-red-100 hover:bg-red-200 border border-red-300 rounded text-red-700 transition-colors"
              >
                Επανεκκίνηση Εφαρμογής
              </button>
              
              <div className="mt-4 text-xs text-gray-400">
                <p>Αν το πρόβλημα παραμένει, παρακαλώ επικοινωνήστε με την υποστήριξη</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Check if dev mode is enabled OR user is authenticated
  const showMainApp = isDevMode || isAuthenticated;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showMainApp ? (
        <>
          <Header />
          <main className="flex-grow">
            <Dashboard />
          </main>
          <footer className="py-4 px-6 border-t text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Arivia Group - Αυτοματισμός Παραστατικών
            {isDevMode && (
              <span className="ml-2 inline-flex items-center">
                <span className="h-2 w-2 rounded-full mr-1 bg-amber-500"></span>
                Development Mode
              </span>
            )}
            {supabaseConnected !== null && (
              <span className="ml-2 inline-flex items-center">
                <span className={`h-2 w-2 rounded-full mr-1 ${supabaseConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {supabaseConnected ? 'Supabase connected' : 'Supabase disconnected'}
              </span>
            )}
          </footer>
        </>
      ) : (
        <Login />
      )}
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default Index;
