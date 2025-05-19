
/**
 * Email-related operations for Gmail Service
 */
import { getValidAccessToken } from '../googleAuth';
import { EmailData, AttachmentData } from '@/types';
import { processAttachments } from './attachments';

export async function fetchEmailsWithLabel(label: string): Promise<EmailData[]> {
  try {
    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      throw new Error("No valid access token available");
    }

    // First, get label ID
    const labelsResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/labels`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!labelsResponse.ok) {
      const errorData = await labelsResponse.json();
      console.error("Error fetching labels:", errorData);
      throw new Error("Failed to fetch labels");
    }

    const labels = await labelsResponse.json();
    const targetLabel = labels.labels.find((l: any) => l.name === label);
    
    if (!targetLabel) {
      console.log(`Label '${label}' not found. Fetching all inbox emails with invoice-related attachments.`);
    }

    // Query for messages with the specified label or invoice-related emails if label not found
    // Look for emails that might contain invoices (subject contains invoice keywords or has attachments)
    const invoiceKeywords = 'invoice OR τιμολόγιο OR παραστατικό OR ΑΦΜ OR VAT OR φόρος OR πληρωμή OR payment';
    const queryParam = targetLabel 
      ? `label:${targetLabel.id}` 
      : `in:inbox (has:attachment (${invoiceKeywords}))`;
    
    console.log("Using query parameter:", queryParam);
    
    // Increased maxResults to fetch more emails
    const messagesResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(queryParam)}&maxResults=25`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      console.error("Error fetching messages:", errorData);
      throw new Error("Failed to fetch messages");
    }

    const messagesData = await messagesResponse.json();
    if (!messagesData.messages || messagesData.messages.length === 0) {
      return [];
    }

    // Fetch each message's details
    const emails: EmailData[] = [];
    for (const message of messagesData.messages) {
      const messageResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!messageResponse.ok) {
        console.error(`Error fetching message ${message.id}`);
        continue;
      }

      const messageData = await messageResponse.json();
      
      // Parse headers to get subject, from, date
      const headers = messageData.payload.headers;
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
      const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
      const date = headers.find((h: any) => h.name === 'Date')?.value || new Date().toISOString();
      
      // Check if the subject contains invoice-related keywords
      const subjectLower = subject.toLowerCase();
      const isInvoiceRelated = 
        subjectLower.includes('invoice') || 
        subjectLower.includes('τιμολόγιο') || 
        subjectLower.includes('παραστατικό') || 
        subjectLower.includes('αφμ') || 
        subjectLower.includes('vat') ||
        subjectLower.includes('φόρος') ||
        subjectLower.includes('πληρωμή') ||
        subjectLower.includes('payment');
      
      // Look for attachments
      const attachments = processAttachments(messageData.payload);
      
      // Only include emails that are invoice-related or have PDF attachments that might be invoices
      if (isInvoiceRelated || attachments.length > 0) {
        emails.push({
          id: messageData.id,
          subject,
          from,
          date,
          attachments,
          processed: false
        });
      }
    }

    return emails;
  } catch (error) {
    console.error("Error fetching emails with label:", error);
    throw error;
  }
}
