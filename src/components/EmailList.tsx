
import React, { useState } from "react";
import {
  Accordion,
} from "@/components/ui/accordion";
import { EmailData } from "@/types";
import NoEmails from "./email/NoEmails";
import EmailItem from "./email/EmailItem";
import { useEmailProcessing } from "@/hooks/useEmailProcessing";

interface EmailListProps {
  emails: EmailData[];
  updateEmail: (email: EmailData) => void;
}

const EmailList: React.FC<EmailListProps> = ({ emails, updateEmail }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { processingEmail, handleProcess } = useEmailProcessing(emails, updateEmail);

  const handleExpandToggle = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId));
    } else {
      setExpandedItems([...expandedItems, itemId]);
    }
  };

  if (emails.length === 0) {
    return <NoEmails />;
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
          <EmailItem
            key={email.id}
            email={email}
            expandedItems={expandedItems}
            processingEmail={processingEmail}
            onToggle={handleExpandToggle}
            onProcess={handleProcess}
          />
        ))}
      </Accordion>
    </div>
  );
};

export default EmailList;
