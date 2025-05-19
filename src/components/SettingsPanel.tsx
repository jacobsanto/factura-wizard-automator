
import React from "react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import AISettingsCard from "./settings/AISettingsCard";
import FilteringSettingsCard from "./settings/FilteringSettingsCard";
import GoogleSheetsSettingsCard from "./settings/GoogleSheetsSettingsCard";
import AutoScanSettingsCard from "./settings/AutoScanSettingsCard";
import NotificationsSettingsCard from "./settings/NotificationsSettingsCard";
import ResetSettingsCard from "./settings/ResetSettingsCard";
import ExtractionPerformanceCard from "./settings/ExtractionPerformanceCard";

const SettingsPanel: React.FC = () => {
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Ρυθμίσεις αποθηκεύτηκαν",
      description: "Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Ρυθμίσεις Εφαρμογής</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AISettingsCard />
        <FilteringSettingsCard />
        <GoogleSheetsSettingsCard />
        <AutoScanSettingsCard />
        <NotificationsSettingsCard />
        <ExtractionPerformanceCard />
        <ResetSettingsCard />
      </div>
      
      <div className="flex justify-end">
        <Button 
          className="bg-brand-blue hover:bg-blue-700"
          onClick={handleSaveSettings}
        >
          Αποθήκευση Ρυθμίσεων
        </Button>
      </div>
    </div>
  );
};

export default SettingsPanel;
