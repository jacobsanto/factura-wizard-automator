
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Φόρτωση...</p>
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
