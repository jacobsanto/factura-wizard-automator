/**
 * Invoice number extraction patterns
 */

/**
 * Extracts invoice number from invoice text
 */
export function extractInvoiceNumber(text: string): string | null {
  const invoiceNumberPatterns = [
    /invoice(?:\s+|:|\s*#?\s*|number:?\s*)([A-Za-z0-9\-_\/]+)/i,
    /τιμολόγιο(?:\s+|:|\s*#?\s*|number:?\s*)([A-Za-z0-9\-_\/]+)/i,  // Greek
    /αριθμός(?:\s+|:|\s*#?\s*)([A-Za-z0-9\-_\/]+)/i, // Greek: number
    /αρ\.?τιμ\.?(?:\s+|:|\s*#?\s*)([A-Za-z0-9\-_\/]+)/i, // Greek abbreviated
    /αρ\.?παρ\.?(?:\s+|:|\s*#?\s*)([A-Za-z0-9\-_\/]+)/i, // Greek abbreviated document
    /αριθμός παραστατικού[:\s]*([A-Za-z0-9\-_\/]+)/i, // Greek: document number
    /α\/α(?:\s+|:|\s*#?\s*)([A-Za-z0-9\-_\/]+)/i, // Greek sequential number
    /[Νν][Οο](?:\.|\s+)([A-Za-z0-9\-_\/]+)/i, // Greek No. abbreviation
  ];
  
  for (const pattern of invoiceNumberPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const result = match[1].trim();
      // Filter out results that are too long or too short to be invoice numbers
      if (result.length >= 1 && result.length <= 20) {
        return result;
      }
    }
  }
  
  // Look for patterns like "TDA-1234" or similar common invoice number formats
  const commonFormats = [
    /\b([A-Z]{2,4}[-\/]?[0-9]{3,6})\b/,  // Like TDA-1234 or ABC12345
    /\b([0-9]{1,5}[-\/][0-9]{1,5}[-\/][0-9]{2,4})\b/, // Like 123/456/2023
    /\b([0-9]{1,6}[-\/][0-9]{2,4})\b/, // Like 12345/2023
  ];
  
  for (const pattern of commonFormats) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}