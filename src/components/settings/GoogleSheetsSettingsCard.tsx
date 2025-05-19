
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/contexts/SettingsContext";

const GoogleSheetsSettingsCard: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Καταγραφή στο Google Sheets</CardTitle>
        <CardDescription>
          Αποθήκευση των δεδομένων των παραστατικών σε ένα Google Sheet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-sheets">Ενεργοποίηση Google Sheets</Label>
          <Switch 
            id="enable-sheets" 
            checked={settings.enableSheets}
            onCheckedChange={(checked) => updateSettings({ enableSheets: checked })}
          />
        </div>
        
        {settings.enableSheets && (
          <div className="space-y-2">
            <Label htmlFor="sheet-id">ID του Google Sheet</Label>
            <Input 
              id="sheet-id" 
              placeholder="Εισάγετε το ID του φύλλου εργασίας"
              value={settings.sheetsId || ""}
              onChange={(e) => updateSettings({ sheetsId: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Το ID βρίσκεται στο URL του Sheet: https://docs.google.com/spreadsheets/d/[ID]/edit
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleSheetsSettingsCard;
