
/**
 * Types for processor service
 */
import { AttachmentData, DocumentData, ProcessingStatus } from "@/types";

export interface ProcessResult {
  success: boolean;
  data?: DocumentData;
  targetPath?: string;
  newFilename?: string;
  driveFileId?: string;
  message?: string;
}

export interface ExtractorOptions {
  useGpt?: boolean;
}
