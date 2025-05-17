
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPdf } from "@/utils/pdfUtils";
import { extractInvoiceDataWithGpt } from "@/api/gptApi";

interface InvoiceData {
  clientVat: string;
  clientName: string;
  issuer: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  currency: string;
}

interface UseFileUploadReturn {
  file: File | null;
  parsing: boolean;
  setFile: (file: File | null) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleParsePdf: () => Promise<void>;
  extractedData: InvoiceData | null;
}

export function useFileUpload(): UseFileUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [extractedData, setExtractedData] = useState<InvoiceData | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log("File selected", { 
        name: selectedFile.name, 
        type: selectedFile.type, 
        size: selectedFile.size 
      });
      setFile(selectedFile);
    } else {
      console.log("No file selected or file selection cancelled");
    }
  };

  const handleParsePdf = async () => {
    if (!file) {
      console.log("Parse PDF aborted: No file selected");
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε ένα αρχείο PDF πρώτα",
      });
      return;
    }

    if (!file.type.includes('pdf')) {
      console.log("Parse PDF aborted: File is not a PDF", { 
        fileType: file.type,
        fileName: file.name 
      });
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Το αρχείο πρέπει να είναι τύπου PDF",
      });
      return;
    }

    console.log("Starting PDF parsing", { fileName: file.name });
    setParsing(true);
    
    try {
      // Extract text from PDF
      console.log("Extracting text from PDF...");
      const extractedText = await extractTextFromPdf(file);
      console.log("Text extraction complete", { 
        textLength: extractedText.length,
        textPreview: extractedText.substring(0, 100) + '...' 
      });
      
      // Process with GPT
      console.log("Processing extracted text with GPT...");
      const extractedData = await extractInvoiceDataWithGpt(extractedText);
      console.log("GPT processing complete", extractedData);
      
      if (extractedData) {
        const mappedData: InvoiceData = {
          clientVat: extractedData.vatNumber !== "unknown" ? extractedData.vatNumber : "",
          clientName: extractedData.clientName !== "unknown" ? extractedData.clientName : "",
          issuer: extractedData.issuer !== "unknown" ? extractedData.issuer : "",
          invoiceNumber: extractedData.documentNumber !== "unknown" ? extractedData.documentNumber : "",
          date: extractedData.date !== "unknown" ? extractedData.date : "",
          amount: extractedData.amount !== "unknown" ? extractedData.amount : "",
          currency: extractedData.currency !== "unknown" ? extractedData.currency : "€"
        };
        
        console.log("Setting extracted data", mappedData);
        setExtractedData(mappedData);
        
        toast({
          title: "Επιτυχία",
          description: "Τα στοιχεία του τιμολογίου εξήχθησαν επιτυχώς",
        });
      } else {
        console.warn("No data extracted from GPT processing");
        toast({
          variant: "destructive",
          title: "Προειδοποίηση",
          description: "Δεν ήταν δυνατή η εξαγωγή στοιχείων από το PDF",
        });
      }
    } catch (error) {
      console.error("Error during PDF parsing or GPT processing:", error);
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η ανάλυση του αρχείου PDF",
      });
    } finally {
      console.log("PDF parsing process complete");
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
