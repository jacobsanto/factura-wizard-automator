
import React, { useState, useEffect } from "react";
import { EmailData } from "@/types";
import EmailList from "../EmailList";
import DashboardButton from "./DashboardButton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import GoogleAuthButton from "../GoogleAuthButton";
import { checkAndFixAuthState, getStoredTokens } from "@/services/google";
import { useToast } from "@/hooks/use-toast";

interface DashboardEmailSectionProps {
  emails: EmailData[];
  updateEmail: (email: EmailData) => void;
  fetchEmails: () => Promise<void>;
  isLoading: boolean;
}

const DashboardEmailSection: React.FC<DashboardEmailSectionProps> = ({ 
  emails, 
  updateEmail, 
  fetchEmails, 
  isLoading 
}) => {
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasGoogleAuth, setHasGoogleAuth] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  // Check if Google auth is available on mount and when tokens change
  useEffect(() => {
    const checkGoogleAuth = async () => {
      const tokens = await getStoredTokens();
      setHasGoogleAuth(!!tokens?.access_token);
    };
    
    checkGoogleAuth();
    
    // Re-check when local storage changes
    const handleStorageChange = async () => {
      await checkGoogleAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const handleFetchEmails = async () => {
    setFetchError(null);
    
    if (!hasGoogleAuth) {
      setFetchError("Απαιτείται σύνδεση με το Google για ανάκτηση emails");
      toast({
        title: "Απαιτείται σύνδεση",
        description: "Πρέπει να συνδεθείτε με το Google για να ανακτήσετε emails",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await checkAndFixAuthState();
      await fetchEmails();
    } catch (error) {
      console.error("Error fetching emails:", error);
      setFetchError("Σφάλμα κατά την ανάκτηση emails. Παρακαλώ προσπαθήστε ξανά.");
    }
  };
  
  // Show loading state while checking Google auth
  if (hasGoogleAuth === null) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Emails με Παραστατικά</h2>
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="ml-3">Έλεγχος σύνδεσης με Google...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-semibold">Emails με Παραστατικά</h2>
        <div className="flex gap-2">
          {!hasGoogleAuth && (
            <GoogleAuthButton className="text-gray-600" onSuccess={fetchEmails} />
          )}
          <DashboardButton 
            className="bg-brand-blue hover:bg-blue-700" 
            onClick={handleFetchEmails} 
            disabled={isLoading}
          >
            {isLoading ? "Φόρτωση..." : "Ανανέωση"}
          </DashboardButton>
        </div>
      </div>
      
      {fetchError && (
        <Alert variant="destructive">
          <AlertTitle>Σφάλμα</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}
      
      {!hasGoogleAuth && (
        <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertTitle>Απαιτείται σύνδεση με Google</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>Για να δείτε τα emails σας με παραστατικά, παρακαλώ συνδεθείτε με το Google.</p>
            <GoogleAuthButton 
              className="bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200 w-fit"
            />
          </AlertDescription>
        </Alert>
      )}
      
      <EmailList emails={emails} updateEmail={updateEmail} />
    </div>
  );
};

export default DashboardEmailSection;
