
/**
 * Pattern-based extractor for invoice data
 */
import { DocumentData } from "@/types";
import { BaseExtractor } from "./BaseExtractor";
import { 
  extractVatNumber,
  extractClientName,
  extractIssuer,
  extractDate,
  extractInvoiceNumber,
  extractAmount,
  extractCurrency
} from "@/api/extractionPatterns";

export class PatternExtractor extends BaseExtractor {
  /**
   * Extract invoice data using regex patterns
   */
  async extract(text: string): Promise<DocumentData> {
    console.log("Extracting data using pattern matching");
    
    // Extract data using patterns
    const rawVatNumber = extractVatNumber(text);
    const vatNumber = this.cleanVatNumber(rawVatNumber || "Unknown");
    const clientName = extractClientName(text) || "Άγνωστος Πελάτης";
    const issuer = extractIssuer(text) || "Άγνωστος Προμηθευτής";
    const date = extractDate(text) || new Date().toISOString().split('T')[0];
    const documentNumber = extractInvoiceNumber(text) || "Unknown";
    const amountString = extractAmount(text) || "0";
    const amount = parseFloat(amountString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const currencyStr = extractCurrency(text) || "€";
    
    return {
      vatNumber,
      date,
      documentNumber,
      supplier: issuer,
      amount,
      currency: currencyStr,
      clientName
    };
  }
}
