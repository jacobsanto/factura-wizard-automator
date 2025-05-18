
// This file provides a central location for environment variables
// In production, these should be set through your hosting platform

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = "467372877930-o2pfcrfugeh1c4h5gvo2at9um6grq7eg.apps.googleusercontent.com";
export const GOOGLE_CLIENT_SECRET = "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";

// For development environment, use window.location.origin
// For production, use the fixed URL
export const GOOGLE_REDIRECT_URI = typeof window !== "undefined" 
  ? `${window.location.origin}/oauth2callback` 
  : "https://factura.ariviagroup.com/oauth2callback";

// Log configuration on initialization to help with debugging
console.log("OAuth Configuration:");
console.log("- Redirect URI:", GOOGLE_REDIRECT_URI);
console.log("- Current browser URL:", typeof window !== "undefined" ? window.location.href : "Not in browser");
