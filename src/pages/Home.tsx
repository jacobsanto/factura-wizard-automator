
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { extractInvoiceDataFromPdf } from "@/api/gptApi";
import { uploadInvoiceToDrive } from "@/helpers/uploadHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UploadStatus from "@/components/uploads/UploadStatus";
import AdvancedUploadForm from "@/components/uploads/AdvancedUploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Home: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"success" | "error" | null>(null);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus(null);
    }
  };
  
  const handleQuickUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε ένα αρχείο PDF πρώτα",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadStatus(null);
    
    try {
      // Extract data using GPT
      toast({
        title: "Επεξεργασία",
        description: "Αναλύουμε το PDF σας με AI...",
      });
      
      const extractedData = await extractInvoiceDataFromPdf(file);
      
      // Upload to Drive
      toast({
        title: "Αποστολή",
        description: "Ανεβάζουμε το αρχείο στο Google Drive...",
      });
      
      const result = await uploadInvoiceToDrive(file, {
        ...extractedData,
        // Convert string amount to number
        amount: typeof extractedData.amount === 'string' 
          ? parseFloat(extractedData.amount) 
          : extractedData.amount,
        supplier: extractedData.issuer,
      });
      
      if (result.success && result.fileId) {
        setUploadStatus("success");
        setDriveLink(`https://drive.google.com/file/d/${result.fileId}`);
        toast({
          title: "Επιτυχία!",
          description: "Το αρχείο αναλύθηκε και ανέβηκε επιτυχώς",
        });
      } else {
        setUploadStatus("error");
        toast({
          variant: "destructive",
          title: "Σφάλμα",
          description: "Υπήρξε πρόβλημα κατά το ανέβασμα του αρχείου",
        });
      }
    } catch (error) {
      console.error("Quick upload error:", error);
      setUploadStatus("error");
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Υπήρξε πρόβλημα κατά την επεξεργασία ή το ανέβασμα του αρχείου",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📤 Ανέβασμα Παραστατικού</h1>
      
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
                
                <div className="flex flex-col gap-4">
                  <input 
                    type="file" 
                    id="quick-file" 
                    accept=".pdf" 
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  
                  <Button 
                    onClick={handleQuickUpload}
                    disabled={isUploading || !file}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Αναλύουμε και ανεβάζουμε...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Αυτόματο Ανέβασμα στο Drive
                      </>
                    )}
                  </Button>
                </div>
                
                {uploadStatus && (
                  <UploadStatus 
                    status={uploadStatus} 
                    fileLink={driveLink || undefined}
                    message={uploadStatus === "error" ? "Η αποστολή απέτυχε. Παρακαλώ προσπαθήστε ξανά." : undefined}
                  />
                )}
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

export default Home;
