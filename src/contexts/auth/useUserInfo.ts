
import { jwtDecode } from "jwt-decode";
import { GoogleUserInfo } from "./types";

export function useUserInfo() {
  // Extract user information from ID token
  const extractUserInfo = (idToken: string): GoogleUserInfo | null => {
    try {
      const decoded = jwtDecode(idToken) as any;
      return {
        name: decoded.name || "Google User",
        email: decoded.email || "",
        picture: decoded.picture || "",
        sub: decoded.sub || ""
      };
    } catch (error) {
      console.error("Error decoding ID token:", error);
      return null;
    }
  };

  return { extractUserInfo };
}
