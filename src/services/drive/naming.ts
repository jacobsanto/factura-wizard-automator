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
 * Convert month number to Greek month name
 */
function getGreekMonthName(month: string): string {
  const monthMap: Record<string, string> = {
    "01": "Ιανουάριος",
    "02": "Φεβρουάριος",
    "03": "Μάρτιος",
    "04": "Απρίλιος",
    "05": "Μάιος",
    "06": "Ιούνιος",
    "07": "Ιούλιος",
    "08": "Αύγουστος",
    "09": "Σεπτέμβριος",
    "10": "Οκτώβριος",
    "11": "Νοέμβριος",
    "12": "Δεκέμβριος",
  };
  return monthMap[month] || month;
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
 * @deprecated Use generateDrivePath and joinPathSegments instead
 */
export const determineTargetFolder = async (docData: DocumentData): Promise<string> => {
  // Extract year and month from date
  const date = new Date(docData.date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Use the new path generation
  const pathSegments = generateDrivePath({
    clientVat: docData.vatNumber,
    clientName: docData.clientName || "Άγνωστος Πελάτης", // Fallback if client name is not available
    issuer: docData.supplier,
    date: docData.date
  });
  
  return joinPathSegments(pathSegments);
};

/**
 * Generates folder path based on VAT, client name, date, and issuer
 */
export function generateDrivePath({
  clientVat,
  clientName,
  issuer,
  date,
}: {
  clientVat: string;
  clientName: string;
  issuer: string;
  date: string; // supports YYYY-MM-DD or DD/MM/YYYY
}): string[] {
  // Split date
  const parts = date.split(/[-/.]/);
  let year = "2025";
  let month = "01";

  if (parts[0].length === 4) {
    year = parts[0];
    month = parts[1];
  } else if (parts[2]?.length === 4) {
    year = parts[2];
    month = parts[1];
  }

  const formattedMonth = `${month}.${getGreekMonthName(month)}`;

  const rootFolder = "01.Λογιστήριο";
  const clientFolder = `${sanitizeText(clientName)} ΑΦΜ: ${clientVat}`;
  const typeFolder = clientVat.startsWith("EL") ? "Ενδοκοινοτικά" : "Παραστατικά εξόδων";
  const vendorFolder = sanitizeText(issuer);

  return [
    rootFolder,
    clientFolder,
    year,
    formattedMonth,
    typeFolder,
    vendorFolder,
  ];
}

/**
 * Creates a full path string from path segments
 */
export function joinPathSegments(segments: string[]): string {
  return segments.join('/') + '/';
}
