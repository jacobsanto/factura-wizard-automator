
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
- vatNumber (the VAT/Tax ID of the client, for Greek invoices look for "ΑΦΜ" followed by 9 digits)
- clientName (the name of the client/company receiving the invoice)
- issuer (the supplier/vendor issuing the invoice)
- date (the invoice date in YYYY-MM-DD format if possible)
- documentNumber (the invoice number or "Αριθμός Παραστατικού" or "Αρ. Τιμολογίου")
- amount (the total amount as a number without currency symbol)
- currency (the currency symbol or code, e.g., €, $, EUR, USD)

IMPORTANT GUIDELINES:
- For Greek invoices, VAT numbers are typically labeled as "ΑΦΜ" or "Α.Φ.Μ." followed by 9 digits
- For dates, convert any format (DD/MM/YYYY, MM-DD-YYYY, etc.) to YYYY-MM-DD
- For amount, look for "ΣΥΝΟΛΟ", "ΠΛΗΡΩΤΕΟ", "TOTAL", or similar terms
- Return ONLY the JSON object, no other text or explanation

Here's the invoice text:
${pdfText}
`;
};

/**
 * Creates a specialized prompt for Greek invoices
 */
export const createGreekPrompt = (pdfText: string) => {
  return `
Από το παρακάτω κείμενο τιμολογίου, εξήγαγε τις ακόλουθες πληροφορίες. Αν δεν μπορείς να βρεις κάποιο πεδίο, απάντησε "unknown" για αυτό.
Επίστρεψε ΜΟΝΟ ένα JSON αντικείμενο με τα εξής κλειδιά:
- vatNumber (ο ΑΦΜ του πελάτη/λήπτη, συνήθως 9 ψηφία με πρόθεμα "ΑΦΜ")
- clientName (το όνομα του πελάτη/εταιρείας που λαμβάνει το τιμολόγιο)
- issuer (ο προμηθευτής/εκδότης του τιμολογίου)
- date (η ημερομηνία του τιμολογίου σε μορφή YYYY-MM-DD αν είναι δυνατόν)
- documentNumber (ο αριθμός του τιμολογίου ή "Αριθμός Παραστατικού")
- amount (το συνολικό ποσό ως αριθμός χωρίς σύμβολο νομίσματος)
- currency (το σύμβολο ή κωδικός νομίσματος, π.χ., €, $, EUR, USD)

ΣΗΜΑΝΤΙΚΕΣ ΟΔΗΓΙΕΣ:
- Ο ΑΦΜ είναι 9 ψηφία και συνήθως έχει πρόθεμα "ΑΦΜ:" ή "Α.Φ.Μ."
- Για ημερομηνίες, μετάτρεψε οποιαδήποτε μορφή (ΗΗ/ΜΜ/ΕΕΕΕ, ΗΗ-ΜΜ-ΕΕΕΕ, κτλ.) σε ΕΕΕΕ-ΜΜ-ΗΗ
- Για το ποσό, ψάξε για "ΣΥΝΟΛΟ", "ΠΛΗΡΩΤΕΟ ΠΟΣΟ", "ΠΛΗΡΩΜΗ", κτλ.
- Επίστρεψε ΜΟΝΟ το JSON αντικείμενο, χωρίς άλλο κείμενο ή επεξήγηση

Κείμενο τιμολογίου:
${pdfText}
`;
};
