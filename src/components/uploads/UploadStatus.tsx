
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface UploadStatusProps {
  status: "success" | "error" | null;
  fileLink?: string;
  message?: string;
}

const UploadStatus: React.FC<UploadStatusProps> = ({ status, fileLink, message }) => {
  if (!status) return null;

  return (
    <div className={`mt-2 p-3 rounded-md ${
      status === "success" ? "bg-green-50 text-green-700 border border-green-200" : 
      "bg-red-50 text-red-700 border border-red-200"
    }`}>
      <div className="flex items-center">
        {status === "success" ? (
          <CheckCircle className="h-5 w-5 mr-2" />
        ) : (
          <XCircle className="h-5 w-5 mr-2" />
        )}
        
        <span className="font-medium">
          {status === "success" 
            ? "Το αρχείο ανέβηκε επιτυχώς." 
            : message || "Το ανέβασμα απέτυχε. Παρακαλώ προσπαθήστε ξανά."}
        </span>
      </div>
      
      {status === "success" && fileLink && (
        <div className="mt-1 ml-7">
          <a 
            href={fileLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm underline"
          >
            Άνοιγμα στο Google Drive
          </a>
        </div>
      )}
    </div>
  );
};

export default UploadStatus;
