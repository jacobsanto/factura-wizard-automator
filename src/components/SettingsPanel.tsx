
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";

const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
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
        {/* AI Feature Settings */}
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
        
        {/* Invoice Filtering Settings */}
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
        
        {/* Google Sheets Settings */}
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
        
        {/* Automatic Scanning */}
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
        
        {/* Error Notifications */}
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
        
        {/* Reset Settings */}
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
              onClick={() => {
                resetSettings();
                toast({
                  title: "Επαναφορά ρυθμίσεων",
                  description: "Οι ρυθμίσεις επαναφέρθηκαν στις προεπιλεγμένες τιμές."
                });
              }}
            >
              Επαναφορά σε Προεπιλογές
            </Button>
          </CardContent>
        </Card>
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
