
/**
 * Utilities for file and folder naming
 */
import { DocumentData } from "@/types";

/**
 * Clean and normalize Greek text
 */
function sanitizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[\/\\:*?"<>|]/g, "") // remove illegal file chars
    .replace(/\s+/g, "_"); // replace spaces with underscores
}

/**
 * Normalize date to MM-DD-YYYY
 */
function normalizeDate(input: string): string {
  const parts = input.split(/[-/.]/);
  if (parts[0].length === 4) {
    // YYYY-MM-DD
    return `${parts[1]}-${parts[2]}-${parts[0]}`;
  } else if (parts[2]?.length === 4) {
    // DD/MM/YYYY or MM/DD/YYYY
    return `${parts[1]}-${parts[0]}-${parts[2]}`;
  }
  return input; // fallback
}

/**
 * Generate a standardized filename for a document
 */
export const generateFilename = async (docData: DocumentData): Promise<string> => {
  const cleanedSupplier = sanitizeText(docData.supplier);
  const cleanedNumber = sanitizeText(docData.documentNumber);
  const cleanedDate = normalizeDate(docData.date);
  const cleanedAmount = sanitizeText(docData.amount.toString());
  
  return `Παρ_${cleanedSupplier}_${cleanedNumber}_${cleanedDate}_${cleanedAmount}${docData.currency}.pdf`;
};

/**
 * Generate invoice filename with extended options
 */
export function generateInvoiceFilename({
  issuer,
  invoiceNumber,
  date,
  amount,
  currency,
}: {
  issuer: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  currency: string;
}): string {
  const cleanedIssuer = sanitizeText(issuer);
  const cleanedInvoice = sanitizeText(invoiceNumber);
  const cleanedDate = normalizeDate(date);
  const cleanedAmount = sanitizeText(amount);

  return `Παρ_${cleanedIssuer}_${cleanedInvoice}_${cleanedDate}_${cleanedAmount}${currency}.pdf`;
}

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

/**
 * Generates folder path based on VAT, date, and type
 */
export function generateDrivePath({
  customerVat,
  issuer,
  date,
}: {
  customerVat: string;
  issuer: string;
  date: string;
}): string[] {
  const folderPath = ["01.Λογιστήριο"];

  // Step 1: By Customer VAT
  folderPath.push(sanitizeText(customerVat));

  // Step 2: Extract year & month
  const parts = date.split(/[-/.]/);
  let year = "2025", month = "01";
  if (parts[0].length === 4) {
    year = parts[0];
    month = parts[1];
  } else if (parts[2]?.length === 4) {
    year = parts[2];
    month = parts[1];
  }
  folderPath.push(year);
  folderPath.push(month);

  // Step 3: Ενδοκοινοτικά / Εξοδα
  if (customerVat.startsWith("EL")) {
    folderPath.push("Ενδοκοινοτικά");
  } else {
    folderPath.push("Εξοδα");
  }

  // Step 4: Vendor folder
  folderPath.push(sanitizeText(issuer));

  return folderPath;
}

/**
 * Creates a full path string from path segments
 */
export function joinPathSegments(segments: string[]): string {
  return segments.join('/') + '/';
}
