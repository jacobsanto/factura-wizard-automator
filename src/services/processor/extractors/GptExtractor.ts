
/**
 * GPT-based extractor for invoice data
 */
import { DocumentData } from "@/types";
import { BaseExtractor } from "./BaseExtractor";
import { extractInvoiceDataFromPdf } from "@/api/gptApi";

export class GptExtractor extends BaseExtractor {
  /**
   * Extract invoice data using GPT with confidence scoring
   * This is an internal method that returns both data and confidence
   */
  async extractWithConfidence(pdfBlob: Blob): Promise<{ data: DocumentData; confidence: number }> {
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
        
        // Calculate confidence based on language and content quality
        const containsGreek = this.containsGreekCharacters(gptData.issuer + gptData.clientName);
        const settings = this.getUserSettings();
        const preferGreekExtraction = settings.preferGreekExtraction !== false;
        
        // Adjust confidence scoring based on content completeness and language
        let confidence = 85; // Base confidence
        
        // Document quality factors
        if (vatNumber.length === 9 && !isNaN(Number(vatNumber))) {
          confidence += 5; // Valid VAT format
        }
        
        if (gptData.date && gptData.date !== "unknown") {
          confidence += 3; // Has date
        }
        
        if (gptData.amount && gptData.amount !== "unknown") {
          confidence += 3; // Has amount
        }
        
        // Language and preference adjustments
        if (containsGreek) {
          if (preferGreekExtraction) {
            confidence += 5; // Preferred language with Greek preference enabled
          } else {
            confidence -= 5; // Greek document but preference disabled
          }
        }
        
        // Cap confidence between 50-95
        confidence = Math.min(95, Math.max(50, confidence));
        
        return { data: aiResult, confidence };
      }
      
      console.log("GPT extraction didn't provide sufficient data");
      throw new Error("Insufficient data from GPT extraction");
    } catch (error) {
      console.warn("GPT extraction failed:", error);
      throw error;
    }
  }
  
  /**
   * Implementation of the abstract extract method
   * This is the primary method that follows the BaseExtractor interface
   */
  async extract(pdfBlob: Blob): Promise<DocumentData> {
    try {
      const result = await this.extractWithConfidence(pdfBlob);
      return result.data;
    } catch (error) {
      // Return a default DocumentData object if extraction fails
      return {
        vatNumber: "Unknown",
        date: new Date().toISOString().split('T')[0],
        documentNumber: "Unknown",
        supplier: "Unknown",
        amount: 0,
        currency: "€",
        clientName: "Unknown"
      };
    }
  }
}
