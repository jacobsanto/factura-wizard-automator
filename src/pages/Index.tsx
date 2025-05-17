
import React, { useState, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import { forceResetAuthState } from "@/services/google";

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showHelp, setShowHelp] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {isAuthenticated ? (
        <>
          <Header />
          <main className="flex-grow">
            <Dashboard />
          </main>
          <footer className="py-4 px-6 border-t text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Αριβία Γκρουπ - Αυτοματισμός Παραστατικών
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
    <AuthProvider>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </AuthProvider>
  );
};

export default Index;
