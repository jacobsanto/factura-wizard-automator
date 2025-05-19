
/**
 * Functions for processing email attachments 
 */
import { AttachmentData } from '@/types';
import { isInvoiceDocument } from './invoice-detection';

/**
 * Process attachments from email and filter for likely invoices
 */
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
