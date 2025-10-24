
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
export const getCurrentUser = async (): Promise<UserInfo | null> => {
  try {
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
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || !user.email) {
    return baseKey;
  }
  return `${baseKey}-${user.email}`;
};

/**
 * Synchronous version of getCurrentUser
 */
export const getCurrentUserSync = (): UserInfo | null => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error("Error getting current user from localStorage:", error);
    return null;
  }
};
