
import { useState } from "react";
import { EmailData, ProcessingStatus } from "@/types";
import { ProcessorService } from "@/services/ProcessorService";
import { useSettings } from "@/contexts/SettingsContext";
import { GmailService } from "@/services/GmailService";
import { useToast } from "@/hooks/use-toast";

export const useEmailProcessing = (emails: EmailData[], updateEmail: (email: EmailData) => void) => {
  const [processingEmail, setProcessingEmail] = useState<string | null>(null);
  const { settings } = useSettings();
  const { toast } = useToast();

  const handleProcess = async (emailId: string, attachmentId: string) => {
    setProcessingEmail(emailId);
    
    // Find the email
    const email = emails.find(e => e.id === emailId);
    if (!email) {
      setProcessingEmail(null);
      return;
    }
    
    const attachmentIndex = email.attachments.findIndex(a => a.id === attachmentId);
    if (attachmentIndex === -1) {
      setProcessingEmail(null);
      return;
    }
    
    // Create a copy of the email to update
    const updatedEmail: EmailData = { ...email };
    
    // Update the attachment status to processing
    updatedEmail.attachments[attachmentIndex] = {
      ...updatedEmail.attachments[attachmentIndex],
      processingStatus: { status: "processing", message: "Έναρξη επεξεργασίας..." }
    };
    
    // Update the UI
    updateEmail(updatedEmail);
    
    try {
      const processorService = ProcessorService.getInstance();
      
      // Process the attachment
      const result = await processorService.processAttachment(
        emailId,
        email.attachments[attachmentIndex],
        (status: ProcessingStatus) => {
          // Update status during processing
          const statusUpdate = { ...updatedEmail };
          statusUpdate.attachments[attachmentIndex] = {
            ...statusUpdate.attachments[attachmentIndex],
            processingStatus: status
          };
          updateEmail(statusUpdate);
        }
      );
      
      if (result.success && result.data) {
        // If successful, update with extracted data
        const finalUpdate = { ...updatedEmail };
        finalUpdate.attachments[attachmentIndex] = {
          ...finalUpdate.attachments[attachmentIndex],
          processed: true,
          extractedData: result.data,
          processingStatus: { 
            status: "success", 
            message: result.driveFileId 
              ? `Μεταφέρθηκε και αποθηκεύτηκε ως ${result.newFilename}`
              : `Σφάλμα: Αδυναμία αποθήκευσης στο Drive`
          }
        };
        
        // Log to Sheet if enabled
        if (settings.enableSheets && settings.sheetsId) {
          await processorService.logToSheet(
            result.data,
            result.targetPath || "",
            result.newFilename || "",
            settings.sheetsId
          );
        }
        
        // Update UI
        updateEmail(finalUpdate);
        
        const driveLink = result.driveFileId
          ? `https://drive.google.com/file/d/${result.driveFileId}`
          : undefined;
        
        toast({
          title: "Επιτυχής επεξεργασία",
          description: result.driveFileId
            ? `Το αρχείο αποθηκεύτηκε ως ${result.newFilename}`
            : "Το αρχείο επεξεργάστηκε αλλά δεν αποθηκεύτηκε στο Drive"
        });
      } else {
        // If failed, update with error
        const errorUpdate = { ...updatedEmail };
        errorUpdate.attachments[attachmentIndex] = {
          ...errorUpdate.attachments[attachmentIndex],
          processed: true,
          processingStatus: { 
            status: "error", 
            message: result.message || "Άγνωστο σφάλμα" 
          }
        };
        
        updateEmail(errorUpdate);
        
        // Add "Needs Review" label and send notification if configured
        const gmailService = GmailService.getInstance();
        await gmailService.addLabel(emailId, "Χρειάζεται Έλεγχο");
        
        if (settings.notifyOnError && settings.notifyEmail) {
          await gmailService.sendNotificationEmail(
            settings.notifyEmail,
            "Σφάλμα επεξεργασίας παραστατικού",
            `Υπήρξε σφάλμα κατά την επεξεργασία του συνημμένου "${email.attachments[attachmentIndex].name}" από το email "${email.subject}". Απαιτείται χειροκίνητος έλεγχος.`
          );
        }
        
        toast({
          title: "Σφάλμα επεξεργασίας",
          description: result.message || "Προέκυψε σφάλμα κατά την επεξεργασία του αρχείου",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error processing attachment:", error);
      
      // Update with error
      const errorUpdate = { ...updatedEmail };
      errorUpdate.attachments[attachmentIndex] = {
        ...errorUpdate.attachments[attachmentIndex],
        processed: true,
        processingStatus: { 
          status: "error", 
          message: error instanceof Error ? error.message : "Άγνωστο σφάλμα" 
        }
      };
      
      updateEmail(errorUpdate);
      
      toast({
        title: "Σφάλμα",
        description: "Προέκυψε σφάλμα κατά την επεξεργασία του αρχείου",
        variant: "destructive"
      });
    } finally {
      setProcessingEmail(null);
    }
  };

  return {
    processingEmail,
    handleProcess
  };
};
