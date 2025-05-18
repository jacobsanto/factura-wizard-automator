
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { useDebugMode } from "@/hooks/useDebugMode";
import { AuthErrorMessage } from "@/components/login/AuthErrorMessage";
import { DebugPanel } from "@/components/login/DebugPanel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { testSupabaseConnection } from "@/utils/supabaseTest";
import { toast } from "@/hooks/use-toast";

const Login: React.FC = () => {
  const { isLoading, signIn, signUp } = useAuth();
  const { showDebug, handleClearLocalStorage } = useDebugMode();
  
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("signin");

  const handleSignIn = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!email || !password) {
      setAuthError("Παρακαλώ συμπληρώστε όλα τα πεδία.");
      return;
    }
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setAuthError(error.message || "Προέκυψε σφάλμα κατά τη σύνδεση.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("Προέκυψε σφάλμα κατά τη σύνδεση. Παρακαλώ δοκιμάστε ξανά.");
    }
  };

  const handleSignUp = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!email || !password) {
      setAuthError("Παρακαλώ συμπληρώστε όλα τα πεδία.");
      return;
    }
    
    if (password.length < 6) {
      setAuthError("Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.");
      return;
    }
    
    try {
      const { error } = await signUp(email, password);
      if (error) {
        setAuthError(error.message || "Προέκυψε σφάλμα κατά την εγγραφή.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setAuthError("Προέκυψε σφάλμα κατά την εγγραφή. Παρακαλώ δοκιμάστε ξανά.");
    }
  };

  const testConnection = async () => {
    try {
      const isConnected = await testSupabaseConnection();
      
      if (isConnected) {
        toast({
          title: "Επιτυχής σύνδεση",
          description: "Η σύνδεση με το Supabase είναι εφικτή.",
        });
        setAuthError(null);
      } else {
        toast({
          variant: "destructive",
          title: "Σφάλμα σύνδεσης",
          description: "Δεν ήταν δυνατή η σύνδεση με το Supabase.",
        });
        setAuthError("Σφάλμα σύνδεσης με το Supabase.");
      }
    } catch (error) {
      console.error("Test connection error:", error);
      setAuthError("Προέκυψε σφάλμα κατά τον έλεγχο σύνδεσης.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <img 
              alt="Arivia Group Logo" 
              src="/lovable-uploads/9e419dda-f61f-41e7-ac02-301a7ae32f6f.png" 
              className="logo-debug-trigger h-8 w-auto mb-4 cursor-pointer object-fill" 
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Αυτοματισμός Παραστατικών
          </CardTitle>
          <CardDescription className="text-gray-500">
            Συνδεθείτε για να συνεχίσετε
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Σύνδεση</TabsTrigger>
              <TabsTrigger value="signup">Εγγραφή</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4 pt-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Κωδικός</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-brand-blue hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Σύνδεση...' : 'Σύνδεση'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 pt-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Κωδικός</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες
                  </p>
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-brand-blue hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Εγγραφή...' : 'Εγγραφή'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          {/* Test connection button */}
          <Button 
            onClick={testConnection} 
            variant="outline" 
            className="w-full text-sm"
            disabled={isLoading}
          >
            Έλεγχος σύνδεσης με Supabase
          </Button>
          
          {/* Error message display */}
          <AuthErrorMessage error={authError} />
          
          {/* Debug panel */}
          {showDebug && <DebugPanel handleClearLocalStorage={handleClearLocalStorage} />}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
