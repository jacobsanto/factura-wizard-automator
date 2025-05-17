
import React from "react";

interface DashboardLoaderProps {
  message?: string;
}

const DashboardLoader: React.FC<DashboardLoaderProps> = ({ message = "Αρχικοποίηση υπηρεσιών..." }) => {
  return (
    <div className="flex items-center justify-center h-[80vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default DashboardLoader;
