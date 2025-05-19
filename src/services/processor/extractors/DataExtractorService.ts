
/**
 * Service for extracting data from PDF files
 */
import { DocumentData, ExtractionResult } from "@/types";
import { PatternExtractor } from "./PatternExtractor";
import { GptExtractor } from "./GptExtractor";
import { DocumentAiExtractor } from "./DocumentAiExtractor";
import { TextExtractor } from "./TextExtractor";
import { BaseExtractor } from "./BaseExtractor";

export class DataExtractorService extends BaseExtractor {
  private static instance: DataExtractorService;
  private patternExtractor: PatternExtractor;
  private gptExtractor: GptExtractor;
  private documentAiExtractor: DocumentAiExtractor;
  private textExtractor: TextExtractor;

  private constructor() {
    super();
    console.log("DataExtractorService initialized");
    this.patternExtractor = new PatternExtractor();
    this.gptExtractor = new GptExtractor();
    this.documentAiExtractor = new DocumentAiExtractor();
    this.textExtractor = new TextExtractor();
  }

  public static getInstance(): DataExtractorService {
    if (!DataExtractorService.instance) {
      DataExtractorService.instance = new DataExtractorService();
      console.log("Created new DataExtractorService instance");
    }
    return DataExtractorService.instance;
  }

  /**
   * Extract data from a PDF file using multi-tiered approach
   * with priority on VAT number extraction
   * (Implementation of the abstract method in BaseExtractor)
   */
  async extract(pdfBlob: Blob): Promise<DocumentData> {
    // This method is required by the BaseExtractor abstract class
    // but we'll just delegate to extractDataFromPdf
    return this.extractDataFromPdf(pdfBlob);
  }

  /**
   * Extract data from a PDF file using multi-tiered approach
   * with priority on VAT number extraction
   */
  async extractDataFromPdf(pdfBlob: Blob): Promise<DocumentData> {
    console.log("Attempting to extract data from PDF blob", {
      type: pdfBlob.type,
      size: pdfBlob.size
    });
    
    try {
      // Get user settings
      const settings = this.getUserSettings();
      const enableAI = settings.enableAI !== false;
      const enableDocumentAI = settings.enableDocumentAI === true;
      const preferGreekExtraction = settings.preferGreekExtraction !== false;
      const documentAIPreferredForGreek = settings.documentAIPreferredForGreek === true;
      
      // Extract text for language detection
      const sampleText = await this.textExtractor.extractSampleText(pdfBlob);
      const containsGreek = this.containsGreekCharacters(sampleText);
      console.log("Document language detection:", { containsGreek });
      
      // Start extraction process
      const results: ExtractionResult[] = [];
      
      // Step 1: Try Document AI if enabled and preferred for Greek documents
      if (enableDocumentAI && (documentAIPreferredForGreek && containsGreek)) {
        console.log("Attempting Document AI extraction (preferred for Greek)");
        const documentAIResult = await this.documentAiExtractor.extract(pdfBlob);
        
        if (documentAIResult) {
          console.log("Document AI extraction successful");
          results.push({
            data: documentAIResult.data,
            confidence: documentAIResult.confidence,
            method: 'documentAi'
          });
        }
      }
      
      // Step 2: Try using AI-powered extraction if enabled
      if (enableAI) {
        try {
          const gptResult = await this.gptExtractor.extract(pdfBlob);
          results.push({
            data: gptResult.data,
            confidence: gptResult.confidence,
            method: 'gpt'
          });
        } catch (aiError) {
          console.warn("GPT extraction failed:", aiError);
        }
      }
      
      // Step 3: Try Document AI if enabled but not already tried
      if (enableDocumentAI && !(documentAIPreferredForGreek && containsGreek) && results.length === 0) {
        console.log("Attempting Document AI extraction as fallback");
        const documentAIResult = await this.documentAiExtractor.extract(pdfBlob);
        
        if (documentAIResult) {
          console.log("Document AI fallback extraction successful");
          results.push({
            data: documentAIResult.data,
            confidence: documentAIResult.confidence,
            method: 'documentAi'
          });
        }
      }
      
      // Step 4: Try pattern matching as a fallback
      console.log("Attempting pattern matching extraction");
      const extractedText = await this.textExtractor.extractFullText(pdfBlob);
      console.log("Text extracted successfully", {
        textLength: extractedText.length,
        textSample: extractedText.substring(0, 100) + "..."
      });
      
      // Extract data using patterns
      const patternResult = await this.patternExtractor.extract(extractedText);
      
      // Add pattern matching result with lower confidence
      results.push({
        data: patternResult,
        confidence: patternResult.vatNumber !== "Unknown" ? 65 : 40,
        method: 'pattern'
      });
      
      // Select the best result based on confidence
      results.sort((a, b) => b.confidence - a.confidence);
      console.log("Extraction results sorted by confidence:", 
        results.map(r => ({ method: r.method, confidence: r.confidence, vat: r.data.vatNumber }))
      );
      
      // Return the highest confidence result
      const bestResult = results[0].data;
      console.log("Selected best extraction result:", { 
        method: results[0].method, 
        confidence: results[0].confidence,
        result: bestResult
      });
      
      return bestResult;
      
    } catch (error) {
      console.error("Error extracting data from PDF:", error);
      
      // Fallback data when extraction fails
      const fallbackData = {
        vatNumber: "Unknown",
        date: new Date().toISOString().split('T')[0],
        documentNumber: "Unknown",
        supplier: "Unknown",
        amount: 0,
        currency: "€",
        clientName: "Unknown Client"
      };
      
      console.log("Using fallback data:", fallbackData);
      return fallbackData;
    }
  }

  /**
   * Extract data from a PDF using GPT
   */
  async extractWithGpt(pdfBlob: Blob): Promise<DocumentData> {
    try {
      const result = await this.gptExtractor.extract(pdfBlob);
      return result.data;
    } catch (error) {
      console.error("Error extracting with GPT:", error);
      console.log("Falling back to basic extraction method");
      throw error; // Let the calling function handle the fallback
    }
  }
}
