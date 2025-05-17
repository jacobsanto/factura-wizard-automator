
import { useState } from "react";
import { GmailService } from "@/services/GmailService";
import { EmailData, ProcessingStats as StatsType } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useEmailManagement = () => {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StatsType>({
    total: 0,
    processed: 0,
    success: 0,
    error: 0,
    pending: 0
  });
  
  const { toast } = useToast();

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const gmailService = GmailService.getInstance();
      const fetchedEmails = await gmailService.fetchEmailsWithLabel("Παραστατικά/Εισερχόμενα");
      setEmails(fetchedEmails);
      
      // Update stats
      const totalAttachments = fetchedEmails.reduce(
        (sum, email) => sum + email.attachments.length, 0
      );
      
      setStats({
        total: totalAttachments,
        processed: 0,
        success: 0,
        error: 0,
        pending: totalAttachments
      });
      
      toast({
        title: "Επιτυχής λήψη",
        description: `Βρέθηκαν ${fetchedEmails.length} emails με ${totalAttachments} συνημμένα αρχεία.`
      });
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast({
        title: "Σφάλμα",
        description: "Αδυναμία λήψης emails. Παρακαλώ προσπαθήστε ξανά.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmailData = (updatedEmail: EmailData) => {
    setEmails(prevEmails => 
      prevEmails.map(email => 
        email.id === updatedEmail.id ? updatedEmail : email
      )
    );
    
    // Recalculate stats
    const allEmails = emails.map(email => 
      email.id === updatedEmail.id ? updatedEmail : email
    );
    
    const newStats = {
      total: 0,
      processed: 0,
      success: 0,
      error: 0,
      pending: 0
    };
    
    allEmails.forEach(email => {
      email.attachments.forEach(attachment => {
        newStats.total++;
        if (attachment.processed) {
          newStats.processed++;
          if (attachment.processingStatus.status === "success") {
            newStats.success++;
          } else if (attachment.processingStatus.status === "error") {
            newStats.error++;
          }
        } else {
          newStats.pending++;
        }
      });
    });
    
    setStats(newStats);
  };

  return { emails, isLoading, stats, fetchEmails, updateEmailData };
};
