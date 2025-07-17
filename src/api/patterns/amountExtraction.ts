/**
 * Amount and currency extraction patterns
 */

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