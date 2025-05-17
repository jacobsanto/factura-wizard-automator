
/**
 * Functions for validating Google OAuth tokens
 */
import { getStoredTokens } from './storage';
import { refreshAccessToken } from './token';
import { storeTokens } from './storage';

/**
 * Check if stored access token is valid (not expired)
 */
export const isAccessTokenValid = (): boolean => {
  const tokens = getStoredTokens();
  if (!tokens || !tokens.access_token) {
    console.log("Auth validation: No tokens found or missing access token");
    return false;
  }
  
  // If we have an expiry date, check if token is still valid
  if (tokens.expiry_date) {
    const isValid = tokens.expiry_date > Date.now() + 5 * 60 * 1000; // 5 minute buffer
    console.log(`Auth validation: Token validity check - expires in ${Math.round((tokens.expiry_date - Date.now())/60000)} minutes, isValid: ${isValid}`);
    return isValid;
  }
  
  // If no expiry date, assume token is expired
  console.log("Auth validation: No expiry date found on token, assuming expired");
  return false;
};

/**
 * Get a valid access token (refreshing if necessary)
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  console.log("Auth validation: Getting valid access token");
  const tokens = getStoredTokens();
  if (!tokens) {
    console.log("Auth validation: No tokens found in storage");
    return null;
  }
  
  // If token is valid, return it
  if (isAccessTokenValid()) {
    console.log("Auth validation: Access token is valid, returning it");
    return tokens.access_token;
  }
  
  // If token is expired and we have a refresh token, refresh it
  if (tokens.refresh_token) {
    console.log("Auth validation: Access token expired, attempting to refresh");
    try {
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      if (newTokens && newTokens.access_token) {
        console.log("Auth validation: Successfully refreshed access token");
        storeTokens(newTokens);
        return newTokens.access_token;
      } else {
        console.error("Auth validation: Refresh completed but no new access token returned");
        return null;
      }
    } catch (error) {
      console.error("Auth validation: Error refreshing token:", error);
      return null;
    }
  }
  
  console.log("Auth validation: No refresh token available, authentication failed");
  return null;
};

/**
 * Force logout if authentication is broken
 * This helps users recover from broken auth states
 */
export const checkAndFixAuthState = (): boolean => {
  try {
    const tokens = getStoredTokens();
    
    // Check for partial/corrupt token state
    if (!tokens || 
        (tokens && !tokens.refresh_token) || 
        (tokens && !tokens.access_token)) {
      
      console.log("Auth validation: Detected broken authentication state, clearing tokens");
      
      // Clear any existing tokens to force a clean re-login
      localStorage.removeItem("google_tokens");
      localStorage.removeItem("google_user");
      localStorage.removeItem("user");
      
      return false;
    }
    
    // Check for potentially corrupted tokens or invalid format
    if (tokens) {
      try {
        // Just try to access some properties to validate structure
        const testAccessToken = tokens.access_token;
        const testRefreshToken = tokens.refresh_token;
        console.log("Auth validation: Token structure seems valid");
      } catch (error) {
        console.error("Auth validation: Token structure validation failed:", error);
        
        // Clear corrupted tokens
        localStorage.removeItem("google_tokens");
        localStorage.removeItem("google_user");
        localStorage.removeItem("user");
        
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Auth validation: Unexpected error during auth check:", error);
    
    // Clear everything on unexpected error
    localStorage.removeItem("google_tokens");
    localStorage.removeItem("google_user");
    localStorage.removeItem("user");
    
    return false;
  }
};
