
import { EmailData, AttachmentData } from "@/types";
import { getValidAccessToken } from './googleAuth';

export class GmailService {
  private static instance: GmailService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Check if we have valid auth
      const accessToken = await getValidAccessToken();
      this.isInitialized = !!accessToken;
      console.log("Gmail service initialized:", this.isInitialized);
      return this.isInitialized;
    } catch (error) {
      console.error("Failed to initialize Gmail service:", error);
      this.isInitialized = false;
      return false;
    }
  }

  async fetchEmailsWithLabel(label: string): Promise<EmailData[]> {
    if (!this.isInitialized) {
      throw new Error("Gmail service not initialized");
    }

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
        console.log(`Label '${label}' not found. Using inbox messages.`);
      }

      // Query for messages with the specified label or inbox if label not found
      const queryParam = targetLabel ? `label:${targetLabel.id}` : 'in:inbox';
      const messagesResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(queryParam)}&maxResults=10`,
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
        
        // Look for attachments
        const attachments: AttachmentData[] = [];
        
        // Recursive function to find attachments in message parts
        const findAttachments = (part: any) => {
          if (part.body && part.body.attachmentId && part.mimeType && part.mimeType.includes('pdf')) {
            attachments.push({
              id: part.body.attachmentId,
              name: part.filename || `attachment-${attachments.length + 1}.pdf`,
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
        
        if (messageData.payload) {
          findAttachments(messageData.payload);
        }
        
        // Only include emails with PDF attachments
        if (attachments.length > 0) {
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

  async addLabel(emailId: string, label: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("Gmail service not initialized");
    }

    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        throw new Error("No valid access token available");
      }

      // First, check if the label exists or create it
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
        return false;
      }

      const labels = await labelsResponse.json();
      let targetLabel = labels.labels.find((l: any) => l.name === label);
      
      // Create the label if it doesn't exist
      if (!targetLabel) {
        const createResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/labels`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: label,
              labelListVisibility: 'labelShow',
              messageListVisibility: 'show'
            })
          }
        );

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          console.error("Error creating label:", errorData);
          return false;
        }

        targetLabel = await createResponse.json();
      }

      // Now add the label to the email
      const modifyResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            addLabelIds: [targetLabel.id]
          })
        }
      );

      if (!modifyResponse.ok) {
        const errorData = await modifyResponse.json();
        console.error("Error adding label to message:", errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error adding label:", error);
      return false;
    }
  }

  async downloadAttachment(emailId: string, attachmentId: string): Promise<Blob | null> {
    if (!this.isInitialized) {
      throw new Error("Gmail service not initialized");
    }

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

  async sendNotificationEmail(to: string, subject: string, body: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("Gmail service not initialized");
    }

    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        throw new Error("No valid access token available");
      }

      // Create email content
      const email = [
        'From: me',
        `To: ${to}`,
        `Subject: ${subject}`,
        '',
        body
      ].join('\r\n');

      // Encode the email in base64
      const base64EncodedEmail = btoa(unescape(encodeURIComponent(email)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            raw: base64EncodedEmail
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error sending notification email:", errorData);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error sending notification email:", error);
      return false;
    }
  }
}
