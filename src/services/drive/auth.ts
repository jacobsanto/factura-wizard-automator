
/**
 * Authentication utilities for Drive Service
 */
import { getValidAccessToken } from '../googleAuth';

/**
 * Ensure authentication is valid before making any API calls
 */
export const ensureAuth = async (): Promise<string> => {
  console.log("Drive auth: Ensuring valid authentication before API call");
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    console.error("Drive auth: Failed to get valid access token");
    throw new Error("No valid access token available");
  }
  
  console.log("Drive auth: Valid access token obtained");
  return accessToken;
};
