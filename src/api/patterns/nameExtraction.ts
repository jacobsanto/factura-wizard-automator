/**
 * Name extraction patterns for client and issuer information
 */

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