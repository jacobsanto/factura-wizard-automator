/**
 * Google Identity Services (GIS) Integration
 * This replaces the traditional OAuth flow with Google's modern token client
 */
import { GOOGLE_CLIENT_ID } from "@/env";
import { GoogleTokens } from "./types";
import { storeTokens } from "./storage";

// Define Google Identity Services types
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient;
        };
      };
    };
  }
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  error_callback?: (error: ErrorResponse) => void;
}

interface TokenClient {
  requestAccessToken: (options?: { prompt?: string }) => void;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

interface ErrorResponse {
  type: string;
  message: string;
}

const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets"
].join(" ");

/**
 * Initialize and request access token using Google Identity Services
 */
export const requestGoogleToken = (): Promise<GoogleTokens> => {
  return new Promise((resolve, reject) => {
    // Check if Google Identity Services is loaded
    if (!window.google?.accounts?.oauth2) {
      reject(new Error("Google Identity Services not loaded"));
      return;
    }

    console.log("Initializing Google Identity Services token client...");

    // Create token client
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (response: TokenResponse) => {
        if (response.error) {
          console.error("Token request failed:", response.error, response.error_description);
          reject(new Error(response.error_description || response.error));
          return;
        }

        console.log("Access token received successfully");
        
        const tokens: GoogleTokens = {
          access_token: response.access_token,
          refresh_token: "", // GIS doesn't provide refresh tokens in browser
          expiry_date: Date.now() + (response.expires_in * 1000),
          token_type: response.token_type || "Bearer",
          expires_in: response.expires_in
        };

        await storeTokens(tokens);
        resolve(tokens);
      },
      error_callback: (error: ErrorResponse) => {
        console.error("Token client error:", error);
        reject(new Error(error.message || "Token request failed"));
      }
    });

    // Request access token with consent prompt
    console.log("Requesting access token...");
    tokenClient.requestAccessToken({ prompt: "consent" });
  });
};

/**
 * Check if Google Identity Services is loaded
 */
export const isGoogleIdentityServicesLoaded = (): boolean => {
  return !!window.google?.accounts?.oauth2;
};

/**
 * Wait for Google Identity Services to load
 */
export const waitForGoogleIdentityServices = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isGoogleIdentityServicesLoaded()) {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (isGoogleIdentityServicesLoaded()) {
        clearInterval(checkInterval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        reject(new Error("Google Identity Services failed to load"));
      }
    }, 100);
  });
};
