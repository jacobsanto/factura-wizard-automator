
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
      return null;
    }

    console.log("Exchanging code for tokens with redirect URI:", GOOGLE_REDIRECT_URI);
    
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
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("Missing required environment variables for Google OAuth");
      return null;
    }

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
