
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { validatePdfFile } from "@/utils/fileValidation";
import { pdfProcessingService } from "@/services/PdfProcessingService";
import { dataExtractionService, InvoiceData } from "@/services/DataExtractionService";

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
    // Validate file
    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: validation.errorMessage,
      });
      return;
    }

    setParsing(true);
    
    try {
      // Process PDF using the service
      const processedData = await pdfProcessingService.processPdf(file!);
      
      if (processedData) {
        // Map to invoice data format
        const invoiceData = dataExtractionService.mapToInvoiceData(processedData);
        setExtractedData(invoiceData);
        
        // Show success toast
        const successMessage = dataExtractionService.getSuccessMessage(processedData);
        toast({
          title: "Επιτυχία",
          description: successMessage,
        });
      } else {
        // This shouldn't happen since processPdf always returns data
        throw new Error("No data extracted from PDF");
      }
    } catch (error) {
      console.error("Error during PDF parsing or processing:", error);
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
