
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ExtractionFeedback from "./ExtractionFeedback";
import { DocumentData, ExtractionFeedback as ExtractionFeedbackType } from "@/types";
import { feedbackService } from "@/services/FeedbackService";
import { useToast } from "@/hooks/use-toast";

interface ExtractedDataPreviewProps {
  data: {
    clientVat: string;
    clientName: string;
    issuer: string;
    invoiceNumber: string;
    date: string;
    amount: string;
    currency: string;
  } | null;
  fileName?: string;
}

const ExtractedDataPreview: React.FC<ExtractedDataPreviewProps> = ({ data, fileName = "Unknown" }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const { toast } = useToast();

  if (!data) {
    return null;
  }
  
  // Convert to DocumentData format
  const documentData: DocumentData = {
    vatNumber: data.clientVat || "Unknown",
    clientName: data.clientName || "Unknown",
    supplier: data.issuer || "Unknown",
    documentNumber: data.invoiceNumber || "Unknown",
    date: data.date || new Date().toISOString().split('T')[0],
    amount: parseFloat(data.amount) || 0,
    currency: data.currency || "€",
  };

  const handleProvideFeedback = () => {
    setShowFeedback(true);
  };

  const handleSubmitFeedback = async (feedback: ExtractionFeedbackType) => {
    try {
      await feedbackService.submitFeedback(feedback);
      toast({
        title: "Ευχαριστούμε!",
        description: "Η αναπληροφόρησή σας καταγράφηκε με επιτυχία.",
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η καταγραφή της αναπληροφόρησής σας.",
      });
    } finally {
      setShowFeedback(false);
    }
  };

  if (showFeedback) {
    return (
      <ExtractionFeedback
        extractedData={documentData}
        fileName={fileName}
        extractionMethod="gpt" // Default method, could be improved to track actual method used
        confidence={85} // Default confidence, could be improved to track actual confidence
        onSubmit={handleSubmitFeedback}
        onCancel={() => setShowFeedback(false)}
      />
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Εξαγόμενα Στοιχεία</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="font-medium text-gray-500">ΑΦΜ Πελάτη</div>
          <div className="text-right">{data.clientVat || "-"}</div>
          
          <div className="font-medium text-gray-500">Όνομα Πελάτη</div>
          <div className="text-right">{data.clientName || "-"}</div>
          
          <div className="font-medium text-gray-500">Προμηθευτής</div>
          <div className="text-right">{data.issuer || "-"}</div>
          
          <div className="font-medium text-gray-500">Αριθμός Τιμολογίου</div>
          <div className="text-right">{data.invoiceNumber || "-"}</div>
          
          <div className="font-medium text-gray-500">Ημερομηνία</div>
          <div className="text-right">{data.date || "-"}</div>
          
          <div className="font-medium text-gray-500">Ποσό</div>
          <div className="text-right">{data.amount ? `${data.amount} ${data.currency}` : "-"}</div>
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            className="text-sm" 
            onClick={handleProvideFeedback}
          >
            Αξιολόγηση & Διόρθωση
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractedDataPreview;
