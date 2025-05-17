
/**
 * Functions for generating Google OAuth URLs
 */
import { GOOGLE_AUTH_URI, SCOPES } from './constants';
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from '../../env';

/**
 * Validates OAuth configuration
 */
const validateOAuthConfig = () => {
  const issues = [];
  
  if (!GOOGLE_CLIENT_ID) {
    issues.push("Missing GOOGLE_CLIENT_ID");
  }
  
  if (!GOOGLE_REDIRECT_URI) {
    issues.push("Missing GOOGLE_REDIRECT_URI");
  }
  
  if (issues.length > 0) {
    console.error("OAuth configuration validation failed:", issues);
    throw new Error(`OAuth configuration issues: ${issues.join(", ")}`);
  }
  
  return true;
};

/**
 * Generates the Google OAuth authorization URL
 */
export const getGoogleAuthUrl = () => {
  try {
    // Validate configuration
    validateOAuthConfig();
    
    console.log("Generating Google Auth URL with:");
    console.log("- Client ID:", GOOGLE_CLIENT_ID.substring(0, 8) + "...");
    console.log("- Redirect URI:", GOOGLE_REDIRECT_URI);
    console.log("- Current Origin:", typeof window !== "undefined" ? window.location.origin : "Not in browser");
    console.log("- Requested Scopes:", SCOPES);
    
    // Check if current origin matches part of the redirect URI to detect mismatches
    if (typeof window !== "undefined" && GOOGLE_REDIRECT_URI && !GOOGLE_REDIRECT_URI.includes(window.location.origin)) {
      console.warn("⚠️ Potential redirect URI mismatch! The current origin does not match the redirect URI.");
      console.warn("  Current origin:", window.location.origin);
      console.warn("  Redirect URI:", GOOGLE_REDIRECT_URI);
      // This isn't necessarily an error, as localhost development may use different URLs
    }
    
    // Use encodeURIComponent for all parameters to ensure proper URL encoding
    const authUrl = `${GOOGLE_AUTH_URI}?response_type=code&client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent&include_granted_scopes=true`;
    
    console.log("Full Auth URL length:", authUrl.length);
    
    // Test URL validity to catch issues early
    try {
      new URL(authUrl);
    } catch (urlError) {
      console.error("Generated auth URL is invalid:", urlError);
      throw new Error(`Invalid authentication URL: ${urlError instanceof Error ? urlError.message : String(urlError)}`);
    }
    
    return authUrl;
  } catch (error) {
    console.error("Failed to generate Google authentication URL:", error);
    throw error; // Re-throw to let calling code handle it
  }
};
