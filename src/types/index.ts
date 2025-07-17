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
  preferGreekExtraction?: boolean; // Whether to optimize for Greek invoices
  strictInvoiceCheck?: boolean; // Whether to strictly verify if files are invoices
  pdfOnly?: boolean; // Whether to only process PDF files
}

/**
 * Extraction feedback data
 */
export interface ExtractionFeedback {
  id?: string;
  userId?: string;
  documentId?: string;
  fileName?: string;
  extractionMethod: string;
  confidence: number;
  originalData: DocumentData;
  correctedData: DocumentData;
  fields: {
    [key: string]: {
      wasCorrect: boolean;
      original: string;
      corrected?: string;
    }
  };
  feedbackDate: string;
  rating: number; // 1-5 rating
  comment?: string;
}

// Add a new interface for extraction results with confidence scoring
export interface ExtractionResult {
  data: DocumentData;
  confidence: number;
  method: 'pattern';
}
