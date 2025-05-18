
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForTokens } from '@/services/google';
import { useToast } from '@/hooks/use-toast';

const GoogleAuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
          console.error("Google auth error:", error);
          setErrorMessage(`Σφάλμα από το Google: ${error}`);
          setStatus('error');
          
          toast({
            title: "Σφάλμα σύνδεσης",
            description: `Σφάλμα κατά τη σύνδεση με το Google: ${error}`,
            variant: "destructive",
          });
          
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        if (!code) {
          console.error("No code in callback URL");
          setErrorMessage("Δεν βρέθηκε κωδικός εξουσιοδότησης στην απάντηση");
          setStatus('error');
          
          toast({
            title: "Σφάλμα σύνδεσης",
            description: "Δεν βρέθηκε κωδικός εξουσιοδότησης",
            variant: "destructive",
          });
          
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        const tokens = await exchangeCodeForTokens(code);
        
        if (!tokens) {
          setErrorMessage("Αποτυχία ανταλλαγής κωδικού για tokens");
          setStatus('error');
          
          toast({
            title: "Σφάλμα σύνδεσης",
            description: "Αποτυχία σύνδεσης με το Google. Παρακαλώ προσπαθήστε ξανά.",
            variant: "destructive",
          });
          
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        setStatus('success');
        
        toast({
          title: "Επιτυχής σύνδεση",
          description: "Συνδεθήκατε επιτυχώς με το Google",
        });
        
        // Check if there was a callback function waiting
        const hasCallback = sessionStorage.getItem('google_auth_callback');
        sessionStorage.removeItem('google_auth_callback');
        
        // Redirect back to home or reload to initialize services
        setTimeout(() => {
          if (hasCallback) {
            window.location.reload();
          } else {
            navigate('/');
          }
        }, 1000);
      } catch (error) {
        console.error("Error in OAuth callback:", error);
        setErrorMessage(`Σφάλμα: ${error instanceof Error ? error.message : 'Άγνωστο σφάλμα'}`);
        setStatus('error');
        
        toast({
          title: "Σφάλμα σύνδεσης",
          description: "Προέκυψε σφάλμα κατά την ολοκλήρωση της σύνδεσης με το Google",
          variant: "destructive",
        });
        
        setTimeout(() => navigate('/'), 3000);
      }
    };
    
    handleCallback();
  }, [navigate, toast]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <img 
          src="/lovable-uploads/71c1dde9-c19a-4c28-8ac8-fb92c644916c.png" 
          alt="Factura Automations Logo" 
          className="h-16 mx-auto mb-4" 
        />
        
        {status === 'processing' && (
          <>
            <div className="w-12 h-12 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Επεξεργασία σύνδεσης Google</h2>
            <p className="text-gray-600">Παρακαλώ περιμένετε όσο ολοκληρώνουμε την διαδικασία...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-green-600">Σύνδεση επιτυχής!</h2>
            <p className="text-gray-600">Θα μεταφερθείτε στην εφαρμογή σε λίγα δευτερόλεπτα...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Σφάλμα σύνδεσης</h2>
            <p className="text-gray-600">
              {errorMessage || "Προέκυψε σφάλμα κατά τη σύνδεση με το Google"}
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Επιστροφή στην αρχική
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
