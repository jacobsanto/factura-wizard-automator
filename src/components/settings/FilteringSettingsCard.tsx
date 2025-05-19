
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/contexts/SettingsContext";

const FilteringSettingsCard: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Φιλτράρισμα Τιμολογίων</CardTitle>
        <CardDescription>
          Ρυθμίσεις για το φιλτράρισμα των τιμολογίων και παραστατικών
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="strict-invoice-check">Αυστηρός Έλεγχος Τιμολογίων</Label>
          <Switch 
            id="strict-invoice-check" 
            checked={settings.strictInvoiceCheck !== false}
            onCheckedChange={(checked) => updateSettings({ strictInvoiceCheck: checked })}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Όταν είναι ενεργοποιημένο, μόνο αρχεία που αναγνωρίζονται με βεβαιότητα ως τιμολόγια θα επεξεργάζονται
        </p>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="pdf-only">Μόνο Αρχεία PDF</Label>
          <Switch 
            id="pdf-only" 
            checked={settings.pdfOnly !== false}
            onCheckedChange={(checked) => updateSettings({ pdfOnly: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FilteringSettingsCard;
