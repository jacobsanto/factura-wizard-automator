
/**
 * Service for processing attachments
 */
import { AttachmentData, DocumentData, ProcessingStatus } from "@/types";
import { GmailService } from "../gmail";
import { EnhancedDriveService } from "../drive";
import { LoggingService } from "../LoggingService";
import { DataExtractorService } from "./dataExtractor";
import { ProcessResult } from "./types";
import { verifyInvoiceDocument } from "../gmail/attachments";

export class AttachmentProcessorService {
  private static instance: AttachmentProcessorService;
  private gmailService: GmailService;
  private driveService: EnhancedDriveService;
  private dataExtractor: DataExtractorService;
  private loggingService: LoggingService;

  private constructor() {
    console.log("AttachmentProcessorService initialized");
    this.gmailService = GmailService.getInstance();
    this.driveService = EnhancedDriveService.getInstance();
    this.dataExtractor = DataExtractorService.getInstance();
    this.loggingService = LoggingService.getInstance();
  }

  public static getInstance(): AttachmentProcessorService {
    if (!AttachmentProcessorService.instance) {
      AttachmentProcessorService.instance = new AttachmentProcessorService();
      console.log("Created new AttachmentProcessorService instance");
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
    console.log("Starting to process attachment", { 
      emailId, 
      attachmentId: attachment.id, 
      attachmentName: attachment.name 
    });
    
    try {
      // Update status to processing
      updateCallback({ status: "processing", message: "Κατέβασμα αρχείου..." });
      console.log("Downloading attachment from Gmail");
      
      // Download attachment
      const pdfBlob = await this.gmailService.downloadAttachment(emailId, attachment.id);
      if (!pdfBlob) {
        console.error("Failed to download attachment");
        updateCallback({ status: "error", message: "Αδυναμία λήψης αρχείου" });
        return { success: false, message: "Failed to download attachment" };
      }
      
      console.log("Attachment downloaded successfully", { 
        type: pdfBlob.type, 
        size: pdfBlob.size 
      });
      
      // Verify this is actually an invoice document
      updateCallback({ status: "processing", message: "Επιβεβαίωση τύπου εγγράφου..." });
      const isInvoice = await verifyInvoiceDocument(pdfBlob);
      
      if (!isInvoice) {
        console.log("Document is not an invoice, skipping processing");
        updateCallback({ status: "error", message: "Το έγγραφο δεν είναι τιμολόγιο" });
        return { success: false, message: "Document is not an invoice" };
      }
      
      console.log("Document verified as invoice, proceeding with data extraction");
      
      // Extract data with priority on VAT
      updateCallback({ status: "processing", message: "Εξαγωγή δεδομένων..." });
      console.log("Extracting data from attachment");
      const extractedData = await this.dataExtractor.extractDataFromPdf(pdfBlob);
      console.log("Data extracted successfully", extractedData);
      
      // Validate VAT number - it's critical for folder structure
      if (!extractedData.vatNumber || extractedData.vatNumber === "Unknown") {
        console.warn("No valid VAT number found, this may affect folder structure");
      }
      
      // Try to use the streamlined upload function
      updateCallback({ status: "processing", message: "Μεταφόρτωση αρχείου στο Drive..." });
      console.log("Attempting streamlined upload to Drive");
      
      try {
        // Use the new direct upload method with updated filename format
        const uploadParams = {
          file: pdfBlob,
          clientVat: extractedData.vatNumber,
          clientName: extractedData.clientName || "Άγνωστος Πελάτης",
          issuer: extractedData.supplier,
          invoiceNumber: extractedData.documentNumber,
          date: extractedData.date,
          amount: extractedData.amount.toString(),
          currency: extractedData.currency
        };
        
        console.log("Direct upload parameters:", uploadParams);
        const uploadResult = await this.driveService.uploadInvoiceToDrive(uploadParams);
        console.log("Direct upload successful", uploadResult);
        
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
        
        // Generate new filename based on updated format
        const newFilename = await this.driveService.generateFilename(extractedData);
        console.log("Generated filename:", newFilename);
        
        // Generate path segments using the new method
        const pathSegments = generateDrivePath({
          clientVat: extractedData.vatNumber,
          clientName: extractedData.clientName || "Άγνωστος Πελάτης",
          issuer: extractedData.supplier,
          date: extractedData.date
        });
        
        console.log("Generated path segments:", pathSegments);
        const targetFolder = joinPathSegments(pathSegments);
        console.log("Target folder path:", targetFolder);
        
        // Create folder structure if it doesn't exist
        console.log("Creating folder structure");
        const folderId = await this.driveService.getOrCreateFolder(targetFolder);
        console.log("Created/found folder with ID:", folderId);
        
        // Upload file
        updateCallback({ status: "processing", message: "Μεταφόρτωση αρχείου..." });
        console.log("Uploading file to folder", { targetFolder, newFilename });
        const fileId = await this.driveService.uploadFile(targetFolder, newFilename, pdfBlob);
        console.log("File uploaded with ID:", fileId);
        
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
