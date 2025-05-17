
/**
 * Drive Helper Functions
 * Simple wrapper functions for Google Drive operations
 */
import { EnhancedDriveService } from "@/services/drive";

/**
 * Check if the Drive service is initialized
 */
export const isDriveReady = async (): Promise<boolean> => {
  try {
    const driveService = EnhancedDriveService.getInstance();
    return await driveService.initialize();
  } catch (error) {
    console.error("Error checking Drive service status:", error);
    return false;
  }
};

/**
 * Upload a file to a specific folder in Drive
 */
export const uploadFileToDrive = async (
  folderPath: string,
  fileName: string,
  fileContent: Blob
): Promise<string | null> => {
  try {
    const driveService = EnhancedDriveService.getInstance();
    const fileId = await driveService.uploadFile(folderPath, fileName, fileContent);
    return fileId;
  } catch (error) {
    console.error("Error uploading file to Drive:", error);
    return null;
  }
};

/**
 * Find a folder by path
 */
export const findFolder = async (folderPath: string): Promise<string | null> => {
  try {
    const driveService = EnhancedDriveService.getInstance();
    return await driveService.findFolderByPath(folderPath);
  } catch (error) {
    console.error("Error finding folder:", error);
    return null;
  }
};

/**
 * Create folder path if it doesn't exist
 */
export const createFolder = async (folderPath: string): Promise<string | null> => {
  try {
    const driveService = EnhancedDriveService.getInstance();
    return await driveService.getOrCreateFolder(folderPath);
  } catch (error) {
    console.error("Error creating folder:", error);
    return null;
  }
};
