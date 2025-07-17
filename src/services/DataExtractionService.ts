import { ProcessedPdfData } from "./PdfProcessingService";

export interface InvoiceData {
  clientVat: string;
  clientName: string;
  issuer: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  currency: string;
}

/**
 * Service for handling data extraction and mapping
 */
export class DataExtractionService {
  /**
   * Map processed PDF data to invoice data format
   */
  mapToInvoiceData(processedData: ProcessedPdfData): InvoiceData {
    return {
      clientVat: processedData.vatNumber,
      clientName: processedData.clientName,
      issuer: processedData.issuer,
      invoiceNumber: processedData.documentNumber,
      date: processedData.date,
      amount: processedData.amount,
      currency: processedData.currency
    };
  }

  /**
   * Get extraction success message based on method used
   */
  getSuccessMessage(processedData: ProcessedPdfData): string {
    // Check if we have substantial data extraction
    const hasVat = processedData.vatNumber && processedData.vatNumber !== "";
    const hasClient = processedData.clientName && processedData.clientName !== "";
    const hasAmount = processedData.amount && processedData.amount !== "";
    
    if (hasVat && hasClient && hasAmount) {
      return "Τα στοιχεία του τιμολογίου εξήχθησαν επιτυχώς με AI";
    }
    
    return "Τα στοιχεία του τιμολογίου εξήχθησαν επιτυχώς με OCR";
  }

  /**
   * Validate extracted data quality
   */
  validateExtractedData(data: InvoiceData): boolean {
    // At minimum, we should have either VAT number or client name
    return !!(data.clientVat || data.clientName);
  }
}

export const dataExtractionService = new DataExtractionService();