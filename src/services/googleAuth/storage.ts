
/**
 * Token storage functionality for Google Authentication
 */
import { supabase } from "@/integrations/supabase/client";
import { GoogleTokens } from "./types";

// Store tokens in local storage (temporary storage for session duration)
// and in the database (persistent storage)
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
    
    // Also store tokens in database for persistence
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      // Only store tokens if user is authenticated
      const { error } = await supabase.from('user_google_tokens').upsert({
        user_id: sessionData.session.user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date || 0
      }, { onConflict: 'user_id' });
      
      if (error) {
        console.error("Error storing tokens in database:", error);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error storing tokens:", error);
    return false;
  }
};

// Get stored tokens from local storage or database
export const getStoredTokens = async (): Promise<GoogleTokens | null> => {
  try {
    // First try to get tokens from local storage (faster)
    const tokensString = localStorage.getItem("google_tokens");
    
    if (tokensString) {
      return JSON.parse(tokensString);
    }
    
    // If not in local storage, try to get from database
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      // Only fetch tokens if user is authenticated
      const { data, error } = await supabase
        .from('user_google_tokens')
        .select('access_token, refresh_token, expiry_date')
        .eq('user_id', sessionData.session.user.id)
        .single();
      
      if (error || !data) {
        console.error("Error fetching tokens from database:", error);
        return null;
      }
      
      // Store fetched tokens in local storage for future use
      const tokens: GoogleTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiry_date: data.expiry_date
      };
      
      localStorage.setItem("google_tokens", JSON.stringify(tokens));
      return tokens;
    }
    
    return null;
  } catch (error) {
    console.error("Error retrieving tokens:", error);
    return null;
  }
};

// Clear stored tokens from local storage and database
export const clearTokens = async (): Promise<boolean> => {
  try {
    // Clear from local storage
    localStorage.removeItem("google_tokens");
    
    // Clear from database
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData.session) {
      // Only delete tokens if user is authenticated
      const { error } = await supabase
        .from('user_google_tokens')
        .delete()
        .eq('user_id', sessionData.session.user.id);
      
      if (error) {
        console.error("Error deleting tokens from database:", error);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error clearing tokens:", error);
    return false;
  }
};
