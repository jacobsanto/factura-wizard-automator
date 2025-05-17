
import React from "react";
import { File } from "lucide-react";

const NoEmails: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border p-8 text-center">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <File className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">Δεν βρέθηκαν emails</h3>
      <p className="text-gray-500">Κάντε κλικ στο κουμπί "Ανανέωση" για να φορτωθούν τα emails με την ετικέτα "Παραστατικά/Εισερχόμενα"</p>
    </div>
  );
};

export default NoEmails;
