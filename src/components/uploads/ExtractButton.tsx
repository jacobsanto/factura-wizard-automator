
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader } from "lucide-react";

interface ExtractButtonProps {
  onClick: () => void;
  isExtracting: boolean;
}

const ExtractButton: React.FC<ExtractButtonProps> = ({ 
  onClick, 
  isExtracting 
}) => {
  return (
    <Button 
      onClick={onClick}
      variant="outline"
      disabled={isExtracting}
      className="w-full"
    >
      {isExtracting ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Ανάλυση PDF...
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Ανάλυση του PDF
        </>
      )}
    </Button>
  );
};

export default ExtractButton;
