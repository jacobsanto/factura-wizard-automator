
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { DevModeProvider } from "@/contexts/DevModeContext";
import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import StatusPage from "@/pages/StatusPage";
import NotFound from "@/pages/NotFound";
import GoogleAuthCallback from "@/components/GoogleAuthCallback";
import "./App.css";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    <DevModeProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/oauth2callback" element={<GoogleAuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </DevModeProvider>
  );
}

export default App;
