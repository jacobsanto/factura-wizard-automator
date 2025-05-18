
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { 
    isAuthenticated, 
    isLoading, 
    user,
    serviceStatus,
    signIn, 
    signUp, 
    signOut,
    signInWithGoogle 
  } = context;

  return {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    serviceStatus
  };
};

export { AuthProvider } from './AuthProvider';
