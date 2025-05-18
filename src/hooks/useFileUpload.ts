
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPdf, extractTextFromPdfAdvanced } from "@/utils/pdfUtils";
import { extractInvoiceDataWithGpt, extractInvoiceDataFromPdf } from "@/api/gptApi";

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
      // Try direct PDF processing with our improved GPT integration
      console.log("Processing PDF with enhanced GPT extraction...");
      try {
        // Use the direct PDF method which extracts text and sends to GPT
        const extractedData = await extractInvoiceDataFromPdf(file);
        console.log("Enhanced GPT processing complete", extractedData);
        
        if (extractedData && extractedData.vatNumber !== "unknown") {
          const mappedData: InvoiceData = {
            clientVat: extractedData.vatNumber !== "unknown" ? extractedData.vatNumber : "",
            clientName: extractedData.clientName !== "unknown" ? extractedData.clientName : "",
            issuer: extractedData.issuer !== "unknown" ? extractedData.issuer : "",
            invoiceNumber: extractedData.documentNumber !== "unknown" ? extractedData.documentNumber : "",
            date: extractedData.date !== "unknown" ? extractedData.date : "",
            amount: extractedData.amount !== "unknown" ? extractedData.amount : "",
            currency: extractedData.currency !== "unknown" ? extractedData.currency : "€"
          };
          
          console.log("Setting extracted data from enhanced GPT", mappedData);
          setExtractedData(mappedData);
          
          toast({
            title: "Επιτυχία",
            description: "Τα στοιχεία του τιμολογίου εξήχθησαν επιτυχώς με AI",
          });
          
          setParsing(false);
          return;
        } else {
          console.log("Enhanced GPT extraction didn't provide sufficient data, trying fallback methods");
        }
      } catch (enhancedGptError) {
        console.warn("Enhanced GPT extraction failed:", enhancedGptError);
      }
      
      // If enhanced GPT fails, try the legacy GPT approach with extracted text
      console.log("Trying legacy GPT extraction...");
      try {
        // Extract text first
        const pdfText = await extractTextFromPdf(file);
        // Send text to GPT API
        const extractedData = await extractInvoiceDataWithGpt(pdfText);
        console.log("Legacy GPT processing complete", extractedData);
        
        if (extractedData && extractedData.vatNumber !== "unknown") {
          const mappedData: InvoiceData = {
            clientVat: extractedData.vatNumber !== "unknown" ? extractedData.vatNumber : "",
            clientName: extractedData.clientName !== "unknown" ? extractedData.clientName : "",
            issuer: extractedData.issuer !== "unknown" ? extractedData.issuer : "",
            invoiceNumber: extractedData.documentNumber !== "unknown" ? extractedData.documentNumber : "",
            date: extractedData.date !== "unknown" ? extractedData.date : "",
            amount: extractedData.amount !== "unknown" ? extractedData.amount : "",
            currency: extractedData.currency !== "unknown" ? extractedData.currency : "€"
          };
          
          console.log("Setting extracted data from legacy GPT", mappedData);
          setExtractedData(mappedData);
          
          toast({
            title: "Επιτυχία",
            description: "Τα στοιχεία του τιμολογίου εξήχθησαν επιτυχώς με AI",
          });
          
          setParsing(false);
          return;
        } else {
          console.log("Legacy GPT extraction didn't provide sufficient data, trying advanced extraction");
        }
      } catch (legacyGptError) {
        console.warn("Legacy GPT extraction failed:", legacyGptError);
      }
      
      // As a last resort, try the advanced extraction (PDF.js + OCR)
      console.log("Falling back to advanced extraction with OCR...");
      const extractedText = await extractTextFromPdfAdvanced(file);
      console.log("Advanced text extraction complete", {
        textLength: extractedText.length,
        textPreview: extractedText.substring(0, 100) + '...'
      });
      
      // Try to extract specific fields using regex patterns
      const { 
        extractVatNumber, extractClientName, extractIssuer,
        extractDate, extractInvoiceNumber, extractAmount, extractCurrency
      } = await import("@/api/extractionPatterns");
      
      const vatNumber = extractVatNumber(extractedText) || "";
      const clientName = extractClientName(extractedText) || "";
      const issuer = extractIssuer(extractedText) || "";
      const date = extractDate(extractedText) || "";
      const invoiceNumber = extractInvoiceNumber(extractedText) || "";
      const amount = extractAmount(extractedText) || "";
      const currency = extractCurrency(extractedText) || "€";
      
      const patternData: InvoiceData = {
        clientVat: vatNumber,
        clientName,
        issuer,
        invoiceNumber,
        date,
        amount,
        currency
      };
      
      console.log("Setting extracted data from patterns", patternData);
      setExtractedData(patternData);
      
      toast({
        title: "Επιτυχία",
        description: "Τα στοιχεία του τιμολογίου εξήχθησαν επιτυχώς με OCR",
      });
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
