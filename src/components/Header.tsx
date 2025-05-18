
import React, { useEffect, useState } from "react";
import { useSupabaseAuth } from "@/contexts/supabase/SupabaseAuthContext";
import { useDevMode } from "@/contexts/DevModeContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { LogOut, Settings, HelpCircle, Home, Upload, ToggleLeft, ToggleRight, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, UserInfo } from "@/utils/userUtils";

const Header: React.FC = () => {
  const {
    isAuthenticated,
    user,
    session,
    signOut
  } = useSupabaseAuth();
  const {
    isDevMode,
    toggleDevMode
  } = useDevMode();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [hasGoogleAuth, setHasGoogleAuth] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchUser = async () => {
      const userInfo = await getCurrentUser();
      setCurrentUser(userInfo);
    };
    if (isAuthenticated) {
      fetchUser();
      // Check if user has Google auth from Supabase session
      setHasGoogleAuth(!!session?.provider_token);
    }
  }, [isAuthenticated, user, session]);
  
  const handleNavigate = (tab: string) => {
    navigate(`/?tab=${tab}`);
  };
  
  const handleSettingsClick = () => {
    navigate('/?tab=settings');
  };

  // Use either the currentUser or create a basic user object if not available
  const displayUser: UserInfo = currentUser || {
    id: user?.id,
    email: user?.email || "user@example.com",
    name: "User"
  };
  
  return <header className="bg-white shadow-sm border-b px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 mx-0 px-[5px]">
          <img src="/lovable-uploads/71c1dde9-c19a-4c28-8ac8-fb92c644916c.png" alt="Factura Automations Logo" className="h-12 w-auto object-contain" />
          
          {isDevMode && <span className="text-xs bg-amber-100 text-amber-800 py-1 rounded-full mx-0 px-[9px]">
              Dev Mode
            </span>}
            
          {hasGoogleAuth && <span className="text-xs bg-green-100 text-green-800 py-1 rounded-full mx-0 px-[9px]">
              Google Connected
            </span>}
        </div>

        <div className="flex items-center space-x-4">
          {/* Dev Mode Toggle - Always visible in header */}
          <Button variant="outline" size="sm" className={isDevMode ? "text-amber-600 border-amber-300" : "text-gray-600"} onClick={toggleDevMode}>
            {isDevMode ? <ToggleRight className="h-4 w-4 mr-2" /> : <ToggleLeft className="h-4 w-4 mr-2" />}
            {isDevMode ? "Disable Dev Mode" : "Enable Dev Mode"}
          </Button>

          {(isAuthenticated || isDevMode) && <>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-brand-blue" onClick={() => handleNavigate('emails')}>
                      <Mail className="h-4 w-4 mr-2" />
                      Emails
                    </Button>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-brand-blue" onClick={() => handleNavigate('upload')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Ανέβασμα
                    </Button>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              
              <Button variant="outline" size="sm" className="text-brand-blue">
                <HelpCircle className="h-4 w-4 mr-2" />
                Βοήθεια
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={displayUser.picture} />
                    <AvatarFallback>{displayUser.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{displayUser.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{displayUser.email || "user@example.com"}</p>
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
            </>}
        </div>
      </div>
    </header>;
};
export default Header;
