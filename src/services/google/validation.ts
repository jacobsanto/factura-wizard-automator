
/**
 * Functions for validating Google OAuth tokens
 */
import { getStoredTokens } from './storage';
import { refreshAccessToken } from './token';
import { storeTokens } from './storage';

/**
 * Check if stored access token is valid (not expired)
 */
export const isAccessTokenValid = (): boolean => {
  const tokens = getStoredTokens();
  if (!tokens || !tokens.access_token) return false;
  
  // If we have an expiry date, check if token is still valid
  if (tokens.expiry_date) {
    // Add 5 minute buffer to be safe
    return tokens.expiry_date > Date.now() + 5 * 60 * 1000;
  }
  
  // If no expiry date, assume token is expired
  return false;
};

/**
 * Get a valid access token (refreshing if necessary)
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  const tokens = getStoredTokens();
  if (!tokens) return null;
  
  // If token is valid, return it
  if (isAccessTokenValid()) {
    return tokens.access_token;
  }
  
  // If token is expired and we have a refresh token, refresh it
  if (tokens.refresh_token) {
    const newTokens = await refreshAccessToken(tokens.refresh_token);
    if (newTokens && newTokens.access_token) {
      storeTokens(newTokens);
      return newTokens.access_token;
    }
  }
  
  return null;
};
