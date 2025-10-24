
/**
 * Token storage functionality for Google Authentication
 */
import { GoogleTokens } from "./types";

// Store tokens in local storage only for session duration
export const storeTokens = async (tokens: GoogleTokens) => {
  if (!tokens.access_token) {
    console.error("Invalid tokens received - missing access_token");
    return false;
  }
  
  // Calculate expiry date if it doesn't exist
  if (tokens.expires_in && !tokens.expiry_date) {
    tokens.expiry_date = Date.now() + tokens.expires_in * 1000;
  }
  
  try {
    // Store tokens in local storage for session usage
    localStorage.setItem("google_tokens", JSON.stringify(tokens));
    return true;
  } catch (error) {
    console.error("Error storing tokens:", error);
    return false;
  }
};

// Get stored tokens from local storage
export const getStoredTokens = async (): Promise<GoogleTokens | null> => {
  try {
    const tokensString = localStorage.getItem("google_tokens");
    
    if (tokensString) {
      return JSON.parse(tokensString);
    }
    
    return null;
  } catch (error) {
    console.error("Error retrieving tokens:", error);
    return null;
  }
};

// Clear stored tokens
export const clearTokens = async (): Promise<boolean> => {
  try {
    localStorage.removeItem("google_tokens");
    return true;
  } catch (error) {
    console.error("Error clearing tokens:", error);
    return false;
  }
};
