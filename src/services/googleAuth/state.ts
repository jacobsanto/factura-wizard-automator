
/**
 * Auth state management for Google OAuth
 */
import { clearTokens } from "./storage";

// Check and fix auth state issues
export const checkAndFixAuthState = async (): Promise<boolean> => {
  try {
    const tokensString = localStorage.getItem("google_tokens");
    if (!tokensString) {
      // No tokens, auth state is valid (user is not logged in)
      return true;
    }
    
    // Check if tokens are valid JSON
    try {
      const parsedTokens = JSON.parse(tokensString);
      if (!parsedTokens.access_token || typeof parsedTokens.access_token !== 'string') {
        // Invalid tokens, clear them
        await clearTokens();
        return false;
      }
      return true;
    } catch (e) {
      // Invalid JSON, clear tokens
      await clearTokens();
      return false;
    }
  } catch (error) {
    console.error("Error checking auth state:", error);
    return false;
  }
};

// Force reset of authentication state
export const forceResetAuthState = async (): Promise<void> => {
  try {
    await clearTokens();
    localStorage.removeItem("google_user");
    localStorage.removeItem("user");
    console.log("Auth state reset forced");
  } catch (error) {
    console.error("Error during force reset:", error);
  }
};
