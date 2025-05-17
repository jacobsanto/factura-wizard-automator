
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { extractInvoiceDataFromPdf } from "@/api/gptApi";
import { uploadInvoiceToDrive } from "@/helpers/uploadHelpers";
import { Loader, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UploadStatus from "@/components/uploads/UploadStatus";

const SimpleUploadForm: React.FC = () => {
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
    <div className="space-y-4">
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
      
      {uploadStatus && (
        <UploadStatus 
          status={uploadStatus} 
          fileLink={driveLink || undefined}
          message={uploadStatus === "error" ? "Η αποστολή απέτυχε. Παρακαλώ προσπαθήστε ξανά." : undefined}
        />
      )}
    </div>
  );
};

export default SimpleUploadForm;
