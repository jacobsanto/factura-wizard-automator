
/**
 * Types for Google OAuth
 */

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  id_token?: string;
  scope: string;
  expiry_date?: number; // Added for tracking expiration
}
