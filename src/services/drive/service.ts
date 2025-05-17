
/**
 * Enhanced Drive Service
 * Uses Google OAuth tokens to interact with Google Drive API
 */
import { getValidAccessToken } from '../googleAuth';
import { DocumentData } from "@/types";
import { findFolderByPath, createFolderPath, getOrCreateFolder } from './folders';
import { uploadFile } from './files';
import { generateFilename, determineTargetFolder } from './naming';

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
      const accessToken = await getValidAccessToken();
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
   */
  private async ensureAuth(): Promise<string> {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error("Drive service not initialized or authenticated");
      }
    }

    const accessToken = await getValidAccessToken();
    if (!accessToken) {
      throw new Error("No valid access token available");
    }
    
    return accessToken;
  }

  // Re-export functions that were refactored
  findFolderByPath = findFolderByPath;
  createFolderPath = createFolderPath;
  getOrCreateFolder = getOrCreateFolder;
  uploadFile = uploadFile;
  generateFilename = generateFilename;
  determineTargetFolder = determineTargetFolder;
}
