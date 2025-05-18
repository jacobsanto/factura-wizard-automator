
/**
 * Token storage functionality for Google Authentication
 */
import { supabase } from "@/integrations/supabase/client";
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
    // Try to get tokens from local storage
    const tokensString = localStorage.getItem("google_tokens");
    
    if (tokensString) {
      return JSON.parse(tokensString);
    }
    
    // If not in local storage, try to get from Supabase session
    const { data } = await supabase.auth.getSession();
    if (data.session?.provider_token) {
      const tokens: GoogleTokens = {
        access_token: data.session.provider_token,
        refresh_token: data.session.provider_refresh_token || '',
        expiry_date: Date.now() + 3600 * 1000, // Default to 1 hour if unknown
        token_type: "Bearer"
      };
      
      // Store in local storage for future use
      localStorage.setItem("google_tokens", JSON.stringify(tokens));
      return tokens;
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
    // Clear from local storage
    localStorage.removeItem("google_tokens");
    return true;
  } catch (error) {
    console.error("Error clearing tokens:", error);
    return false;
  }
};
