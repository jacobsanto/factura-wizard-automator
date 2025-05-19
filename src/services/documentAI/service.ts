
/**
 * Service for interacting with Google Document AI
 */
import { DocumentData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { extractVatNumber, extractClientName, extractIssuer, extractDate, extractInvoiceNumber, extractAmount, extractCurrency } from "@/api/extractionPatterns";

export class DocumentAIService {
  private static instance: DocumentAIService;

  private constructor() {
    console.log("DocumentAIService initialized");
  }

  public static getInstance(): DocumentAIService {
    if (!DocumentAIService.instance) {
      DocumentAIService.instance = new DocumentAIService();
      console.log("Created new DocumentAIService instance");
    }
    return DocumentAIService.instance;
  }

  /**
   * Check if Document AI is properly configured
   */
  public isConfigured(): boolean {
    try {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        return (
          parsedSettings.enableDocumentAI === true &&
          !!parsedSettings.documentAIProcessorId &&
          !!parsedSettings.documentAILocation
        );
      }
    } catch (e) {
      console.error("Error reading Document AI settings:", e);
    }
    return false;
  }

  /**
   * Process a PDF with Document AI
   */
  async processDocument(pdfBlob: Blob): Promise<DocumentData | null> {
    try {
      if (!this.isConfigured()) {
        console.log("Document AI is not configured, skipping");
        return null;
      }

      console.log("Converting PDF to base64 for Document AI");
      const base64Data = await this.blobToBase64(pdfBlob);

      console.log("Sending document to Document AI edge function");
      const { data, error } = await supabase.functions.invoke('document-ai-process', {
        body: { 
          fileContent: base64Data,
          mimeType: 'application/pdf'
        },
      });

      if (error) {
        console.error("Error calling Document AI edge function:", error);
        return null;
      }

      if (!data || !data.success) {
        console.warn("Document AI processing failed:", data?.error || "Unknown error");
        return null;
      }

      console.log("Document AI processed document successfully", data);

      // Map Document AI results to DocumentData
      const extractedData: DocumentData = {
        vatNumber: this.cleanVatNumber(data.vatNumber || "Unknown"),
        date: data.date || new Date().toISOString().split('T')[0],
        documentNumber: data.documentNumber || "Unknown",
        supplier: data.supplier || "Άγνωστος Προμηθευτής",
        amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount) || 0,
        currency: data.currency || "€",
        clientName: data.clientName || "Άγνωστος Πελάτης"
      };

      console.log("Extracted data from Document AI:", extractedData);
      return extractedData;
    } catch (error) {
      console.error("Error processing document with Document AI:", error);
      return null;
    }
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
   * Convert Blob to base64 string
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract the base64 data without the prefix
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
