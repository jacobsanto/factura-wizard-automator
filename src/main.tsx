import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a proxy handler for API requests to Supabase Edge Functions
const createProxyHandler = () => {
  const SUPABASE_URL = "https://yjjfyjbgfvqcabgdncek.supabase.co";
  
  const handleApiRequest = async (request: Request) => {
    const url = new URL(request.url);
    
    // Only proxy requests to /api/* routes
    if (!url.pathname.startsWith('/api/')) {
      return fetch(request);
    }
    
    // Map /api/function-name to Supabase Edge Function URL
    const functionName = url.pathname.replace('/api/', '');
    const supabaseFunctionUrl = `${SUPABASE_URL}/functions/v1/${functionName}`;
    
    // Forward the request to the Supabase Edge Function
    return fetch(supabaseFunctionUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      credentials: request.credentials,
      mode: 'cors',
    });
  };
  
  // Register the fetch handler if running in a browser
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    
    // Override fetch to intercept API requests
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      // If the request is a string that starts with /api/, or a Request object with URL starting with /api/
      if (
        (typeof input === 'string' && input.startsWith('/api/')) || 
        (input instanceof Request && input.url.startsWith(`${window.location.origin}/api/`))
      ) {
        return handleApiRequest(new Request(input, init));
      }
      
      // Otherwise, pass through to the original fetch
      return originalFetch.call(this, input, init);
    };
  }
};

// Initialize the API proxy before mounting the app
createProxyHandler();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
