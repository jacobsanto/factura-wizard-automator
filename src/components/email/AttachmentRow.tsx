
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { AttachmentData } from "@/types";
import AttachmentActions from "./AttachmentActions";
import StatusIndicator from "./StatusIndicator";

interface AttachmentRowProps {
  attachment: AttachmentData;
  emailId: string;
  processingEmail: string | null;
  onProcess: (emailId: string, attachmentId: string) => void;
}

const AttachmentRow: React.FC<AttachmentRowProps> = ({
  attachment,
  emailId,
  processingEmail,
  onProcess
}) => {
  return (
    <TableRow key={attachment.id}>
      <TableCell className="font-medium">
        {attachment.name}
      </TableCell>
      <TableCell>
        {(attachment.size / 1024).toFixed(1)} KB
      </TableCell>
      <TableCell>
        <StatusIndicator 
          status={attachment.processingStatus.status} 
          message={attachment.processingStatus.message}
        />
      </TableCell>
      <TableCell className="text-right">
        <AttachmentActions
          processingStatus={attachment.processingStatus}
          processingEmail={processingEmail}
          emailId={emailId}
          attachmentId={attachment.id}
          onProcess={onProcess}
        />
      </TableCell>
    </TableRow>
  );
};

export default AttachmentRow;
