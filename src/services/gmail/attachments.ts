
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
  const invoiceTerms = [
    'invoice', 
    'τιμολόγιο', 
    'παραστατικό', 
    'αφμ', 
    'vat', 
    'receipt',
    'απόδειξη',
    'payment',
    'πληρωμή'
  ];
  
  // Check filename for invoice-related terms
  const filenameHasInvoiceTerms = invoiceTerms.some(term => fileNameLower.includes(term));
  if (filenameHasInvoiceTerms) {
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
    
    // Check for VAT or ΑΦΜ patterns in the text
    const vatPatterns = [
      /vat\s*[#:.\s]?\s*[a-z0-9]{7,12}/i,
      /αφμ\s*[#:.\s]?\s*[0-9]{9,12}/i,
      /α\.?φ\.?μ\.?\s*[#:.\s]?\s*[0-9]{9,12}/i,
      /tax\s*id\s*[#:.\s]?\s*[a-z0-9]{7,12}/i
    ];
    
    const hasVatPatterns = vatPatterns.some(pattern => pattern.test(textLower));
    if (hasVatPatterns) {
      return true;
    }
    
    // Check for invoice number patterns
    const invoiceNumberPatterns = [
      /invoice\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /τιμολόγιο\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /αρ\s*[#:.\s]?\s*τιμ\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i,
      /αριθμός\s*[#:.\s]?\s*[a-z0-9\-\/]{3,20}/i
    ];
    
    const hasInvoiceNumberPatterns = invoiceNumberPatterns.some(pattern => pattern.test(textLower));
    if (hasInvoiceNumberPatterns) {
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
    if (part.body && part.body.attachmentId && part.mimeType && part.mimeType.includes('pdf')) {
      // Only include PDF files with names that look like invoices
      // For files without names, we'll check the content later after download
      const filename = part.filename || `attachment-${attachments.length + 1}.pdf`;
      
      // Add all PDFs for now - we'll filter further after text extraction
      attachments.push({
        id: part.body.attachmentId,
        name: filename,
        mimeType: part.mimeType,
        size: parseInt(part.body.size || '0'),
        processed: false,
        processingStatus: { status: 'idle' }
      });
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
 */
export async function verifyInvoiceDocument(pdfBlob: Blob): Promise<boolean> {
  try {
    // Extract text from the PDF
    const extractedText = await extractTextFromPdf(pdfBlob);
    
    // Check if the extracted text indicates this is an invoice
    return isInvoiceDocument("", extractedText);
  } catch (error) {
    console.error("Error verifying if PDF is an invoice:", error);
    return false;
  }
}
