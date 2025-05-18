
import React, { createContext, useContext, useState, useEffect } from "react";

type DevModeContextType = {
  isDevMode: boolean;
  toggleDevMode: () => void;
};

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

export const DevModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  
  // Initialize from localStorage on mount
  useEffect(() => {
    const storedDevMode = localStorage.getItem("devMode");
    if (storedDevMode === "true") {
      setIsDevMode(true);
    }
  }, []);
  
  const toggleDevMode = () => {
    const newDevMode = !isDevMode;
    setIsDevMode(newDevMode);
    localStorage.setItem("devMode", String(newDevMode));
  };
  
  return (
    <DevModeContext.Provider value={{ isDevMode, toggleDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
};

export const useDevMode = (): DevModeContextType => {
  const context = useContext(DevModeContext);
  if (context === undefined) {
    throw new Error("useDevMode must be used within a DevModeProvider");
  }
  return context;
};
