
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SupabaseAuthProvider } from "@/contexts/supabase/SupabaseAuthContext";
import { DevModeProvider } from "@/contexts/DevModeContext";
import Index from "@/pages/Index";
import Home from "@/pages/Home";
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
      <SupabaseAuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/oauth2callback" element={<GoogleAuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </SupabaseAuthProvider>
    </DevModeProvider>
  );
}

export default App;
