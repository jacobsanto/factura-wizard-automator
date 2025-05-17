
/**
 * Functions for handling Google OAuth tokens
 */
import { GOOGLE_TOKEN_URI } from './constants';
import { GoogleTokens } from './types';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from '../../env';

/**
 * Validates token configuration before making requests
 */
const validateTokenConfig = () => {
  const issues = [];
  
  if (!GOOGLE_CLIENT_ID) {
    issues.push("Missing GOOGLE_CLIENT_ID");
  }
  
  if (!GOOGLE_CLIENT_SECRET) {
    issues.push("Missing GOOGLE_CLIENT_SECRET");
  }
  
  if (!GOOGLE_REDIRECT_URI) {
    issues.push("Missing GOOGLE_REDIRECT_URI");
  }
  
  if (issues.length > 0) {
    console.error("Token configuration validation failed:", issues);
    throw new Error(`Token configuration issues: ${issues.join(", ")}`);
  }
  
  return true;
};

/**
 * Exchanges an authorization code for access and refresh tokens
 */
export const exchangeCodeForTokens = async (code: string): Promise<GoogleTokens | null> => {
  try {
    console.log("Starting token exchange process");
    
    // Validate configuration
    validateTokenConfig();

    console.log("Exchanging code for tokens with:");
    console.log("- Client ID:", GOOGLE_CLIENT_ID.substring(0, 8) + "...");
    console.log("- Client Secret:", "PRESENT (hidden)");
    console.log("- Redirect URI:", GOOGLE_REDIRECT_URI);
    console.log("- Current Origin:", typeof window !== "undefined" ? window.location.origin : "Not in browser");
    
    const tokenRequest = {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    };
    
    console.log("Sending token request to:", GOOGLE_TOKEN_URI);
    
    const response = await fetch(GOOGLE_TOKEN_URI, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(tokenRequest),
    }).catch(error => {
      // Catch network errors
      console.error("Network error during token exchange:", error);
      throw new Error(`Network error during token exchange: ${error instanceof Error ? error.message : String(error)}`);
    });

    console.log("Token response received:");
    console.log("- Status:", response.status, response.statusText);
    console.log("- Headers:", Object.fromEntries([...response.headers]));

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: "Failed to parse error response", raw: errorText };
      }
      
      console.error("Error exchanging code for tokens:");
      console.error("- Status:", response.status, response.statusText);
      console.error("- Error data:", errorData);
      
      // For specific known errors, provide more detailed information
      if (response.status === 400 && errorData?.error === "invalid_grant") {
        console.error("Invalid grant error - this usually means the authorization code has expired or was already used");
      } else if (response.status === 401) {
        console.error("Unauthorized - check client ID and client secret");
      } else if (response.status === 403) {
        console.error("Forbidden - check permissions and consent screen configuration");
      } else if (response.status === 429) {
        console.error("Too many requests - you've hit a rate limit");
      }
      
      return null;
    }

    const tokens = await response.json();
    
    // Add expiry date for easier token refresh management
    if (tokens.expires_in) {
      tokens.expiry_date = Date.now() + tokens.expires_in * 1000;
      console.log(`Token will expire in ${tokens.expires_in} seconds (${new Date(tokens.expiry_date).toLocaleString()})`);
    }
    
    console.log("Token exchange successful, received access token");
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
    }).catch(error => {
      // Catch network errors
      console.error("Network error during token refresh:", error);
      return null;
    });

    if (!response || !response.ok) {
      const errorData = response ? await response.json() : { error: "Network error" };
      console.error("Error refreshing access token:", errorData);
      console.error("HTTP Status:", response ? `${response.status} ${response.statusText}` : "No response");
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
