
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsPanel from "./SettingsPanel";
import DashboardStats from "./dashboard/DashboardStats";
import DashboardLoader from "./dashboard/DashboardLoader";
import DashboardEmailSection from "./dashboard/DashboardEmailSection";
import { useServiceInitialization } from "./dashboard/useServiceInitialization";
import { useEmailManagement } from "./dashboard/useEmailManagement";

const Dashboard: React.FC = () => {
  const { isInitializing } = useServiceInitialization();
  const { emails, isLoading, stats, fetchEmails, updateEmailData } = useEmailManagement();

  if (isInitializing) {
    return <DashboardLoader />;
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardStats stats={stats} />

      <Tabs defaultValue="emails" className="space-y-4">
        <TabsList>
          <TabsTrigger value="emails">Επεξεργασία Emails</TabsTrigger>
          <TabsTrigger value="settings">Ρυθμίσεις</TabsTrigger>
        </TabsList>
        
        <TabsContent value="emails" className="space-y-4">
          <DashboardEmailSection 
            emails={emails} 
            updateEmail={updateEmailData} 
            fetchEmails={fetchEmails}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
