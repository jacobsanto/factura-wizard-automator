
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/contexts/SettingsContext";
import { Info } from "lucide-react";

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
      <CardContent>
        <Tabs defaultValue="gpt" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="gpt">OpenAI GPT</TabsTrigger>
            <TabsTrigger value="documentai">Google Document AI</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gpt" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-ai">Ενεργοποίηση GPT Εξαγωγής</Label>
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
          </TabsContent>
          
          <TabsContent value="documentai" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-documentai" className="flex items-center">
                Ενεργοποίηση Google Document AI
              </Label>
              <Switch 
                id="enable-documentai" 
                checked={settings.enableDocumentAI === true}
                onCheckedChange={(checked) => updateSettings({ enableDocumentAI: checked })}
              />
            </div>
            
            {settings.enableDocumentAI === true && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="processor-id">Processor ID</Label>
                  <Input
                    id="processor-id"
                    placeholder="Εισάγετε Processor ID από το Google Cloud Console"
                    value={settings.documentAIProcessorId || ""}
                    onChange={(e) => updateSettings({ documentAIProcessorId: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="processor-location">Processor Location</Label>
                  <Input
                    id="processor-location"
                    placeholder="π.χ. eu, us"
                    value={settings.documentAILocation || ""}
                    onChange={(e) => updateSettings({ documentAILocation: e.target.value })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="prefer-documentai-greek">
                    Προτίμηση Document AI για Ελληνικά Έγγραφα
                  </Label>
                  <Switch 
                    id="prefer-documentai-greek" 
                    checked={settings.documentAIPreferredForGreek === true}
                    onCheckedChange={(checked) => updateSettings({ documentAIPreferredForGreek: checked })}
                  />
                </div>
                
                <div className="bg-muted p-3 rounded-md flex items-start space-x-2">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Για να χρησιμοποιήσετε το Google Document AI, πρέπει να δημιουργήσετε 
                    έναν processor στο Google Cloud Console και να προσθέσετε το Google API Key 
                    στις ρυθμίσεις του Supabase.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AISettingsCard;
