
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { SupabaseAuthProvider, useSupabaseAuth, SupabaseAuthContextProps } from "./supabase/SupabaseAuthContext";

interface DevModeContextProps {
  isDevMode: boolean;
  toggleDevMode: () => void;
  setDevUserRole: (role: string) => void;
  currentDevRole: string;
}

const DevModeContext = createContext<DevModeContextProps | undefined>(undefined);

// Mock user data to use in dev mode
const createMockUser = (role: string = "user"): User => {
  return {
    id: "dev-user-id-123456",
    app_metadata: { provider: "google" },
    user_metadata: {
      name: "Development User",
      email: "dev@example.com",
      avatar_url: "https://ui-avatars.com/api/?name=Dev+User&background=0D8ABC&color=fff",
      role
    },
    aud: "authenticated",
    email: "dev@example.com",
    created_at: new Date().toISOString(),
  } as User;
};

// Mock session for dev mode
const createMockSession = (user: User): Session => {
  return {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    expires_in: 3600,
    token_type: "bearer",
    user
  } as Session;
};

export const DevModeAuthProvider = ({ children }: { children: ReactNode }) => {
  // Check if dev mode is enabled (URL parameter or localStorage)
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [currentDevRole, setCurrentDevRole] = useState<string>("user");
  
  useEffect(() => {
    // Check if devMode parameter is present in URL
    const urlParams = new URLSearchParams(window.location.search);
    const devModeParam = urlParams.get("devMode");
    
    // Check localStorage for saved preference
    const savedDevMode = localStorage.getItem("devMode") === "true";
    
    // Enable dev mode if URL parameter is present or it was previously enabled
    if (devModeParam === "true" || savedDevMode) {
      setIsDevMode(true);
      console.log("Development mode is enabled!");
    }
    
    // Load saved role if available
    const savedRole = localStorage.getItem("devUserRole");
    if (savedRole) {
      setCurrentDevRole(savedRole);
    }
  }, []);
  
  // Save dev mode preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("devMode", isDevMode.toString());
  }, [isDevMode]);
  
  // Toggle development mode
  const toggleDevMode = () => {
    setIsDevMode(prev => !prev);
  };
  
  // Set the dev user role
  const setDevUserRole = (role: string) => {
    setCurrentDevRole(role);
    localStorage.setItem("devUserRole", role);
  };
  
  // Context value
  const contextValue = {
    isDevMode,
    toggleDevMode,
    setDevUserRole,
    currentDevRole
  };
  
  return (
    <DevModeContext.Provider value={contextValue}>
      {children}
    </DevModeContext.Provider>
  );
};

// This component wraps the real Supabase Auth and overrides it with mock data when in dev mode
export const DevModeWrapper = ({ children }: { children: ReactNode }) => {
  const devMode = useDevMode();
  
  if (!devMode.isDevMode) {
    // When not in dev mode, use the real Supabase Auth Provider
    return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
  }
  
  // In dev mode, we'll wrap the real provider and override its behavior
  return (
    <SupabaseAuthProvider>
      <DevModeAuthConsumer devMode={devMode}>
        {children}
      </DevModeAuthConsumer>
    </SupabaseAuthProvider>
  );
};

// This component consumes the real Supabase auth context and overrides it when in dev mode
const DevModeAuthConsumer = ({ 
  children,
  devMode 
}: { 
  children: ReactNode;
  devMode: DevModeContextProps; 
}) => {
  const originalAuthContext = useSupabaseAuth();
  
  // Create mock user and session based on the current role
  const mockUser = createMockUser(devMode.currentDevRole);
  const mockSession = createMockSession(mockUser);
  
  // Override the real auth context with mock data
  const mockAuthContext: SupabaseAuthContextProps = {
    ...originalAuthContext,
    isAuthenticated: true,
    isLoading: false,
    session: mockSession,
    user: mockUser,
    // Mock auth functions that just log instead of doing real auth
    signIn: async () => {
      console.log("Mock sign in called");
      return { error: null };
    },
    signUp: async () => {
      console.log("Mock sign up called");
      return { error: null };
    },
    signOut: async () => {
      console.log("Mock sign out called");
      if (window.confirm("This is a mock sign out. In development mode, you'll stay signed in. Toggle dev mode off to test real sign out. Continue?")) {
        devMode.toggleDevMode();
      }
    },
    signInWithGoogle: async () => {
      console.log("Mock Google sign in called");
    }
  };
  
  // Create a custom provider with our mock context
  const CustomAuthProvider = (React.createContext(mockAuthContext) as React.Context<SupabaseAuthContextProps>).Provider;
  
  return (
    <CustomAuthProvider value={mockAuthContext}>
      {children}
    </CustomAuthProvider>
  );
};

// Hook to use dev mode context
export const useDevMode = () => {
  const context = useContext(DevModeContext);
  if (context === undefined) {
    throw new Error("useDevMode must be used within a DevModeAuthProvider");
  }
  return context;
};
