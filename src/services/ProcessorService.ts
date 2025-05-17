
import { AttachmentData, DocumentData, ProcessingStatus } from "@/types";
import { GmailService } from "./GmailService";
import { EnhancedDriveService } from "./drive";
import { SheetsService } from "./SheetsService";

export class ProcessorService {
  private static instance: ProcessorService;
  private gmailService: GmailService;
  private driveService: EnhancedDriveService;
  private sheetsService: SheetsService;

  private constructor() {
    this.gmailService = GmailService.getInstance();
    this.driveService = EnhancedDriveService.getInstance();
    this.sheetsService = SheetsService.getInstance();
  }

  public static getInstance(): ProcessorService {
    if (!ProcessorService.instance) {
      ProcessorService.instance = new ProcessorService();
    }
    return ProcessorService.instance;
  }

  async extractDataFromPdf(pdfBlob: Blob): Promise<DocumentData> {
    // In a real implementation, this would use OCR or PDF text extraction
    // For demo, return mock data
    
    // Generate some random values to simulate different documents
    const suppliers = ["ABC Company", "XYZ Corp", "European Supplier", "Local Vendor"];
    const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)];
    
    const vatPrefixes = ["EL", "DE", "FR", ""];
    const randomPrefix = vatPrefixes[Math.floor(Math.random() * vatPrefixes.length)];
    const randomVatNumber = randomPrefix + Math.floor(10000000 + Math.random() * 90000000).toString();
    
    const currencies = ["€", "$"];
    const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
    
    // Generate a random date within the last year
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    const randomDate = new Date(oneYearAgo.getTime() + Math.random() * (today.getTime() - oneYearAgo.getTime()));
    const formattedDate = randomDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Simulate processing delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          vatNumber: randomVatNumber,
          date: formattedDate,
          documentNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
          supplier: randomSupplier,
          amount: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
          currency: randomCurrency
        });
      }, 2000);
    });
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
      
      // Generate new filename
      const newFilename = await this.driveService.generateFilename(extractedData);
      
      // Determine target folder
      updateCallback({ status: "processing", message: "Προετοιμασία αποθήκευσης..." });
      const targetFolder = await this.driveService.determineTargetFolder(extractedData);
      
      // Create folder structure if it doesn't exist
      const folderId = await this.driveService.getOrCreateFolder(targetFolder);
      
      // Upload file
      updateCallback({ status: "processing", message: "Μεταφόρτωση αρχείου..." });
      await this.driveService.uploadFile(targetFolder, newFilename, pdfBlob);
      
      // Success
      updateCallback({ status: "success", message: "Επιτυχής επεξεργασία" });
      
      return {
        success: true,
        data: extractedData,
        targetPath: targetFolder,
        newFilename: newFilename
      };
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
    if (!sheetId) return false;
    
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
