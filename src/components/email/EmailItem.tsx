
import React from "react";
import { AccordionItem } from "@/components/ui/accordion";
import { EmailData } from "@/types";
import EmailSummary from "./EmailSummary";
import EmailDetail from "./EmailDetail";

interface EmailItemProps {
  email: EmailData;
  expandedItems: string[];
  processingEmail: string | null;
  onToggle: (itemId: string) => void;
  onProcess: (emailId: string, attachmentId: string) => void;
}

const EmailItem: React.FC<EmailItemProps> = ({
  email,
  expandedItems,
  processingEmail,
  onToggle,
  onProcess
}) => {
  return (
    <AccordionItem value={email.id} key={email.id}>
      <EmailSummary
        subject={email.subject}
        from={email.from}
        date={email.date}
        emailId={email.id}
        onToggle={onToggle}
      />
      <EmailDetail
        email={email}
        processingEmail={processingEmail}
        onProcess={onProcess}
      />
    </AccordionItem>
  );
};

export default EmailItem;
