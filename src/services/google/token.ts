
/**
 * Functions for handling Google OAuth tokens
 */
import { GOOGLE_TOKEN_URI } from './constants';
import { GoogleTokens } from './types';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from '../../env';

/**
 * Exchanges an authorization code for access and refresh tokens
 */
export const exchangeCodeForTokens = async (code: string): Promise<GoogleTokens | null> => {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      console.error("Missing required environment variables for Google OAuth");
      console.error({
        hasClientId: !!GOOGLE_CLIENT_ID,
        hasClientSecret: !!GOOGLE_CLIENT_SECRET,
        redirectUri: GOOGLE_REDIRECT_URI
      });
      return null;
    }

    console.log("Exchanging code for tokens with redirect URI:", GOOGLE_REDIRECT_URI);
    
    // Log the calculated redirect URI to check if it matches what we expect
    console.log("Current origin:", window.location.origin);
    console.log("Current URL:", window.location.href);
    
    const response = await fetch(GOOGLE_TOKEN_URI, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error exchanging code for tokens:", errorData);
      console.error("HTTP Status:", response.status, response.statusText);
      return null;
    }

    const tokens = await response.json();
    
    // Add expiry date for easier token refresh management
    if (tokens.expires_in) {
      tokens.expiry_date = Date.now() + tokens.expires_in * 1000;
      console.log(`Token will expire in ${tokens.expires_in} seconds (${new Date(tokens.expiry_date).toLocaleString()})`);
    }
    
    return tokens as GoogleTokens;
  } catch (error) {
    console.error("Exception during code exchange:", error);
    return null;
  }
};

/**
 * Refreshes the access token using the refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<GoogleTokens | null> => {
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Missing required environment variables for Google OAuth");
      return null;
    }

    console.log("Attempting to refresh access token");
    
    const response = await fetch(GOOGLE_TOKEN_URI, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error refreshing access token:", errorData);
      console.error("HTTP Status:", response.status, response.statusText);
      return null;
    }

    const newTokens = await response.json();
    
    // Add expiry date for easier token refresh management
    if (newTokens.expires_in) {
      newTokens.expiry_date = Date.now() + newTokens.expires_in * 1000;
      console.log(`New token will expire in ${newTokens.expires_in} seconds (${new Date(newTokens.expiry_date).toLocaleString()})`);
    }
    
    // Preserve the refresh token since Google doesn't always return it
    newTokens.refresh_token = refreshToken;
    
    console.log("Access token refreshed successfully");
    return newTokens as GoogleTokens;
  } catch (error) {
    console.error("Exception during token refresh:", error);
    return null;
  }
};
