
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
    console.log("Main ProcessorService initializing");
    this.attachmentProcessor = AttachmentProcessorService.getInstance();
    this.dataExtractor = DataExtractorService.getInstance();
    this.sheetLogger = SheetLoggerService.getInstance();
    console.log("Main ProcessorService initialized with all sub-services");
  }

  public static getInstance(): ProcessorService {
    if (!ProcessorService.instance) {
      ProcessorService.instance = new ProcessorService();
      console.log("Created new main ProcessorService instance");
    }
    return ProcessorService.instance;
  }

  /**
   * Extract data from a PDF
   */
  async extractDataFromPdf(pdfBlob: Blob): Promise<DocumentData> {
    console.log("ProcessorService: delegating PDF data extraction", {
      blobSize: pdfBlob.size,
      blobType: pdfBlob.type
    });
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
    console.log("ProcessorService: delegating attachment processing", {
      emailId,
      attachmentId: attachment.id,
      attachmentName: attachment.name
    });
    return this.attachmentProcessor.processAttachment(emailId, attachment, updateCallback);
  }

  /**
   * Log to Google Sheet
   */
  async logToSheet(docData: DocumentData, targetPath: string, filename: string, sheetId?: string): Promise<boolean> {
    console.log("ProcessorService: delegating sheet logging", {
      targetPath,
      filename,
      hasSheetId: !!sheetId,
      docData: {
        vatNumber: docData.vatNumber,
        documentNumber: docData.documentNumber,
        supplier: docData.supplier,
        amount: docData.amount
      }
    });
    return this.sheetLogger.logToSheet(docData, targetPath, filename, sheetId);
  }
}

// Re-export types
export * from "./types";
export { AttachmentProcessorService } from "./attachmentProcessor";
export { DataExtractorService } from "./dataExtractor";
export { SheetLoggerService } from "./sheetLogger";
