
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface SubmitButtonProps {
  uploading: boolean;
  disabled: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ uploading, disabled }) => {
  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={disabled || uploading}
    >
      {uploading ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Αποστολή...
        </>
      ) : "Αποστολή στο Drive"}
    </Button>
  );
};

export default SubmitButton;
