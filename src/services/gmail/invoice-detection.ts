
/**
 * Functions related to invoice detection and verification
 */
import { extractTextFromPdf } from '@/utils/pdfUtils';

/**
 * Check if a filename or content appears to be an invoice
 */
export function isInvoiceDocument(fileName: string, text?: string): boolean {
  const fileNameLower = fileName.toLowerCase();
  
  // More specific invoice-related terms and document naming patterns
  const invoiceTerms = [
    // English terms
    'invoice', 'receipt', 'tax invoice', 'fiscal', 'factura', 'bill',
    // Greek terms
    'τιμολόγιο', 'παραστατικό', 'αφμ', 'α.φ.μ', 'απόδειξη', 'φορολογικό', 
    'φπα', 'φ.π.α', 'λογαριασμός', 'απόδειξη λιανικής',
    'τιμολόγιο πώλησης', 'τιμολόγιο παροχής υπηρεσιών',
    // Identification numbers
    'vat', 'tin', 'δου', 'δ.ο.υ'
  ];
  
  // Company-specific invoice naming patterns
  const companyPatterns = [
    // English patterns
    'inv-', 'inv_', 'invoice-', 'invoice_', 'rcpt', 'rcpt-', 'rcpt_',
    // Greek patterns
    'tim-', 'tim_', 'τιμ-', 'τιμ_', 'παρ-', 'παρ_', 'αποδ-', 'αποδ_',
    // Common Greek company names that issue invoices
    'cosmote', 'κοσμοτε', 'δεη', 'δ.ε.η', 'ευδαπ', 'ε.υδ.α.π', 'vodafone',
    'οτε', 'ο.τ.ε', 'nova', 'wind', 'forthnet', 'φορθνετ', 'ελτα', 'ε.λ.τ.α'
  ];
  
  // Check filename for invoice-related terms
  const filenameHasInvoiceTerms = invoiceTerms.some(term => fileNameLower.includes(term));
  const filenameHasCompanyPatterns = companyPatterns.some(pattern => fileNameLower.includes(pattern));
  
  if (filenameHasInvoiceTerms || filenameHasCompanyPatterns) {
    return true;
  }
  
  // If we have extracted text, check it for invoice indicators
  if (text) {
    const textLower = text.toLowerCase();
    
    // Check text content for invoice-related terms
    const textHasInvoiceTerms = invoiceTerms.some(term => textLower.includes(term));
    if (textHasInvoiceTerms) {
      return true;
    }
    
    // More comprehensive VAT/tax ID patterns
    const vatPatterns = [
      // International VAT formats
      /vat\s*[#:.\s]?\s*[a-z0-9]{7,12}/i,
      /tax\s*id\s*[#:.\s]?\s*[a-z0-9]{7,12}/i,
      /tax\s*number\s*[#:.\s]?\s*[a-z0-9]{7,12}/i,
      /tin\s*[#:.\s]?\s*[a-z0-9]{7,12}/i,
      
      // Greek VAT formats (ΑΦΜ)
      /αφμ\s*[#:.\s]?\s*[0-9]{9,12}/i,
      /α\.?φ\.?μ\.?\s*[#:.\s]?\s*[0-9]{9,12}/i,
      /α\.?φ\.?μ\.?:?\s*[0-9]{9,12}/i,
      /αριθμός\s*φορολογικού\s*μητρώου\s*:?\s*[0-9]{9,12}/i,
      
      // Greek VAT percentage patterns
      /φ\.?π\.?α\.?\s*[0-9]{1,2}%/i,
      /φπα\s*[0-9]{1,2}%/i,
      /φόρος\s*προστιθέμενης\s*αξίας/i
    ];
    
    const hasVatPatterns = vatPatterns.some(pattern => pattern.test(textLower));
    if (hasVatPatterns) {
      return true;
    }
    
    // Expanded invoice number patterns
    const invoiceNumberPatterns = [
      // English patterns
      /invoice\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /bill\s*number\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /receipt\s*number\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /invoice\s*number\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      
      // Greek patterns
      /τιμολόγιο\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /αρ\s*[#:.\s]?\s*τιμ\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /αριθμός\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /αριθμός\s*τιμολογίου\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /αρ\s*παραστατικου\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /αριθμός\s*παραστατικού\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i
    ];
    
    const hasInvoiceNumberPatterns = invoiceNumberPatterns.some(pattern => pattern.test(textLower));
    if (hasInvoiceNumberPatterns) {
      return true;
    }
    
    // Additional patterns for invoice amount and payment
    const paymentPatterns = [
      // English patterns
      /total\s*amount\s*[#:.\s]?\s*[€$£₤]?\s*\d+[,.]?\d*/i,
      /amount\s*due\s*[#:.\s]?\s*[€$£₤]?\s*\d+[,.]?\d*/i,
      /payment\s*due\s*[#:.\s]?\s*[€$£₤]?\s*\d+[,.]?\d*/i,
      
      // Greek patterns
      /συνολικό\s*ποσό\s*[#:.\s]?\s*[€]?\s*\d+[,.]?\d*/i,
      /πληρωτέο\s*ποσό\s*[#:.\s]?\s*[€]?\s*\d+[,.]?\d*/i,
      /συνολο\s*[#:.\s]?\s*[€]?\s*\d+[,.]?\d*/i,
      /σύνολο\s*[#:.\s]?\s*[€]?\s*\d+[,.]?\d*/i,
      /αξία\s*[#:.\s]?\s*[€]?\s*\d+[,.]?\d*/i,
      /πληρωμή\s*[#:.\s]?\s*[€]?\s*\d+[,.]?\d*/i,
      /πληρωτέο\s*[#:.\s]?\s*[€]?\s*\d+[,.]?\d*/i
    ];
    
    const hasPaymentPatterns = paymentPatterns.some(pattern => pattern.test(textLower));
    if (hasPaymentPatterns) {
      return true;
    }
    
    // Common Greek tax office references
    const greekTaxOfficePatterns = [
      /δ\.?ο\.?υ\.?\s*[α-ω\s]+/i,
      /δημοσια\s*οικονομικη\s*υπηρεσια/i,
      /εφορια/i
    ];
    
    const hasGreekTaxOfficePatterns = greekTaxOfficePatterns.some(pattern => pattern.test(textLower));
    if (hasGreekTaxOfficePatterns) {
      return true;
    }
    
    // Check for Greek utility and telecom specific terms
    const greekUtilityTerms = [
      'λογαριασμός ρεύματος', 'λογαριασμός νερού', 'λογαριασμός τηλεφώνου',
      'λογαριασμοσ δεη', 'λογαριασμός κινητής', 'λογαριασμός σταθερής',
      'τιμολόγιο δεη', 'τιμολόγιο ευδαπ', 'τιμολόγιο οτε', 'τιμολόγιο cosmote',
      'τιμολόγιο vodafone', 'τιμολόγιο wind', 'τιμολόγιο nova'
    ];
    
    const hasGreekUtilityTerms = greekUtilityTerms.some(term => textLower.includes(term));
    if (hasGreekUtilityTerms) {
      return true;
    }
  }
  
  // If no invoice indicators found, return false
  return false;
}

/**
 * Verify if a downloaded PDF is actually an invoice by extracting and analyzing its text
 * Enhanced with stricter validation
 */
export async function verifyInvoiceDocument(pdfBlob: Blob): Promise<boolean> {
  try {
    // Extract text from the PDF
    const extractedText = await extractTextFromPdf(pdfBlob);
    
    // Get settings to determine strictness of invoice verification
    let strictInvoiceCheck = true;
    try {
      // Try to get settings from localStorage
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        strictInvoiceCheck = parsedSettings.strictInvoiceCheck !== false; // Default to true if not specified
      }
    } catch (e) {
      console.error("Error reading settings:", e);
    }
    
    // Check if the extracted text indicates this is an invoice
    const isInvoice = isInvoiceDocument("", extractedText);
    
    if (!isInvoice && strictInvoiceCheck) {
      console.log("Document rejected: Not identified as an invoice and strict checking is enabled");
    }
    
    return isInvoice || !strictInvoiceCheck;
  } catch (error) {
    console.error("Error verifying if PDF is an invoice:", error);
    return false;
  }
}
