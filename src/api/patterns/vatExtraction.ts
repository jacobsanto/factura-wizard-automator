/**
 * VAT number extraction patterns for Greek and international invoices
 */

/**
 * Extracts VAT number from invoice text
 */
export function extractVatNumber(text: string): string | null {
  // Common VAT number patterns with improved Greek patterns
  const vatPatterns = [
    /VAT(?:\s+|:|\s*#?\s*|number:?\s*)([A-Z]{2}\d{7,12})/i,
    /VAT(?:\s+|:|\s*#?\s*|number:?\s*)(\d{7,12})/i,
    /Tax ID(?:\s+|:|\s*#?\s*)([A-Z]{2}\d{7,12}|\d{7,12})/i,
    /ΑΦΜ(?:\s+|:|\s*#?\s*|number:?\s*)(\d{9})/i,  // Greek VAT
    /Α\.?Φ\.?Μ\.?(?:\s+|:|\s*#?\s*)(\d{9})/i,     // Greek VAT alternative format
    /ΑΦΜ[\s\:\.]*?πελάτη[\s\:\.]*?(\d{9})/i,      // Greek: client's VAT number
    /Φ\.?Π\.?Α\.?(?:\s+|:|\s*#?\s*)([A-Z]{2}\d{7,12}|\d{7,12})/i, // FPA Greek
    /αγοραστ[ήη](?:ς|)[\s\:\.]*?(?:.*?)ΑΦΜ[\s\:\.]*?(\d{9})/i, // Greek: buyer's VAT number
    /(?:στοιχεία|λήπτη|πελάτη)[\s\S]{0,50}?ΑΦΜ[\s\:\.]*?(\d{9})/i, // Client details section with VAT
    /(?:πελάτης|αγοραστής|λήπτης)[\s\S]{0,50}?(\d{9})(?:\s|$)/i, // Numbers near client keywords
    /(?:ΑΦΜ|VAT|TAX ID)[\s\:\.]*?(?:[^\n\r]{0,20})(\d{9})(?:\s|$)/i // VAT followed by number
  ];
  
  for (const pattern of vatPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Clean the VAT number (remove spaces, dots, etc.)
      return match[1].trim().replace(/[\s\.\-]/g, '');
    }
  }
  
  // Last resort - look for 9-digit numbers that might be VAT numbers
  const vatDigitPattern = /\b(\d{9})\b/g;
  const allMatches = [...text.matchAll(vatDigitPattern)];
  
  if (allMatches.length > 0) {
    // Try to find a 9-digit number near VAT-related terms
    const vatTerms = ['αφμ', 'vat', 'φπα', 'tax', 'α.φ.μ'];
    const textLower = text.toLowerCase();
    
    for (const term of vatTerms) {
      const termIndex = textLower.indexOf(term);
      if (termIndex >= 0) {
        // Find the closest 9-digit number to this term
        let closestMatch = null;
        let closestDistance = Number.MAX_SAFE_INTEGER;
        
        for (const match of allMatches) {
          const matchIndex = match.index || 0;
          const distance = Math.abs(matchIndex - termIndex);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestMatch = match[1];
          }
        }
        
        if (closestMatch && closestDistance < 200) {  // Only if within reasonable distance
          return closestMatch;
        }
      }
    }
    
    // If no VAT term found, return first 9-digit number as fallback
    return allMatches[0][1];
  }
  
  return null;
}