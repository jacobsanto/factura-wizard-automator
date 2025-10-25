import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { exchangeCodeForTokens } from '@/services/googleAuth';

const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);
  
  useEffect(() => {
    const handleCallback = async () => {
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
        
        setTimeout(() => {
          navigate('/');
        }, 5000);
        return;
      }
      
      // Get authorization code from URL
      const code = searchParams.get('code');
      
      if (!code) {
        console.error("No authorization code received");
        setError("Δεν ελήφθη κωδικός εξουσιοδότησης από το Google");
        
        toast({
          variant: "destructive",
          title: "Σφάλμα σύνδεσης",
          description: "Δεν ελήφθη κωδικός εξουσιοδότησης."
        });
        
        setTimeout(() => {
          navigate('/');
        }, 3000);
        return;
      }
      
      console.log("Authorization code received, exchanging for tokens...");
      setIsExchanging(true);
      
      try {
        // Exchange code for tokens
        const tokens = await exchangeCodeForTokens(code);
        
        if (!tokens) {
          console.error("Token exchange failed - no tokens returned");
          setError("Αποτυχία ανταλλαγής κωδικού για tokens");
          
          toast({
            variant: "destructive",
            title: "Σφάλμα σύνδεσης",
            description: "Αποτυχία λήψης tokens από το Google. Παρακαλώ δοκιμάστε ξανά."
          });
          
          setIsExchanging(false);
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }
        
        console.log("Tokens successfully received and stored!");
        console.log("Access token:", tokens.access_token ? "✓ Present" : "✗ Missing");
        console.log("Refresh token:", tokens.refresh_token ? "✓ Present" : "✗ Missing");
        console.log("Expiry date:", tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : "✗ Missing");
        
        // Show success message
        toast({
          title: "Επιτυχής σύνδεση",
          description: "Έχετε συνδεθεί επιτυχώς με το Google."
        });
        
        // Redirect to home page
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (err) {
        console.error("Error during token exchange:", err);
        setError("Σφάλμα κατά την ανταλλαγή tokens");
        
        toast({
          variant: "destructive",
          title: "Σφάλμα σύνδεσης",
          description: "Προέκυψε σφάλμα κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά."
        });
        
        setIsExchanging(false);
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };
    
    handleCallback();
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
            <p className="text-gray-600 mb-4">Ανακατεύθυνση στην αρχική σελίδα...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              {isExchanging ? "Σύνδεση με Google..." : "Ανακατεύθυνση"}
            </h2>
            <p className="text-gray-600">
              {isExchanging 
                ? "Παρακαλώ περιμένετε καθώς ολοκληρώνουμε τη σύνδεση..." 
                : "Παρακαλώ περιμένετε καθώς σας ανακατευθύνουμε..."}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
