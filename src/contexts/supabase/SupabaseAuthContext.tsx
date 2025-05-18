
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface SupabaseAuthContextProps {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextProps | undefined>(undefined);

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.info("SupabaseAuthProvider: Initializing auth state...");

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.info(`SupabaseAuthProvider: Auth state changed: ${event}`);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Επιτυχής σύνδεση",
            description: "Έχετε συνδεθεί επιτυχώς.",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Αποσύνδεση",
            description: "Έχετε αποσυνδεθεί επιτυχώς.",
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
      console.info("SupabaseAuthProvider: Initial session check complete", { 
        hasSession: !!currentSession,
        user: currentSession?.user?.email
      });
    }).catch(error => {
      console.error("SupabaseAuthProvider: Error getting session", error);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
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

  const signUp = async (email: string, password: string) => {
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
  
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      console.info("Starting Google sign-in flow...");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) {
        console.error("Google sign-in error:", error);
        toast({
          title: "Σφάλμα σύνδεσης με Google",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Google sign-in exception:", error);
      toast({
        title: "Σφάλμα σύνδεσης με Google",
        description: "Προέκυψε απρόσμενο σφάλμα κατά τη σύνδεση με Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
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

  const value = {
    session,
    user,
    isLoading,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider");
  }
  return context;
};
