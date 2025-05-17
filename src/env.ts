
// This file provides a central location for environment variables
// In production, these should be set through your hosting platform

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = "467372877930-o2pfcrfugeh1c4h5gvo2at9um6grq7eg.apps.googleusercontent.com";
export const GOOGLE_CLIENT_SECRET = "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";

// Dynamically determine the current URL for the redirect URI
// This helps with different environments (local, preview, production)
const getCurrentDomain = () => {
  return typeof window !== "undefined" 
    ? `${window.location.protocol}//${window.location.host}`
    : "https://preview--factura-wizard-automator.lovable.app"; // Fallback
};

// Make sure this matches EXACTLY what's configured in Google Cloud Console
// Using a dynamic URI that adapts to the current deployment
export const GOOGLE_REDIRECT_URI = `${getCurrentDomain()}/oauth2callback`;

// Note: For production, consider using a proper environment variable system
// This approach works for development but is not secure for production deployments
