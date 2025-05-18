
/**
 * User information utilities
 */

import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export interface UserInfo {
  id?: string;
  email: string;
  name: string;
  picture?: string;
}

/**
 * Get the current user's information from Supabase
 */
export const getCurrentUser = (): UserInfo | null => {
  try {
    // First check if there's a current Supabase session
    const user = supabase.auth.getUser();
    if (user) {
      const userData = user.data?.user;
      if (userData) {
        return {
          id: userData.id,
          email: userData.email || "No email",
          name: userData.user_metadata?.name || userData.email || "User",
          picture: userData.user_metadata?.avatar_url
        };
      }
    }
    
    // Fallback to checking localStorage
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
