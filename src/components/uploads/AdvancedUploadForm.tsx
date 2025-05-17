
import React from "react";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import FormContainer from "@/components/uploads/FormContainer";
import UploadStatus from "@/components/uploads/UploadStatus";
import FileUpload from "@/components/uploads/FileUpload";
import InvoiceFormFields from "@/components/uploads/InvoiceFormFields";
import SubmitButton from "@/components/uploads/SubmitButton";
import GoogleSheetsOptions from "@/components/uploads/GoogleSheetsOptions";

const AdvancedUploadForm: React.FC = () => {
  const {
    file,
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
  } = useInvoiceForm();

  return (
    <FormContainer onSubmit={handleUpload}>
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
    </FormContainer>
  );
};

export default AdvancedUploadForm;
