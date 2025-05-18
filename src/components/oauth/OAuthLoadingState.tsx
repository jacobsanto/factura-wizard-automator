
import React from 'react';

export const OAuthLoadingState: React.FC = () => {
  return (
    <>
      <div className="w-16 h-16 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 className="text-2xl font-semibold mb-2">Επεξεργασία σύνδεσης...</h2>
      <p className="text-gray-600">Παρακαλώ περιμένετε καθώς ολοκληρώνουμε τη σύνδεσή σας.</p>
    </>
  );
};
