
import { useState, useEffect } from "react";
import { useFileUpload } from "./useFileUpload";
import { useGoogleSheetsOptions } from "./useGoogleSheetsOptions";
import { useFileSubmission } from "./useFileSubmission";

export interface UseInvoiceFormReturn {
  // File handling
  file: File | null;
  parsing: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleParsePdf: () => Promise<void>;
  
  // Form fields
  clientVat: string;
  setClientVat: (value: string) => void;
  clientName: string;
  setClientName: (value: string) => void;
  issuer: string;
  setIssuer: (value: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
  
  // Google Sheets options
  useSheets: boolean;
  setUseSheets: (value: boolean) => void;
  spreadsheetId: string;
  setSpreadsheetId: (value: string) => void;
  sheetName: string;
  setSheetName: (value: string) => void;
  
  // Upload handling
  uploading: boolean;
  uploadStatus: null | "success" | "error";
  driveLink: string | null;
  handleUpload: (e: React.FormEvent) => Promise<void>;
}

export function useInvoiceForm(): UseInvoiceFormReturn {
  // Form fields
  const [clientVat, setClientVat] = useState("");
  const [clientName, setClientName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("€");

  // Hooks
  const fileUpload = useFileUpload();
  const sheetsOptions = useGoogleSheetsOptions();
  const fileSubmission = useFileSubmission();

  // Update form fields when extracted data changes
  useEffect(() => {
    if (fileUpload.extractedData) {
      setClientVat(fileUpload.extractedData.clientVat);
      setClientName(fileUpload.extractedData.clientName);
      setIssuer(fileUpload.extractedData.issuer);
      setInvoiceNumber(fileUpload.extractedData.invoiceNumber);
      setDate(fileUpload.extractedData.date);
      setAmount(fileUpload.extractedData.amount);
      setCurrency(fileUpload.extractedData.currency);
    }
  }, [fileUpload.extractedData]);

  // Handle form submission
  const handleUpload = async (e: React.FormEvent) => {
    fileSubmission.handleUpload(e, {
      file: fileUpload.file,
      clientVat,
      clientName,
      issuer,
      invoiceNumber,
      date,
      amount,
      currency,
      useSheets: sheetsOptions.useSheets,
      spreadsheetId: sheetsOptions.spreadsheetId,
      sheetName: sheetsOptions.sheetName
    });
  };

  return {
    // File handling
    file: fileUpload.file,
    parsing: fileUpload.parsing,
    handleFileChange: fileUpload.handleFileChange,
    handleParsePdf: fileUpload.handleParsePdf,
    
    // Form fields
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
    
    // Google Sheets options
    useSheets: sheetsOptions.useSheets,
    setUseSheets: sheetsOptions.setUseSheets,
    spreadsheetId: sheetsOptions.spreadsheetId,
    setSpreadsheetId: sheetsOptions.setSpreadsheetId,
    sheetName: sheetsOptions.sheetName,
    setSheetName: sheetsOptions.setSheetName,
    
    // Upload handling
    uploading: fileSubmission.uploading,
    uploadStatus: fileSubmission.uploadStatus,
    driveLink: fileSubmission.driveLink,
    handleUpload
  };
}
