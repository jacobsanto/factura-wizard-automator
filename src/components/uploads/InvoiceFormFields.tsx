
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InvoiceFormFieldsProps {
  clientVat: string;
  setClientVat: (value: string) => void;
  clientName: string;
  setClientName: (value: string) => void;
  issuer: string;
  setIssuer: (value: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  currency: string;
  setCurrency: (value: string) => void;
}

const InvoiceFormFields: React.FC<InvoiceFormFieldsProps> = ({
  clientVat,
  setClientVat,
  clientName,
  setClientName,
  issuer,
  setIssuer,
  invoiceNumber,
  setInvoiceNumber,
  date,
  setDate,
  amount,
  setAmount,
  currency,
  setCurrency
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="clientVat">ΑΦΜ Πελάτη</Label>
        <Input 
          id="clientVat" 
          value={clientVat} 
          onChange={(e) => setClientVat(e.target.value)}
          placeholder="π.χ. 123456789"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="clientName">Όνομα Πελάτη</Label>
        <Input 
          id="clientName" 
          value={clientName} 
          onChange={(e) => setClientName(e.target.value)}
          placeholder="π.χ. Επωνυμία Πελάτη"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="issuer">Προμηθευτής</Label>
        <Input 
          id="issuer" 
          value={issuer} 
          onChange={(e) => setIssuer(e.target.value)}
          placeholder="π.χ. Όνομα Προμηθευτή"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="invoiceNumber">Αριθμός Τιμολογίου</Label>
        <Input 
          id="invoiceNumber" 
          value={invoiceNumber} 
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="π.χ. ΤΔΑ-12345"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="date">Ημερομηνία</Label>
        <Input 
          id="date" 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Ποσό</Label>
          <Input 
            id="amount" 
            type="number" 
            step="0.01" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currency">Νόμισμα</Label>
          <Input 
            id="currency" 
            value={currency} 
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="€"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceFormFields;
