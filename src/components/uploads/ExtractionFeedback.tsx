
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DocumentData, ExtractionFeedback as ExtractionFeedbackType } from "@/types";
import { Star, StarOff } from "lucide-react";
import { useForm } from "react-hook-form";

interface ExtractionFeedbackProps {
  extractedData: DocumentData;
  fileName: string;
  extractionMethod: string;
  confidence: number;
  onSubmit: (feedback: ExtractionFeedbackType) => void;
  onCancel: () => void;
}

const ExtractionFeedback: React.FC<ExtractionFeedbackProps> = ({
  extractedData,
  fileName,
  extractionMethod,
  confidence,
  onSubmit,
  onCancel,
}) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(3);

  // Initialize form with extracted data
  const form = useForm<{ 
    vatNumber: string;
    clientName: string;
    supplier: string;
    date: string;
    documentNumber: string;
    amount: string;
    currency: string;
    comment: string;
  }>({
    defaultValues: {
      vatNumber: extractedData.vatNumber || "",
      clientName: extractedData.clientName || "",
      supplier: extractedData.supplier || "",
      date: extractedData.date || "",
      documentNumber: extractedData.documentNumber || "",
      amount: extractedData.amount?.toString() || "",
      currency: extractedData.currency || "€",
      comment: "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    // Compare original data with corrected data to build feedback
    const fields: ExtractionFeedbackType['fields'] = {};
    const correctedData: DocumentData = {
      vatNumber: data.vatNumber,
      clientName: data.clientName,
      supplier: data.supplier,
      date: data.date,
      documentNumber: data.documentNumber,
      amount: parseFloat(data.amount) || 0,
      currency: data.currency,
    };
    
    // Check which fields were corrected
    Object.keys(extractedData).forEach((key) => {
      if (key in data) {
        const originalValue = extractedData[key as keyof DocumentData];
        const correctedValue = data[key as keyof typeof data];
        
        const strOriginal = originalValue?.toString() || "";
        const strCorrected = correctedValue?.toString() || "";
        
        fields[key] = {
          wasCorrect: strOriginal === strCorrected,
          original: strOriginal,
          corrected: strCorrected,
        };
      }
    });
    
    // Build feedback object
    const feedback: ExtractionFeedbackType = {
      fileName,
      extractionMethod,
      confidence,
      originalData: extractedData,
      correctedData,
      fields,
      feedbackDate: new Date().toISOString(),
      rating,
      comment: data.comment,
    };
    
    // Submit feedback
    onSubmit(feedback);
    
    toast({
      title: "Ευχαριστούμε για την αξιολόγηση!",
      description: "Η αναπληροφόρησή σας θα μας βοηθήσει να βελτιώσουμε την εξαγωγή δεδομένων.",
    });
  });
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Αξιολόγηση Εξαγωγής Δεδομένων</CardTitle>
        <CardDescription>
          Παρακαλώ διορθώστε τυχόν λάθη στα εξαγόμενα δεδομένα και αξιολογήστε 
          την ποιότητα της εξαγωγής. Αυτό θα βοηθήσει στη βελτίωση του συστήματος.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="vatNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ΑΦΜ</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Όνομα Πελάτη</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Προμηθευτής</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ημερομηνία</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="documentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Αριθμός Παραστατικού</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ποσό</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Νόμισμα</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-1">
              <FormLabel>Αξιολόγηση</FormLabel>
              <div className="flex space-x-1 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= rating ? (
                      <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Σχόλιο</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Προαιρετικά σχόλια για την ποιότητα εξαγωγής" 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Άκυρο
        </Button>
        <Button onClick={handleSubmit}>
          Υποβολή Αξιολόγησης
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExtractionFeedback;
