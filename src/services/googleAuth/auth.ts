/**
 * Core authentication functionality for Google OAuth
 */
import { GoogleTokens } from "./types";
import { getStoredTokens, storeTokens, clearTokens } from "./storage";
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from "@/env";

// Get a fresh access token (using refresh token if needed)
export const getValidAccessToken = async (): Promise<string | null> => {
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

// Refresh the access token using the refresh token directly with Google
export const refreshAccessToken = async (refreshToken: string): Promise<GoogleTokens | null> => {
  console.log("Refreshing access token directly with Google...");
  
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token refresh failed:", errorData);
      
      // If unauthorized, clear tokens
      if (response.status === 401 || response.status === 403) {
        await clearTokens();
      }
      
      return null;
    }
    
    const data = await response.json();
    
    const newTokens: GoogleTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      expiry_date: Date.now() + (data.expires_in * 1000),
      token_type: "Bearer"
    };
    
    await storeTokens(newTokens);
    return newTokens;
  } catch (error) {
    console.error("Error during token refresh:", error);
    return null;
  }
};
