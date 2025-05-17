
/**
 * Google Authentication Service
 * Handles OAuth flow and token management
 */

// OAuth endpoints
const GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token";

// Scopes needed for the application
// Using more specific scopes for better security:
// - gmail.readonly - for reading emails
// - drive.file - for file operations on files created by the app
// - spreadsheets - for Google Sheets operations
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
].join(" ");

interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  id_token?: string;
  scope: string;
  expiry_date?: number; // Added for tracking expiration
}

/**
 * Generates the Google OAuth authorization URL
 */
export const getGoogleAuthUrl = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    console.error("Missing required environment variables for Google OAuth");
    throw new Error("OAuth configuration missing");
  }

  return `${GOOGLE_AUTH_URI}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;
};

/**
 * Exchanges an authorization code for access and refresh tokens
 */
export const exchangeCodeForTokens = async (code: string): Promise<GoogleTokens | null> => {
  try {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    
    if (!clientId || !clientSecret || !redirectUri) {
      console.error("Missing required environment variables for Google OAuth");
      return null;
    }

    const response = await fetch(GOOGLE_TOKEN_URI, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error exchanging code for tokens:", errorData);
      return null;
    }

    const tokens = await response.json();
    
    // Add expiry date for easier token refresh management
    if (tokens.expires_in) {
      tokens.expiry_date = Date.now() + tokens.expires_in * 1000;
    }
    
    return tokens as GoogleTokens;
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    return null;
  }
};

/**
 * Refreshes the access token using the refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<GoogleTokens | null> => {
  try {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error("Missing required environment variables for Google OAuth");
      return null;
    }

    const response = await fetch(GOOGLE_TOKEN_URI, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error refreshing access token:", errorData);
      return null;
    }

    const newTokens = await response.json();
    
    // Add expiry date for easier token refresh management
    if (newTokens.expires_in) {
      newTokens.expiry_date = Date.now() + newTokens.expires_in * 1000;
    }
    
    // Preserve the refresh token since Google doesn't always return it
    newTokens.refresh_token = refreshToken;
    
    return newTokens as GoogleTokens;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return null;
  }
};

/**
 * Gets stored tokens from localStorage
 */
export const getStoredTokens = (): GoogleTokens | null => {
  const tokenString = localStorage.getItem("google_tokens");
  if (!tokenString) return null;
  
  try {
    return JSON.parse(tokenString) as GoogleTokens;
  } catch (error) {
    console.error("Error parsing stored tokens:", error);
    return null;
  }
};

/**
 * Store tokens in localStorage
 */
export const storeTokens = (tokens: GoogleTokens): void => {
  localStorage.setItem("google_tokens", JSON.stringify(tokens));
};

/**
 * Check if stored access token is valid (not expired)
 */
export const isAccessTokenValid = (): boolean => {
  const tokens = getStoredTokens();
  if (!tokens || !tokens.access_token) return false;
  
  // If we have an expiry date, check if token is still valid
  if (tokens.expiry_date) {
    // Add 5 minute buffer to be safe
    return tokens.expiry_date > Date.now() + 5 * 60 * 1000;
  }
  
  // If no expiry date, assume token is expired
  return false;
};

/**
 * Get a valid access token (refreshing if necessary)
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  const tokens = getStoredTokens();
  if (!tokens) return null;
  
  // If token is valid, return it
  if (isAccessTokenValid()) {
    return tokens.access_token;
  }
  
  // If token is expired and we have a refresh token, refresh it
  if (tokens.refresh_token) {
    const newTokens = await refreshAccessToken(tokens.refresh_token);
    if (newTokens && newTokens.access_token) {
      storeTokens(newTokens);
      return newTokens.access_token;
    }
  }
  
  return null;
};

/**
 * Clear stored tokens (for logout)
 */
export const clearTokens = (): void => {
  localStorage.removeItem("google_tokens");
};
