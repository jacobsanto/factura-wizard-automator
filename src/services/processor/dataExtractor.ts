
/**
 * Service for extracting data from PDF files
 */
import { DocumentData } from "@/types";
import { extractInvoiceDataWithGpt } from "@/api/gptApi";
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
   * Extract data from a PDF file using multi-tiered approach
   */
  async extractDataFromPdf(pdfBlob: Blob): Promise<DocumentData> {
    console.log("Attempting to extract data from PDF blob", {
      type: pdfBlob.type,
      size: pdfBlob.size
    });
    
    try {
      // First try using GPT extraction (highest accuracy)
      try {
        console.log("Attempting extraction with GPT");
        const gptData = await this.extractWithGpt(pdfBlob);
        
        // If GPT returns meaningful data, use it
        if (gptData.vatNumber !== "Unknown" && 
            gptData.documentNumber !== "Unknown" && 
            gptData.clientName !== "Unknown Client") {
          
          console.log("Successfully extracted data with GPT", gptData);
          return gptData;
        } else {
          console.log("GPT extraction didn't provide sufficient data, falling back to other methods");
        }
      } catch (gptError) {
        console.warn("GPT extraction failed, falling back to other methods", gptError);
      }
      
      // If GPT fails, try multi-tiered extraction with PDF.js and OCR
      console.log("Attempting multi-tiered extraction with PDF.js and OCR");
      const extractedText = await extractTextFromPdfAdvanced(pdfBlob);
      console.log("Text extracted successfully", {
        textLength: extractedText.length,
        textSample: extractedText.substring(0, 100) + "..."
      });
      
      // Extract data using patterns
      const vatNumber = extractVatNumber(extractedText) || "Unknown";
      const clientName = extractClientName(extractedText) || "Unknown Client";
      const issuer = extractIssuer(extractedText) || "Unknown";
      const date = extractDate(extractedText) || new Date().toISOString().split('T')[0];
      const documentNumber = extractInvoiceNumber(extractedText) || "Unknown";
      const amountString = extractAmount(extractedText) || "0";
      const amount = parseFloat(amountString) || 0;
      const currency = extractCurrency(extractedText) || "€";
      
      const extractedData = {
        vatNumber,
        date,
        documentNumber,
        supplier: issuer,
        amount,
        currency,
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
      // First get the text from the PDF
      const pdfText = await extractTextFromPdf(pdfBlob);
      
      console.log("PDF converted to text, sending to GPT API", { 
        textLength: pdfText.length,
        excerpt: pdfText.substring(0, 100) + '...'
      });
      
      // Use the GPT API to extract data
      const extractedData = await extractInvoiceDataWithGpt(pdfText);
      
      console.log("GPT API returned data:", extractedData);
      
      // Convert the string amount to number and ensure supplier field exists
      const resultData = {
        ...extractedData,
        amount: parseFloat(extractedData.amount) || 0,
        supplier: extractedData.issuer // Map issuer to supplier for DocumentData compatibility
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
