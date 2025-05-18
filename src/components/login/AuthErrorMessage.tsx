
import React from 'react';

interface AuthErrorMessageProps {
  error: string | null;
}

export const AuthErrorMessage: React.FC<AuthErrorMessageProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
      <p className="font-medium mb-1">Σφάλμα σύνδεσης:</p>
      <p>{error}</p>
    </div>
  );
};
