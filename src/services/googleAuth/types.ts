
/**
 * Type definitions for Google Authentication
 */

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  expiry_date?: number;
}
