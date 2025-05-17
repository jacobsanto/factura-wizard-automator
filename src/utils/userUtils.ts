
/**
 * User information utilities
 */

export interface UserInfo {
  id?: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Get the current user's information from localStorage
 */
export const getCurrentUser = (): UserInfo | null => {
  try {
    // First try to get from google_user (newer format)
    const googleUserStr = localStorage.getItem("google_user");
    if (googleUserStr) {
      const googleUser = JSON.parse(googleUserStr);
      return {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name || "Google User",
        picture: googleUser.picture
      };
    }
    
    // Fallback to checking for user info stored in localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Get user-specific storage key
 */
export const getUserStorageKey = (baseKey: string): string => {
  const user = getCurrentUser();
  if (!user || !user.email) {
    return baseKey;
  }
  return `${baseKey}-${user.email}`;
};
