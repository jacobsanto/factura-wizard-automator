
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { exchangeCodeForTokens, storeTokens } from "@/services/google";
import { useToast } from "@/hooks/use-toast";
import { GOOGLE_REDIRECT_URI } from "@/env";

export type OAuthStatus = "loading" | "success" | "error";

export function useOAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [status, setStatus] = useState<OAuthStatus>("loading");
  const [errorDetails, setErrorDetails] = useState<string>("");
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  const hasProcessed = useRef(false);

  const logStep = (step: string) => {
    const timestamp = new Date().toISOString().substring(11, 23);
    const logEntry = `${timestamp} - ${step}`;
    console.log(logEntry);
    setProcessingSteps((prev) => [...prev, logEntry]);
  };

  const safeNavigate = (path: string, delay: number) => {
    if (location.pathname === "/oauth2callback") {
      logStep(`Safe navigation to ${path} in ${delay}ms`);
      setTimeout(() => navigate(path), delay);
    } else {
      logStep(`Navigation skipped: already redirected`);
    }
  };

  useEffect(() => {
    const processAuthCode = async () => {
      if (hasProcessed.current) {
        logStep("Skipping duplicate processing attempt");
        return;
      }
      hasProcessed.current = true;

      try {
        logStep("OAuth callback page loaded");

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        logStep(`Code: ${!!code}, Error: ${error || "none"}`);
        logStep(`Full URL: ${window.location.href}`);
        logStep(`Expected redirect: ${GOOGLE_REDIRECT_URI}`);

        if (error) {
          setStatus("error");
          const description = `Google sign-in failed: ${error}`;
          setErrorDetails(description);
          logStep(description);
          toast({
            title: "Σφάλμα σύνδεσης",
            description,
            variant: "destructive",
          });

          if (error.includes("redirect_uri_mismatch")) {
            const detailed = `⚠️ redirect_uri_mismatch: ${window.location.origin}/oauth2callback is not whitelisted in Google Cloud Console.`;
            setErrorDetails(detailed);
            logStep(detailed);
          }

          safeNavigate("/", 5000);
          return;
        }

        if (!code) {
          setStatus("error");
          setErrorDetails("No authentication code received.");
          toast({
            title: "Σφάλμα σύνδεσης",
            description: "Δεν ελήφθη κωδικός.",
            variant: "destructive",
          });
          safeNavigate("/", 3000);
          return;
        }

        logStep("Exchanging code for tokens...");
        const tokens = await exchangeCodeForTokens(code);
        logStep(`Token exchange: ${tokens ? "✔️ success" : "❌ failed"}`);

        if (!tokens || !tokens.access_token || !tokens.refresh_token) {
          setStatus("error");
          setErrorDetails("Failed to exchange code for valid tokens.");
          toast({
            title: "Αποτυχία",
            description: "Η ανταλλαγή token απέτυχε.",
            variant: "destructive",
          });
          safeNavigate("/", 3000);
          return;
        }

        logStep("Storing tokens...");
        storeTokens(tokens);

        // Fetch user info
        try {
          logStep("Fetching user info...");
          const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
          });

          if (userInfoRes.ok) {
            const userInfo = await userInfoRes.json();
            logStep(`User info: ${userInfo.email}`);
            localStorage.setItem("google_user", JSON.stringify(userInfo));
            localStorage.setItem("user", JSON.stringify(userInfo));
          } else {
            logStep(`User info failed: ${userInfoRes.status}`);
          }
        } catch (err) {
          logStep(`Error fetching user info: ${String(err)}`);
        }

        setStatus("success");
        logStep("✅ Auth complete. Redirecting...");
        toast({
          title: "Επιτυχία",
          description: "Συνδεθήκατε επιτυχώς!",
        });

        safeNavigate("/home", 1500);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logStep(`Exception in OAuth flow: ${msg}`);
        setErrorDetails(msg);
        setStatus("error");
        toast({
          title: "Σφάλμα σύνδεσης",
          description: "Η πιστοποίηση απέτυχε.",
          variant: "destructive",
        });
        safeNavigate("/", 3000);
      }
    };

    processAuthCode();
  }, [navigate, toast, location.pathname]);

  return {
    status,
    errorDetails,
    processingSteps,
  };
}
