
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoogleSheetsOptionsProps {
  useSheets: boolean;
  setUseSheets: (value: boolean) => void;
  spreadsheetId: string;
  setSpreadsheetId: (value: string) => void;
  sheetName: string;
  setSheetName: (value: string) => void;
}

const GoogleSheetsOptions: React.FC<GoogleSheetsOptionsProps> = ({
  useSheets,
  setUseSheets,
  spreadsheetId,
  setSpreadsheetId,
  sheetName,
  setSheetName
}) => {
  return (
    <>
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="useSheets"
          className="mr-2"
          checked={useSheets}
          onChange={(e) => setUseSheets(e.target.checked)}
        />
        <Label htmlFor="useSheets">Καταγραφή στο Google Sheets</Label>
      </div>
      
      {useSheets && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="spreadsheetId">ID Google Spreadsheet</Label>
            <Input 
              id="spreadsheetId" 
              value={spreadsheetId} 
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="Αντιγράψτε το ID από το URL του Google Sheet"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sheetName">Όνομα Φύλλου</Label>
            <Input 
              id="sheetName" 
              value={sheetName} 
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="π.χ. Log"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleSheetsOptions;
