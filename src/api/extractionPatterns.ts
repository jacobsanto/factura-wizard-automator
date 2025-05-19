
/**
 * Text extraction patterns for invoice data
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

/**
 * Extracts client name from invoice text
 */
export function extractClientName(text: string): string | null {
  // Look for common client patterns
  const clientPatterns = [
    /bill to:?\s*([^,\n]+)/i,
    /customer:?\s*([^,\n]+)/i,
    /client:?\s*([^,\n]+)/i,
    /πελάτης:?\s*([^,\n]+)/i,  // Greek
    /στοιχεία πελάτη:?\s*([^,\n]+)/i, // Greek: client details
    /επωνυμία(?:\s+|:|\s*#?\s*)([^,\n]+)/i, // Greek: business name
    /προς(?:\s+|:|\s*#?\s*)([^,\n]+)/i, // Greek: To (client)
    /αγοραστ[ήη](?:ς|):?\s*([^,\n]+)/i, // Greek: buyer
    /λήπτης:?\s*([^,\n]+)/i, // Greek: recipient
    /(?:στοιχεία|λεπτομέρειες) (?:λήπτη|αγοραστ[ήη](?:ς|))(?:\s|:)+([^,\n]+)/i // Client details section
  ];
  
  for (const pattern of clientPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const result = match[1].trim();
      // Filter out very short results or those containing "ΑΦΜ" which would be part of another field
      if (result.length > 3 && !result.includes("ΑΦΜ") && !result.includes("VAT")) {
        return result;
      }
    }
  }
  
  // Extended search: Look for text near ΑΦΜ which might be client name
  const afmIndex = text.indexOf("ΑΦΜ");
  if (afmIndex >= 0) {
    // Look for a line or few lines before the ΑΦΜ occurrence
    const previousText = text.substring(Math.max(0, afmIndex - 200), afmIndex);
    const lines = previousText.split(/\r?\n/).filter(line => line.trim().length > 0);
    
    if (lines.length > 0) {
      // Get the last non-empty line before ΑΦΜ which might contain the client name
      const potentialClientName = lines[lines.length - 1].trim();
      
      // Filter out lines that are likely not client names
      if (potentialClientName.length > 3 && 
          !potentialClientName.match(/^(τιμολ|invoice|παραστατικ|ημερομην|date|αριθμ)/i)) {
        return potentialClientName;
      }
    }
  }
  
  return null;
}

/**
 * Extracts issuer from invoice text
 */
export function extractIssuer(text: string): string | null {
  // Look for company issuing the invoice
  const issuerPatterns = [
    /from:?\s*([^,\n]+)/i,
    /issued by:?\s*([^,\n]+)/i,
    /company:?\s*([^,\n]+)/i,
    /εκδότης:?\s*([^,\n]+)/i,  // Greek
    /επωνυμία εκδότη:?\s*([^,\n]+)/i, // Greek: issuer name
    /στοιχεία εκδότη:?\s*([^,\n]+)/i, // Greek: issuer details
    /στοιχεία επιχείρησης:?\s*([^,\n]+)/i, // Greek: business details
    /πωλητ[ήη](?:ς|):?\s*([^,\n]+)/i, // Greek: seller
    /προμηθευτ[ήη](?:ς|):?\s*([^,\n]+)/i // Greek: supplier
  ];
  
  for (const pattern of issuerPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const result = match[1].trim();
      // Filter out very short results
      if (result.length > 3) {
        return result;
      }
    }
  }
  
  // Check the first few lines of the document which often contain the issuer name
  const firstLines = text.split(/\r?\n/, 10).filter(line => line.trim().length > 0);
  if (firstLines.length > 0) {
    // The first non-empty line is often the issuer name in many invoice formats
    const potentialIssuer = firstLines[0].trim();
    
    // Check if it looks like a company name (not a title, date, etc.)
    if (potentialIssuer.length > 3 && 
        !potentialIssuer.match(/^(τιμολ|invoice|παραστατικ|ημερομην|date|αριθμ)/i)) {
      return potentialIssuer;
    }
  }
  
  return null;
}

/**
 * Extracts date from invoice text
 */
