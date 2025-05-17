
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UploadLogEntry, LoggingService } from "@/services/LoggingService";

const UploadsTable: React.FC = () => {
  const [logs, setLogs] = useState<UploadLogEntry[]>([]);
  const loggingService = LoggingService.getInstance();

  useEffect(() => {
    // Load logs on component mount
    loadLogs();
  }, []);

  const loadLogs = () => {
    const recentLogs = loggingService.getRecentLogs(20);
    setLogs(recentLogs);
  };

  const handleClearLogs = () => {
    loggingService.clearLogs();
    setLogs([]);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('el-GR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Δεν υπάρχουν καταγεγραμμένες αποστολές.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Πρόσφατες Αποστολές</h3>
        <Button variant="outline" size="sm" onClick={handleClearLogs}>
          Καθαρισμός
        </Button>
      </div>

      <Table>
        <TableCaption>Οι τελευταίες 20 αποστολές αρχείων.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Ημερομηνία</TableHead>
            <TableHead>Αρχείο</TableHead>
            <TableHead>Πελάτης</TableHead>
            <TableHead>Προμηθευτής</TableHead>
            <TableHead>Ποσό</TableHead>
            <TableHead className="text-right">Σύνδεσμος</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, i) => (
            <TableRow key={i}>
              <TableCell className="font-medium">
                {formatDate(log.timestamp)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate" title={log.filename}>
                {log.filename}
              </TableCell>
              <TableCell className="max-w-[150px] truncate" title={log.clientName}>
                {log.clientName}
              </TableCell>
              <TableCell className="max-w-[150px] truncate" title={log.issuer}>
                {log.issuer}
              </TableCell>
              <TableCell>
                {log.amount} {log.currency}
              </TableCell>
              <TableCell className="text-right">
                <a 
                  href={log.driveLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Drive
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UploadsTable;
