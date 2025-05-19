
/**
 * Attachment-related operations for Gmail Service
 */
import { getValidAccessToken } from '../googleAuth';
import { AttachmentData } from '@/types';
import { extractTextFromPdf } from '@/utils/pdfUtils';

/**
 * Check if a filename or content appears to be an invoice
 */
export function isInvoiceDocument(fileName: string, text?: string): boolean {
  const fileNameLower = fileName.toLowerCase();
  
  // More specific invoice-related terms and document naming patterns
  const invoiceTerms = [
    'invoice', 
    'τιμολόγιο', 
    'παραστατικό', 
    'αφμ', 
    'vat', 
    'receipt',
    'απόδειξη',
    'tax invoice',
    'fiscal',
    'factura'
  ];
  
  // Company-specific invoice naming patterns
  const companyPatterns = [
    'inv-', 
    'inv_',
    'invoice-',
    'invoice_', 
    'tim-',
    'tim_',
    'τιμ-', 
    'τιμ_'
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
      /vat\s*[#:.\s]?\s*[a-z0-9]{7,12}/i,
      /αφμ\s*[#:.\s]?\s*[0-9]{9,12}/i,
      /α\.?φ\.?μ\.?\s*[#:.\s]?\s*[0-9]{9,12}/i,
      /tax\s*id\s*[#:.\s]?\s*[a-z0-9]{7,12}/i,
      /tax\s*number\s*[#:.\s]?\s*[a-z0-9]{7,12}/i,
      /tin\s*[#:.\s]?\s*[a-z0-9]{7,12}/i,
      /φ\.?π\.?α\.?\s*[0-9]{1,2}%/i // Greek VAT percentage pattern
    ];
    
    const hasVatPatterns = vatPatterns.some(pattern => pattern.test(textLower));
    if (hasVatPatterns) {
      return true;
    }
    
    // Expanded invoice number patterns
    const invoiceNumberPatterns = [
      /invoice\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /τιμολόγιο\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /αρ\s*[#:.\s]?\s*τιμ\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /αριθμός\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /invoice\s*number\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /αριθμός\s*τιμολογίου\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /bill\s*number\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /receipt\s*number\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i
    ];
    
    const hasInvoiceNumberPatterns = invoiceNumberPatterns.some(pattern => pattern.test(textLower));
    if (hasInvoiceNumberPatterns) {
      return true;
    }
    
    // Additional patterns for invoice amount and payment
    const paymentPatterns = [
      /total\s*amount\s*[#:.\s]?\s*[€$£₤]?\s*\d+[,.]?\d*/i,
      /συνολικό\s*ποσό\s*[#:.\s]?\s*[€]?\s*\d+[,.]?\d*/i,
      /amount\s*due\s*[#:.\s]?\s*[€$£₤]?\s*\d+[,.]?\d*/i,
      /payment\s*due\s*[#:.\s]?\s*[€$£₤]?\s*\d+[,.]?\d*/i,
      /πληρωτέο\s*ποσό\s*[#:.\s]?\s*[€]?\s*\d+[,.]?\d*/i
    ];
    
    const hasPaymentPatterns = paymentPatterns.some(pattern => pattern.test(textLower));
    if (hasPaymentPatterns) {
      return true;
    }
  }
  
  // If no invoice indicators found, return false
  return false;
}

export function processAttachments(messagePart: any): AttachmentData[] {
  const attachments: AttachmentData[] = [];
  
  // Recursive function to find attachments in message parts
  const findAttachments = (part: any) => {
    if (part.body && part.body.attachmentId && part.mimeType) {
      // Only include PDF files - strict filtering
      if (part.mimeType.includes('pdf')) {
        const filename = part.filename || `attachment-${attachments.length + 1}.pdf`;
        
        // Perform first-level filtering based on filename
        // We'll do deeper content analysis after download
        if (isInvoiceDocument(filename)) {
          attachments.push({
            id: part.body.attachmentId,
            name: filename,
            mimeType: part.mimeType,
            size: parseInt(part.body.size || '0'),
            processed: false,
            processingStatus: { status: 'idle' }
          });
        } else {
          console.log(`Skipping attachment ${filename} as it doesn't appear to be an invoice`);
        }
      }
    }
    
    if (part.parts) {
      part.parts.forEach(findAttachments);
    }
  };
  
  findAttachments(messagePart);
  return attachments;
}

export async function downloadAttachment(emailId: string, attachmentId: string): Promise<Blob | null> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      throw new Error("No valid access token available");
    }

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/attachments/${attachmentId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error downloading attachment:", errorData);
      return null;
    }

    const data = await response.json();
    
    // Gmail returns base64 encoded attachment data
    const base64Data = data.data.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return new Blob([bytes], { type: 'application/pdf' });
  } catch (error) {
    console.error("Error downloading attachment:", error);
    return null;
  }
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
