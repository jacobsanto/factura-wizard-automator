
/**
 * Service for extracting data from PDF files
 */
import { DocumentData, ExtractionResult } from "@/types";
import { PatternExtractor } from "./PatternExtractor";
// AI extractors removed
import { TextExtractor } from "./TextExtractor";
import { BaseExtractor } from "./BaseExtractor";

export class DataExtractorService extends BaseExtractor {
  private static instance: DataExtractorService;
  private patternExtractor: PatternExtractor;
  private textExtractor: TextExtractor;

  private constructor() {
    super();
    console.log("DataExtractorService initialized");
    this.patternExtractor = new PatternExtractor();
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
      const preferGreekExtraction = settings.preferGreekExtraction !== false;
      
      // Extract text for language detection
      const sampleText = await this.textExtractor.extractSampleText(pdfBlob);
      const containsGreek = this.containsGreekCharacters(sampleText);
      console.log("Document language detection:", { containsGreek });
      
      // Start extraction process
      const results: ExtractionResult[] = [];
      
      // Use pattern matching extraction
      console.log("Attempting pattern matching extraction");
      const extractedText = await this.textExtractor.extractFullText(pdfBlob);
      console.log("Text extracted successfully", {
        textLength: extractedText.length,
        textSample: extractedText.substring(0, 100) + "..."
      });
      
      // Extract data using patterns
      const patternResult = await this.patternExtractor.extract(extractedText);
      
      // Add pattern matching result
      results.push({
        data: patternResult,
        confidence: patternResult.vatNumber !== "Unknown" ? 65 : 40,
        method: 'pattern'
      });
      
      // Return the pattern result
      const bestResult = results[0].data;
      console.log("Selected extraction result:", { 
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

  // AI extraction methods removed
}
