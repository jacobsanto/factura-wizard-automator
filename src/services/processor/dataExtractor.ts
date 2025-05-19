
/**
 * Service for extracting data from PDF files
 */
import { DocumentData } from "@/types";
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
import { useSettings } from "@/contexts/SettingsContext";

export class DataExtractorService {
  private static instance: DataExtractorService;

  private constructor() {
    console.log("DataExtractorService initialized");
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
   * Extract data from a PDF file using multi-tiered approach
   * with priority on VAT number extraction
   */
  async extractDataFromPdf(pdfBlob: Blob): Promise<DocumentData> {
    console.log("Attempting to extract data from PDF blob", {
      type: pdfBlob.type,
      size: pdfBlob.size
    });
    
    try {
      // Get user settings to check if AI extraction is enabled
      let enableAI = true;
      let preferGreekExtraction = true;
      
      try {
        // Try to get settings from localStorage directly since we can't use React hooks here
        const savedSettings = localStorage.getItem("userSettings");
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          enableAI = parsedSettings.enableAI !== false; // Default to true if not specified
          preferGreekExtraction = parsedSettings.preferGreekExtraction !== false; // Default to true
        }
      } catch (e) {
        console.error("Error reading settings:", e);
      }
      
      // Step 1: Try using AI-powered extraction if enabled
      if (enableAI) {
        try {
          console.log("Attempting extraction with AI directly from PDF");
          const gptData = await extractInvoiceDataFromPdf(pdfBlob);
          
          // Extract and clean the VAT number as a priority
          const vatNumber = this.cleanVatNumber(gptData.vatNumber);
          
          // If AI returns meaningful data with a VAT number, use it
          if (vatNumber !== "Unknown" && 
              gptData.documentNumber !== "unknown" && 
              gptData.issuer !== "unknown") {
            
            console.log("Successfully extracted data with AI", gptData);
            console.log("Extracted VAT number:", vatNumber);
            
            return {
              vatNumber: vatNumber,
              date: gptData.date,
              documentNumber: gptData.documentNumber,
              supplier: gptData.issuer,
              amount: parseFloat(gptData.amount) || 0,
              currency: gptData.currency,
              clientName: gptData.clientName
            };
          } else {
            console.log("AI extraction didn't provide sufficient data, trying other methods");
          }
        } catch (aiError) {
          console.warn("AI extraction failed, falling back to other methods", aiError);
        }
      }
      
      // Step 2: Try pure text extraction with pattern matching
      console.log("Attempting multi-tiered extraction with PDF.js");
      const extractedText = await extractTextFromPdfAdvanced(pdfBlob);
      console.log("Text extracted successfully", {
        textLength: extractedText.length,
        textSample: extractedText.substring(0, 100) + "..."
      });
      
      // Priority 1: Extract VAT number first
      const rawVatNumber = extractVatNumber(extractedText);
      const vatNumber = this.cleanVatNumber(rawVatNumber || "Unknown");
      console.log("Extracted VAT number:", vatNumber);
      
      // Extract remaining data
      const clientName = extractClientName(extractedText) || "Άγνωστος Πελάτης";
      const issuer = extractIssuer(extractedText) || "Άγνωστος Προμηθευτής";
      const date = extractDate(extractedText) || new Date().toISOString().split('T')[0];
      const documentNumber = extractInvoiceNumber(extractedText) || "Unknown";
      const amountString = extractAmount(extractedText) || "0";
      const amount = parseFloat(amountString.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      const currencyStr = extractCurrency(extractedText) || "€";
      
      const extractedData = {
        vatNumber,
        date,
        documentNumber,
        supplier: issuer,
        amount,
        currency: currencyStr,
        clientName
      };

      console.log("Successfully extracted data from PDF using patterns:", extractedData);
      return extractedData;
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
