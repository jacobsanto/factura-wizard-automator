
import React from "react";
import { useDevMode } from "@/contexts/DevModeAuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const DevModeToggle: React.FC = () => {
  const { isDevMode, toggleDevMode, setDevUserRole, currentDevRole } = useDevMode();

  // Available user roles for testing
  const userRoles = [
    { label: "Κανονικός χρήστης", value: "user" },
    { label: "Διαχειριστής", value: "admin" },
    { label: "Συντονιστής", value: "moderator" },
  ];

  return (
    <div className="flex items-center">
      {isDevMode && (
        <Badge variant="outline" className="mr-2 bg-amber-100 text-amber-800 border-amber-300">
          Dev Mode
        </Badge>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={isDevMode ? "border-amber-500 text-amber-700" : ""}
          >
            <SettingsIcon className="h-4 w-4 mr-1" />
            Dev
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Λειτουργία Ανάπτυξης</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleDevMode}>
            {isDevMode ? "Απενεργοποίηση Dev Mode" : "Ενεργοποίηση Dev Mode"}
          </DropdownMenuItem>

          {isDevMode && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Ρόλος Χρήστη</DropdownMenuLabel>
              {userRoles.map((role) => (
                <DropdownMenuItem 
                  key={role.value}
                  onClick={() => setDevUserRole(role.value)}
                  className={currentDevRole === role.value ? "bg-muted" : ""}
                >
                  {role.label}
                  {currentDevRole === role.value && (
                    <span className="ml-auto">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
