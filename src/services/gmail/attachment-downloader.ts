
/**
 * Functions for downloading email attachments
 */
import { getValidAccessToken } from '../googleAuth';

/**
 * Download an attachment from a Gmail message
 */
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
