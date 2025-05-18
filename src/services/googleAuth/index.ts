
/**
 * Google Authentication Service
 * This file provides core functionality for Google OAuth authentication.
 */

// Re-export all functionality from submodules
export { getValidAccessToken, refreshAccessToken, getGoogleAuthUrl } from './auth';
export { storeTokens, getStoredTokens, clearTokens } from './storage';
export { exchangeCodeForTokens } from './exchange';
export { checkAndFixAuthState, forceResetAuthState } from './state';
export type { GoogleTokens } from './types';
