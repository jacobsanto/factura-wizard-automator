
import { useState, useEffect } from "react";
import { GmailService } from "@/services/GmailService";
import { DriveService } from "@/services/driveService";
import { SheetsService } from "@/services/SheetsService";
import { useToast } from "@/hooks/use-toast";

export const useServiceInitialization = () => {
  const [isInitializing, setIsInitializing] = useState(true);
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

  return { isInitializing };
};
