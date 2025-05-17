
/**
 * Drive Service
 * This file is maintained for backwards compatibility
 * New code should import directly from the src/services/drive directory
 */

import { EnhancedDriveService } from './drive';

// Export the DriveService class as an alias of EnhancedDriveService
export const DriveService = EnhancedDriveService;

// Re-export everything from the drive service
export * from './drive';
