
import React from "react";
import { useOAuthCallback } from "@/hooks/useOAuthCallback";
import { OAuthLoadingState } from "@/components/oauth/OAuthLoadingState";
import { OAuthSuccessState } from "@/components/oauth/OAuthSuccessState";
import { OAuthErrorState } from "@/components/oauth/OAuthErrorState";
import { ProcessingLog } from "@/components/oauth/ProcessingLog";

const OAuthCallback: React.FC = () => {
  const { status, errorDetails, processingSteps } = useOAuthCallback();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          {status === "loading" && <OAuthLoadingState />}
          {status === "success" && <OAuthSuccessState />}
          {status === "error" && <OAuthErrorState errorDetails={errorDetails} />}
          
          {/* Debug processing steps */}
          <ProcessingLog processingSteps={processingSteps} />
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
