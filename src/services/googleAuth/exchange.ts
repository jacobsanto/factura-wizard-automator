
/**
 * Code exchange functionality for Google OAuth
 */
import { GoogleTokens } from "./types";
import { storeTokens } from "./storage";
import { supabase } from "@/integrations/supabase/client";

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (code: string): Promise<GoogleTokens | null> => {
  console.log("Exchanging code for tokens using Supabase Edge Function...");
  
  try {
    const { data: authData } = await supabase.auth.getSession();
    const accessToken = authData.session?.access_token;
    
    if (!accessToken) {
      console.error("No Supabase session available for code exchange");
      return null;
    }
    
    const response = await fetch("/api/google-oauth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Code exchange failed:", errorData);
      return null;
    }
    
    const data = await response.json();
    
    const tokens: GoogleTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expiry_date: data.expiry_date,
      token_type: "Bearer"
    };
    
    // Store tokens in both local storage and database
    await storeTokens(tokens);
    return tokens;
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    return null;
  }
};
