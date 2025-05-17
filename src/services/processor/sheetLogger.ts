
/**
 * Service for logging to Google Sheets
 */
import { DocumentData } from "@/types";
import { SheetsService } from "../SheetsService";

export class SheetLoggerService {
  private static instance: SheetLoggerService;
  private sheetsService: SheetsService;

  private constructor() {
    this.sheetsService = SheetsService.getInstance();
  }

  public static getInstance(): SheetLoggerService {
    if (!SheetLoggerService.instance) {
      SheetLoggerService.instance = new SheetLoggerService();
    }
    return SheetLoggerService.instance;
  }

  /**
   * Log document data to a Google Sheet
   */
  async logToSheet(docData: DocumentData, targetPath: string, filename: string, sheetId?: string): Promise<boolean> {
    if (!sheetId) {
      console.log("No sheet ID provided, creating new sheet");
      try {
        sheetId = await this.sheetsService.createLogSheet();
        console.log("Created new log sheet with ID:", sheetId);
      } catch (error) {
        console.error("Failed to create new log sheet:", error);
        return false;
      }
    }
    
    try {
      return await this.sheetsService.appendRow(sheetId, [
        new Date().toISOString(),
        docData.vatNumber,
        docData.date,
        docData.documentNumber,
        docData.supplier,
        docData.amount.toString(),
        docData.currency,
        targetPath,
        filename
      ]);
    } catch (error) {
      console.error("Failed to log to sheet:", error);
      return false;
    }
  }
}
