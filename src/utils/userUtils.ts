
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
export const getCurrentUser = async (): Promise<UserInfo | null> => {
  try {
    // First check if there's a current Supabase session
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting current user:", error);
      return null;
    }
    
    if (data?.user) {
      const userData = data.user;
      return {
        id: userData.id,
        email: userData.email || "No email",
        name: userData.user_metadata?.name || userData.email || "User",
        picture: userData.user_metadata?.avatar_url
      };
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
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user || !user.email) {
    return baseKey;
  }
  return `${baseKey}-${user.email}`;
};
