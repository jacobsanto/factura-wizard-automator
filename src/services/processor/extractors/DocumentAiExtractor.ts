
/**
 * Document AI extractor for invoice data
 */
import { DocumentData } from "@/types";
import { BaseExtractor } from "./BaseExtractor";
import { DocumentAIService } from "../../documentAI";

export class DocumentAiExtractor extends BaseExtractor {
  private documentAIService: DocumentAIService;
  
  constructor() {
    super();
    this.documentAIService = DocumentAIService.getInstance();
  }
  
  /**
   * Extract invoice data using Document AI with confidence scoring
   * This is an internal method that returns both data and confidence
   */
  async extractWithConfidence(pdfBlob: Blob): Promise<{ data: DocumentData; confidence: number } | null> {
    console.log("Attempting Document AI extraction");
    
    try {
      const documentAIData = await this.documentAIService.processDocument(pdfBlob);
      
      if (documentAIData && documentAIData.vatNumber !== "Unknown") {
        console.log("Document AI extraction successful");
        
        // Calculate confidence based on language
        const containsGreek = this.containsGreekCharacters(
          documentAIData.supplier + documentAIData.clientName
        );
        const settings = this.getUserSettings();
        const documentAIPreferredForGreek = settings.documentAIPreferredForGreek === true;
        
        let confidence = 75;
        if (containsGreek) {
          confidence = documentAIPreferredForGreek ? 90 : 85;
        }
        
        return {
          data: documentAIData,
          confidence
        };
      }
      
      console.log("Document AI extraction failed or returned insufficient data");
      return null;
    } catch (error) {
      console.error("Document AI extraction error:", error);
      return null;
    }
  }
  
  /**
   * Implementation of the abstract extract method
   * This is the primary method that follows the BaseExtractor interface
   */
  async extract(pdfBlob: Blob): Promise<DocumentData> {
    const result = await this.extractWithConfidence(pdfBlob);
    
    if (result) {
      return result.data;
    }
    
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
