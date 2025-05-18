
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SimpleUploadForm from "@/components/uploads/SimpleUploadForm";
import AdvancedUploadForm from "@/components/uploads/AdvancedUploadForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormContainer from "@/components/uploads/FormContainer";
import AuthAlert from "@/components/uploads/AuthAlert";
import ErrorAlert from "@/components/uploads/ErrorAlert";
import { getStoredTokens } from "@/services/google";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { EnhancedDriveService } from "@/services/drive";

const DashboardUploadSection: React.FC = () => {
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<"simple" | "advanced">("simple");

  useEffect(() => {
    const checkGoogleAuth = async () => {
      try {
        // Check if we have valid Google tokens
        const tokens = await getStoredTokens();
        
        if (!tokens?.access_token) {
          setIsGoogleAuthenticated(false);
          return;
        }
        
        // Check if Drive service is ready
        const driveService = EnhancedDriveService.getInstance();
        const isDriveInitialized = await driveService.initialize();
        
        setIsGoogleAuthenticated(isDriveInitialized);
      } catch (error) {
        console.error("Error checking Google auth status:", error);
        setError("Σφάλμα κατά τον έλεγχο της σύνδεσης με το Google");
        setIsGoogleAuthenticated(false);
      }
    };
    
    checkGoogleAuth();
    
    // Listen for token changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'google_tokens') {
        checkGoogleAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleClearError = () => {
    setError(null);
  };

  // Dummy submit handler for FormContainer
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This is a placeholder function to satisfy the type requirements
    // The actual submission is handled by the SimpleUploadForm or AdvancedUploadForm components
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Χειροκίνητο Ανέβασμα Παραστατικών</h2>
      
      <ErrorAlert message={error} />
      <AuthAlert isDriveAuthenticated={isGoogleAuthenticated} />
      
      {isGoogleAuthenticated === false && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Σύνδεση με Google Drive</h3>
          <p className="text-blue-700 mb-3">
            Για να ανεβάσετε αρχεία στο Google Drive, παρακαλώ συνδεθείτε με τον λογαριασμό σας Google.
          </p>
          <GoogleAuthButton 
            className="bg-white hover:bg-gray-50" 
            onSuccess={async () => {
              // Force re-check of authentication after success
              const tokens = await getStoredTokens();
              if (tokens?.access_token) {
                const driveService = EnhancedDriveService.getInstance();
                const isDriveInitialized = await driveService.initialize();
                setIsGoogleAuthenticated(isDriveInitialized);
              }
            }}
          />
        </div>
      )}
      
      {isGoogleAuthenticated === true && (
        <FormContainer onSubmit={handleFormSubmit}>
          <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as "simple" | "advanced")}>
            <TabsList className="mb-4">
              <TabsTrigger value="simple">Απλό ανέβασμα</TabsTrigger>
              <TabsTrigger value="advanced">Προχωρημένο ανέβασμα</TabsTrigger>
            </TabsList>
            
            <TabsContent value="simple">
              <SimpleUploadForm />
            </TabsContent>
            
            <TabsContent value="advanced">
              <AdvancedUploadForm />
            </TabsContent>
          </Tabs>
        </FormContainer>
      )}

      {isGoogleAuthenticated === null && (
        <div className="flex items-center justify-center p-8">
          <div className="w-10 h-10 border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-gray-600">Έλεγχος σύνδεσης...</p>
        </div>
      )}
    </div>
  );
};

export default DashboardUploadSection;
