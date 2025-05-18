
/**
 * Exchange code for tokens with Google OAuth
 */
import { supabase } from "@/integrations/supabase/client";
import { GOOGLE_REDIRECT_URI } from "@/env";
import { GoogleTokens } from "./types";
import { storeTokens } from "./storage";

// Get the Google OAuth URL for initiating the authentication flow
export const getGoogleAuthUrl = (): string => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  
  const options = {
    redirect_uri: GOOGLE_REDIRECT_URI,
    client_id: "467372877930-o2pfcrfugeh1c4h5gvo2at9um6grq7eg.apps.googleusercontent.com",
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets"
    ].join(" ")
  };
  
  const queryString = new URLSearchParams(options).toString();
  return `${rootUrl}?${queryString}`;
};

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
