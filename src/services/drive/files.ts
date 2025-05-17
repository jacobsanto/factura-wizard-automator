
/**
 * File operations for Drive Service
 */
import { DocumentData } from "@/types";
import { ensureAuth } from './auth';
import { getOrCreateFolder } from './folders';

/**
 * Upload a file to Google Drive
 */
export const uploadFile = async (
  folderPath: string, 
  fileName: string, 
  fileContent: Blob
): Promise<string> => {
  const accessToken = await ensureAuth();
  
  // Ensure folder exists
  const folderId = await getOrCreateFolder(folderPath);
  
  // Create metadata
  const metadata = {
    name: fileName,
    parents: [folderId],
  };
  
  // Create form data
  const formData = new FormData();
  formData.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  formData.append('file', fileContent);
  
  // Upload file
  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Error uploading file:', error);
    throw new Error('Error uploading file to Drive');
  }
  
  const data = await response.json();
  return data.id;
};
