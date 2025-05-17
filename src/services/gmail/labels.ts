
/**
 * Label-related operations for Gmail Service
 */
import { getValidAccessToken } from '../googleAuth';

export async function addLabel(emailId: string, label: string): Promise<boolean> {
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
