
/**
 * GPT-based extractor for invoice data
 */
import { DocumentData } from "@/types";
import { BaseExtractor } from "./BaseExtractor";
import { extractInvoiceDataFromPdf } from "@/api/gptApi";

export class GptExtractor extends BaseExtractor {
  /**
   * Extract invoice data using GPT
   */
  async extract(pdfBlob: Blob): Promise<{ data: DocumentData; confidence: number }> {
    console.log("Attempting extraction with GPT directly from PDF");
    
    try {
      const gptData = await extractInvoiceDataFromPdf(pdfBlob);
      
      // Extract and clean the VAT number as a priority
      const vatNumber = this.cleanVatNumber(gptData.vatNumber);
      
      // If AI returns meaningful data with a VAT number, use it
      if (vatNumber !== "Unknown" && 
          gptData.documentNumber !== "unknown" && 
          gptData.issuer !== "unknown") {
        
        console.log("Successfully extracted data with GPT");
        
        const aiResult: DocumentData = {
          vatNumber: vatNumber,
          date: gptData.date,
          documentNumber: gptData.documentNumber,
          supplier: gptData.issuer,
          amount: parseFloat(gptData.amount) || 0,
          currency: gptData.currency,
          clientName: gptData.clientName
        };
        
        // Calculate confidence based on language
        const containsGreek = this.containsGreekCharacters(gptData.issuer + gptData.clientName);
        const settings = this.getUserSettings();
        const preferGreekExtraction = settings.preferGreekExtraction !== false;
        const confidence = containsGreek && !preferGreekExtraction ? 70 : 85;
        
        return { data: aiResult, confidence };
      }
      
      console.log("GPT extraction didn't provide sufficient data");
      throw new Error("Insufficient data from GPT extraction");
    } catch (error) {
      console.warn("GPT extraction failed:", error);
      throw error;
    }
  }
}
