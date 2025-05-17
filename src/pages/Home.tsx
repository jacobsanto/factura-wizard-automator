
import React from "react";
import AdvancedUploadForm from "@/components/uploads/AdvancedUploadForm";

const Home: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📤 Ανέβασμα Παραστατικού</h1>
      
      <div className="bg-white rounded-lg border p-6 mb-6">
        <AdvancedUploadForm />
      </div>
    </div>
  );
};

export default Home;
