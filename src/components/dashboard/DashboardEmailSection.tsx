
import React from "react";
import { EmailData } from "@/types";
import EmailList from "../EmailList";
import DashboardButton from "./DashboardButton";

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
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Emails με Παραστατικά</h2>
        <DashboardButton className="bg-brand-blue hover:bg-blue-700" onClick={fetchEmails} disabled={isLoading}>
          {isLoading ? "Φόρτωση..." : "Ανανέωση"}
        </DashboardButton>
      </div>
      
      <EmailList emails={emails} updateEmail={updateEmail} />
    </div>
  );
};

export default DashboardEmailSection;
