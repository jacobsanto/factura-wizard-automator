
import React, { createContext, useContext, ReactNode } from "react";
import { useAuthState } from "./useAuthState";
import { AuthContextType } from "./types";
import { useAuthInitialization } from "./useAuthInitialization";
import { useAuthActions } from "./useAuthActions";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { 
    isAuthenticated, 
    setIsAuthenticated,
    isLoading, 
    setIsLoading,
    user, 
    setUser,
    serviceStatus, 
    setServiceStatus 
  } = useAuthState();
  
  // Initialize authentication state
  useAuthInitialization({
    setIsAuthenticated,
    setIsLoading,
    setUser,
    setServiceStatus
  });
  
  // Auth action handlers
  const { signIn, signOut, refreshToken, signUp, signInWithGoogle } = useAuthActions({
    isAuthenticated,
    setIsAuthenticated,
    setIsLoading,
    setUser,
    setServiceStatus
  });

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      user,
      serviceStatus,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
