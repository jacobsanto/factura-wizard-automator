
/**
 * Prompt engineering for invoice data extraction
 */

/**
 * Creates a prompt for GPT to extract invoice data from PDF text
 */
export const createPrompt = (pdfText: string) => {
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
