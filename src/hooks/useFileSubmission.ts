
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/helpers";
import { logToGoogleSheet, logUpload } from "@/helpers/logHelpers";

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

  const handleUpload = async (e: React.FormEvent, options: UploadOptions) => {
    e.preventDefault();
    if (!options.file) return;

    setUploading(true);
    setUploadStatus(null);

    try {
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
        // Log the upload
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
          try {
            await logToGoogleSheet({
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
            
            toast({
              title: "Επιτυχία",
              description: "Το αρχείο καταγράφηκε επιτυχώς στο Google Sheets",
            });
          } catch (sheetError) {
            console.error("Google Sheets logging error:", sheetError);
            toast({
              variant: "destructive",
              title: "Προειδοποίηση",
              description: "Το αρχείο ανέβηκε αλλά απέτυχε η καταγραφή στο Google Sheets",
            });
          }
        } else {
          toast({
            title: "Επιτυχία",
            description: "Το αρχείο ανέβηκε επιτυχώς στο Google Drive",
          });
        }
      } else {
        setUploadStatus("error");
        toast({
          variant: "destructive",
          title: "Σφάλμα",
          description: "Υπήρξε πρόβλημα κατά το ανέβασμα του αρχείου",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
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
