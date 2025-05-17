
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/helpers";
import { logToGoogleSheet, logUpload } from "@/helpers/logHelpers";
import { extractTextFromPdf } from "@/utils/pdfUtils";
import { extractInvoiceDataWithGpt } from "@/api/gptApi";
import UploadStatus from "@/components/uploads/UploadStatus";
import GoogleSheetsOptions from "@/components/uploads/GoogleSheetsOptions";
import FileUpload from "@/components/uploads/FileUpload";
import InvoiceFormFields from "@/components/uploads/InvoiceFormFields";
import SubmitButton from "@/components/uploads/SubmitButton";

const AdvancedUploadForm: React.FC = () => {
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

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <FileUpload
        file={file}
        handleFileChange={handleFileChange}
        handleParsePdf={handleParsePdf}
        parsing={parsing}
      />
      
      <InvoiceFormFields
        clientVat={clientVat}
        setClientVat={setClientVat}
        clientName={clientName}
        setClientName={setClientName}
        issuer={issuer}
        setIssuer={setIssuer}
        invoiceNumber={invoiceNumber}
        setInvoiceNumber={setInvoiceNumber}
        date={date}
        setDate={setDate}
        amount={amount}
        setAmount={setAmount}
        currency={currency}
        setCurrency={setCurrency}
      />
      
      <div className="border-t pt-4">
        <GoogleSheetsOptions 
          useSheets={useSheets}
          setUseSheets={setUseSheets}
          spreadsheetId={spreadsheetId}
          setSpreadsheetId={setSpreadsheetId}
          sheetName={sheetName}
          setSheetName={setSheetName}
        />
      </div>
      
      <SubmitButton 
        uploading={uploading}
        disabled={!file}
      />
      
      {uploadStatus && (
        <UploadStatus 
          status={uploadStatus} 
          fileLink={driveLink || undefined} 
          message={uploadStatus === "error" ? "Η αποστολή απέτυχε. Παρακαλώ προσπαθήστε ξανά." : undefined}
        />
      )}
    </form>
  );
};

export default AdvancedUploadForm;
