
/**
 * Text extraction utilities
 */
import { DocumentData } from "@/types";
import { extractTextFromPdf, extractTextFromPdfAdvanced } from "@/utils/pdfUtils";
import { BaseExtractor } from "./BaseExtractor";

export class TextExtractor extends BaseExtractor {
  /**
   * Extract a sample of text from the PDF for language detection
   */
  async extractSampleText(pdfBlob: Blob): Promise<string> {
    try {
      // Extract the first page or first 1000 characters
      const text = await extractTextFromPdf(pdfBlob);
      return text.substring(0, 1000);
    } catch (e) {
      console.error("Error extracting sample text:", e);
      return "";
    }
  }
  
  /**
   * Extract full text from PDF
   */
  async extractFullText(pdfBlob: Blob): Promise<string> {
    try {
      return await extractTextFromPdfAdvanced(pdfBlob);
    } catch (e) {
      console.error("Error extracting full text:", e);
      return "";
    }
  }
  
  /**
   * Implementation of the abstract extract method
   * Since this is just a text extractor, we return a minimal DocumentData object
   * with default values
   */
  async extract(pdfBlob: Blob): Promise<DocumentData> {
    // This implementation returns a minimal DocumentData with the text being the only meaningful field
    // In practice, this method would rarely be called directly on TextExtractor
    const text = await this.extractFullText(pdfBlob);
    return {
      vatNumber: "Unknown",
      date: new Date().toISOString().split('T')[0],
      documentNumber: "Unknown",
      supplier: "Unknown",
      amount: 0,
      currency: "€",
      clientName: text.substring(0, 50) // Use first part of text as client name placeholder
    };
  }
}
