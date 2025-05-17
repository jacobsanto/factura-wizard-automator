
/**
 * Upload Helper Functions
 * Simplified file upload functions
 */
import { EnhancedDriveService } from "@/services/drive";
import { DocumentData } from "@/types";
import { logDocumentUpload } from "./logHelpers";

/**
 * Upload an invoice to Google Drive with automatic path and filename generation
 */
export const uploadInvoiceToDrive = async (
  file: Blob,
  docData: DocumentData
): Promise<{ success: boolean; fileId?: string; fileName?: string; path?: string }> => {
  try {
    const driveService = EnhancedDriveService.getInstance();
    
    const result = await driveService.uploadInvoiceToDrive({
      file,
      clientVat: docData.vatNumber,
      clientName: docData.clientName || "Άγνωστος Πελάτης",
      issuer: docData.supplier,
      invoiceNumber: docData.documentNumber,
      date: docData.date,
      amount: docData.amount.toString(),
      currency: docData.currency
    });
    
    // Log the successful upload
    logDocumentUpload(docData, result.name, result.id);
    
    return {
      success: true,
      fileId: result.id,
      fileName: result.name,
      path: result.path
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
  }
): Promise<{ success: boolean; fileId?: string; fileName?: string; path?: string }> => {
  try {
    const driveService = EnhancedDriveService.getInstance();
    
    const result = await driveService.uploadInvoiceToDrive({
      file,
      ...options
    });
    
    return {
      success: true,
      fileId: result.id,
      fileName: result.name,
      path: result.path
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false };
  }
};
