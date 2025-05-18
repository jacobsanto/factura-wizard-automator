
import React from "react";
import { useSimpleUpload } from "@/hooks/useSimpleUpload";
import SimpleFileInput from "@/components/uploads/SimpleFileInput";
import ExtractButton from "@/components/uploads/ExtractButton";
import ExtractedDataPreview from "@/components/uploads/ExtractedDataPreview";
import UploadProgress from "@/components/uploads/UploadProgress";
import UploadButton from "@/components/uploads/UploadButton";
import UploadStatus from "@/components/uploads/UploadStatus";
import AuthAlert from "@/components/uploads/AuthAlert";
import ErrorAlert from "@/components/uploads/ErrorAlert";

const SimpleUploadForm: React.FC = () => {
  const {
    file,
    isUploading,
    uploadStatus,
    driveLink,
    uploadProgress,
    extractedData,
    isExtracting,
    isDriveAuthenticated,
    errorMessage,
    handleFileChange,
    handleExtractData,
    handleQuickUpload
  } = useSimpleUpload();

  return (
    <div className="space-y-4">
      <AuthAlert isDriveAuthenticated={isDriveAuthenticated} />
      <ErrorAlert message={errorMessage} />
      
      <SimpleFileInput 
        file={file} 
        handleFileChange={handleFileChange} 
      />
      
      {file && !extractedData && !isExtracting && (
        <ExtractButton 
          onClick={handleExtractData}
          isExtracting={isExtracting}
        />
      )}
      
      <ExtractedDataPreview extractedData={extractedData} />
      
      <UploadProgress 
        uploadProgress={uploadProgress} 
        isVisible={isUploading || uploadProgress > 0} 
      />
      
      <UploadButton 
        onClick={handleQuickUpload}
        isUploading={isUploading}
        isExtracting={isExtracting}
        disabled={isUploading || isExtracting || isDriveAuthenticated === false}
        hasExtractedData={!!extractedData}
      />
      
      {uploadStatus && (
        <UploadStatus 
          status={uploadStatus} 
          fileLink={driveLink || undefined}
          message={uploadStatus === "error" ? (errorMessage || "Η αποστολή απέτυχε. Παρακαλώ προσπαθήστε ξανά.") : undefined}
        />
      )}
    </div>
  );
};

export default SimpleUploadForm;
