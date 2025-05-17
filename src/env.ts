
// This file provides a central location for environment variables
// In production, these should be set through your hosting platform

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = "467372877930-o2pfcrfugeh1c4h5gvo2at9um6grq7eg.apps.googleusercontent.com";
export const GOOGLE_CLIENT_SECRET = "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";

// Make sure this matches EXACTLY what's configured in Google Cloud Console
// Look at your error screen - if you see a different URL, use that one instead
export const GOOGLE_REDIRECT_URI = "https://app.lovable.dev/oauth2callback";

// Note: For production, consider using a proper environment variable system
// This approach works for development but is not secure for production deployments
