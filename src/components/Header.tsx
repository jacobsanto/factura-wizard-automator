
import React from "react";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, HelpCircle, FileText } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "@/utils/userUtils";

const Header: React.FC = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  const handleSettingsClick = () => {
    // If we're already on the home page, we can simply change the tab
    if (location.pathname === '/') {
      // Find the tabs element and programmatically click on the settings tab
      const settingsTab = document.querySelector('button[value="settings"]') as HTMLButtonElement;
      if (settingsTab) {
        settingsTab.click();
      }
    } else {
      // Navigate to home page with settings tab query parameter
      navigate('/?tab=settings');
    }
  };

  // Use either the currentUser from our utility or the user from auth context
  const displayUser = currentUser || user;

  return (
    <header className="bg-white shadow-sm border-b px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-brand-blue" />
          <h1 className="text-xl font-semibold text-gray-800">
            Αυτοματισμός Παραστατικών
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated && (
            <>
              <Button variant="outline" size="sm" className="text-brand-blue">
                <HelpCircle className="h-4 w-4 mr-2" />
                Βοήθεια
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={displayUser?.picture} />
                    <AvatarFallback>{displayUser?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{displayUser?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{displayUser?.email || "user@example.com"}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Ρυθμίσεις</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-500 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Αποσύνδεση</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
