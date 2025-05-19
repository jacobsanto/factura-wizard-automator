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
  enableAI?: boolean; // Whether to use AI for data extraction
  preferGreekExtraction?: boolean; // Whether to optimize for Greek invoices
  aiConfidenceThreshold?: number; // Minimum confidence level for AI extraction (0-100)
  strictInvoiceCheck?: boolean; // Whether to strictly verify if files are invoices
  pdfOnly?: boolean; // Whether to only process PDF files
  enableDocumentAI?: boolean; // Whether to use Google Document AI for extraction
  documentAIProcessorId?: string; // The Document AI processor ID to use
  documentAILocation?: string; // Location of Document AI processor (e.g., 'eu', 'us')
  documentAIPreferredForGreek?: boolean; // Whether to prefer Document AI for Greek invoices
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
  method: 'gpt' | 'documentAi' | 'pattern';
}
