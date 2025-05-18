
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, isLoading, isAuthenticated } = context.state;
  const { signIn, signUp, signOut, signInWithGoogle } = context.actions;

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    signInWithGoogle
  };
};

export { AuthProvider } from './AuthProvider';
