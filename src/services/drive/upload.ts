
/**
 * Upload utilities for Drive Service
 */
import { ensureAuth } from './auth';
import { generateDrivePath, generateInvoiceFilename } from './naming';

/**
 * Creates folder path recursively on Google Drive
 * @param pathSegments Array of folder names to create
 * @param parentId ID of the parent folder to start from
 * @returns ID of the final folder in the path
 */
export const createDrivePathRecursively = async (
  pathSegments: string[], 
  parentId: string = 'root', 
  accessTokenOverride?: string
): Promise<string> => {
  // If path is empty, return the parent ID
  if (pathSegments.length === 0) {
    return parentId;
  }

  const accessToken = accessTokenOverride || await ensureAuth();
  const currentSegment = pathSegments[0];
  const remainingSegments = pathSegments.slice(1);
  
  try {
    // Try to find if the folder already exists
    const findResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(currentSegment)}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!findResponse.ok) {
      const error = await findResponse.json();
      console.error(`Error finding folder ${currentSegment}:`, error);
      throw new Error(`Error finding folder ${currentSegment}`);
    }

    const data = await findResponse.json();
    let currentFolderId: string;
    
    if (data.files.length > 0) {
      // Folder exists, use its ID
      currentFolderId = data.files[0].id;
    } else {
      // Create folder
      const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: currentSegment,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.json();
        console.error(`Error creating folder ${currentSegment}:`, error);
        throw new Error(`Error creating folder ${currentSegment}`);
      }

      const folder = await createResponse.json();
      currentFolderId = folder.id;
    }
    
    // Process remaining segments recursively
    if (remainingSegments.length === 0) {
      return currentFolderId; // Final folder reached
    }
    
    return createDrivePathRecursively(remainingSegments, currentFolderId, accessToken);
  } catch (error) {
    console.error(`Error processing path segment ${currentSegment}:`, error);
    throw error;
  }
};

/**
 * Uploads invoice PDF to Google Drive in the correct location
 */
export const uploadInvoiceToDrive = async ({
  file,
  clientVat,
  clientName,
  issuer,
  invoiceNumber,
  date,
  amount,
  currency,
  rootFolderId = 'root',
  includeUserFolder = true,
}: {
  file: Blob;
  clientVat: string;
  clientName: string;
  issuer: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  currency: string;
  rootFolderId?: string;
  includeUserFolder?: boolean;
}): Promise<{id: string; name: string}> => {
  const accessToken = await ensureAuth();

  console.log("Starting upload to Drive:", { clientName, issuer, invoiceNumber, includeUserFolder });
  
  // Step 1: Generate folder path
  const folderPath = generateDrivePath({
    clientVat,
    clientName,
    issuer,
    date,
    includeUserFolder
  });

  console.log("Generated folder path:", folderPath);
  
  // Step 2: Walk the folder path and get the final parent ID
  // We start with the first folder in the path (after the root which is handled by rootFolderId)
  const parentId = await createDrivePathRecursively(folderPath, rootFolderId, accessToken);
  
  console.log("Created folder path, final folder ID:", parentId);

  // Step 3: Generate filename
  // Fix: Include the required clientName parameter
  const filename = generateInvoiceFilename({
    clientName,
    issuer,
    invoiceNumber,
    date,
    amount,
    currency,
  });
  
  console.log("Generated filename:", filename);

  // Step 4: Upload file
  const metadata = {
    name: filename,
    parents: [parentId],
  };

  const form = new FormData();
  form.append(
    "metadata", 
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", file);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Upload to Drive failed:", data);
    throw new Error(data.error?.message || "Upload failed");
  }

  console.log("File uploaded to Drive successfully:", data);
  return { id: data.id, name: data.name };
};
