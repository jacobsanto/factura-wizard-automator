
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";

const ResetSettingsCard: React.FC = () => {
  const { resetSettings } = useSettings();
  const { toast } = useToast();
  
  const handleReset = () => {
    resetSettings();
    toast({
      title: "Επαναφορά ρυθμίσεων",
      description: "Οι ρυθμίσεις επαναφέρθηκαν στις προεπιλεγμένες τιμές."
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Επαναφορά Ρυθμίσεων</CardTitle>
        <CardDescription>
          Επαναφορά όλων των ρυθμίσεων στις προεπιλεγμένες τιμές
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          className="border-red-300 text-red-500 hover:bg-red-50"
          onClick={handleReset}
        >
          Επαναφορά σε Προεπιλογές
        </Button>
      </CardContent>
    </Card>
  );
};

export default ResetSettingsCard;
