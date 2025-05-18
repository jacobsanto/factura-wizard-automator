
import React from 'react';

export const OAuthSuccessState: React.FC = () => {
  return (
    <>
      <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <h2 className="text-2xl font-semibold mb-2">Επιτυχής σύνδεση!</h2>
      <p className="text-gray-600">Ανακατεύθυνση στην αρχική σελίδα...</p>
    </>
  );
};
