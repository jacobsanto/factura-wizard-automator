
/**
 * Upload Helper Functions
 * Simplified file upload functions
 */
import { EnhancedDriveService } from "@/services/drive";
import { DocumentData } from "@/types";
import { logDocumentUpload } from "./logHelpers";
import { verifyInvoiceDocument } from "@/services/gmail/attachments";

/**
 * Verify if a PDF is an invoice before processing
 */
export const verifyInvoiceFile = async (
  file: Blob
): Promise<boolean> => {
  try {
    return await verifyInvoiceDocument(file);
  } catch (error) {
    console.error("Error verifying invoice file:", error);
    return false;
  }
};

/**
 * Upload an invoice to Google Drive with automatic path and filename generation
 */
export const uploadInvoiceToDrive = async (
  file: Blob,
  docData: DocumentData
): Promise<{ success: boolean; fileId?: string; fileName?: string }> => {
  try {
    // First verify this is an invoice
    const isInvoice = await verifyInvoiceFile(file);
    if (!isInvoice) {
      console.warn("File does not appear to be an invoice");
      // Continue anyway since the user manually uploaded it
    }
    
    const driveService = EnhancedDriveService.getInstance();
    
    // Upload the file with the user folder included in the path
    const result = await driveService.uploadInvoiceToDrive({
      file,
      clientVat: docData.vatNumber,
      clientName: docData.clientName || "Άγνωστος Πελάτης",
      issuer: docData.supplier,
      invoiceNumber: docData.documentNumber,
      date: docData.date,
      amount: docData.amount.toString(),
      currency: docData.currency,
      includeUserFolder: true  // Add this parameter to include user folder in path
    });
    
    // Log the successful upload
    logDocumentUpload(docData, result.name, result.id);
    
    return {
      success: true,
      fileId: result.id,
      fileName: result.name
    };
  } catch (error) {
    console.error("Error uploading invoice:", error);
    return { success: false };
  }
};

/**
 * Upload a file to Google Drive with manual options
 */
export const uploadFile = async (
  file: Blob,
  options: {
    clientVat: string;
    clientName: string;
    issuer: string;
    invoiceNumber: string;
    date: string;
    amount: string;
    currency: string;
    includeUserFolder?: boolean;
  }
): Promise<{ success: boolean; fileId?: string; fileName?: string }> => {
  try {
    // For manual uploads, no need to verify if it's an invoice
    const driveService = EnhancedDriveService.getInstance();
    
    // Include user folder by default
    const uploadOptions = {
      ...options,
      includeUserFolder: options.includeUserFolder !== false
    };
    
    const result = await driveService.uploadInvoiceToDrive({
      file,
      ...uploadOptions
    });
    
    return {
      success: true,
      fileId: result.id,
      fileName: result.name
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false };
  }
};
