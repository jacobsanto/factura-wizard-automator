
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";

interface FileUploadProps {
  file: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleParsePdf: () => Promise<void>;
  parsing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  file,
  handleFileChange,
  handleParsePdf,
  parsing
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="file">Αρχείο</Label>
      <div className="flex gap-2">
        <Input 
          id="file" 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          className="flex-1"
        />
        {file && file.type.includes('pdf') && (
          <Button 
            type="button"
            onClick={handleParsePdf} 
            disabled={parsing || !file}
            className="whitespace-nowrap"
          >
            {parsing ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Ανάλυση...
              </>
            ) : (
              "Ανάλυση PDF"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
