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
      console.error("GIS Error: Google Identity Services not loaded");
      reject(new Error("Google Identity Services failed to load. Please refresh the page and try again."));
      return;
    }

    console.log("GIS: Initializing Google Identity Services token client...");
    console.log("GIS: Client ID:", GOOGLE_CLIENT_ID);
    console.log("GIS: Scopes:", SCOPES);

    try {
      // Create token client
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (response: TokenResponse) => {
          if (response.error) {
            console.error("GIS Token Error:", response.error, response.error_description);
            
            // Provide user-friendly error messages
            let errorMessage = "Authentication failed";
            if (response.error === 'popup_closed_by_user') {
              errorMessage = "Sign-in popup was closed. Please try again.";
            } else if (response.error === 'access_denied') {
              errorMessage = "Access was denied. Please grant the required permissions.";
            } else if (response.error_description) {
              errorMessage = response.error_description;
            }
            
            reject(new Error(errorMessage));
            return;
          }

          console.log("GIS: Access token received successfully");
          console.log("GIS: Token expires in", response.expires_in, "seconds");
          
          const tokens: GoogleTokens = {
            access_token: response.access_token,
            refresh_token: "", // GIS doesn't provide refresh tokens in browser
            expiry_date: Date.now() + (response.expires_in * 1000),
            token_type: response.token_type || "Bearer",
            expires_in: response.expires_in
          };

          const stored = await storeTokens(tokens);
          if (!stored) {
            reject(new Error("Failed to store authentication tokens"));
            return;
          }
          
          console.log("GIS: Tokens stored successfully");
          resolve(tokens);
        },
        error_callback: (error: ErrorResponse) => {
          console.error("GIS Error Callback:", error);
          reject(new Error(error.message || "Token request failed"));
        }
      });

      // Request access token with consent prompt
      console.log("GIS: Requesting access token with consent prompt...");
      tokenClient.requestAccessToken({ prompt: "consent" });
      
    } catch (error) {
      console.error("GIS Initialization Error:", error);
      reject(new Error("Failed to initialize Google sign-in. Please try again."));
    }
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
    console.log("GIS: Checking if Google Identity Services is loaded...");
    
    if (isGoogleIdentityServicesLoaded()) {
      console.log("GIS: Already loaded");
      resolve();
      return;
    }

    console.log("GIS: Waiting for script to load...");
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds max wait
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (isGoogleIdentityServicesLoaded()) {
        clearInterval(checkInterval);
        console.log(`GIS: Loaded successfully after ${attempts * 100}ms`);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.error("GIS: Failed to load after 10 seconds");
        reject(new Error("Google Identity Services failed to load. Please check your internet connection and refresh the page."));
      }
    }, 100);
  });
};
