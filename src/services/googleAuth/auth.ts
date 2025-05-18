/**
 * Core authentication functionality for Google OAuth
 */
import { GoogleTokens } from "./types";
import { getStoredTokens, storeTokens, clearTokens } from "./storage";
import { supabase } from "@/integrations/supabase/client";
import { GOOGLE_REDIRECT_URI } from "@/env";

// Get a fresh access token (using refresh token if needed)
export const getValidAccessToken = async (): Promise<string | null> => {
  // Get stored tokens
  const tokens = await getStoredTokens();
  
  if (!tokens) {
    console.log("No tokens found in storage");
    return null;
  }
  
  // If token is still valid, return it
  if (tokens.expiry_date && tokens.expiry_date > Date.now() + 60000) {
    return tokens.access_token;
  }
  
  console.log("Token expired or will expire soon, refreshing...");
  
  // Token is expired or will expire soon, refresh it
  if (tokens.refresh_token) {
    try {
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      if (newTokens && newTokens.access_token) {
        return newTokens.access_token;
      } else {
        console.error("Failed to refresh token - invalid response");
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }
  
  console.error("No refresh token available");
  return null;
};

// Refresh the access token using the refresh token
export const refreshAccessToken = async (refreshToken: string): Promise<GoogleTokens | null> => {
  console.log("Refreshing access token using Supabase Edge Function...");
  
  try {
    const { data: authData } = await supabase.auth.getSession();
    const accessToken = authData.session?.access_token;
    
    if (!accessToken) {
      console.error("No Supabase session available for token refresh");
      return null;
    }
    
    const response = await fetch("/api/google-oauth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token refresh failed:", errorData);
      
      // If unauthorized, we need to clear tokens and re-authenticate
      if (response.status === 401 || response.status === 403) {
        await clearTokens();
      }
      
      return null;
    }
    
    const data = await response.json();
    
    // Make sure we keep the refresh token if the response doesn't include a new one
    const newTokens: GoogleTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      expiry_date: data.expiry_date,
      token_type: "Bearer"
    };
    
    // Store the refreshed tokens
    await storeTokens(newTokens);
    return newTokens;
  } catch (error) {
    console.error("Error during token refresh:", error);
    return null;
  }
};

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
