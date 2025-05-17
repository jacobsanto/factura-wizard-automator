
/**
 * Types for Enhanced Drive Service
 */
import { DocumentData } from "@/types";

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType?: string;
}

export interface DriveSearchResult {
  files: DriveFileMetadata[];
  nextPageToken?: string;
}

export interface DriveUploadResult {
  id: string;
  name: string;
}
