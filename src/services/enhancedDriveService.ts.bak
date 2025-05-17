
/**
 * Enhanced Drive Service
 * Uses Google OAuth tokens to interact with Google Drive API
 */
import { getValidAccessToken } from './googleAuth';
import { DocumentData } from "@/types";

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

  /**
   * Search for a folder by path
   */
  async findFolderByPath(path: string): Promise<string | null> {
    const accessToken = await this.ensureAuth();
    
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
  }

  /**
   * Create a folder at the specified path, creating parent folders if needed
   */
  async createFolderPath(path: string): Promise<string> {
    const accessToken = await this.ensureAuth();
    
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
  }

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(
    folderPath: string, 
    fileName: string, 
    fileContent: Blob
  ): Promise<string> {
    const accessToken = await this.ensureAuth();
    
    // Ensure folder exists
    const folderId = await this.getOrCreateFolder(folderPath);
    
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
  }

  /**
   * Get folder if it exists or create it if it doesn't
   */
  async getOrCreateFolder(path: string): Promise<string> {
    // Check if folder already exists
    const existingFolderId = await this.findFolderByPath(path);
    if (existingFolderId) {
      return existingFolderId;
    }
    
    // Create folder path if it doesn't exist
    return this.createFolderPath(path);
  }

  /**
   * Generate a standardized filename for a document
   */
  async generateFilename(docData: DocumentData): Promise<string> {
    // Format the date from YYYY-MM-DD to YYYYMMDD
    const formattedDate = docData.date.replace(/-/g, '');
    
    // Generate filename according to specified format
    return `Παρ_${docData.vatNumber}_${docData.supplier}_${docData.documentNumber}_${formattedDate}_${docData.amount}${docData.currency}.pdf`;
  }

  /**
   * Determine target folder based on document data
   */
  async determineTargetFolder(docData: DocumentData): Promise<string> {
    // Extract year and month from date
    const date = new Date(docData.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}-${month}`;
    
    // Determine base path depending on VAT number
    if (docData.vatNumber.startsWith('EL')) {
      return `01.Λογιστήριο/Ενδοκοινοτικά/${yearMonth}/`;
    } else {
      return `01.Λογιστήριο/Παραστατικά Εξόδων/${yearMonth}/`;
    }
  }
}
