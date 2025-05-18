
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { extractInvoiceDataFromPdf } from "@/api/gptApi";
import { uploadInvoiceToDrive } from "@/helpers/uploadHelpers";
import { Loader, Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UploadStatus from "@/components/uploads/UploadStatus";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { isDriveReady } from "@/helpers/driveHelpers";
import { useSupabaseAuth } from "@/contexts/supabase/SupabaseAuthContext";

const SimpleUploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"success" | "error" | null>(null);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDriveAuthenticated, setIsDriveAuthenticated] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useSupabaseAuth();
  
  // Check if Drive is authenticated when component mounts
  useEffect(() => {
    const checkDriveAuth = async () => {
      const isReady = await isDriveReady();
      setIsDriveAuthenticated(isReady);
      
      if (!isReady) {
        console.log("Google Drive is not authenticated or ready");
      }
    };
    
    if (isAuthenticated) {
      checkDriveAuth();
    }
  }, [isAuthenticated]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setUploadStatus(null);
    setExtractedData(null);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.type.includes('pdf')) {
        setErrorMessage("Παρακαλώ επιλέξτε αρχείο PDF");
        return;
      }
      
      setFile(selectedFile);
      toast({
        title: "Αρχείο επιλέχθηκε",
        description: `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`,
      });
    }
  };
  
  const handleExtractData = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε ένα αρχείο PDF πρώτα",
      });
      return;
    }
    
    setIsExtracting(true);
    setErrorMessage(null);
    
    try {
      toast({
        title: "Επεξεργασία",
        description: "Αναλύουμε το PDF σας με AI...",
      });
      
      const data = await extractInvoiceDataFromPdf(file);
      setExtractedData(data);
      
      toast({
        title: "Ανάλυση ολοκληρώθηκε",
        description: "Τα στοιχεία του παραστατικού αναλύθηκαν επιτυχώς",
      });
    } catch (error) {
      console.error("PDF extraction error:", error);
      setErrorMessage("Αποτυχία ανάλυσης του PDF. Παρακαλώ δοκιμάστε ξανά.");
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η ανάλυση του αρχείου PDF",
      });
    } finally {
      setIsExtracting(false);
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
    
    // Check Drive authentication
    if (!isDriveAuthenticated) {
      toast({
        variant: "destructive",
        title: "Σφάλμα σύνδεσης",
        description: "Δεν είστε συνδεδεμένοι στο Google Drive. Παρακαλώ συνδεθείτε και δοκιμάστε ξανά.",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadStatus(null);
    setUploadProgress(0);
    setErrorMessage(null);
    
    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          // Slowly increase progress up to 90% during processing
          // The last 10% will be set after success
          return prev < 90 ? prev + 5 : prev;
        });
      }, 500);
      
      // First extract if not already done
      let dataToUpload;
      if (!extractedData) {
        setIsExtracting(true);
        toast({
          title: "Επεξεργασία",
          description: "Αναλύουμε το PDF σας με AI...",
        });
        
        try {
          dataToUpload = await extractInvoiceDataFromPdf(file);
          setExtractedData(dataToUpload);
        } catch (error) {
          console.error("PDF extraction error during upload:", error);
          throw new Error("Αποτυχία ανάλυσης του PDF");
        } finally {
          setIsExtracting(false);
        }
      } else {
        dataToUpload = extractedData;
      }
      
      // Upload to Drive
      toast({
        title: "Αποστολή",
        description: "Ανεβάζουμε το αρχείο στο Google Drive...",
      });
      
      const result = await uploadInvoiceToDrive(file, {
        ...dataToUpload,
        // Convert string amount to number
        amount: typeof dataToUpload.amount === 'string' 
          ? parseFloat(dataToUpload.amount) 
          : dataToUpload.amount,
        supplier: dataToUpload.issuer,
      });
      
      clearInterval(progressInterval);
      
      if (result.success && result.fileId) {
        setUploadProgress(100);
        setUploadStatus("success");
        setDriveLink(`https://drive.google.com/file/d/${result.fileId}`);
        toast({
          title: "Επιτυχία!",
          description: "Το αρχείο αναλύθηκε και ανέβηκε επιτυχώς",
        });
        
        // Save to recent uploads in localStorage
        saveToRecentUploads({
          filename: file.name,
          date: new Date().toISOString(),
          driveLink: `https://drive.google.com/file/d/${result.fileId}`,
          success: true,
        });
      } else {
        setUploadStatus("error");
        setErrorMessage("Υπήρξε πρόβλημα κατά το ανέβασμα του αρχείου");
        toast({
          variant: "destructive",
          title: "Σφάλμα",
          description: "Υπήρξε πρόβλημα κατά το ανέβασμα του αρχείου",
        });
      }
    } catch (error) {
      console.error("Quick upload error:", error);
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Άγνωστο σφάλμα");
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: error instanceof Error ? error.message : "Υπήρξε πρόβλημα κατά την επεξεργασία ή το ανέβασμα του αρχείου",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to save upload history in localStorage
  const saveToRecentUploads = (upload: {
    filename: string;
    date: string;
    driveLink: string;
    success: boolean;
  }) => {
    try {
      const recentUploads = JSON.parse(localStorage.getItem('recentUploads') || '[]');
      const updatedUploads = [upload, ...recentUploads].slice(0, 10); // Keep only last 10 uploads
      localStorage.setItem('recentUploads', JSON.stringify(updatedUploads));
    } catch (error) {
      console.error("Error saving to recent uploads:", error);
    }
  };

  const renderAuthAlert = () => {
    if (isDriveAuthenticated === false) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Δεν είστε συνδεδεμένοι στο Google Drive</AlertTitle>
          <AlertDescription>
            Παρακαλώ συνδεθείτε στο Google για να μπορέσετε να ανεβάσετε αρχεία.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  const renderExtractedDataPreview = () => {
    if (!extractedData) return null;
    
    return (
      <Card className="mb-4 bg-gray-50">
        <CardContent className="pt-4">
          <h4 className="text-sm font-medium mb-2">Στοιχεία που αναγνωρίστηκαν:</h4>
          <ul className="text-xs space-y-1">
            <li><span className="font-medium">ΑΦΜ:</span> {extractedData.vatNumber}</li>
            <li><span className="font-medium">Πελάτης:</span> {extractedData.clientName}</li>
            <li><span className="font-medium">Εκδότης:</span> {extractedData.issuer}</li>
            <li><span className="font-medium">Αρ. Παραστατικού:</span> {extractedData.documentNumber}</li>
            <li><span className="font-medium">Ημερομηνία:</span> {extractedData.date}</li>
            <li><span className="font-medium">Ποσό:</span> {extractedData.amount} {extractedData.currency}</li>
          </ul>
        </CardContent>
      </Card>
    );
  };

  const renderError = () => {
    if (!errorMessage) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <X className="h-4 w-4 mr-2" />
        <AlertTitle>Σφάλμα</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-4">
      {renderAuthAlert()}
      {renderError()}
      
      <div className="flex flex-col space-y-2">
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
        
        {file && (
          <div className="flex items-center text-xs text-gray-500">
            <FileText className="h-3 w-3 mr-1" /> 
            {file.name} - {(file.size / 1024).toFixed(1)} KB
          </div>
        )}
      </div>
      
      {file && !extractedData && !isExtracting && (
        <Button 
          onClick={handleExtractData}
          variant="outline"
          disabled={isExtracting}
          className="w-full"
        >
          {isExtracting ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Ανάλυση PDF...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Ανάλυση του PDF
            </>
          )}
        </Button>
      )}
      
      {renderExtractedDataPreview()}
      
      {(isUploading || uploadProgress > 0) && (
        <div className="space-y-1">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-gray-500 text-center">{uploadProgress}%</p>
        </div>
      )}
      
      <Button 
        onClick={handleQuickUpload}
        disabled={isUploading || isExtracting || isDriveAuthenticated === false}
        className="w-full"
      >
        {isUploading || isExtracting ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            {isExtracting ? "Αναλύουμε..." : "Ανεβάζουμε..."}
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {extractedData ? "Αποστολή στο Drive" : "Αυτόματο Ανέβασμα στο Drive"}
          </>
        )}
      </Button>
      
      {uploadStatus && (
        <UploadStatus 
          status={uploadStatus} 
          fileLink={driveLink || undefined}
          message={uploadStatus === "error" ? (errorMessage || "Η αποστολή απέτυχε. Παρακαλώ προσπαθήστε ξανά.") : undefined}
        />
      )}
    </div>
  );
};

export default SimpleUploadForm;
