
/**
 * Enhanced Drive Service
 * Main export file that combines all functionality
 */
import { DocumentData } from "@/types";
import { uploadFile } from './files';
import { generateFilename, determineTargetFolder } from './naming';
import { getOrCreateFolder, findFolderByPath, createFolderPath } from './folders';
import { ensureAuth } from './auth';

export class EnhancedDriveService {
  private static instance: EnhancedDriveService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): EnhancedDriveService {
    if (!EnhancedDriveService.instance) {
      EnhancedDriveService.instance = new EnhancedDriveService();
    }
    return EnhancedDriveService.instance;
  }

  /**
   * Initialize the drive service by checking authentication status
   */
  async initialize(): Promise<boolean> {
    try {
      const accessToken = await ensureAuth();
      this.isInitialized = !!accessToken;
      console.log("Enhanced Drive service initialized:", this.isInitialized);
      return this.isInitialized;
    } catch (error) {
      console.error("Failed to initialize Enhanced Drive service:", error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Ensure authentication is valid before making any API calls
   * @private
   */
  private async ensureAuth(): Promise<string> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error("Drive service not initialized or authenticated");
      }
    }
    return ensureAuth();
  }

  // Re-export functions from the modules as methods of the service
  findFolderByPath = findFolderByPath;
  createFolderPath = createFolderPath;
  getOrCreateFolder = getOrCreateFolder;
  uploadFile = uploadFile;
  generateFilename = generateFilename;
  determineTargetFolder = determineTargetFolder;
}

// Export individual functions for direct use
export {
  findFolderByPath,
  createFolderPath,
  getOrCreateFolder,
  uploadFile,
  generateFilename,
  determineTargetFolder
};
