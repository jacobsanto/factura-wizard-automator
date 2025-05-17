
import React from "react";
import AdvancedUploadForm from "@/components/uploads/AdvancedUploadForm";

const Home: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📤 Ανέβασμα Παραστατικού</h1>
      
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Αυτόματη ανάλυση PDF</h2>
          <p className="text-gray-600 text-sm">
            Ανεβάστε το PDF τιμολόγιό σας και πατήστε "Ανάλυση PDF" για αυτόματη εξαγωγή 
            των στοιχείων του τιμολογίου. Μπορείτε να επεξεργαστείτε τα δεδομένα πριν την αποστολή.
          </p>
        </div>
        <AdvancedUploadForm />
      </div>
    </div>
  );
};

export default Home;
