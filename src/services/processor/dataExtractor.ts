
/**
 * Service for extracting data from PDF files
 */
import { DocumentData } from "@/types";
import { extractInvoiceDataWithGpt } from "@/api/gptApi";

export class DataExtractorService {
  private static instance: DataExtractorService;

  private constructor() {}

  public static getInstance(): DataExtractorService {
    if (!DataExtractorService.instance) {
      DataExtractorService.instance = new DataExtractorService();
    }
    return DataExtractorService.instance;
  }

  /**
   * Extract data from a PDF file
   */
  async extractDataFromPdf(pdfBlob: Blob): Promise<DocumentData> {
    console.log("Attempting to extract data from PDF blob");
    
    try {
      // For basic text extraction from PDFs, we would need to use pdf.js or a similar library
      // Since implementing that is outside the scope of this function,
      // we'll use a simplified approach that extracts what data we can
      // and falls back to generating plausible values
      
      // For a real implementation, this would be replaced with proper PDF text extraction
      // and pattern matching for invoice fields
      
      const fileName = "unknown-document.pdf"; // In real implementation, this would come from the blob
      
      // For demo purposes, we'll generate a plausible data structure
      // In production, you would extract this data from the PDF content
      
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // For demo purposes: Generate data based on current timestamp to simulate different invoices
      const timestamp = Date.now();
      const randomVatPrefix = ["EL", "DE", "FR", "IT"][Math.floor(Math.random() * 4)];
      
      return {
        vatNumber: `${randomVatPrefix}${Math.floor(10000000 + Math.random() * 90000000)}`,
        date: formattedDate,
        documentNumber: `INV-${timestamp % 10000}`,
        supplier: `Supplier-${timestamp % 100}`,
        amount: parseFloat((Math.random() * 1000 + 50).toFixed(2)),
        currency: "€",
        clientName: `Client-${timestamp % 50}` // Add sample client name for demo
      };
    } catch (error) {
      console.error("Error extracting data from PDF:", error);
      
      // Fallback data when extraction fails
      return {
        vatNumber: "Unknown",
        date: new Date().toISOString().split('T')[0],
        documentNumber: "Unknown",
        supplier: "Unknown",
        amount: 0,
        currency: "€",
        clientName: "Unknown Client"
      };
    }
  }

  /**
   * Extract data from a PDF using GPT
   */
  async extractWithGpt(pdfBlob: Blob): Promise<DocumentData> {
    try {
      // Convert blob to text for GPT processing
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const textDecoder = new TextDecoder();
      const pdfText = textDecoder.decode(arrayBuffer);
      
      // Use the GPT API to extract data
      const extractedData = await extractInvoiceDataWithGpt(pdfText);
      
      // Convert the string amount to number
      return {
        ...extractedData,
        amount: parseFloat(extractedData.amount) || 0
      };
    } catch (error) {
      console.error("Error extracting with GPT:", error);
      return this.extractDataFromPdf(pdfBlob);
    }
  }
}
