
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for error in URL parameters
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (errorParam) {
      console.error("OAuth Error:", errorParam, errorDescription);
      setError(`${errorParam}: ${errorDescription || 'Unknown error'}`);
      
      toast({
        variant: "destructive",
        title: "Σφάλμα σύνδεσης",
        description: "Προέκυψε σφάλμα κατά τη σύνδεση με το Google."
      });
      
      // After 5 seconds, redirect to home page
      setTimeout(() => {
        navigate('/');
      }, 5000);
      return;
    }
    
    // On successful login, show success message and redirect
    toast({
      title: "Επιτυχής σύνδεση",
      description: "Έχετε συνδεθεί επιτυχώς με το Google."
    });
    
    setTimeout(() => {
      navigate('/');
    }, 1500);
  }, [navigate, toast, searchParams]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <img 
          src="/lovable-uploads/71c1dde9-c19a-4c28-8ac8-fb92c644916c.png" 
          alt="Factura Automations Logo" 
          className="h-16 mx-auto mb-4" 
        />
        
        {error ? (
          <>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <h2 className="text-xl font-semibold mb-2">Σφάλμα σύνδεσης</h2>
            <p className="text-gray-600 mb-4">Παρακαλώ ανακατευθύνουμε στην αρχική σελίδα...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Ανακατεύθυνση</h2>
            <p className="text-gray-600">Παρακαλώ περιμένετε καθώς σας ανακατευθύνουμε...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
