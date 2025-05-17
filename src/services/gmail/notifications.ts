
/**
 * Notification-related operations for Gmail Service
 */
import { getValidAccessToken } from '../googleAuth';

export async function sendNotificationEmail(to: string, subject: string, body: string): Promise<boolean> {
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
