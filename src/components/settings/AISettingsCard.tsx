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
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Features Removed</CardTitle>
        <CardDescription>
          AI-powered extraction features have been removed from this application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          The application now uses pattern-based extraction and OCR for document processing.
        </p>
      </CardContent>
    </Card>
  );
};
export default AISettingsCard;