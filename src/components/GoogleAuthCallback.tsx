
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Now this component only exists for backward compatibility
const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Just redirect to home page
    toast({
      title: "Επιτυχής σύνδεση",
      description: "Έχετε συνδεθεί επιτυχώς με το Google."
    });
    
    setTimeout(() => {
      navigate('/');
    }, 1000);
  }, [navigate, toast]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <img 
          src="/lovable-uploads/71c1dde9-c19a-4c28-8ac8-fb92c644916c.png" 
          alt="Factura Automations Logo" 
          className="h-16 mx-auto mb-4" 
        />
        <div className="w-12 h-12 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Ανακατεύθυνση</h2>
        <p className="text-gray-600">Παρακαλώ περιμένετε καθώς σας ανακατευθύνουμε...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
