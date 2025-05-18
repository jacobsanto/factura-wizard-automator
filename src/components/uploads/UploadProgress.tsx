
import React from "react";
import { Progress } from "@/components/ui/progress";

interface UploadProgressProps {
  uploadProgress: number;
  isVisible: boolean;
}

const UploadProgress: React.FC<UploadProgressProps> = ({ uploadProgress, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="space-y-1">
      <Progress value={uploadProgress} className="h-2" />
      <p className="text-xs text-gray-500 text-center">{uploadProgress}%</p>
    </div>
  );
};

export default UploadProgress;
