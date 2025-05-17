
import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsPanel from "./SettingsPanel";
import DashboardStats from "./dashboard/DashboardStats";
import DashboardLoader from "./dashboard/DashboardLoader";
import DashboardEmailSection from "./dashboard/DashboardEmailSection";
import UploadsTable from "./uploads/UploadsTable";
import { useServiceInitialization } from "./dashboard/useServiceInitialization";
import { useEmailManagement } from "./dashboard/useEmailManagement";
import { useLocation } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { isInitializing } = useServiceInitialization();
  const { emails, isLoading, stats, fetchEmails, updateEmailData } = useEmailManagement();
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState<string>("emails");

  // Check URL for tab parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");
    
    if (tabParam === "settings") {
      setActiveTab("settings");
    } else if (tabParam === "uploads") {
      setActiveTab("uploads");
    }
  }, [location]);

  if (isInitializing) {
    return <DashboardLoader />;
  }

  return (
    <div className="p-6 space-y-6">
      <DashboardStats stats={stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="emails">Επεξεργασία Emails</TabsTrigger>
          <TabsTrigger value="uploads">Ιστορικό Αποστολών</TabsTrigger>
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
        
        <TabsContent value="uploads">
          <div className="bg-white rounded-lg border p-6">
            <UploadsTable />
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
