
/**
 * API Routes
 * This file defines the API routes for the application
 */
import { handlePdfParsingRequest } from './gpt-parse-pdf';

// Define route handlers
const routes = {
  '/api/gpt-parse-pdf': handlePdfParsingRequest,
};

// Global API handler
export async function apiHandler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Find handler for the requested path
  const handler = routes[path as keyof typeof routes];
  
  if (handler) {
    try {
      return await handler(request);
    } catch (error) {
      console.error(`Error in API handler for ${path}:`, error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // Return 404 for unknown routes
  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}

// Export the API handler
export default apiHandler;
