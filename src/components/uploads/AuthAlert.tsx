
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthAlertProps {
  isDriveAuthenticated: boolean | null;
}

const AuthAlert: React.FC<AuthAlertProps> = ({ isDriveAuthenticated }) => {
  if (isDriveAuthenticated !== false) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTitle>Δεν είστε συνδεδεμένοι στο Google Drive</AlertTitle>
      <AlertDescription>
        Για πρόσβαση στο Google Drive, παρακαλώ αποσυνδεθείτε και συνδεθείτε ξανά επιλέγοντας τη σύνδεση με Google από την αρχική σελίδα.
      </AlertDescription>
    </Alert>
  );
};

export default AuthAlert;
