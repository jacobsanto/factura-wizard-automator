
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
    console.error({
      hasClientId: !!GOOGLE_CLIENT_ID,
      redirectUri: GOOGLE_REDIRECT_URI
    });
    throw new Error("OAuth configuration missing");
  }

  console.log("Generating Google Auth URL with redirect URI:", GOOGLE_REDIRECT_URI);
  console.log("Current origin:", window.location.origin);
  
  return `${GOOGLE_AUTH_URI}?response_type=code&client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;
};
