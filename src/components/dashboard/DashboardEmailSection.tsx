
import React, { useState, useEffect } from "react";
import { EmailData } from "@/types";
import EmailList from "../EmailList";
import DashboardButton from "./DashboardButton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import useDriveAuth from "@/hooks/useDriveAuth";

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
  const { isAuthenticated } = useDriveAuth();
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();
  const hasGoogleAccess = !!localStorage.getItem("google_tokens");
  
  const handleFetchEmails = async () => {
    setFetchError(null);
    
    if (!hasGoogleAccess) {
      setFetchError("Απαιτείται σύνδεση με το Google για ανάκτηση emails");
      toast({
        title: "Απαιτείται σύνδεση",
        description: "Πρέπει να συνδεθείτε με το Google για να ανακτήσετε emails",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await fetchEmails();
    } catch (error) {
      console.error("Error fetching emails:", error);
      setFetchError("Σφάλμα κατά την ανάκτηση emails. Παρακαλώ προσπαθήστε ξανά.");
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-xl font-semibold">Emails με Παραστατικά</h2>
        <div className="flex gap-2">
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
      
      {!hasGoogleAccess && (
        <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertTitle>Απαιτείται σύνδεση με Google</AlertTitle>
          <AlertDescription>
            <p>Για να δείτε τα emails σας με παραστατικά, παρακαλώ αποσυνδεθείτε και συνδεθείτε ξανά επιλέγοντας τη σύνδεση με Google από την αρχική σελίδα.</p>
          </AlertDescription>
        </Alert>
      )}
      
      <EmailList emails={emails} updateEmail={updateEmail} />
    </div>
  );
};

export default DashboardEmailSection;
