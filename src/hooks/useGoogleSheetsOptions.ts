
import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";

export interface GoogleSheetsOptions {
  useSheets: boolean;
  setUseSheets: (value: boolean) => void;
  spreadsheetId: string;
  setSpreadsheetId: (value: string) => void;
  sheetName: string;
  setSheetName: (value: string) => void;
}

export function useGoogleSheetsOptions(): GoogleSheetsOptions {
  const { settings } = useSettings();
  const [useSheets, setUseSheets] = useState<boolean>(settings.enableSheets || false);
  const [spreadsheetId, setSpreadsheetId] = useState<string>(settings.sheetsId || "");
  const [sheetName, setSheetName] = useState<string>("Invoices");

  // Update local state when settings change
  useEffect(() => {
    setUseSheets(settings.enableSheets || false);
    if (settings.sheetsId) {
      setSpreadsheetId(settings.sheetsId);
    }
  }, [settings.enableSheets, settings.sheetsId]);

  return {
    useSheets,
    setUseSheets,
    spreadsheetId,
    setSpreadsheetId,
    sheetName,
    setSheetName
  };
}
