
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import EmailList from "./EmailList";
import SettingsPanel from "./SettingsPanel";
import ProcessingStats from "./ProcessingStats";
import { GmailService } from "@/services/GmailService";
import { DriveService } from "@/services/DriveService";
import { SheetsService } from "@/services/SheetsService";
import { EmailData, ProcessingStats as StatsType } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StatsType>({
    total: 0,
    processed: 0,
    success: 0,
    error: 0,
    pending: 0
  });
  
  const { toast } = useToast();

  useEffect(() => {
    // Initialize services
    const initializeServices = async () => {
      try {
        const gmailService = GmailService.getInstance();
        const driveService = DriveService.getInstance();
        const sheetsService = SheetsService.getInstance();
        
        await Promise.all([
          gmailService.initialize(),
          driveService.initialize(),
          sheetsService.initialize()
        ]);
        
        setIsInitializing(false);
      } catch (error) {
        console.error("Failed to initialize services:", error);
        toast({
          title: "Σφάλμα",
          description: "Αδυναμία αρχικοποίησης των υπηρεσιών. Παρακαλώ προσπαθήστε ξανά.",
          variant: "destructive"
        });
        setIsInitializing(false);
      }
    };
    
    initializeServices();
  }, [toast]);

  const fetchEmails = async () => {
    setIsLoading(true);
    try {
      const gmailService = GmailService.getInstance();
      const fetchedEmails = await gmailService.fetchEmailsWithLabel("Παραστατικά/Εισερχόμενα");
      setEmails(fetchedEmails);
      
      // Update stats
      const totalAttachments = fetchedEmails.reduce(
        (sum, email) => sum + email.attachments.length, 0
      );
      
      setStats({
        total: totalAttachments,
        processed: 0,
        success: 0,
        error: 0,
        pending: totalAttachments
      });
      
      toast({
        title: "Επιτυχής λήψη",
        description: `Βρέθηκαν ${fetchedEmails.length} emails με ${totalAttachments} συνημμένα αρχεία.`
      });
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast({
        title: "Σφάλμα",
        description: "Αδυναμία λήψης emails. Παρακαλώ προσπαθήστε ξανά.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmailData = (updatedEmail: EmailData) => {
    setEmails(prevEmails => 
      prevEmails.map(email => 
        email.id === updatedEmail.id ? updatedEmail : email
      )
    );
    
    // Recalculate stats
    const allEmails = emails.map(email => 
      email.id === updatedEmail.id ? updatedEmail : email
    );
    
    const newStats = {
      total: 0,
      processed: 0,
      success: 0,
      error: 0,
      pending: 0
    };
    
    allEmails.forEach(email => {
      email.attachments.forEach(attachment => {
        newStats.total++;
        if (attachment.processed) {
          newStats.processed++;
          if (attachment.processingStatus.status === "success") {
            newStats.success++;
          } else if (attachment.processingStatus.status === "error") {
            newStats.error++;
          }
        } else {
          newStats.pending++;
        }
      });
    });
    
    setStats(newStats);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Αρχικοποίηση υπηρεσιών...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Συνολικά Παραστατικά</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <Progress value={(stats.processed / stats.total) * 100 || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Επιτυχής Επεξεργασία</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-green-500">{stats.success}</div>
              <div className="ml-2 text-sm text-muted-foreground">
                από {stats.total}
              </div>
            </div>
            <Progress value={(stats.success / stats.total) * 100 || 0} className="h-2 mt-2 bg-gray-100" indicatorClassName="bg-green-500" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-gray-500">Σφάλματα</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-red-500">{stats.error}</div>
              <div className="ml-2 text-sm text-muted-foreground">
                από {stats.total}
              </div>
            </div>
            <Progress value={(stats.error / stats.total) * 100 || 0} className="h-2 mt-2 bg-gray-100" indicatorClassName="bg-red-500" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="emails" className="space-y-4">
        <TabsList>
          <TabsTrigger value="emails">Επεξεργασία Emails</TabsTrigger>
          <TabsTrigger value="settings">Ρυθμίσεις</TabsTrigger>
        </TabsList>
        
        <TabsContent value="emails" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Emails με Παραστατικά</h2>
            <Button className="bg-brand-blue hover:bg-blue-700" onClick={fetchEmails} disabled={isLoading}>
              {isLoading ? "Φόρτωση..." : "Ανανέωση"}
            </Button>
          </div>
          
          <EmailList emails={emails} updateEmail={updateEmailData} />
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Define the Button component for the Dashboard
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }> = ({ 
  children,
  className,
  ...props
}) => {
  return (
    <button 
      className={`px-4 py-2 rounded font-medium text-white ${className} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Dashboard;
