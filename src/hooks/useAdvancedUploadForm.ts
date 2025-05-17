
/**
 * @deprecated This hook is now split into smaller, more focused hooks:
 * - useFileUpload
 * - useInvoiceForm
 * - useGoogleSheetsOptions
 * - useFileSubmission
 * 
 * Please use these hooks instead. This hook is kept for backward compatibility.
 */
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/helpers";
import { logToGoogleSheet, logUpload } from "@/helpers/logHelpers";
import { extractTextFromPdf } from "@/utils/pdfUtils";
import { extractInvoiceDataWithGpt } from "@/api/gptApi";

export interface AdvancedUploadFormState {
  file: File | null;
  clientVat: string;
  clientName: string;
  issuer: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  currency: string;
  uploading: boolean;
  parsing: boolean;
  uploadStatus: null | "success" | "error";
  driveLink: string | null;
  useSheets: boolean;
  spreadsheetId: string;
  sheetName: string;
}

interface UseAdvancedUploadFormReturn extends AdvancedUploadFormState {
  setFile: (file: File | null) => void;
  setClientVat: (value: string) => void;
  setClientName: (value: string) => void;
  setIssuer: (value: string) => void;
  setInvoiceNumber: (value: string) => void;
  setDate: (value: string) => void;
  setAmount: (value: string) => void;
  setCurrency: (value: string) => void;
  setUseSheets: (value: boolean) => void;
  setSpreadsheetId: (value: string) => void;
  setSheetName: (value: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleParsePdf: () => Promise<void>;
  handleUpload: (e: React.FormEvent) => Promise<void>;
}

export function useAdvancedUploadForm(): UseAdvancedUploadFormReturn {
  const [file, setFile] = useState<File | null>(null);
  const [clientVat, setClientVat] = useState("");
  const [clientName, setClientName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("€");
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<null | "success" | "error">(null);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const [useSheets, setUseSheets] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("Log");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus(null); // Reset status when file changes
    }
  };

  const handleParsePdf = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε ένα αρχείο PDF πρώτα",
      });
      return;
    }

    if (!file.type.includes('pdf')) {
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Το αρχείο πρέπει να είναι τύπου PDF",
      });
      return;
    }

    setParsing(true);
    try {
      // Extract text from PDF
      const extractedText = await extractTextFromPdf(file);
      
      // Process with GPT
      const extractedData = await extractInvoiceDataWithGpt(extractedText);
      
      // Fill the form fields with extracted data
      if (extractedData) {
        setClientVat(extractedData.vatNumber !== "unknown" ? extractedData.vatNumber : "");
        setClientName(extractedData.clientName !== "unknown" ? extractedData.clientName : "");
        setIssuer(extractedData.issuer !== "unknown" ? extractedData.issuer : "");
        setInvoiceNumber(extractedData.documentNumber !== "unknown" ? extractedData.documentNumber : "");
        setDate(extractedData.date !== "unknown" ? extractedData.date : "");
        setAmount(extractedData.amount !== "unknown" ? extractedData.amount : "");
        setCurrency(extractedData.currency !== "unknown" ? extractedData.currency : "€");
        
        toast({
          title: "Επιτυχία",
          description: "Τα στοιχεία του τιμολογίου εξήχθησαν επιτυχώς",
        });
      }
    } catch (error) {
      console.error("Error parsing PDF:", error);
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η ανάλυση του αρχείου PDF",
      });
    } finally {
      setParsing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);

    try {
      const result = await uploadFile(file, {
        clientVat,
        clientName,
        issuer,
        invoiceNumber,
        date,
        amount,
        currency
      });

      if (result.success && result.fileId) {
        // Log the upload
        logUpload(
          file.name,
          clientVat,
          clientName,
          issuer,
          invoiceNumber,
          date,
          amount,
          currency,
          result.fileId
        );
        
        setUploadStatus("success");
        setDriveLink(`https://drive.google.com/file/d/${result.fileId}`);
        
        // If Google Sheets logging is enabled
        if (useSheets && spreadsheetId) {
          try {
            await logToGoogleSheet({
              spreadsheetId,
              sheetName,
              values: [
                new Date().toLocaleString(),
                result.fileName || file.name,
                clientVat,
                clientName,
                issuer,
                invoiceNumber,
                date,
                amount,
                currency,
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
    file,
    setFile,
    clientVat,
    setClientVat,
    clientName,
    setClientName,
    issuer,
    setIssuer,
    invoiceNumber,
    setInvoiceNumber,
    date,
    setDate,
    amount,
    setAmount,
    currency,
    setCurrency,
    uploading,
    parsing,
    uploadStatus,
    driveLink,
    useSheets,
    setUseSheets,
    spreadsheetId,
    setSpreadsheetId,
    sheetName,
    setSheetName,
    handleFileChange,
    handleParsePdf,
    handleUpload
  };
}
