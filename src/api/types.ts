
/**
 * Type definitions for API interactions
 */

/**
 * Data structure for extracted invoice data
 */
export interface GptExtractedData {
  vatNumber: string;
  clientName: string;
  issuer: string;
  date: string;
  documentNumber: string;
  amount: string;
  currency: string;
}
