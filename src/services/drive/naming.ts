
/**
 * Utilities for file and folder naming
 */
import { DocumentData } from "@/types";

/**
 * Generate a standardized filename for a document
 */
export const generateFilename = async (docData: DocumentData): Promise<string> => {
  // Format the date from YYYY-MM-DD to YYYYMMDD
  const formattedDate = docData.date.replace(/-/g, '');
  
  // Generate filename according to specified format
  return `Παρ_${docData.vatNumber}_${docData.supplier}_${docData.documentNumber}_${formattedDate}_${docData.amount}${docData.currency}.pdf`;
};

/**
 * Determine target folder based on document data
 */
export const determineTargetFolder = async (docData: DocumentData): Promise<string> => {
  // Extract year and month from date
  const date = new Date(docData.date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const yearMonth = `${year}-${month}`;
  
  // Determine base path depending on VAT number
  if (docData.vatNumber.startsWith('EL')) {
    return `01.Λογιστήριο/Ενδοκοινοτικά/${yearMonth}/`;
  } else {
    return `01.Λογιστήριο/Παραστατικά Εξόδων/${yearMonth}/`;
  }
};
