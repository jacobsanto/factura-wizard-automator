
/**
 * Main ProcessorService that coordinates between all processor components
 */
import { AttachmentData, DocumentData, ProcessingStatus } from "@/types";
import { AttachmentProcessorService } from "./attachmentProcessor";
import { DataExtractorService } from "./dataExtractor";
import { SheetLoggerService } from "./sheetLogger";
import { ProcessResult } from "./types";

export class ProcessorService {
  private static instance: ProcessorService;
  private attachmentProcessor: AttachmentProcessorService;
  private dataExtractor: DataExtractorService;
  private sheetLogger: SheetLoggerService;

  private constructor() {
    this.attachmentProcessor = AttachmentProcessorService.getInstance();
    this.dataExtractor = DataExtractorService.getInstance();
    this.sheetLogger = SheetLoggerService.getInstance();
  }

  public static getInstance(): ProcessorService {
    if (!ProcessorService.instance) {
      ProcessorService.instance = new ProcessorService();
    }
    return ProcessorService.instance;
  }

  /**
   * Extract data from a PDF
   */
  async extractDataFromPdf(pdfBlob: Blob): Promise<DocumentData> {
    return this.dataExtractor.extractDataFromPdf(pdfBlob);
  }

  /**
   * Process an attachment
   */
  async processAttachment(
    emailId: string, 
    attachment: AttachmentData,
    updateCallback: (status: ProcessingStatus) => void
  ): Promise<ProcessResult> {
    return this.attachmentProcessor.processAttachment(emailId, attachment, updateCallback);
  }

  /**
   * Log to Google Sheet
   */
  async logToSheet(docData: DocumentData, targetPath: string, filename: string, sheetId?: string): Promise<boolean> {
    return this.sheetLogger.logToSheet(docData, targetPath, filename, sheetId);
  }
}

// Re-export types
export * from "./types";
export { AttachmentProcessorService } from "./attachmentProcessor";
export { DataExtractorService } from "./dataExtractor";
export { SheetLoggerService } from "./sheetLogger";
