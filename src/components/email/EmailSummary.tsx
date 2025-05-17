
import React from "react";
import { AccordionTrigger } from "@/components/ui/accordion";

interface EmailSummaryProps {
  subject: string;
  from: string;
  date: string;
  emailId: string;
  onToggle: (itemId: string) => void;
}

const EmailSummary: React.FC<EmailSummaryProps> = ({ 
  subject, 
  from, 
  date, 
  emailId, 
  onToggle 
}) => {
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

  return (
    <AccordionTrigger
      onClick={() => onToggle(emailId)}
      className="px-4 hover:no-underline"
    >
      <div className="flex flex-col sm:flex-row justify-between w-full text-left gap-2">
        <div className="font-medium truncate max-w-xs sm:max-w-sm">
          {subject}
        </div>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{from.split('<')[0].trim()}</span>
          <span>{formatDate(date)}</span>
        </div>
      </div>
    </AccordionTrigger>
  );
};

export default EmailSummary;
