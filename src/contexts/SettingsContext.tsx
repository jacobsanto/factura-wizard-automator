
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { UserSettings } from "@/types";

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  enableSheets: false,
  notifyOnError: true,
  notifyEmail: "",
  autoProcessingEnabled: false,
  processingInterval: 30, // 30 minutes default
  enableAI: true, // Enable AI extraction by default
  preferGreekExtraction: true, // Optimize for Greek invoices by default
  aiConfidenceThreshold: 70, // 70% confidence threshold by default
  strictInvoiceCheck: true, // Enable strict invoice verification by default
  pdfOnly: true, // Only process PDF files by default
  enableDocumentAI: false, // Disable Document AI by default
  documentAIProcessorId: "", // No processor ID by default
  documentAILocation: "eu", // EU location by default
  documentAIPreferredForGreek: false, // Don't prefer Document AI for Greek by default
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage on initialization
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings) as UserSettings;
        setSettings(parsedSettings);
      } catch (e) {
        console.error("Error parsing saved settings:", e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem("userSettings", JSON.stringify(updatedSettings));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem("userSettings", JSON.stringify(defaultSettings));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
