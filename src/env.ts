
// This file provides a central location for environment variables
// In production, these should be set through your hosting platform

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = "467372877930-o2pfcrfugeh1c4h5gvo2at9um6grq7eg.apps.googleusercontent.com";
export const GOOGLE_CLIENT_SECRET = "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";

// Dynamically determine the current URL for the redirect URI
// This helps with different environments (local, preview, production)
const getCurrentDomain = () => {
  // When in the browser, use the current window location
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Fallback for SSR or during initialization
  // Using custom domain as default fallback
  return "https://factura.ariviagroup.com";
};

// Make sure this matches EXACTLY what's configured in Google Cloud Console
export const GOOGLE_REDIRECT_URI = `${getCurrentDomain()}/oauth2callback`;

// Log the redirect URI during initialization to help with debugging
console.log("OAuth Redirect URI configured as:", GOOGLE_REDIRECT_URI);
