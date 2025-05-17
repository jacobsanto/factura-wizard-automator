
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getValidAccessToken } from "@/services/googleAuth";

interface UseGoogleSheetsLoggerReturn {
  loggingToSheets: boolean;
  logToSheet: (options: {
    spreadsheetId: string;
    sheetName: string;
    values: string[];
  }) => Promise<boolean>;
}

/**
 * Hook for handling Google Sheets logging operations
 */
export function useGoogleSheetsLogger(): UseGoogleSheetsLoggerReturn {
  const [loggingToSheets, setLoggingToSheets] = useState(false);
  const { toast } = useToast();

  /**
   * Log data to Google Sheets
   */
  const logToSheet = async ({
    spreadsheetId,
    sheetName,
    values,
  }: {
    spreadsheetId: string;
    sheetName: string;
    values: string[];
  }): Promise<boolean> => {
    console.log("Starting Google Sheets logging operation", {
      spreadsheetId,
      sheetName,
      valueCount: values.length
    });

    if (!spreadsheetId) {
      console.error("Google Sheets logging failed: No spreadsheet ID provided");
      return false;
    }

    setLoggingToSheets(true);
    
    try {
      const accessToken = await getValidAccessToken();
      
      if (!accessToken) {
        console.error("Google Sheets logging failed: No valid access token available");
        toast({
          variant: "destructive",
          title: "Σφάλμα",
          description: "Δεν υπάρχει έγκυρο token για το Google Sheets",
        });
        return false;
      }
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED`;
      console.log("Sending request to Google Sheets API", { url });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [values],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Google Sheets API error response:", errorData);
        toast({
          variant: "destructive",
          title: "Σφάλμα",
          description: "Απέτυχε η καταγραφή στο Google Sheets",
        });
        return false;
      }

      console.log("Successfully logged data to Google Sheets");
      return true;
    } catch (error) {
      console.error("Exception during Google Sheets logging:", error);
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Απέτυχε η καταγραφή στο Google Sheets",
      });
      return false;
    } finally {
      setLoggingToSheets(false);
    }
  };

  return {
    loggingToSheets,
    logToSheet
  };
}
