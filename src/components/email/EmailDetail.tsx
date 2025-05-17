
import React from "react";
import { AccordionContent } from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmailData } from "@/types";
import AttachmentRow from "./AttachmentRow";

interface EmailDetailProps {
  email: EmailData;
  processingEmail: string | null;
  onProcess: (emailId: string, attachmentId: string) => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email, processingEmail, onProcess }) => {
  return (
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
            <AttachmentRow
              key={attachment.id}
              attachment={attachment}
              emailId={email.id}
              processingEmail={processingEmail}
              onProcess={onProcess}
            />
          ))}
        </TableBody>
      </Table>
    </AccordionContent>
  );
};

export default EmailDetail;
