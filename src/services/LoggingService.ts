
/**
 * LoggingService - Handles logging uploads to both local storage and potentially Google Sheets
 */
import { DocumentData } from "@/types";
import { getUserStorageKey } from "@/utils/userUtils";

export interface UploadLogEntry {
  timestamp: string;
  filename: string;
  clientVat: string;
  clientName: string;
  issuer: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  currency: string;
  driveLink: string;
  targetPath?: string;
  userEmail?: string;
}

export class LoggingService {
  private static instance: LoggingService;
  private readonly LOCAL_STORAGE_BASE_KEY = "uploadLogs";

  private constructor() {}

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  /**
   * Get the user-specific storage key
   */
  private getStorageKey(): string {
    return getUserStorageKey(this.LOCAL_STORAGE_BASE_KEY);
  }

  /**
   * Log file upload to local storage
   */
  public logUpload({
    filename,
    clientVat,
    clientName,
    issuer,
    invoiceNumber,
    date,
    amount,
    currency,
    driveFileId,
    targetPath,
    userEmail
  }: {
    filename: string;
    clientVat: string;
    clientName: string;
    issuer: string;
    invoiceNumber: string;
    date: string;
    amount: string;
    currency: string;
    driveFileId: string;
    targetPath?: string;
    userEmail?: string;
  }): void {
    const logs = this.getLogs();
    const currentUser = userEmail || (localStorage.getItem("google_user") ? JSON.parse(localStorage.getItem("google_user")!).email : "unknown");
    
    logs.push({
      timestamp: new Date().toISOString(),
      filename,
      clientVat,
      clientName,
      issuer,
      invoiceNumber,
      date,
      amount,
      currency,
      driveLink: `https://drive.google.com/file/d/${driveFileId}`,
      targetPath,
      userEmail: currentUser
    });
    
    localStorage.setItem(this.getStorageKey(), JSON.stringify(logs));
  }

  /**
   * Log upload using document data
   */
  public logUploadFromDoc(
    docData: DocumentData, 
    filename: string, 
    driveFileId: string,
    targetPath?: string
  ): void {
    this.logUpload({
      filename,
      clientVat: docData.vatNumber,
      clientName: docData.clientName || "Άγνωστος Πελάτης",
      issuer: docData.supplier,
      invoiceNumber: docData.documentNumber,
      date: docData.date,
      amount: docData.amount.toString(),
      currency: docData.currency,
      driveFileId,
      targetPath
    });
  }

  /**
   * Get all logs from local storage
   */
  public getLogs(): UploadLogEntry[] {
    try {
      const logs = localStorage.getItem(this.getStorageKey());
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error("Error retrieving logs:", error);
      return [];
    }
  }

  /**
   * Get recent logs with limit
   */
  public getRecentLogs(limit: number = 20): UploadLogEntry[] {
    const logs = this.getLogs();
    return logs.slice(-Math.abs(limit)).reverse(); // Get most recent logs first
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    localStorage.removeItem(this.getStorageKey());
  }

  /**
   * Future method for Google Sheets integration
   */
  public async logToGoogleSheets(entry: UploadLogEntry): Promise<boolean> {
    // This will be implemented in the future when Google Sheets integration is added
    console.log("Google Sheets logging not yet implemented", entry);
    return false;
  }
}
