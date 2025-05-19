
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
   * Extract invoice data using Document AI
   */
  async extract(pdfBlob: Blob): Promise<{ data: DocumentData; confidence: number } | null> {
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
}
