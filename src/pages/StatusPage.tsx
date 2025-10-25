
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { getStoredTokens } from "@/services/googleAuth";
import { forceResetAuthState } from "@/services/google";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ServiceStatus {
  name: string;
  status: 'ok' | 'error' | 'warning';
  message: string;
}

const StatusPage: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkStatus = async () => {
    const statuses: ServiceStatus[] = [];
    
    // Check tokens
    const tokens = await getStoredTokens();
    setTokenInfo(tokens);
    
    if (!tokens) {
      statuses.push({
        name: "Google Authentication",
        status: 'error',
        message: "No tokens found - not authenticated"
      });
    } else if (!tokens.access_token) {
      statuses.push({
        name: "Google Authentication",
        status: 'error',
        message: "Invalid tokens - missing access_token"
      });
    } else if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      statuses.push({
        name: "Google Authentication",
        status: 'warning',
        message: "Token expired - needs refresh"
      });
    } else {
      statuses.push({
        name: "Google Authentication",
        status: 'ok',
        message: `Valid until ${new Date(tokens.expiry_date || 0).toLocaleString()}`
      });
    }
    
    // Check Google Identity Services
    if (window.google?.accounts?.oauth2) {
      statuses.push({
        name: "Google Identity Services",
        status: 'ok',
        message: "Script loaded successfully"
      });
    } else {
      statuses.push({
        name: "Google Identity Services",
        status: 'error',
        message: "Script not loaded"
      });
    }
    
    // Check localStorage
    const hasUserInfo = localStorage.getItem("user");
    statuses.push({
      name: "User Information",
      status: hasUserInfo ? 'ok' : 'warning',
      message: hasUserInfo ? "User data stored" : "No user data found"
    });
    
    setServices(statuses);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleReset = async () => {
    await forceResetAuthState();
    toast({
      title: "Reset Complete",
      description: "All authentication data has been cleared"
    });
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              System Status
              <Button variant="outline" size="sm" onClick={checkStatus}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>
              Current status of all services and authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <StatusIcon status={service.status} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{service.name}</h3>
                    <Badge variant={
                      service.status === 'ok' ? 'default' : 
                      service.status === 'warning' ? 'secondary' : 
                      'destructive'
                    }>
                      {service.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{service.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {tokenInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify({
                  ...tokenInfo,
                  access_token: tokenInfo.access_token ? `${tokenInfo.access_token.substring(0, 20)}...` : 'none'
                }, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="destructive" 
              onClick={handleReset}
              className="w-full"
            >
              Clear All & Return to Login
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/home')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatusPage;
