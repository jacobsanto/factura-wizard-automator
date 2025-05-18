
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { signInWithEmailPassword, signUpWithEmailPassword, signOutUser, handleOAuthTokens } from './authMethods';
import { signInWithGoogle } from './googleAuth';
import { SupabaseAuthContextProps } from './types';

const SupabaseAuthContext = createContext<SupabaseAuthContextProps | undefined>(undefined);

export const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.info("SupabaseAuthProvider: Initializing auth state...");

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.info(`SupabaseAuthProvider: Auth state changed: ${event}`);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If this is a sign in with OAuth provider, check for Google tokens
        if (event === 'SIGNED_IN') {
          if (currentSession) {
            const tokenStored = await handleOAuthTokens(currentSession);
            
            if (tokenStored) {
              toast({
                title: "Σύνδεση με Google επιτυχής",
                description: "Έχετε πρόσβαση στις υπηρεσίες Google.",
              });
            }
          }
          
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
      
      // If session exists and has provider tokens, store them
      if (currentSession) {
        handleOAuthTokens(currentSession);
      }
      
      setIsLoading(false);
      console.info("SupabaseAuthProvider: Initial session check complete", { 
        hasSession: !!currentSession,
        user: currentSession?.user?.email,
        hasGoogleTokens: !!currentSession?.provider_token
      });
    }).catch(error => {
      console.error("SupabaseAuthProvider: Error getting session", error);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignInWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    isAuthenticated: !!session,
    signIn: signInWithEmailPassword,
    signUp: signUpWithEmailPassword,
    signOut: signOutUser,
    signInWithGoogle: handleSignInWithGoogle,
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
