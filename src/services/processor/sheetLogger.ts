
/**
 * Service for logging to Google Sheets
 */
import { DocumentData } from "@/types";
import { SheetsService } from "../SheetsService";

export class SheetLoggerService {
  private static instance: SheetLoggerService;
  private sheetsService: SheetsService;

  private constructor() {
    console.log("SheetLoggerService initialized");
    this.sheetsService = SheetsService.getInstance();
  }

  public static getInstance(): SheetLoggerService {
    if (!SheetLoggerService.instance) {
      SheetLoggerService.instance = new SheetLoggerService();
      console.log("Created new SheetLoggerService instance");
    }
    return SheetLoggerService.instance;
  }

  /**
   * Log document data to a Google Sheet
   */
  async logToSheet(docData: DocumentData, targetPath: string, filename: string, sheetId?: string): Promise<boolean> {
    console.log("Logging document data to sheet", { 
      targetPath, 
      filename, 
      hasSheetId: !!sheetId,
      docData
    });
    
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
      console.log("Preparing row data for sheet", { sheetId });
      const rowData = [
        new Date().toISOString(),
        docData.vatNumber,
        docData.date,
        docData.documentNumber,
        docData.supplier,
        docData.amount.toString(),
        docData.currency,
        targetPath,
        filename
      ];
      
      const result = await this.sheetsService.appendRow(sheetId, rowData);
      console.log("Sheet logging result:", result);
      return result;
    } catch (error) {
      console.error("Failed to log to sheet:", error);
      return false;
    }
  }
}
