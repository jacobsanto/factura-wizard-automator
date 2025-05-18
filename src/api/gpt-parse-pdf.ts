
import { extractTextFromPdf } from "@/utils/pdfUtils";
import { supabase } from "@/integrations/supabase/client";

/**
 * API endpoint to parse PDF files using GPT
 * This implementation tries to use the Supabase Edge Function first,
 * then falls back to pattern matching if that fails
 */
export async function handlePdfParsingRequest(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const promptText = formData.get("prompt") as string | null;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log("Received file:", file.name, "size:", file.size);
    console.log("Prompt:", promptText?.substring(0, 100) + "...");
    
    // Extract text from PDF
    const text = await extractTextFromPdf(file);
    console.log("Extracted text length:", text.length);
    
    // Try to use the Supabase Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('invoice-gpt', {
        body: { 
          text: text,
          prompt: promptText 
        },
      });
      
      if (!error && data) {
        console.log("Edge function returned data:", data);
        return new Response(
          JSON.stringify(data),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      
      console.warn("Edge function error or no data, falling back to pattern matching:", error);
    } catch (edgeFunctionError) {
      console.error("Error calling edge function:", edgeFunctionError);
      // Continue to fallback
    }
    
    // Fallback to pattern matching
    const result = {
      vatNumber: extractPattern(text, /(?:[Α|A]ΦΜ|[Α|A]\.?Φ\.?Μ\.?|VAT)[:|\s]*(\d{9,12})/i) || 
                  extractPattern(text, /(\d{9,12})/),
      clientName: extractPattern(text, /(?:ΕΠΩΝΥΜΙΑ|ΠΕΛΑΤΗΣ|ΑΓΟΡΑΣΤΗΣ|CUSTOMER|CLIENT)[:|\s]*(.*?)(?:\r|\n|$)/i) ||
                  extractPattern(text, /^(.*?)(?:\r|\n|$)/),
      issuer: extractPattern(text, /(?:ΕΚΔΟΤΗΣ|ΠΡΟΜΗΘΕΥΤΗΣ|SUPPLIER|VENDOR)[:|\s]*(.*?)(?:\r|\n|$)/i) ||
              extractPattern(text, /(?:ΣΤΟΙΧΕΙΑ ΕΚΔΟΤΗ)[\s\S]*?(?:ΕΠΩΝΥΜΙΑ|ΟΝΟΜΑ)[:|\s]*(.*?)(?:\r|\n|$)/i),
      documentNumber: extractPattern(text, /(?:ΑΡΙΘΜΟΣ|ΑΡ\.)(?:\s|:)*(.*?)(?:\r|\n|$)/i) ||
                      extractPattern(text, /(?:INVOICE|ΤΙΜΟΛΟΓΙΟ)(?:\s|#|No|:)*(.*?)(?:\r|\n|$)/i),
      date: extractPattern(text, /(?:ΗΜΕΡΟΜΗΝΙΑ|DATE)(?:\s|:)*([\d\/\.\-]+)/i) ||
            extractPattern(text, /([\d]{1,2}\/[\d]{1,2}\/[\d]{2,4})/),
      amount: extractPattern(text, /(?:ΣΥΝΟΛΟ|ΠΛΗΡΩΜΗ|TOTAL|AMOUNT)(?:\s|:)*(\d+[,\.]\d+)/i) ||
              extractPattern(text, /(\d+[,\.]\d+)(?:\s)*(?:€|EUR|EURO|ΕΥΡΩ|USD|\$)/i),
      currency: extractPattern(text, /(?:ΣΥΝΟΛΟ|ΠΛΗΡΩΜΗ|TOTAL|AMOUNT)(?:\s|:)*\d+[,\.]\d+(?:\s)*([€|EUR|EURO|ΕΥΡΩ|USD|\$])/i) || "€"
    };
    
    console.log("Extracted data using pattern matching:", result);
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return new Response(
      JSON.stringify({ error: "Failed to parse PDF" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function extractPattern(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match && match[1] ? match[1].trim() : null;
}
