
/**
 * Path Helper Functions
 * Simple wrapper functions for generating Drive paths and filenames
 */
import { EnhancedDriveService } from "@/services/drive";
import { generateDrivePath, generateInvoiceFilename, joinPathSegments } from "@/services/drive/naming";
import { DocumentData } from "@/types";

/**
 * Generate a Google Drive path for an invoice
 */
export const createDrivePath = (options: {
  clientVat: string;
  clientName: string;
  issuer: string;
  date: string;
}): string => {
  const pathSegments = generateDrivePath(options);
  return joinPathSegments(pathSegments);
};

/**
 * Generate a filename for an invoice
 */
export const createFilename = async (docData: DocumentData): Promise<string> => {
  const driveService = EnhancedDriveService.getInstance();
  return await driveService.generateFilename(docData);
};

/**
 * Generate a filename for an invoice with options
 */
export const createFilenameWithOptions = (options: {
  clientVat: string;
  issuer: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  currency: string;
}): string => {
  return generateInvoiceFilename(options);
};
