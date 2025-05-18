
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TokenRequest {
  code?: string;
  refresh_token?: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  success: boolean;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Create a Supabase client for storing user tokens
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get client config from environment variables
    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID") || "467372877930-o2pfcrfugeh1c4h5gvo2at9um6grq7eg.apps.googleusercontent.com";
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";
    
    // Use environment variable, but provide a proper fallback for production
    const REDIRECT_URI = Deno.env.get("GOOGLE_REDIRECT_URI") || "https://factura.ariviagroup.com/oauth2callback";
    
    console.log("[google-oauth] Using redirect URI:", REDIRECT_URI);
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("[google-oauth] Missing Google OAuth credentials");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error - missing Google OAuth credentials" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!REDIRECT_URI) {
      console.error("[google-oauth] Missing or empty redirect URI");
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error - missing redirect URI" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse request
    const { code, refresh_token } = await req.json() as TokenRequest;
    
    console.log("[google-oauth] Request type:", code ? "authorization code" : "refresh token");
    
    let endpoint = "https://oauth2.googleapis.com/token";
    let body: Record<string, string> = {};
    
    // Handle token exchange (authorization code) or token refresh
    if (code) {
      // Exchange authorization code for tokens
      body = {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: REDIRECT_URI,
      };
      console.log("[google-oauth] Exchanging code for tokens with redirect URI:", REDIRECT_URI);
    } else if (refresh_token) {
      // Refresh access token
      body = {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token,
        grant_type: "refresh_token",
      };
      console.log("[google-oauth] Refreshing token");
    } else {
      console.error("[google-oauth] Missing code or refresh_token");
      return new Response(
        JSON.stringify({ error: "Missing code or refresh_token" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Make request to Google's OAuth server
    console.log("[google-oauth] Making request to Google OAuth server");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(body),
    });
    
    const data = await response.json();
    
    if (response.status !== 200) {
      console.error("[google-oauth] Google OAuth error:", data);
      return new Response(
        JSON.stringify({ 
          error: data.error_description || data.error || "Failed to exchange tokens",
          details: data
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("[google-oauth] Received successful response from Google");
    
    // Calculate expiry time (seconds -> milliseconds)
    const expiresIn = data.expires_in || 3600;
    const expiryDate = Date.now() + expiresIn * 1000;
    
    // Prepare the response
    const tokenResponse: TokenResponse = {
      access_token: data.access_token,
      // Use the new refresh token if provided, otherwise keep the existing one
      refresh_token: data.refresh_token || refresh_token || "",
      expiry_date: expiryDate,
      success: true,
    };

    // If this was a new authorization (not a refresh), and we have a user ID and supabase client,
    // we should store the tokens in the database
    if (code && req.headers.get("authorization")) {
      try {
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.replace("Bearer ", "");
        
        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        
        if (userError) {
          console.error("[google-oauth] Error getting user:", userError);
        } else if (userData.user) {
          console.log("[google-oauth] Storing tokens for user:", userData.user.id);
          // Store the tokens in the database
          const { error: storageError } = await supabase
            .from("user_google_tokens")
            .upsert({
              user_id: userData.user.id,
              refresh_token: tokenResponse.refresh_token,
              access_token: tokenResponse.access_token,
              expiry_date: tokenResponse.expiry_date,
            })
            .select();
            
          if (storageError) {
            console.error("[google-oauth] Error storing tokens:", storageError);
          } else {
            console.log("[google-oauth] Tokens stored successfully");
          }
        }
      } catch (err) {
        console.error("[google-oauth] Error processing user token storage:", err);
      }
    }

    console.log("[google-oauth] Returning successful response");
    return new Response(
      JSON.stringify(tokenResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("[google-oauth] Error in google-oauth function:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
