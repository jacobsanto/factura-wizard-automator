
import { GoogleServiceStatus } from "@/types";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  serviceStatus: GoogleServiceStatus;
  signIn: (email: string, password: string) => Promise<{error: any | null}>;
  signUp: (email: string, password: string) => Promise<{error: any | null}>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface GoogleUserInfo {
  name: string;
  email: string;
  picture: string;
  sub: string;
}
