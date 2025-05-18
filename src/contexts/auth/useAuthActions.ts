
import { useSupabaseAuth } from "../supabase/SupabaseAuthContext";
import { GoogleUserInfo } from "./types";
import { useUserInfo } from "./useUserInfo";

interface AuthActionsProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setUser: (user: any) => void;
  setServiceStatus: (status: any) => void;
}

export function useAuthActions({
  isAuthenticated,
  setIsAuthenticated,
  setIsLoading,
  setUser,
  setServiceStatus
}: AuthActionsProps) {
  const supabaseAuth = useSupabaseAuth();
  const { extractUserInfo } = useUserInfo();
  
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await supabaseAuth.signIn(email, password);
    setIsLoading(false);
    return result;
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await supabaseAuth.signUp(email, password);
    setIsLoading(false);
    return result;
  };
  
  const signOut = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      await supabaseAuth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setServiceStatus({
        gmail: false,
        drive: false,
        sheets: false
      });
      
      // Clear any auth data from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await supabaseAuth.signInWithGoogle();
      // Auth state changes will be handled by the Supabase auth state listener
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshToken = async () => {
    // This would be implemented for token refresh logic if needed
    console.log("Token refresh triggered");
  };
  
  return {
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    refreshToken
  };
}
