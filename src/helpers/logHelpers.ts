
/**
 * Log Helper Functions
 * Simple wrapper functions for logging operations
 */
import { LoggingService, UploadLogEntry } from "@/services/LoggingService";
import { DocumentData } from "@/types";
import { getValidAccessToken } from "@/services/googleAuth";

/**
 * Log an upload operation with document data
 */
export const logDocumentUpload = (
  docData: DocumentData, 
  filename: string, 
  driveFileId: string,
  targetPath?: string
): void => {
  const loggingService = LoggingService.getInstance();
  loggingService.logUploadFromDoc(docData, filename, driveFileId, targetPath);
};

/**
 * Log an upload operation with manual data
 */
export const logUpload = (
  filename: string,
  clientVat: string,
  clientName: string,
  issuer: string,
  invoiceNumber: string,
  date: string,
  amount: string,
  currency: string,
  driveFileId: string,
  targetPath?: string
): void => {
  const loggingService = LoggingService.getInstance();
  loggingService.logUpload({
    filename,
    clientVat,
    clientName,
    issuer,
    invoiceNumber,
    date,
    amount,
    currency,
    driveFileId,
    targetPath
  });
};

/**
 * Log upload details to Google Sheets
 */
export const logToGoogleSheet = async ({
  spreadsheetId,
  sheetName,
  values,
}: {
  spreadsheetId: string;
  sheetName: string;
  values: string[];
}): Promise<void> => {
  const accessToken = await getValidAccessToken();
  
  if (!accessToken) {
    throw new Error("No valid access token available");
  }
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:append?valueInputOption=USER_ENTERED`;

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
    console.error("Error logging to Google Sheets:", errorData);
    throw new Error("Failed to log to Google Sheets");
  }
};

/**
 * Get recent upload logs
 */
export const getRecentLogs = (limit: number = 20): UploadLogEntry[] => {
  const loggingService = LoggingService.getInstance();
  return loggingService.getRecentLogs(limit);
};

/**
 * Get all upload logs
 */
export const getAllLogs = (): UploadLogEntry[] => {
  const loggingService = LoggingService.getInstance();
  return loggingService.getLogs();
};

/**
 * Clear all logs
 */
export const clearLogs = (): void => {
  const loggingService = LoggingService.getInstance();
  loggingService.clearLogs();
};
