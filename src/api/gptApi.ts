
/**
 * GPT API for invoice data extraction
 */

import { createPrompt } from './promptEngineering';
import { 
  extractVatNumber,
  extractClientName,
  extractIssuer,
  extractDate,
  extractInvoiceNumber,
  extractAmount,
  extractCurrency
} from './extractionPatterns';
import { GptExtractedData } from './types';
import { extractTextFromPdf } from '@/utils/pdfUtils';

/**
 * Extract invoice data from PDF text using GPT
 */
export async function extractInvoiceDataWithGpt(pdfText: string): Promise<GptExtractedData> {
  try {
    // Try connecting to the API endpoint first
    try {
      const response = await fetch("/api/gpt-parse-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: pdfText,
          prompt: createPrompt(pdfText)
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (apiError) {
      console.log("GPT API endpoint not available, falling back to pattern extraction", apiError);
    }
    
    // Fallback to pattern matching if the API call fails
    const mockExtract: GptExtractedData = {
      vatNumber: extractVatNumber(pdfText) || "unknown",
      clientName: extractClientName(pdfText) || "unknown",
      issuer: extractIssuer(pdfText) || "unknown",
      date: extractDate(pdfText) || "unknown",
      documentNumber: extractInvoiceNumber(pdfText) || "unknown",
      amount: extractAmount(pdfText) || "unknown",
      currency: extractCurrency(pdfText) || "€",
    };

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockExtract;
  } catch (error) {
    console.error('Error extracting invoice data with GPT:', error);
    throw new Error('Failed to extract invoice data');
  }
}

/**
 * Extract invoice data directly from a PDF file using GPT
 */
export async function extractInvoiceDataFromPdf(pdfFile: File | Blob): Promise<GptExtractedData> {
  try {
    // First try using the API endpoint directly with the file
    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append(
      "prompt",
      `Από το παραστατικό εξήγαγε τα εξής πεδία:
- ΑΦΜ πελάτη
- Επωνυμία πελάτη
- Επωνυμία εκδότη
- Ημερομηνία παραστατικού
- Αριθμός παραστατικού
- Συνολικό ποσό με σύμβολο νομίσματος

Απάντησε μόνο σε JSON:
{
  "vatNumber": "",
  "clientName": "",
  "issuer": "",
  "documentNumber": "",
  "date": "",
  "amount": "",
  "currency": ""
}`
    );

    try {
      const response = await fetch("/api/gpt-parse-pdf", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (apiError) {
      console.log("Direct file upload to GPT API failed, falling back to text extraction", apiError);
    }
    
    // Fallback: extract text from PDF and then use the text-based method
    const text = await extractTextFromPdf(pdfFile);
    return await extractInvoiceDataWithGpt(text);
  } catch (error) {
    console.error('Error extracting invoice data from PDF:', error);
    throw new Error('Failed to extract invoice data from PDF');
  }
}

// Re-export the GptExtractedData type for convenient importing elsewhere
export type { GptExtractedData };
