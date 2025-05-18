
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Trash2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { el } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface UploadRecord {
  filename: string;
  date: string;
  driveLink: string;
  success: boolean;
}

const RecentUploads: React.FC = () => {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    try {
      const storedUploads = localStorage.getItem('recentUploads');
      if (storedUploads) {
        setUploads(JSON.parse(storedUploads));
      }
    } catch (error) {
      console.error("Error loading recent uploads:", error);
    }
  }, []);
  
  const clearHistory = () => {
    try {
      localStorage.removeItem('recentUploads');
      setUploads([]);
      toast({
        title: "Ιστορικό εκκαθαρίστηκε",
        description: "Το ιστορικό των προηγούμενων ανεβασμάτων διαγράφηκε",
      });
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };
  
  if (uploads.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center">
            <History className="h-4 w-4 mr-2" />
            Πρόσφατα ανεβάσματα
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearHistory}
            className="h-8 px-2 text-gray-500"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {uploads.map((upload, index) => (
            <div 
              key={index}
              className="text-xs flex justify-between items-center py-1 border-t first:border-t-0"
            >
              <div className="truncate max-w-[70%]">
                <div className="font-medium truncate" title={upload.filename}>
                  {upload.filename}
                </div>
                <div className="text-gray-500">
                  {formatDistanceToNow(new Date(upload.date), { 
                    addSuffix: true, 
                    locale: el 
                  })}
                </div>
              </div>
              <a 
                href={upload.driveLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-blue hover:text-brand-blue-dark flex items-center"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Άνοιγμα
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentUploads;
