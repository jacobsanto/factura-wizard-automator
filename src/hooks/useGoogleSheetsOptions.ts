
import { useState } from "react";

interface UseGoogleSheetsOptionsReturn {
  useSheets: boolean;
  setUseSheets: (value: boolean) => void;
  spreadsheetId: string;
  setSpreadsheetId: (value: string) => void;
  sheetName: string;
  setSheetName: (value: string) => void;
}

export function useGoogleSheetsOptions(): UseGoogleSheetsOptionsReturn {
  const [useSheets, setUseSheets] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("Log");

  return {
    useSheets,
    setUseSheets,
    spreadsheetId,
    setSpreadsheetId,
    sheetName,
    setSheetName
  };
}
