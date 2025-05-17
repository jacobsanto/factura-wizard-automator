
/**
 * GPT API for invoice data extraction
 */

// The prompt engineering for extracting invoice data
const createPrompt = (pdfText: string) => {
  return `
Extract the following information from this invoice text. If you can't find a specific field, respond with "unknown" for that field.
Return ONLY a JSON object with these keys:
- vatNumber (the VAT/Tax ID of the client)
- clientName (the name of the client/company receiving the invoice)
- issuer (the supplier/vendor issuing the invoice)
- date (the invoice date in YYYY-MM-DD format if possible)
- documentNumber (the invoice number)
- amount (the total amount as a number without currency symbol)
- currency (the currency symbol or code, e.g., €, $, EUR, USD)

Here's the invoice text:
${pdfText}
`;
};

export interface GptExtractedData {
  vatNumber: string;
  clientName: string;
  issuer: string;
  date: string;
  documentNumber: string;
  amount: string;
  currency: string;
}

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

// Helper functions for text pattern matching (basic mock implementation)
function extractVatNumber(text: string): string | null {
  // Common VAT number patterns
  const vatPatterns = [
    /VAT(?:\s+|:|\s*#?\s*|number:?\s*)([A-Z]{2}\d{7,12})/i,
    /VAT(?:\s+|:|\s*#?\s*|number:?\s*)(\d{7,12})/i,
    /Tax ID(?:\s+|:|\s*#?\s*)([A-Z]{2}\d{7,12}|\d{7,12})/i,
    /ΑΦΜ(?:\s+|:|\s*#?\s*|number:?\s*)(\d{9})/i,  // Greek VAT
  ];
  
  for (const pattern of vatPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

function extractClientName(text: string): string | null {
  // Look for common client patterns
  const clientPatterns = [
    /bill to:?\s*([^,\n]+)/i,
    /customer:?\s*([^,\n]+)/i,
    /client:?\s*([^,\n]+)/i,
    /πελάτης:?\s*([^,\n]+)/i,  // Greek
  ];
  
  for (const pattern of clientPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return null;
}

function extractIssuer(text: string): string | null {
  // Look for company issuing the invoice
  const issuerPatterns = [
    /from:?\s*([^,\n]+)/i,
    /issued by:?\s*([^,\n]+)/i,
    /company:?\s*([^,\n]+)/i,
    /εκδότης:?\s*([^,\n]+)/i,  // Greek
  ];
  
  for (const pattern of issuerPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return null;
}

function extractDate(text: string): string | null {
  // Common date formats
  const datePatterns = [
    /(?:date|invoice date|ημερομηνία)(?:\s+|:|\s*#?\s*)(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
    /(?:date|invoice date|ημερομηνία)(?:\s+|:|\s*#?\s*)(\d{4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2})/i,
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
            return `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
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

function extractInvoiceNumber(text: string): string | null {
  const invoiceNumberPatterns = [
    /invoice(?:\s+|:|\s*#?\s*|number:?\s*)([A-Za-z0-9\-_]+)/i,
    /τιμολόγιο(?:\s+|:|\s*#?\s*|number:?\s*)([A-Za-z0-9\-_]+)/i,  // Greek
  ];
  
  for (const pattern of invoiceNumberPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return null;
}

function extractAmount(text: string): string | null {
  // Look for total amount
  const amountPatterns = [
    /total(?:\s+|:|\s*#?\s*)([0-9.,]+)/i,
    /amount(?:\s+|:|\s*#?\s*)([0-9.,]+)/i,
    /σύνολο(?:\s+|:|\s*#?\s*)([0-9.,]+)/i,  // Greek
  ];
  
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Clean up formatting and return as a number string
      return match[1].replace(/[^0-9.]/g, '');
    }
  }
  return null;
}

function extractCurrency(text: string): string | null {
  // Look for common currency symbols and codes
  if (text.includes('€') || text.includes('EUR') || text.includes('euro')) return '€';
  if (text.includes('$') || text.includes('USD') || text.includes('dollar')) return '$';
  if (text.includes('£') || text.includes('GBP') || text.includes('pound')) return '£';
  
  return null;
}
