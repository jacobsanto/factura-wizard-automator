
/**
 * Exchange code for tokens with Google OAuth
 */
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI } from "@/env";
import { GoogleTokens } from "./types";
import { storeTokens } from "./storage";

// Get the Google OAuth URL for initiating the authentication flow
export const getGoogleAuthUrl = (): string => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  
  const options = {
    redirect_uri: GOOGLE_REDIRECT_URI,
    client_id: GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets"
    ].join(" ")
  };
  
  const queryString = new URLSearchParams(options).toString();
  return `${rootUrl}?${queryString}`;
};

// Exchange authorization code for tokens directly with Google
export const exchangeCodeForTokens = async (code: string): Promise<GoogleTokens | null> => {
  console.log("Exchanging code for tokens directly with Google...");
  
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Code exchange failed:", errorData);
      return null;
    }
    
    const data = await response.json();
    
    const tokens: GoogleTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expiry_date: Date.now() + (data.expires_in * 1000),
      token_type: "Bearer"
    };
    
    await storeTokens(tokens);
    return tokens;
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    return null;
  }
};
