import { extractTextFromPdf, extractTextFromPdfAdvanced } from "@/utils/pdfUtils";
import { extractInvoiceDataWithGpt, extractInvoiceDataFromPdf } from "@/api/gptApi";

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
 * Service for handling PDF processing with multiple extraction methods
 */
export class PdfProcessingService {
  /**
   * Process PDF with enhanced GPT extraction
   */
  async processWithEnhancedGpt(file: File): Promise<ProcessedPdfData | null> {
    console.log("Processing PDF with enhanced GPT extraction...");
    try {
      const extractedData = await extractInvoiceDataFromPdf(file);
      console.log("Enhanced GPT processing complete", extractedData);
      
      if (extractedData && extractedData.vatNumber !== "unknown") {
        return {
          vatNumber: extractedData.vatNumber !== "unknown" ? extractedData.vatNumber : "",
          clientName: extractedData.clientName !== "unknown" ? extractedData.clientName : "",
          issuer: extractedData.issuer !== "unknown" ? extractedData.issuer : "",
          documentNumber: extractedData.documentNumber !== "unknown" ? extractedData.documentNumber : "",
          date: extractedData.date !== "unknown" ? extractedData.date : "",
          amount: extractedData.amount !== "unknown" ? extractedData.amount : "",
          currency: extractedData.currency !== "unknown" ? extractedData.currency : "€"
        };
      }
      
      console.log("Enhanced GPT extraction didn't provide sufficient data");
      return null;
    } catch (error) {
      console.warn("Enhanced GPT extraction failed:", error);
      return null;
    }
  }

  /**
   * Process PDF with legacy GPT extraction
   */
  async processWithLegacyGpt(file: File): Promise<ProcessedPdfData | null> {
    console.log("Trying legacy GPT extraction...");
    try {
      const pdfText = await extractTextFromPdf(file);
      const extractedData = await extractInvoiceDataWithGpt(pdfText);
      console.log("Legacy GPT processing complete", extractedData);
      
      if (extractedData && extractedData.vatNumber !== "unknown") {
        return {
          vatNumber: extractedData.vatNumber !== "unknown" ? extractedData.vatNumber : "",
          clientName: extractedData.clientName !== "unknown" ? extractedData.clientName : "",
          issuer: extractedData.issuer !== "unknown" ? extractedData.issuer : "",
          documentNumber: extractedData.documentNumber !== "unknown" ? extractedData.documentNumber : "",
          date: extractedData.date !== "unknown" ? extractedData.date : "",
          amount: extractedData.amount !== "unknown" ? extractedData.amount : "",
          currency: extractedData.currency !== "unknown" ? extractedData.currency : "€"
        };
      }
      
      console.log("Legacy GPT extraction didn't provide sufficient data");
      return null;
    } catch (error) {
      console.warn("Legacy GPT extraction failed:", error);
      return null;
    }
  }

  /**
   * Process PDF with advanced OCR and pattern matching
   */
  async processWithAdvancedOcr(file: File): Promise<ProcessedPdfData> {
    console.log("Falling back to advanced extraction with OCR...");
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
   * Process PDF using all available methods in order of preference
   */
  async processPdf(file: File): Promise<ProcessedPdfData | null> {
    console.log("Starting PDF parsing", { fileName: file.name });
    
    // Try enhanced GPT first
    const enhancedResult = await this.processWithEnhancedGpt(file);
    if (enhancedResult) {
      console.log("Setting extracted data from enhanced GPT", enhancedResult);
      return enhancedResult;
    }
    
    // Try legacy GPT
    const legacyResult = await this.processWithLegacyGpt(file);
    if (legacyResult) {
      console.log("Setting extracted data from legacy GPT", legacyResult);
      return legacyResult;
    }
    
    // Fall back to advanced OCR
    const ocrResult = await this.processWithAdvancedOcr(file);
    console.log("Setting extracted data from patterns", ocrResult);
    return ocrResult;
  }
}

export const pdfProcessingService = new PdfProcessingService();