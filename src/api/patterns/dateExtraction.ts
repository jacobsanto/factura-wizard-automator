/**
 * Date extraction patterns for invoice dates
 */

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