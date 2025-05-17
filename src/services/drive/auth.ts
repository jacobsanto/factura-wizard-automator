
/**
 * Authentication utilities for Drive Service
 */
import { getValidAccessToken } from '../googleAuth';

/**
 * Ensure authentication is valid before making any API calls
 */
export const ensureAuth = async (): Promise<string> => {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    throw new Error("No valid access token available");
  }
  
  return accessToken;
};
