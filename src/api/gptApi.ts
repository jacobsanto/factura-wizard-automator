
/**
 * GPT API for invoice data extraction
 */

import { createPrompt, createGreekPrompt } from './promptEngineering';
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
import { supabase } from "@/integrations/supabase/client";

// Define a simple cache to avoid repeated API calls
const extractionCache = new Map<string, GptExtractedData>();

/**
 * Extract invoice data from PDF text using GPT
 */
export async function extractInvoiceDataWithGpt(pdfText: string): Promise<GptExtractedData> {
  try {
    // Generate a simple hash for the PDF text to use as cache key
    const cacheKey = await generateSimpleHash(pdfText);
    
    // Check cache first
    if (extractionCache.has(cacheKey)) {
      console.log("Using cached extraction result");
      return extractionCache.get(cacheKey)!;
    }
    
    console.log("Extracting invoice data with GPT...");
    
    // Detect if text contains Greek characters to use specialized prompt
    const containsGreekCharacters = /[\u0370-\u03FF\u1F00-\u1FFF]/.test(pdfText);
    const prompt = containsGreekCharacters ? createGreekPrompt(pdfText) : createPrompt(pdfText);
    
    // Try calling our Supabase Edge Function first
    try {
      console.log("Calling invoice-gpt edge function...");
      
      const { data, error } = await supabase.functions.invoke('invoice-gpt', {
        body: { text: pdfText, prompt },
      });
      
      if (error) {
        console.error("Error calling invoice-gpt edge function:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }
      
      if (data && !data.error) {
        console.log("Successfully extracted data with OpenAI:", data);
        
        // Cache the result
        extractionCache.set(cacheKey, data);
        
        return data;
      }
      
      console.warn("Edge function returned error or no data:", data?.error || "No data");
      throw new Error(data?.error || "Failed to extract data");
      
    } catch (supabaseError) {
      console.warn("Supabase edge function failed, trying fallback API:", supabaseError);
      
      // Try with the /api/gpt-parse-pdf endpoint as fallback
      try {
        const response = await fetch("/api/gpt-parse-pdf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: pdfText,
            prompt
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Fallback API returned data:", data);
          
          // Cache the result
          extractionCache.set(cacheKey, data);
          
          return data;
        }
        
        throw new Error(`API response not OK: ${response.status}`);
      } catch (apiError) {
        console.log("All API endpoints failed, falling back to pattern extraction", apiError);
      }
    }
    
    // Fallback to pattern matching if both API calls fail
    const mockExtract: GptExtractedData = {
      vatNumber: extractVatNumber(pdfText) || "unknown",
      clientName: extractClientName(pdfText) || "unknown",
      issuer: extractIssuer(pdfText) || "unknown",
      date: extractDate(pdfText) || "unknown",
      documentNumber: extractInvoiceNumber(pdfText) || "unknown",
      amount: extractAmount(pdfText) || "unknown",
      currency: extractCurrency(pdfText) || "€",
    };

    console.log("Using pattern extraction result:", mockExtract);
    
    // Cache the pattern extraction result too
    extractionCache.set(cacheKey, mockExtract);
    
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
    console.log("Extracting text from PDF file before sending to GPT");
    // Extract text from PDF and then use the text-based method
    const text = await extractTextFromPdf(pdfFile);
    console.log(`Extracted ${text.length} characters from PDF`);
    
    return await extractInvoiceDataWithGpt(text);
  } catch (error) {
    console.error('Error extracting invoice data from PDF:', error);
    throw new Error('Failed to extract invoice data from PDF');
  }
}

/**
 * Generate a simple hash for a string for caching purposes
 */
async function generateSimpleHash(text: string): Promise<string> {
  // Take a sample of the text to create a fingerprint
  // This is a simple approach - a real implementation might use a proper hashing algorithm
  const sampleSize = 500;
  const textSample = text.length > sampleSize 
    ? text.substring(0, 100) + text.substring(Math.floor(text.length / 2), Math.floor(text.length / 2) + 100) + text.substring(text.length - 100)
    : text;
  
  // Use SubtleCrypto API if available for a more robust hash
  if (window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(textSample);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback if SubtleCrypto fails
      console.warn("SubtleCrypto hash failed, using fallback:", e);
    }
  }
  
  // Simple fallback hash function
  let hash = 0;
  for (let i = 0; i < textSample.length; i++) {
    const char = textSample.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

// Re-export the GptExtractedData type for convenient importing elsewhere
export type { GptExtractedData };
