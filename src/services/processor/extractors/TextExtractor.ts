
/**
 * Text extraction utilities
 */
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
  
  // This method doesn't actually extract document data, it only extracts text
  async extract(pdfBlob: Blob): Promise<string> {
    return this.extractFullText(pdfBlob);
  }
}
