import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadFile } from "@/helpers";
import UploadStatus from "@/components/uploads/UploadStatus";
import GoogleSheetsOptions from "@/components/uploads/GoogleSheetsOptions";
import { useToast } from "@/hooks/use-toast";
import { logToGoogleSheet, logUpload } from "@/helpers/logHelpers";

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
  const [uploadStatus, setUploadStatus] = useState<null | "success" | "error">(null);
  const [driveLink, setDriveLink] = useState<string | null>(null);
  const [useSheets, setUseSheets] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("Log");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
      <div className="space-y-2">
        <Label htmlFor="file">Αρχείο</Label>
        <Input id="file" type="file" accept=".pdf" onChange={handleFileChange} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientVat">ΑΦΜ Πελάτη</Label>
          <Input 
            id="clientVat" 
            value={clientVat} 
            onChange={(e) => setClientVat(e.target.value)}
            placeholder="π.χ. 123456789"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="clientName">Όνομα Πελάτη</Label>
          <Input 
            id="clientName" 
            value={clientName} 
            onChange={(e) => setClientName(e.target.value)}
            placeholder="π.χ. Επωνυμία Πελάτη"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="issuer">Προμηθευτής</Label>
          <Input 
            id="issuer" 
            value={issuer} 
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="π.χ. Όνομα Προμηθευτή"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Αριθμός Τιμολογίου</Label>
          <Input 
            id="invoiceNumber" 
            value={invoiceNumber} 
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="π.χ. ΤΔΑ-12345"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Ημερομηνία</Label>
          <Input 
            id="date" 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Ποσό</Label>
            <Input 
              id="amount" 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currency">Νόμισμα</Label>
            <Input 
              id="currency" 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="€"
            />
          </div>
        </div>
      </div>
      
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
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={uploading || !file}
      >
        {uploading ? "Αποστολή..." : "Αποστολή στο Drive"}
      </Button>
      
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
