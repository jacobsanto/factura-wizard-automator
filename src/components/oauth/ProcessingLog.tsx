
import React from 'react';

interface ProcessingLogProps {
  processingSteps: string[];
}

export const ProcessingLog: React.FC<ProcessingLogProps> = ({ processingSteps }) => {
  if (processingSteps.length === 0) return null;
  
  return (
    <div className="mt-6 p-3 text-left bg-gray-100 rounded text-xs max-h-60 overflow-y-auto border border-gray-300">
      <h5 className="font-bold mb-2 text-center">Processing Log</h5>
      <ul className="space-y-1">
        {processingSteps.map((step, index) => (
          <li key={index} className="font-mono">{step}</li>
        ))}
      </ul>
    </div>
  );
};
