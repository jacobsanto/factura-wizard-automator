
import { SupabaseAuthProvider, useSupabaseAuth } from '../supabase/SupabaseAuthContext';

// Re-export the SupabaseAuth provider and hook as our main auth system
export const AuthProvider = SupabaseAuthProvider;
export const useAuth = useSupabaseAuth;
