
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader, Upload } from "lucide-react";

interface UploadButtonProps {
  onClick: () => void;
  isUploading: boolean;
  isExtracting: boolean;
  disabled: boolean;
  hasExtractedData: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({ 
  onClick, 
  isUploading,
  isExtracting,
  disabled,
  hasExtractedData
}) => {
  return (
    <Button 
      onClick={onClick}
      disabled={disabled}
      className="w-full"
    >
      {isUploading || isExtracting ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          {isExtracting ? "Αναλύουμε..." : "Ανεβάζουμε..."}
        </>
      ) : (
        <>
          <Upload className="mr-2 h-4 w-4" />
          {hasExtractedData ? "Αποστολή στο Drive" : "Αυτόματο Ανέβασμα στο Drive"}
        </>
      )}
    </Button>
  );
};

export default UploadButton;