export function extractDate(text: string): string | null {
  // Common date formats
  const datePatterns = [
    /(?:date|invoice date|ημερομηνία)(?:\s+|:|\s*#?\s*)(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
    /(?:date|invoice date|ημερομηνία)(?:\s+|:|\s*#?\s*)(\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2})/i,
    /ημ(?:\/|\.)?(?:\s+|:|\s*#?\s*)(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i, // Greek abbreviated
    /έκδοση(?:\s+|:|\s*#?\s*)(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i, // Greek: issued on
    /(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/ // General date format anywhere in text
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Try to convert to YYYY-MM-DD format if possible
      try {
        const dateParts = match[1].split(/[\/\.\-]/);
        if (dateParts.length === 3) {
          // Guess the format based on the first part
          if (dateParts[0].length === 4) {
            // YYYY-MM-DD
            return `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
          } else {
            // DD-MM-YYYY or MM-DD-YYYY (assuming DD-MM-YYYY here)
            const year = dateParts[2].length === 2 ? `20${dateParts[2]}` : dateParts[2];
            return `${year}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
          }
        }
      } catch (e) {
        // If parsing fails, just return the raw match
        return match[1];
      }
      return match[1];
    }
  }
  
  return null;
}

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

/**
 * Extracts amount from invoice text
 */
export function extractAmount(text: string): string | null {
  // Look for total amount
  const amountPatterns = [
    /total(?:\s+|:|\s*#?\s*)([0-9.,]+)/i,
    /amount(?:\s+|:|\s*#?\s*)([0-9.,]+)/i,
    /σύνολο(?:\s+|:|\s*#?\s*)([0-9.,]+)/i,  // Greek
    /συνολο(?:\s+|:|\s*#?\s*)([0-9.,]+)/i,  // Greek without accent
    /πληρωτέο(?:\s+|:|\s*#?\s*)([0-9.,]+)/i, // Greek: payable
    /πληρωμή(?:\s+|:|\s*#?\s*)([0-9.,]+)/i, // Greek: payment
    /συν\.?(?:\s+|:|\s*#?\s*)([0-9.,]+)/i, // Greek abbreviated
    /(?:πληρωτέο ποσό|ποσό πληρωμής)(?:\s+|:|\s*#?\s*)([0-9.,]+)/i, // Greek: payment amount
    /(?:συνολικό ποσό)(?:\s+|:|\s*#?\s*)([0-9.,]+)/i, // Greek: total amount
    // Look for amount with currency symbol
    /συνολικ[όο](?:\s+|:|\s*#?\s*)([0-9.,]+)(?:\s*)(?:€|EUR)/i,
    /([0-9.,]+)(?:\s*)(?:€|EUR|ευρώ)/i,
  ];
  
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Clean up formatting and return as a number string
      return match[1].replace(/[^\d.,]/g, '').replace(',', '.');
    }
  }
  
  // Extended search: Look for numbers near total-related terms
  const totalTerms = ['συνολο', 'συνολικό', 'πληρωμή', 'total', 'amount', 'sum'];
  const textLower = text.toLowerCase();
  
  for (const term of totalTerms) {
    const termIndex = textLower.indexOf(term);
    if (termIndex >= 0) {
      // Look for a number pattern within 50 characters after the term
      const textAfterTerm = text.substring(termIndex, termIndex + 50);
      const numberMatch = textAfterTerm.match(/(\d+[.,]\d+)/);
      
      if (numberMatch && numberMatch[1]) {
        return numberMatch[1].replace(/[^\d.,]/g, '').replace(',', '.');
      }
    }
  }
  
  return null;
}

/**
 * Extracts currency from invoice text
 */
export function extractCurrency(text: string): string | null {
  // Look for common currency symbols and codes
  if (text.includes('€')) return '€';
  if (text.includes('EUR') || text.includes('euro') || text.includes('ευρώ') || text.includes('ΕΥΡΩ')) return '€';
  if (text.includes('$')) return '$';
  if (text.includes('USD') || text.includes('dollar')) return '$';
  if (text.includes('£')) return '£';
  if (text.includes('GBP') || text.includes('pound')) return '£';
  
  // Default to euro for Greek invoices
  return '€';
}
