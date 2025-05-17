export interface DocumentData {
  vatNumber: string;
  date: string;
  documentNumber: string;
  supplier: string;
  amount: number;
  currency: string;
  clientName?: string; // Added client name field as optional for backward compatibility
}

export interface ProcessingStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
}

export interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: string;
  attachments: AttachmentData[];
  processed: boolean;
}

export interface AttachmentData {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  processed: boolean;
  extractedData?: DocumentData;
  processingStatus: ProcessingStatus;
}

export interface GoogleAuthConfig {
  clientId: string;
  apiKey: string;
  scopes: string[];
}

export interface GoogleServiceStatus {
  gmail: boolean;
  drive: boolean;
  sheets?: boolean;
}

export interface ProcessingStats {
  total: number;
  processed: number;
  success: number;
  error: number;
  pending: number;
}

export interface UserSettings {
  enableSheets: boolean;
  sheetsId?: string;
  notifyOnError: boolean;
  notifyEmail?: string;
  autoProcessingEnabled: boolean;
  processingInterval: number; // in minutes
}
