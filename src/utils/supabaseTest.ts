
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function to test Supabase connectivity
 * @returns Promise<boolean> Whether the connection was successful
 */
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    // A simple ping to Supabase by checking auth status
    // This doesn't require authentication but will verify the connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
    
    console.log("Supabase connection test successful:", data);
    return true;
  } catch (err) {
    console.error("Error testing Supabase connection:", err);
    return false;
  }
};
