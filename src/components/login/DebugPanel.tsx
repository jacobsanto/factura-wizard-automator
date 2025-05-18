
import React from 'react';
import { GOOGLE_REDIRECT_URI } from "@/env";

interface DebugPanelProps {
  handleClearLocalStorage: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ handleClearLocalStorage }) => {
  return (
    <div className="w-full mt-4 p-3 bg-gray-100 rounded text-xs border border-gray-300">
      <h5 className="font-bold mb-2 text-center text-gray-700">Debug Information</h5>
      <div className="space-y-2">
        <p><strong>Redirect URI:</strong> {GOOGLE_REDIRECT_URI}</p>
        <p><strong>Current Origin:</strong> {window.location.origin}</p>
        <p><strong>Current Path:</strong> {window.location.pathname}</p>
        <p><strong>Has Tokens:</strong> {localStorage.getItem("google_tokens") ? "Yes" : "No"}</p>
        <p><strong>Has User:</strong> {localStorage.getItem("google_user") ? "Yes" : "No"}</p>
        <p><strong>Browser:</strong> {navigator.userAgent}</p>
        <button 
          onClick={handleClearLocalStorage} 
          className="w-full mt-2 bg-red-100 text-red-700 hover:bg-red-200 py-1 rounded border border-red-300 text-sm"
        >
          Clear All Local Storage
        </button>
        <div className="text-center mt-2">
          <a href="/?debug" className="text-blue-600 hover:underline">Reload with debug mode</a>
        </div>
      </div>
    </div>
  );
};
