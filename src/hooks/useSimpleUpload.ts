
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { extractInvoiceDataFromPdf } from "@/api/gptApi";
import { uploadInvoiceToDrive } from "@/helpers/uploadHelpers";
import { isDriveReady } from "@/helpers/driveHelpers";
import { useSupabaseAuth } from "@/contexts/supabase/SupabaseAuthContext";

type UploadStatusType = "success" | "error" | null;

interface RecentUpload {
  filename: string;
  date: string;
  driveLink: string;
  success: boolean;
}

export function useSimpleUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatusType>(null);
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
  
  const saveToRecentUploads = (upload: RecentUpload) => {
    try {
      const recentUploads = JSON.parse(localStorage.getItem('recentUploads') || '[]');
      const updatedUploads = [upload, ...recentUploads].slice(0, 10); // Keep only last 10 uploads
      localStorage.setItem('recentUploads', JSON.stringify(updatedUploads));
    } catch (error) {
      console.error("Error saving to recent uploads:", error);
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

  return {
    file,
    isUploading,
    uploadStatus,
    driveLink,
    uploadProgress,
    extractedData,
    isExtracting,
    isDriveAuthenticated,
    errorMessage,
    handleFileChange,
    handleExtractData,
    handleQuickUpload
  };
}
