
/**
 * Token storage functionality for Google Authentication
 */
import { GoogleTokens } from "./types";

// Store tokens in local storage only for session duration
export const storeTokens = async (tokens: GoogleTokens) => {
  console.log("Storage: Attempting to store tokens...");
  
  if (!tokens || !tokens.access_token) {
    console.error("Storage: Invalid tokens received - missing access_token");
    return false;
  }
  
  // Calculate expiry date if it doesn't exist
  if (tokens.expires_in && !tokens.expiry_date) {
    tokens.expiry_date = Date.now() + tokens.expires_in * 1000;
    console.log("Storage: Calculated expiry date:", new Date(tokens.expiry_date).toISOString());
  }
  
  // Validate token structure
  if (typeof tokens.access_token !== 'string' || tokens.access_token.length === 0) {
    console.error("Storage: Invalid access_token format");
    return false;
  }
  
  try {
    // Store tokens in local storage for session usage
    localStorage.setItem("google_tokens", JSON.stringify(tokens));
    console.log("Storage: Tokens stored successfully");
    console.log("Storage: Expiry:", new Date(tokens.expiry_date || 0).toLocaleString());
    return true;
  } catch (error) {
    console.error("Storage: Error storing tokens:", error);
    return false;
  }
};

// Get stored tokens from local storage
export const getStoredTokens = async (): Promise<GoogleTokens | null> => {
  try {
    const tokensString = localStorage.getItem("google_tokens");
    
    if (!tokensString) {
      console.log("Storage: No tokens found in localStorage");
      return null;
    }
    
    const tokens = JSON.parse(tokensString);
    
    // Validate token structure
    if (!tokens.access_token) {
      console.error("Storage: Stored tokens are invalid - missing access_token");
      await clearTokens();
      return null;
    }
    
    console.log("Storage: Retrieved tokens successfully");
    return tokens;
  } catch (error) {
    console.error("Storage: Error retrieving tokens:", error);
    await clearTokens();
    return null;
  }
};

// Clear stored tokens
export const clearTokens = async (): Promise<boolean> => {
  try {
    localStorage.removeItem("google_tokens");
    console.log("Storage: Tokens cleared");
    return true;
  } catch (error) {
    console.error("Storage: Error clearing tokens:", error);
    return false;
  }
};
