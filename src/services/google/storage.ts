
/**
 * Functions for storing and retrieving Google OAuth tokens
 */
import { GoogleTokens } from './types';

/**
 * Gets stored tokens from localStorage
 */
export const getStoredTokens = (): GoogleTokens | null => {
  const tokenString = localStorage.getItem("google_tokens");
  if (!tokenString) return null;
  
  try {
    return JSON.parse(tokenString) as GoogleTokens;
  } catch (error) {
    console.error("Error parsing stored tokens:", error);
    return null;
  }
};

/**
 * Store tokens in localStorage
 */
export const storeTokens = (tokens: GoogleTokens): void => {
  localStorage.setItem("google_tokens", JSON.stringify(tokens));
};

/**
 * Clear stored tokens (for logout)
 */
export const clearTokens = (): void => {
  localStorage.removeItem("google_tokens");
};
