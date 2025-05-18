
// This file provides a central location for environment variables
// In production, these should be set through your hosting platform

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = "467372877930-o2pfcrfugeh1c4h5gvo2at9um6grq7eg.apps.googleusercontent.com";
export const GOOGLE_CLIENT_SECRET = "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";

// IMPORTANT: Using hardcoded redirect URI to eliminate dynamic URI issues
// This must EXACTLY match what's in Google Cloud Console
export const GOOGLE_REDIRECT_URI = "https://factura.ariviagroup.com/oauth2callback";

// Log configuration on initialization to help with debugging
console.log("OAuth Configuration:");
console.log("- Redirect URI hardcoded as:", GOOGLE_REDIRECT_URI);
console.log("- Current browser URL:", typeof window !== "undefined" ? window.location.href : "Not in browser");
