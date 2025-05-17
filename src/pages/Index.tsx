
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Add a manual reset function for stuck loading states
  const handleManualReset = () => {
    console.log("Manual reset triggered");
    localStorage.removeItem("google_tokens");
    localStorage.removeItem("google_user");
    localStorage.removeItem("user");
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Φόρτωση...</p>
          
          {/* Add a help button that appears after 5 seconds */}
          <div className="mt-8 opacity-0 animate-fade-in delay-5000">
            <p className="text-sm text-gray-500 mb-2">Εάν η φόρτωση καθυστερεί πολύ:</p>
            <button
              onClick={handleManualReset}
              className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
            >
              Επανεκκίνηση Εφαρμογής
            </button>
          </div>
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
            © {new Date().getFullYear()} Αυτοματισμός Παραστατικών - Google Workspace Integration
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
