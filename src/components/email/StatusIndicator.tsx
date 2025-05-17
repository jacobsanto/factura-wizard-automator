
import React from "react";
import { ProcessingStatus } from "@/types";

interface StatusIndicatorProps {
  status: ProcessingStatus["status"];
  message?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, message }) => {
  const getStatusBadge = (statusValue: ProcessingStatus["status"]) => {
    switch (statusValue) {
      case "idle":
        return <span className="status-circle status-idle"></span>;
      case "processing":
        return <span className="status-circle status-processing"></span>;
      case "success":
        return <span className="status-circle status-success"></span>;
      case "error":
        return <span className="status-circle status-error"></span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center">
      {getStatusBadge(status)}
      <span>
        {status === "idle" && "Αναμονή"}
        {status === "processing" && message}
        {status === "success" && "Ολοκληρώθηκε"}
        {status === "error" && message}
      </span>
    </div>
  );
};

export default StatusIndicator;
