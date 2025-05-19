
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/contexts/SettingsContext";

const AutoScanSettingsCard: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Αυτόματος Έλεγχος</CardTitle>
        <CardDescription>
          Ρύθμιση αυτόματης σάρωσης για νέα emails με παραστατικά
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-process">Αυτόματη Σάρωση</Label>
          <Switch 
            id="auto-process" 
            checked={settings.autoProcessingEnabled}
            onCheckedChange={(checked) => updateSettings({ autoProcessingEnabled: checked })}
          />
        </div>
        
        {settings.autoProcessingEnabled && (
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="interval">Συχνότητα Ελέγχου</Label>
              <span className="text-sm text-muted-foreground">
                {settings.processingInterval} λεπτά
              </span>
            </div>
            <Slider
              id="interval"
              min={5}
              max={120}
              step={5}
              value={[settings.processingInterval]}
              onValueChange={(value) => updateSettings({ processingInterval: value[0] })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoScanSettingsCard;
