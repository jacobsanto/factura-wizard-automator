
// This file provides a central location for environment variables
// In production, these should be set through your hosting platform

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = "467372877930-o2pfcrfugeh1c4h5gvo2at9um6grq7eg.apps.googleusercontent.com";

// IMPORTANT: Using hardcoded redirect URI to eliminate dynamic URI issues
// This must EXACTLY match what's in Google Cloud Console
// Set this to the actual production domain where the app is hosted
const PRODUCTION_DOMAIN = "factura.ariviagroup.com";

// Determine if we're in production
const isProduction = window.location.hostname === PRODUCTION_DOMAIN;

// Set the redirect URI based on environment
export const GOOGLE_REDIRECT_URI = isProduction 
  ? `https://${PRODUCTION_DOMAIN}/oauth2callback`
  : `${window.location.origin}/oauth2callback`;

// Log configuration on initialization to help with debugging
console.log("OAuth Configuration:");
console.log("- Redirect URI set to:", GOOGLE_REDIRECT_URI);
console.log("- Current browser URL:", window.location.href);
console.log("- Is Production:", isProduction);
