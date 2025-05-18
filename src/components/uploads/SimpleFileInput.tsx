
import React from "react";
import { FileText } from "lucide-react";

interface SimpleFileInputProps {
  file: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SimpleFileInput: React.FC<SimpleFileInputProps> = ({ 
  file, 
  handleFileChange 
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <input 
        type="file" 
        id="quick-file" 
        accept=".pdf" 
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      
      {file && (
        <div className="flex items-center text-xs text-gray-500">
          <FileText className="h-3 w-3 mr-1" /> 
          {file.name} - {(file.size / 1024).toFixed(1)} KB
        </div>
      )}
    </div>
  );
};

export default SimpleFileInput;
