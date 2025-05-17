
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmailData, AttachmentData, ProcessingStatus } from "@/types";
import { ProcessorService } from "@/services/ProcessorService";
import { useSettings } from "@/contexts/SettingsContext";
import { GmailService } from "@/services/GmailService";
import { File, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailListProps {
  emails: EmailData[];
  updateEmail: (email: EmailData) => void;
}

const EmailList: React.FC<EmailListProps> = ({ emails, updateEmail }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [processingEmail, setProcessingEmail] = useState<string | null>(null);
  const { settings } = useSettings();
  const { toast } = useToast();

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('el-GR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const handleProcess = async (emailId: string, attachmentId: string) => {
    setProcessingEmail(emailId);
    
    // Find the email and attachment
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
      
      if (result.success && result.data && result.targetPath && result.newFilename) {
        // If successful, update with extracted data
        const finalUpdate = { ...updatedEmail };
        finalUpdate.attachments[attachmentIndex] = {
          ...finalUpdate.attachments[attachmentIndex],
          processed: true,
          extractedData: result.data,
          processingStatus: { 
            status: "success", 
            message: `Μεταφέρθηκε στον φάκελο: ${result.targetPath}` 
          }
        };
        
        // Log to Sheet if enabled
        if (settings.enableSheets && settings.sheetsId) {
          await processorService.logToSheet(
            result.data,
            result.targetPath,
            result.newFilename,
            settings.sheetsId
          );
        }
        
        // Update UI
        updateEmail(finalUpdate);
        
        toast({
          title: "Επιτυχής επεξεργασία",
          description: `Το αρχείο αποθηκεύτηκε ως ${result.newFilename}`
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

  const handleExpandToggle = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId));
    } else {
      setExpandedItems([...expandedItems, itemId]);
    }
  };

  const getStatusBadge = (status: ProcessingStatus["status"]) => {
    switch (status) {
      case "idle":
        return <span className="status-circle status-idle"></span>;
      case "processing":
        return <span className="status-circle status-processing"></span>;
      case "success":
        return <span className="status-circle status-success"></span>;
      case "error":
        return <span className="status-circle status-error"></span>;
      default:
        return null;
    }
  };

  if (emails.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <File className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Δεν βρέθηκαν emails</h3>
        <p className="text-gray-500">Κάντε κλικ στο κουμπί "Ανανέωση" για να φορτωθούν τα emails με την ετικέτα "Παραστατικά/Εισερχόμενα"</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <Accordion
        type="multiple"
        value={expandedItems}
        onValueChange={setExpandedItems}
        className="w-full"
      >
        {emails.map((email) => (
          <AccordionItem value={email.id} key={email.id}>
            <AccordionTrigger
              onClick={() => handleExpandToggle(email.id)}
              className="px-4 hover:no-underline"
            >
              <div className="flex flex-col sm:flex-row justify-between w-full text-left gap-2">
                <div className="font-medium truncate max-w-xs sm:max-w-sm">
                  {email.subject}
                </div>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>{email.from.split('<')[0].trim()}</span>
                  <span>{formatDate(email.date)}</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Όνομα αρχείου</TableHead>
                    <TableHead>Μέγεθος</TableHead>
                    <TableHead>Κατάσταση</TableHead>
                    <TableHead className="text-right">Ενέργειες</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {email.attachments.map((attachment) => (
                    <TableRow key={attachment.id}>
                      <TableCell className="font-medium">
                        {attachment.name}
                      </TableCell>
                      <TableCell>
                        {(attachment.size / 1024).toFixed(1)} KB
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusBadge(attachment.processingStatus.status)}
                          <span>
                            {attachment.processingStatus.status === "idle" && "Αναμονή"}
                            {attachment.processingStatus.status === "processing" && attachment.processingStatus.message}
                            {attachment.processingStatus.status === "success" && "Ολοκληρώθηκε"}
                            {attachment.processingStatus.status === "error" && attachment.processingStatus.message}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {attachment.processingStatus.status === "idle" && (
                          <Button 
                            size="sm" 
                            className="bg-brand-blue hover:bg-blue-700"
                            onClick={() => handleProcess(email.id, attachment.id)}
                            disabled={processingEmail !== null}
                          >
                            {processingEmail === email.id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            Επεξεργασία
                          </Button>
                        )}
                        {attachment.processingStatus.status === "success" && (
                          <div className="flex items-center justify-end text-green-500">
                            <CheckCircle className="h-5 w-5 mr-1" />
                            <span>Επιτυχία</span>
                          </div>
                        )}
                        {attachment.processingStatus.status === "error" && (
                          <div className="flex items-center justify-end text-red-500">
                            <XCircle className="h-5 w-5 mr-1" />
                            <span>Σφάλμα</span>
                          </div>
                        )}
                        {attachment.processingStatus.status === "processing" && (
                          <div className="flex items-center justify-end text-blue-500">
                            <Loader2 className="h-5 w-5 mr-1 animate-spin" />
                            <span>Επεξεργασία</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default EmailList;
