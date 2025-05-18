
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ExtractedDataProps {
  extractedData: {
    vatNumber: string;
    clientName: string;
    issuer: string;
    documentNumber: string;
    date: string;
    amount: string | number;
    currency: string;
  } | null;
}

const ExtractedDataPreview: React.FC<ExtractedDataProps> = ({ extractedData }) => {
  if (!extractedData) return null;
  
  return (
    <Card className="mb-4 bg-gray-50">
      <CardContent className="pt-4">
        <h4 className="text-sm font-medium mb-2">Στοιχεία που αναγνωρίστηκαν:</h4>
        <ul className="text-xs space-y-1">
          <li><span className="font-medium">ΑΦΜ:</span> {extractedData.vatNumber}</li>
          <li><span className="font-medium">Πελάτης:</span> {extractedData.clientName}</li>
          <li><span className="font-medium">Εκδότης:</span> {extractedData.issuer}</li>
          <li><span className="font-medium">Αρ. Παραστατικού:</span> {extractedData.documentNumber}</li>
          <li><span className="font-medium">Ημερομηνία:</span> {extractedData.date}</li>
          <li><span className="font-medium">Ποσό:</span> {extractedData.amount} {extractedData.currency}</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default ExtractedDataPreview;
