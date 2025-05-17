
/**
 * Service for processing attachments
 */
import { AttachmentData, DocumentData, ProcessingStatus } from "@/types";
import { GmailService } from "../GmailService";
import { EnhancedDriveService } from "../drive";
import { LoggingService } from "../LoggingService";
import { DataExtractorService } from "./dataExtractor";
import { ProcessResult } from "./types";

export class AttachmentProcessorService {
  private static instance: AttachmentProcessorService;
  private gmailService: GmailService;
  private driveService: EnhancedDriveService;
  private dataExtractor: DataExtractorService;
  private loggingService: LoggingService;

  private constructor() {
    this.gmailService = GmailService.getInstance();
    this.driveService = EnhancedDriveService.getInstance();
    this.dataExtractor = DataExtractorService.getInstance();
    this.loggingService = LoggingService.getInstance();
  }

  public static getInstance(): AttachmentProcessorService {
    if (!AttachmentProcessorService.instance) {
      AttachmentProcessorService.instance = new AttachmentProcessorService();
    }
    return AttachmentProcessorService.instance;
  }

  /**
   * Process an email attachment
   */
  async processAttachment(
    emailId: string, 
    attachment: AttachmentData,
    updateCallback: (status: ProcessingStatus) => void
  ): Promise<ProcessResult> {
    try {
      // Update status to processing
      updateCallback({ status: "processing", message: "Κατέβασμα αρχείου..." });
      
      // Download attachment
      const pdfBlob = await this.gmailService.downloadAttachment(emailId, attachment.id);
      if (!pdfBlob) {
        updateCallback({ status: "error", message: "Αδυναμία λήψης αρχείου" });
        return { success: false, message: "Failed to download attachment" };
      }
      
      // Extract data
      updateCallback({ status: "processing", message: "Εξαγωγή δεδομένων..." });
      const extractedData = await this.dataExtractor.extractDataFromPdf(pdfBlob);
      
      // Try to use the streamlined upload function first
      updateCallback({ status: "processing", message: "Μεταφόρτωση αρχείου στο Drive..." });
      
      try {
        // Use the new direct upload method
        const uploadResult = await this.driveService.uploadInvoiceToDrive({
          file: pdfBlob,
          clientVat: extractedData.vatNumber,
          clientName: extractedData.clientName || "Άγνωστος Πελάτης",
          issuer: extractedData.supplier,
          invoiceNumber: extractedData.documentNumber,
          date: extractedData.date,
          amount: extractedData.amount.toString(),
          currency: extractedData.currency
        });
        
        // Log the successful upload
        this.loggingService.logUploadFromDoc(
          extractedData, 
          uploadResult.name, 
          uploadResult.id
        );
        
        // Success
        updateCallback({ 
          status: "success", 
          message: "Επιτυχής επεξεργασία και αποστολή" 
        });
        
        return {
          success: true,
          data: extractedData,
          driveFileId: uploadResult.id,
          newFilename: uploadResult.name
        };
      } catch (directUploadError) {
        console.warn("Direct upload failed, falling back to legacy method:", directUploadError);
        
        // Fall back to the legacy upload method
        updateCallback({ status: "processing", message: "Προετοιμασία αποθήκευσης..." });
        
        // Generate new filename
        const newFilename = await this.driveService.generateFilename(extractedData);
        
        // Generate path segments using the new method
        const pathSegments = generateDrivePath({
          clientVat: extractedData.vatNumber,
          clientName: extractedData.clientName || "Άγνωστος Πελάτης",
          issuer: extractedData.supplier,
          date: extractedData.date
        });
        
        const targetFolder = joinPathSegments(pathSegments);
        
        // Create folder structure if it doesn't exist
        const folderId = await this.driveService.getOrCreateFolder(targetFolder);
        
        // Upload file
        updateCallback({ status: "processing", message: "Μεταφόρτωση αρχείου..." });
        const fileId = await this.driveService.uploadFile(targetFolder, newFilename, pdfBlob);
        
        // Log the successful upload
        this.loggingService.logUploadFromDoc(
          extractedData, 
          newFilename, 
          fileId,
          targetFolder
        );
        
        // Success
        updateCallback({ status: "success", message: "Επιτυχής επεξεργασία" });
        
        return {
          success: true,
          data: extractedData,
          targetPath: targetFolder,
          newFilename: newFilename,
          driveFileId: fileId
        };
      }
    } catch (error) {
      console.error("Error processing attachment:", error);
      updateCallback({ status: "error", message: "Σφάλμα επεξεργασίας" });
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
}

// Import here to avoid circular dependencies
import { generateDrivePath, joinPathSegments } from "../drive/naming";
