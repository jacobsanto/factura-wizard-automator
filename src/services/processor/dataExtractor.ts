
/**
 * Service for extracting data from PDF files
 */
import { DocumentData, ExtractionResult } from "@/types";
import { extractInvoiceDataWithGpt, extractInvoiceDataFromPdf } from "@/api/gptApi";
import { extractTextFromPdf, extractTextFromPdfAdvanced } from "@/utils/pdfUtils";
import { 
  extractVatNumber,
  extractClientName,
  extractIssuer,
  extractDate,
  extractInvoiceNumber,
  extractAmount,
  extractCurrency
} from "@/api/extractionPatterns";
import { DocumentAIService } from "../documentAI";

export class DataExtractorService {
  private static instance: DataExtractorService;
  private documentAIService: DocumentAIService;

  private constructor() {
    console.log("DataExtractorService initialized");
    this.documentAIService = DocumentAIService.getInstance();
  }

  public static getInstance(): DataExtractorService {
    if (!DataExtractorService.instance) {
      DataExtractorService.instance = new DataExtractorService();
      console.log("Created new DataExtractorService instance");
    }
    return DataExtractorService.instance;
  }

  /**
   * Clean and normalize VAT number
   */
  private cleanVatNumber(vatNumber: string): string {
    if (!vatNumber || vatNumber === "unknown") return "Unknown";
    
    // Remove common prefixes and non-alphanumeric characters
    return vatNumber
      .replace(/^(ΑΦΜ|ΑΦΜ:|Α\.?Φ\.?Μ\.?|VAT|VAT:)\s*/i, '')
      .replace(/[^0-9A-Za-z]/g, '')
      .trim();
  }

  /**
   * Check if text contains Greek characters
   */
  private containsGreekCharacters(text: string): boolean {
    return /[\u0370-\u03FF\u1F00-\u1FFF]/.test(text);
  }

  /**
   * Get user settings from localStorage
   */
  private getUserSettings() {
    try {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (e) {
      console.error("Error reading settings:", e);
    }
    return {
      enableAI: true,
      enableDocumentAI: false,
      preferGreekExtraction: true,
      documentAIPreferredForGreek: false,
      aiConfidenceThreshold: 70
    };
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
      const sampleText = await this.extractSampleText(pdfBlob);
      const containsGreek = this.containsGreekCharacters(sampleText);
      console.log("Document language detection:", { containsGreek });
      
      // Start extraction process
      const results: ExtractionResult[] = [];
      
      // Step 1: Try Document AI if enabled and preferred for Greek documents
      if (enableDocumentAI && (documentAIPreferredForGreek && containsGreek)) {
        console.log("Attempting Document AI extraction (preferred for Greek)");
        const documentAIData = await this.documentAIService.processDocument(pdfBlob);
        
        if (documentAIData && documentAIData.vatNumber !== "Unknown") {
          console.log("Document AI extraction successful");
          results.push({
            data: documentAIData,
            confidence: 90, // High confidence for Document AI on Greek documents
            method: 'documentAi'
          });
        } else {
          console.log("Document AI extraction failed or returned insufficient data");
        }
      }
      
      // Step 2: Try using AI-powered extraction if enabled
      if (enableAI) {
        try {
          console.log("Attempting extraction with GPT directly from PDF");
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
            
            // Add to results with confidence based on language
            results.push({
              data: aiResult,
              confidence: containsGreek && !preferGreekExtraction ? 70 : 85,
              method: 'gpt'
            });
          } else {
            console.log("GPT extraction didn't provide sufficient data");
          }
        } catch (aiError) {
          console.warn("GPT extraction failed:", aiError);
        }
      }
      
      // Step 3: Try Document AI if enabled but not already tried
      if (enableDocumentAI && !(documentAIPreferredForGreek && containsGreek) && results.length === 0) {
        console.log("Attempting Document AI extraction as fallback");
        const documentAIData = await this.documentAIService.processDocument(pdfBlob);
        
        if (documentAIData && documentAIData.vatNumber !== "Unknown") {
          console.log("Document AI fallback extraction successful");
          results.push({
            data: documentAIData,
            confidence: containsGreek ? 85 : 75,
            method: 'documentAi'
          });
        } else {
          console.log("Document AI fallback extraction failed or returned insufficient data");
        }
      }
      
      // Step 4: Try pattern matching as a fallback
      console.log("Attempting pattern matching extraction");
      const extractedText = await extractTextFromPdfAdvanced(pdfBlob);
      console.log("Text extracted successfully", {
        textLength: extractedText.length,
        textSample: extractedText.substring(0, 100) + "..."
      });
      
      // Extract data using patterns
      const rawVatNumber = extractVatNumber(extractedText);
      const vatNumber = this.cleanVatNumber(rawVatNumber || "Unknown");
      const clientName = extractClientName(extractedText) || "Άγνωστος Πελάτης";
      const issuer = extractIssuer(extractedText) || "Άγνωστος Προμηθευτής";
      const date = extractDate(extractedText) || new Date().toISOString().split('T')[0];
      const documentNumber = extractInvoiceNumber(extractedText) || "Unknown";
      const amountString = extractAmount(extractedText) || "0";
      const amount = parseFloat(amountString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      const currencyStr = extractCurrency(extractedText) || "€";
      
      const patternResult: DocumentData = {
        vatNumber,
        date,
        documentNumber,
        supplier: issuer,
        amount,
        currency: currencyStr,
        clientName
      };
      
      // Add pattern matching result with lower confidence
      results.push({
        data: patternResult,
        confidence: vatNumber !== "Unknown" ? 65 : 40,
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
   * Extract a sample of text from the PDF for language detection
   */
  private async extractSampleText(pdfBlob: Blob): Promise<string> {
    try {
      // Extract the first page or first 1000 characters
      // FIX: Removing the second argument that causes the TypeScript error
      const text = await extractTextFromPdf(pdfBlob);
      return text.substring(0, 1000);
    } catch (e) {
      console.error("Error extracting sample text:", e);
      return "";
    }
  }

  /**
   * Extract data from a PDF using GPT
   */
  async extractWithGpt(pdfBlob: Blob): Promise<DocumentData> {
    console.log("Attempting to extract data from PDF using GPT");
    try {
      // Use the direct PDF method
      const extractedData = await extractInvoiceDataFromPdf(pdfBlob);
      
      console.log("GPT extraction returned data:", extractedData);
      
      // Clean the VAT number
      const vatNumber = this.cleanVatNumber(extractedData.vatNumber);
      
      // Convert the string amount to number and ensure supplier field exists
      const resultData = {
        vatNumber,
        date: extractedData.date,
        documentNumber: extractedData.documentNumber,
        supplier: extractedData.issuer, // Map issuer to supplier for DocumentData compatibility
        amount: parseFloat(extractedData.amount) || 0,
        currency: extractedData.currency,
        clientName: extractedData.clientName
      };
      
      console.log("Processed GPT extraction result:", resultData);
      return resultData;
    } catch (error) {
      console.error("Error extracting with GPT:", error);
      console.log("Falling back to basic extraction method");
      throw error; // Let the calling function handle the fallback
    }
  }
}
