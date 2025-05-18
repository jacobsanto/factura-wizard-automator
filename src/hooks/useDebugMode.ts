
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { checkAndFixAuthState, forceResetAuthState } from "@/services/google";

export function useDebugMode() {
  const [showDebug, setShowDebug] = useState(false);
  const { toast } = useToast();
  
  // Check URL for debug parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
      setShowDebug(true);
    }

    // Add a click counter for the logo to enable debug mode
    let clickCount = 0;
    const logoElement = document.querySelector('.logo-debug-trigger');
    if (logoElement) {
      logoElement.addEventListener('click', () => {
        clickCount++;
        if (clickCount >= 5) {
          setShowDebug(true);
          toast({
            title: "Debug Mode",
            description: "Debug mode enabled. Technical information is now visible."
          });
        }
      });
    }
  }, [toast]);

  // Fix any broken auth state on component mount
  useEffect(() => {
    const cleanupLocalStorage = () => {
      try {
        checkAndFixAuthState();
      } catch (error) {
        console.error("Login: Error cleaning up local storage:", error);
      }
    };
    cleanupLocalStorage();

    // Log OAuth configuration on component mount to help with debugging
    console.log("Login component mounted");
    console.log("- Current origin:", window.location.origin);
    console.log("- Current pathname:", window.location.pathname);
    console.log("- Configured redirect URI:", GOOGLE_REDIRECT_URI);
  }, []);

  const handleClearLocalStorage = () => {
    try {
      localStorage.clear();
      toast({
        title: "Επιτυχής Καθαρισμός",
        description: "Όλα τα τοπικά δεδομένα διαγράφηκαν επιτυχώς."
      });
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Προέκυψε σφάλμα κατά τον καθαρισμό των δεδομένων."
      });
    }
  };

  return {
    showDebug,
    setShowDebug,
    handleClearLocalStorage
  };
}

// Import at the top of the file
import { GOOGLE_REDIRECT_URI } from "@/env";
