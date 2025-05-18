
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { storeTokens } from '@/services/googleAuth/storage';

// Sign in with email and password
export const signInWithEmailPassword = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Σφάλμα σύνδεσης",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error("Sign in exception:", error);
    return { error };
  }
};

// Sign up with email and password
export const signUpWithEmailPassword = async (email: string, password: string) => {
  try {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast({
        title: "Σφάλμα εγγραφής",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
    
    toast({
      title: "Επιτυχής εγγραφή",
      description: "Παρακαλώ ελέγξτε το email σας για επιβεβαίωση.",
    });
    return { error: null };
  } catch (error) {
    console.error("Sign up exception:", error);
    return { error };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await supabase.auth.signOut();
    // Toast notification is handled by the onAuthStateChange event
  } catch (error) {
    console.error("Sign out error:", error);
    toast({
      title: "Σφάλμα αποσύνδεσης",
      description: "Προέκυψε σφάλμα κατά την αποσύνδεση.",
      variant: "destructive",
    });
  }
};

// Handle OAuth tokens storage
export const handleOAuthTokens = async (session: any) => {
  if (session?.provider_token && session.provider_refresh_token) {
    console.log("Found OAuth tokens, storing for Google services");
    
    await storeTokens({
      access_token: session.provider_token,
      refresh_token: session.provider_refresh_token,
      expiry_date: Date.now() + 3600 * 1000, // Default to 1 hour
      token_type: "Bearer"
    });
    
    return true;
  }
  
  return false;
};
