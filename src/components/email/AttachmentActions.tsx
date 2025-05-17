
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { ProcessingStatus } from "@/types";

interface AttachmentActionsProps {
  processingStatus: ProcessingStatus;
  processingEmail: string | null;
  emailId: string;
  attachmentId: string;
  onProcess: (emailId: string, attachmentId: string) => void;
}

const AttachmentActions: React.FC<AttachmentActionsProps> = ({
  processingStatus,
  processingEmail,
  emailId,
  attachmentId,
  onProcess
}) => {
  switch (processingStatus.status) {
    case "idle":
      return (
        <Button 
          size="sm" 
          className="bg-brand-blue hover:bg-blue-700"
          onClick={() => onProcess(emailId, attachmentId)}
          disabled={processingEmail !== null}
        >
          {processingEmail === emailId ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
          Επεξεργασία
        </Button>
      );
    case "success":
      return (
        <div className="flex items-center justify-end text-green-500">
          <CheckCircle className="h-5 w-5 mr-1" />
          <span>Επιτυχία</span>
        </div>
      );
    case "error":
      return (
        <div className="flex items-center justify-end text-red-500">
          <XCircle className="h-5 w-5 mr-1" />
          <span>Σφάλμα</span>
        </div>
      );
    case "processing":
      return (
        <div className="flex items-center justify-end text-blue-500">
          <Loader2 className="h-5 w-5 mr-1 animate-spin" />
          <span>Επεξεργασία</span>
        </div>
      );
    default:
      return null;
  }
};

export default AttachmentActions;
