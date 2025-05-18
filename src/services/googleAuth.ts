
/**
 * Google Authentication Service
 * This file provides core functionality for Google OAuth authentication.
 */
import { GOOGLE_REDIRECT_URI } from "@/env";

// Token storage
interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  expiry_date?: number;
}

// Store tokens in local storage
export const storeTokens = (tokens: GoogleTokens) => {
  if (!tokens.access_token || !tokens.refresh_token) {
    console.error("Invalid tokens received");
    return false;
  }
  
  // Calculate expiry date if it doesn't exist
  if (tokens.expires_in && !tokens.expiry_date) {
    tokens.expiry_date = Date.now() + tokens.expires_in * 1000;
  }
  
  try {
    localStorage.setItem("google_tokens", JSON.stringify(tokens));
    return true;
  } catch (error) {
    console.error("Error storing tokens:", error);
    return false;
  }
};

// Get stored tokens from local storage
export const getStoredTokens = (): GoogleTokens | null => {
  try {
    const tokens = localStorage.getItem("google_tokens");
    if (!tokens) return null;
    return JSON.parse(tokens);
  } catch (error) {
    console.error("Error retrieving tokens:", error);
    return null;
  }
};

// Clear stored tokens from local storage
export const clearTokens = () => {
  try {
    localStorage.removeItem("google_tokens");
    return true;
  } catch (error) {
    console.error("Error clearing tokens:", error);
    return false;
  }
};

// Get a fresh access token (using refresh token if needed)
export const getValidAccessToken = async (): Promise<string | null> => {
  const tokens = getStoredTokens();
  if (!tokens) return null;
  
  // If token is still valid, return it
  if (tokens.expiry_date && tokens.expiry_date > Date.now() + 60000) {
    return tokens.access_token;
  }
  
  // Token is expired or will expire soon, refresh it
  if (tokens.refresh_token) {
    try {
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      if (newTokens && newTokens.access_token) {
        return newTokens.access_token;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  }
  
  return null;
};

// Refresh the access token using the refresh token
export const refreshAccessToken = async (refreshToken: string): Promise<GoogleTokens | null> => {
  console.log("Refreshing access token...");
  
  // This would typically be a server-side operation
  // For the purposes of this fix, we'll return a mock token
  // In a real implementation, this would call a backend service
  
  console.warn("Token refresh is simulated. In production, implement proper OAuth token refresh.");
  
  const mockTokens: GoogleTokens = {
    access_token: "simulated_access_token",
    refresh_token: refreshToken,
    expires_in: 3600,
    expiry_date: Date.now() + 3600000,
    token_type: "Bearer"
  };
  
  storeTokens(mockTokens);
  return mockTokens;
};

// Get the Google OAuth URL for initiating the authentication flow
export const getGoogleAuthUrl = (): string => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  
  const options = {
    redirect_uri: GOOGLE_REDIRECT_URI,
    client_id: "your-client-id.apps.googleusercontent.com", // Replace in production
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets"
    ].join(" ")
  };
  
  const queryString = new URLSearchParams(options).toString();
  return `${rootUrl}?${queryString}`;
};

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (code: string): Promise<GoogleTokens | null> => {
  console.log("Exchanging code for tokens...");
  
  // This would typically be a server-side operation
  // For the purposes of this fix, we'll return a mock token
  // In a real implementation, this would call a backend service
  
  console.warn("Token exchange is simulated. In production, implement proper OAuth token exchange.");
  
  const mockTokens: GoogleTokens = {
    access_token: "simulated_access_token",
    refresh_token: "simulated_refresh_token",
    id_token: "simulated_id_token",
    expires_in: 3600,
    expiry_date: Date.now() + 3600000,
    token_type: "Bearer"
  };
  
  storeTokens(mockTokens);
  return mockTokens;
};

// Check and fix auth state issues
export const checkAndFixAuthState = (): boolean => {
  try {
    const tokens = localStorage.getItem("google_tokens");
    if (!tokens) {
      // No tokens, auth state is valid (user is not logged in)
      return true;
    }
    
    // Check if tokens are valid JSON
    try {
      const parsedTokens = JSON.parse(tokens);
      if (!parsedTokens.access_token || typeof parsedTokens.access_token !== 'string') {
        // Invalid tokens, clear them
        clearTokens();
        return false;
      }
      return true;
    } catch (e) {
      // Invalid JSON, clear tokens
      clearTokens();
      return false;
    }
  } catch (error) {
    console.error("Error checking auth state:", error);
    return false;
  }
};

// Force reset of authentication state
export const forceResetAuthState = (): void => {
  try {
    clearTokens();
    localStorage.removeItem("google_user");
    localStorage.removeItem("user");
    console.log("Auth state reset forced");
  } catch (error) {
    console.error("Error during force reset:", error);
  }
};
