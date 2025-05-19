
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/contexts/SettingsContext";

const AISettingsCard: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Τεχνητή Νοημοσύνη</CardTitle>
        <CardDescription>
          Ρυθμίσεις για την εξαγωγή δεδομένων με AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-ai">Ενεργοποίηση AI Εξαγωγής</Label>
          <Switch 
            id="enable-ai" 
            checked={settings.enableAI !== false}
            onCheckedChange={(checked) => updateSettings({ enableAI: checked })}
          />
        </div>
        
        {settings.enableAI !== false && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="prefer-greek">Βελτιστοποίηση για Ελληνικά Παραστατικά</Label>
              <Switch 
                id="prefer-greek" 
                checked={settings.preferGreekExtraction !== false}
                onCheckedChange={(checked) => updateSettings({ preferGreekExtraction: checked })}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="ai-confidence">Ελάχιστο Επίπεδο Εμπιστοσύνης</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.aiConfidenceThreshold || 70}%
                </span>
              </div>
              <Slider
                id="ai-confidence"
                min={0}
                max={100}
                step={5}
                value={[settings.aiConfidenceThreshold || 70]}
                onValueChange={(value) => updateSettings({ aiConfidenceThreshold: value[0] })}
              />
              <p className="text-sm text-muted-foreground">
                Κάτω από αυτό το όριο, θα χρησιμοποιηθούν εναλλακτικές μέθοδοι εξαγωγής
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISettingsCard;
