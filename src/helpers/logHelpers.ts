
/**
 * Log Helper Functions
 * Simple wrapper functions for logging operations
 */
import { LoggingService, UploadLogEntry } from "@/services/LoggingService";
import { DocumentData } from "@/types";

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
