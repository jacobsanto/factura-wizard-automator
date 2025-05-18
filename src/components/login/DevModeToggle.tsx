
import React from "react";
import { useDevMode } from "@/contexts/DevModeContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const DevModeToggle: React.FC = () => {
  const { isDevMode, toggleDevMode } = useDevMode();
  
  return (
    <div className="flex items-center gap-2 mt-4 p-2 bg-gray-50 rounded border border-gray-200">
      <Switch 
        id="dev-mode" 
        checked={isDevMode} 
        onCheckedChange={toggleDevMode} 
      />
      <Label htmlFor="dev-mode" className="text-sm text-gray-700">
        Development Mode {isDevMode ? '(Enabled)' : '(Disabled)'}
      </Label>
      
      {isDevMode && (
        <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
          Auth Bypass Active
        </span>
      )}
    </div>
  );
};
