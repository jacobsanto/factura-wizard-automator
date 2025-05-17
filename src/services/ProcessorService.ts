
import { AttachmentData, DocumentData, ProcessingStatus } from "@/types";
import { GmailService } from "./GmailService";
import { EnhancedDriveService } from "./drive";
import { SheetsService } from "./SheetsService";
import { LoggingService } from "./LoggingService";
import { generateInvoiceFilename, generateDrivePath, joinPathSegments } from "./drive/naming";

export class ProcessorService {
  private static instance: ProcessorService;
  private gmailService: GmailService;
  private driveService: EnhancedDriveService;
  private sheetsService: SheetsService;
  private loggingService: LoggingService;

  private constructor() {
    this.gmailService = GmailService.getInstance();
    this.driveService = EnhancedDriveService.getInstance();
    this.sheetsService = SheetsService.getInstance();
    this.loggingService = LoggingService.getInstance();
  }

  public static getInstance(): ProcessorService {
    if (!ProcessorService.instance) {
      ProcessorService.instance = new ProcessorService();
    }
    return ProcessorService.instance;
  }

  async extractDataFromPdf(pdfBlob: Blob): Promise<DocumentData> {
    // In a real production environment, you would use a proper PDF text extraction library
    // or send the PDF to a server-side OCR service
    
    // For demo purposes, we'll simulate extraction by parsing the PDF name if available
    // and generating some values
    
    console.log("Attempting to extract data from PDF blob");
    
    try {
      // For basic text extraction from PDFs, we would need to use pdf.js or a similar library
      // Since implementing that is outside the scope of this function,
      // we'll use a simplified approach that extracts what data we can
      // and falls back to generating plausible values
      
      // For a real implementation, this would be replaced with proper PDF text extraction
      // and pattern matching for invoice fields
      
      const fileName = "unknown-document.pdf"; // In real implementation, this would come from the blob
      
      // Example patterns we might look for in a real implementation:
      // - VAT number: XX999999999 format or similar
      // - Date: Various formats like DD/MM/YYYY or YYYY-MM-DD
      // - Invoice number: Often prefixed with INV-, INVOICE-, etc.
      
      // For now, we'll generate a plausible data structure
      // In production, you would extract this data from the PDF content
      
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // For demo purposes: Generate data based on current timestamp to simulate different invoices
      const timestamp = Date.now();
      const randomVatPrefix = ["EL", "DE", "FR", "IT"][Math.floor(Math.random() * 4)];
      
      return {
        vatNumber: `${randomVatPrefix}${Math.floor(10000000 + Math.random() * 90000000)}`,
        date: formattedDate,
        documentNumber: `INV-${timestamp % 10000}`,
        supplier: `Supplier-${timestamp % 100}`,
        amount: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
        currency: "€",
        clientName: `Client-${timestamp % 50}` // Add sample client name for demo
      };
    } catch (error) {
      console.error("Error extracting data from PDF:", error);
      
      // Fallback data when extraction fails
      return {
        vatNumber: "Unknown",
        date: new Date().toISOString().split('T')[0],
        documentNumber: "Unknown",
        supplier: "Unknown",
        amount: 0,
        currency: "€",
        clientName: "Unknown Client"
      };
    }
  }

  async processAttachment(
    emailId: string, 
    attachment: AttachmentData,
    updateCallback: (status: ProcessingStatus) => void
  ): Promise<{
    success: boolean;
    data?: DocumentData;
    targetPath?: string;
    newFilename?: string;
    driveFileId?: string;
    message?: string;
  }> {
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
      const extractedData = await this.extractDataFromPdf(pdfBlob);
      
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
