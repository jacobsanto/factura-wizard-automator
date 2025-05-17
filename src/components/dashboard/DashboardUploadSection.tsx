
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload } from "lucide-react";
import AdvancedUploadForm from "@/components/uploads/AdvancedUploadForm";
import SimpleUploadForm from "@/components/uploads/SimpleUploadForm";

const DashboardUploadSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">📤 Ανέβασμα Παραστατικού</h2>
      
      <Tabs defaultValue="simple" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="simple">Γρήγορο Ανέβασμα</TabsTrigger>
          <TabsTrigger value="advanced">Προχωρημένο</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simple">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Αυτόματο Ανέβασμα με AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Ανεβάστε το PDF τιμολόγιο και η AI θα αναλύσει αυτόματα τα στοιχεία και θα το αποθηκεύσει στη σωστή θέση στο Drive.
                </p>
                
                <SimpleUploadForm />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Προχωρημένη Αποστολή</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Ανεβάστε το PDF τιμολογίό σας και πατήστε "Ανάλυση PDF" για αυτόματη εξαγωγή 
                των στοιχείων του τιμολογίου. Μπορείτε να επεξεργαστείτε τα δεδομένα πριν την αποστολή.
              </p>
              <AdvancedUploadForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardUploadSection;
