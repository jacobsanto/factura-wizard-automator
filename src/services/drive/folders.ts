
/**
 * Folder operations for Drive Service
 */
import { ensureAuth } from './auth';

/**
 * Search for a folder by path
 */
export const findFolderByPath = async (path: string): Promise<string | null> => {
  const accessToken = await ensureAuth();
  
  // Split path into segments
  const pathSegments = path.split('/').filter(segment => segment.trim() !== '');
  
  let parentId = 'root';
  let currentPathId = parentId;
  
  // Traverse path segments
  for (const segment of pathSegments) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${segment}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error(`Error finding folder ${segment}:`, error);
        return null;
      }

      const data = await response.json();
      
      if (data.files.length === 0) {
        // Folder doesn't exist at this level
        return null;
      }
      
      currentPathId = data.files[0].id;
      parentId = currentPathId;
    } catch (error) {
      console.error(`Error finding folder ${segment}:`, error);
      return null;
    }
  }
  
  return currentPathId;
};

/**
 * Create a folder at the specified path, creating parent folders if needed
 */
export const createFolderPath = async (path: string): Promise<string> => {
  const accessToken = await ensureAuth();
  
  // Split path into segments
  const pathSegments = path.split('/').filter(segment => segment.trim() !== '');
  
  let parentId = 'root';
  
  // Traverse and create path segments
  for (const segment of pathSegments) {
    try {
      // Check if folder exists
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${segment}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error(`Error finding folder ${segment}:`, error);
        throw new Error(`Error finding folder ${segment}`);
      }

      const data = await response.json();
      
      if (data.files.length > 0) {
        // Folder exists, move to next segment
        parentId = data.files[0].id;
      } else {
        // Create folder
        const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: segment,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
          }),
        });

        if (!createResponse.ok) {
          const error = await createResponse.json();
          console.error(`Error creating folder ${segment}:`, error);
          throw new Error(`Error creating folder ${segment}`);
        }

        const folder = await createResponse.json();
        parentId = folder.id;
      }
    } catch (error) {
      console.error(`Error processing path segment ${segment}:`, error);
      throw error;
    }
  }
  
  return parentId;
};

/**
 * Get folder if it exists or create it if it doesn't
 */
export const getOrCreateFolder = async (path: string): Promise<string> => {
  // Check if folder already exists
  const existingFolderId = await findFolderByPath(path);
  if (existingFolderId) {
    return existingFolderId;
  }
  
  // Create folder path if it doesn't exist
  return createFolderPath(path);
};
