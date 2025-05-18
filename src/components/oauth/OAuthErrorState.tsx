
import React from 'react';

interface OAuthErrorStateProps {
  errorDetails: string;
}

export const OAuthErrorState: React.FC<OAuthErrorStateProps> = ({ errorDetails }) => {
  return (
    <>
      <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      <h2 className="text-2xl font-semibold mb-2">Σφάλμα σύνδεσης</h2>
      <p className="text-gray-600 mb-2">Προέκυψε σφάλμα κατά τη σύνδεση. Ανακατεύθυνση στην αρχική σελίδα...</p>
      {errorDetails && (
        <p className="text-sm text-red-500 mt-2 p-2 bg-red-50 rounded">
          {errorDetails}
        </p>
      )}
    </>
  );
};
