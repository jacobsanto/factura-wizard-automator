
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

/**
 * Extract invoice data from PDF text using GPT
 */
export async function extractInvoiceDataWithGpt(pdfText: string): Promise<GptExtractedData> {
  try {
    // This is a placeholder - in a real application, you'd connect to OpenAI API
    // For now, we'll simulate the response with a mock extraction based on text patterns
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
    
    /* 
    // Real implementation with API would look like this:
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: createPrompt(pdfText)
          }
        ],
        temperature: 0.1
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
    */
  } catch (error) {
    console.error('Error extracting invoice data with GPT:', error);
    throw new Error('Failed to extract invoice data');
  }
}

// Re-export the GptExtractedData type for convenient importing elsewhere
export type { GptExtractedData };
