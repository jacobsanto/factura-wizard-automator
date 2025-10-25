
/**
 * Google Authentication Service
 * This file provides core functionality for Google OAuth authentication.
 */

// Re-export functionality from submodules 
export { getValidAccessToken, refreshAccessToken } from './auth';
export { storeTokens, getStoredTokens, clearTokens } from './storage';
export { checkAndFixAuthState, forceResetAuthState } from './state';
export type { GoogleTokens } from './types';
export { getGoogleAuthUrl, exchangeCodeForTokens } from './exchange';
export { requestGoogleToken, waitForGoogleIdentityServices, isGoogleIdentityServicesLoaded } from './gsi';

