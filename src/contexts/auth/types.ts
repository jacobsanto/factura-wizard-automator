
import { GoogleServiceStatus } from "@/types";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  serviceStatus: GoogleServiceStatus;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export interface GoogleUserInfo {
  name: string;
  email: string;
  picture: string;
  sub: string;
}
