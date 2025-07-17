import { extractTextFromPdfAdvanced } from "@/utils/pdfUtils";

export interface ProcessedPdfData {
  vatNumber: string;
  clientName: string;
  issuer: string;
  documentNumber: string;
  date: string;
  amount: string;
  currency: string;
}

/**
 * Service for handling PDF processing with pattern extraction and OCR
 */
export class PdfProcessingService {
  /**
   * Process PDF with advanced OCR and pattern matching
   */
  async processWithAdvancedOcr(file: File): Promise<ProcessedPdfData> {
    console.log("Processing PDF with advanced extraction and OCR...");
    const extractedText = await extractTextFromPdfAdvanced(file);
    console.log("Advanced text extraction complete", {
      textLength: extractedText.length,
      textPreview: extractedText.substring(0, 100) + '...'
    });
    
    // Try to extract specific fields using regex patterns
    const { 
      extractVatNumber, extractClientName, extractIssuer,
      extractDate, extractInvoiceNumber, extractAmount, extractCurrency
    } = await import("@/api/extractionPatterns");
    
    const vatNumber = extractVatNumber(extractedText) || "";
    const clientName = extractClientName(extractedText) || "";
    const issuer = extractIssuer(extractedText) || "";
    const date = extractDate(extractedText) || "";
    const invoiceNumber = extractInvoiceNumber(extractedText) || "";
    const amount = extractAmount(extractedText) || "";
    const currency = extractCurrency(extractedText) || "€";
    
    return {
      vatNumber,
      clientName,
      issuer,
      documentNumber: invoiceNumber,
      date,
      amount,
      currency
    };
  }

  /**
   * Process PDF using pattern extraction and OCR
   */
  async processPdf(file: File): Promise<ProcessedPdfData | null> {
    console.log("Starting PDF parsing", { fileName: file.name });
    
    // Use advanced OCR and pattern matching
    const ocrResult = await this.processWithAdvancedOcr(file);
    console.log("Setting extracted data from patterns", ocrResult);
    return ocrResult;
  }
}

export const pdfProcessingService = new PdfProcessingService();