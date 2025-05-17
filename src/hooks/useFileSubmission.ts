
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/helpers";
import { logUpload } from "@/helpers/logHelpers";
import { useGoogleSheetsLogger } from "@/hooks/useGoogleSheetsLogger";

interface UploadOptions {
  file: File | null;
  clientVat: string;
  clientName: string;
  issuer: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  currency: string;
  useSheets: boolean;
  spreadsheetId: string;
  sheetName: string;
}

interface UseFileSubmissionReturn {
  uploading: boolean;
  uploadStatus: null | "success" | "error";
  driveLink: string | null;
  handleUpload: (e: React.FormEvent, options: UploadOptions) => Promise<void>;
}

export function useFileSubmission(): UseFileSubmissionReturn {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<null | "success" | "error">(null);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const { toast } = useToast();
  const sheetsLogger = useGoogleSheetsLogger();

  const handleUpload = async (e: React.FormEvent, options: UploadOptions) => {
    e.preventDefault();
    
    console.log("File upload initiated", {
      hasFile: !!options.file,
      fileName: options.file?.name,
      fileSize: options.file?.size,
      useSheets: options.useSheets,
      hasSheetsId: !!options.spreadsheetId
    });
    
    if (!options.file) {
      console.log("Upload aborted: No file provided");
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      console.log("Starting file upload to Google Drive");
      const result = await uploadFile(options.file, {
        clientVat: options.clientVat,
        clientName: options.clientName,
        issuer: options.issuer,
        invoiceNumber: options.invoiceNumber,
        date: options.date,
        amount: options.amount,
        currency: options.currency
      });

      if (result.success && result.fileId) {
        console.log("File uploaded successfully to Drive", { fileId: result.fileId });
        // Log the upload to local storage
        logUpload(
          options.file.name,
          options.clientVat,
          options.clientName,
          options.issuer,
          options.invoiceNumber,
          options.date,
          options.amount,
          options.currency,
          result.fileId
        );
        
        setUploadStatus("success");
        setDriveLink(`https://drive.google.com/file/d/${result.fileId}`);
        
        // If Google Sheets logging is enabled
        if (options.useSheets && options.spreadsheetId) {
          console.log("Google Sheets logging requested", { 
            spreadsheetId: options.spreadsheetId,
            sheetName: options.sheetName
          });
          
          try {
            const sheetLoggingSuccess = await sheetsLogger.logToSheet({
              spreadsheetId: options.spreadsheetId,
              sheetName: options.sheetName,
              values: [
                new Date().toLocaleString(),
                result.fileName || options.file.name,
                options.clientVat,
                options.clientName,
                options.issuer,
                options.invoiceNumber,
                options.date,
                options.amount,
                options.currency,
                `https://drive.google.com/file/d/${result.fileId}`
              ]
            });
            
            if (sheetLoggingSuccess) {
              toast({
                title: "Επιτυχία",
                description: "Το αρχείο καταγράφηκε επιτυχώς στο Google Sheets",
              });
            } else {
              console.warn("Sheet logging returned false, but no exception was thrown");
              toast({
                variant: "destructive",
                title: "Προειδοποίηση",
                description: "Το αρχείο ανέβηκε αλλά απέτυχε η καταγραφή στο Google Sheets",
              });
            }
          } catch (sheetError) {
            console.error("Exception during Google Sheets logging:", sheetError);
            toast({
              variant: "destructive",
              title: "Προειδοποίηση",
              description: "Το αρχείο ανέβηκε αλλά απέτυχε η καταγραφή στο Google Sheets",
            });
          }
        } else {
          console.log("Google Sheets logging skipped", { 
            useSheets: options.useSheets, 
            hasSheetsId: !!options.spreadsheetId 
          });
          toast({
            title: "Επιτυχία",
            description: "Το αρχείο ανέβηκε επιτυχώς στο Google Drive",
          });
        }
      } else {
        console.error("Upload failed", result);
        setUploadStatus("error");
        toast({
          variant: "destructive",
          title: "Σφάλμα",
          description: "Υπήρξε πρόβλημα κατά το ανέβασμα του αρχείου",
        });
      }
    } catch (error) {
      console.error("Exception during file upload:", error);
      setUploadStatus("error");
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Υπήρξε πρόβλημα κατά το ανέβασμα του αρχείου",
      });
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadStatus,
    driveLink,
    handleUpload
  };
}
