
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPdf } from "@/utils/pdfUtils";
import { extractInvoiceDataWithGpt } from "@/api/gptApi";

interface UseFileUploadReturn {
  file: File | null;
  parsing: boolean;
  setFile: (file: File | null) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleParsePdf: () => Promise<void>;
  extractedData: {
    clientVat: string;
    clientName: string;
    issuer: string;
    invoiceNumber: string;
    date: string;
    amount: string;
    currency: string;
  } | null;
}

export function useFileUpload(): UseFileUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [extractedData, setExtractedData] = useState<UseFileUploadReturn['extractedData']>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
      
      if (extractedData) {
        setExtractedData({
          clientVat: extractedData.vatNumber !== "unknown" ? extractedData.vatNumber : "",
          clientName: extractedData.clientName !== "unknown" ? extractedData.clientName : "",
          issuer: extractedData.issuer !== "unknown" ? extractedData.issuer : "",
          invoiceNumber: extractedData.documentNumber !== "unknown" ? extractedData.documentNumber : "",
          date: extractedData.date !== "unknown" ? extractedData.date : "",
          amount: extractedData.amount !== "unknown" ? extractedData.amount : "",
          currency: extractedData.currency !== "unknown" ? extractedData.currency : "€"
        });
        
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

  return {
    file,
    parsing,
    setFile,
    handleFileChange,
    handleParsePdf,
    extractedData
  };
}
