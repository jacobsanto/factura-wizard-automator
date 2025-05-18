
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Google OAuth scopes
export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/contacts.readonly',
  'profile',
  'email'
].join(' ');

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    console.info("Starting Google sign-in flow...");
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: GOOGLE_OAUTH_SCOPES
      }
    });
    
    if (error) {
      console.error("Google sign-in error:", error);
      toast({
        title: "Σφάλμα σύνδεσης με Google",
        description: error.message,
        variant: "destructive",
      });
      
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error("Google sign-in exception:", error);
    toast({
      title: "Σφάλμα σύνδεσης με Google",
      description: "Προέκυψε απρόσμενο σφάλμα κατά τη σύνδεση με Google.",
      variant: "destructive",
    });
    
    return { error };
  }
};
