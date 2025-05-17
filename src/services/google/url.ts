
/**
 * Functions for generating Google OAuth URLs
 */
import { GOOGLE_AUTH_URI, SCOPES } from './constants';
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from '../../env';

/**
 * Generates the Google OAuth authorization URL
 */
export const getGoogleAuthUrl = () => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_REDIRECT_URI) {
    console.error("Missing required environment variables for Google OAuth");
    throw new Error("OAuth configuration missing");
  }

  return `${GOOGLE_AUTH_URI}?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;
};
