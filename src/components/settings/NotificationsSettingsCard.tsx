
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/contexts/SettingsContext";

const NotificationsSettingsCard: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ειδοποιήσεις Σφαλμάτων</CardTitle>
        <CardDescription>
          Αποστολή email σε περίπτωση σφάλματος κατά την επεξεργασία
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notify-errors">Ειδοποίηση Σφαλμάτων</Label>
          <Switch 
            id="notify-errors" 
            checked={settings.notifyOnError}
            onCheckedChange={(checked) => updateSettings({ notifyOnError: checked })}
          />
        </div>
        
        {settings.notifyOnError && (
          <div className="space-y-2">
            <Label htmlFor="notify-email">Email Ειδοποιήσεων</Label>
            <Input 
              id="notify-email" 
              type="email"
              placeholder="email@example.com"
              value={settings.notifyEmail || ""}
              onChange={(e) => updateSettings({ notifyEmail: e.target.value })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationsSettingsCard;
