
// Document AI Processing Function
// This edge function processes PDF documents using Google Document AI

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentAIRequest {
  fileContent: string; // base64 encoded file content
  mimeType: string;
  processorId?: string; // Optional, falls back to settings
  location?: string; // Optional, falls back to settings
}

interface DocumentAIResponse {
  success: boolean;
  vatNumber?: string;
  clientName?: string;
  supplier?: string;
  date?: string;
  documentNumber?: string;
  amount?: number | string;
  currency?: string;
  error?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GOOGLE_API_KEY) {
      console.error("Google API key not set");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Google API key not set. Please configure it in the Supabase dashboard." 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse the request body
    const requestData: DocumentAIRequest = await req.json();
    
    if (!requestData.fileContent) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing file content" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get processor details from request or DB
    const requestBody = {
      processorVersions: [`projects/PROJECT_ID/locations/${requestData.location || "eu"}/processors/${requestData.processorId || "PROCESSOR_ID"}/processorVersions/pretrained-form-parser-v1.1-2023-02-24`],
      inputDocuments: {
        gcsDocuments: {
          documents: [
            {
              mimeType: requestData.mimeType,
              content: requestData.fileContent
            }
          ]
        }
      }
    };

    console.log("Sending request to Document AI API");
    
    // Call Document AI API
    const response = await fetch(
      `https://contentwarehouse.googleapis.com/v1/projects/PROJECT_ID/locations/${requestData.location || "eu"}/documents:process?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error from Document AI API:", errorData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Document AI API Error: ${response.status} ${response.statusText}` 
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const data = await response.json();
    console.log("Document AI response received");

    // Process and extract information from Document AI response
    // This is a simplified example - actual implementation would depend on the Document AI response structure
    const extractedFields = extractInvoiceFields(data);

    return new Response(
      JSON.stringify({
        success: true,
        ...extractedFields
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

/**
 * Extract invoice fields from Document AI response
 */
function extractInvoiceFields(documentAIResponse: any): Record<string, any> {
  try {
    // This function would parse the Document AI response based on its actual structure
    // The following is a placeholder implementation
    const entities = documentAIResponse.document?.entities || [];
    
    const result: Record<string, any> = {
      vatNumber: findEntityValue(entities, ["VAT_NUMBER", "ΑΦΜ", "AFM", "TIN"]),
      clientName: findEntityValue(entities, ["RECEIVER_NAME", "CLIENT_NAME", "CUSTOMER"]),
      supplier: findEntityValue(entities, ["SUPPLIER_NAME", "VENDOR_NAME", "ISSUER"]),
      date: findEntityValue(entities, ["INVOICE_DATE", "DATE", "ISSUE_DATE"]),
      documentNumber: findEntityValue(entities, ["INVOICE_NUMBER", "DOCUMENT_NUMBER"]),
      amount: parseAmount(findEntityValue(entities, ["TOTAL_AMOUNT", "AMOUNT", "INVOICE_TOTAL"])),
      currency: findEntityValue(entities, ["CURRENCY"]) || "€"
    };
    
    return result;
  } catch (error) {
    console.error("Error extracting fields from Document AI response:", error);
    return {};
  }
}

/**
 * Find entity value from Document AI response
 */
function findEntityValue(entities: any[], types: string[]): string | undefined {
  for (const type of types) {
    const entity = entities.find(e => e.type.toLowerCase() === type.toLowerCase());
    if (entity && entity.mentionText) {
      return entity.mentionText;
    }
  }
  return undefined;
}

/**
 * Parse amount value from string
 */
function parseAmount(amountStr: string | undefined): number | string | undefined {
  if (!amountStr) return undefined;
  
  try {
    // Remove currency symbols and non-numeric characters except decimal points
    const cleanedAmount = amountStr.replace(/[^\d.,]/g, '').replace(',', '.');
    const amount = parseFloat(cleanedAmount);
    return isNaN(amount) ? amountStr : amount;
  } catch (e) {
    return amountStr;
  }
}
