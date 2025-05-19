
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const { text, prompt } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Processing invoice text with OpenAI");
    console.log(`Text length: ${text.length} characters`);

    // Detect if text contains Greek characters to adjust processing
    const containsGreek = /[\u0370-\u03FF\u1F00-\u1FFF]/.test(text);
    console.log(`Text language detection: ${containsGreek ? 'Greek' : 'Non-Greek'}`);

    // Truncate text if it's too long (OpenAI has token limits)
    const truncatedText = text.length > 15000 ? text.substring(0, 15000) + "..." : text;
    
    // Use the provided prompt or build a specialized one based on content
    let finalPrompt = prompt;
    
    if (!finalPrompt) {
      if (containsGreek) {
        // Greek specialized prompt with more detailed instructions
        finalPrompt = `
          Από το παρακάτω κείμενο τιμολογίου, εξήγαγε τις ακόλουθες πληροφορίες. 
          Αν δεν μπορείς να βρεις κάποιο πεδίο, απάντησε "unknown" για αυτό.
          Επίστρεψε ΜΟΝΟ ένα JSON αντικείμενο με τα εξής κλειδιά:
          - vatNumber (ο ΑΦΜ του πελάτη/λήπτη, συνήθως 9 ψηφία με πρόθεμα "ΑΦΜ")
          - clientName (το όνομα του πελάτη/εταιρείας που λαμβάνει το τιμολόγιο)
          - issuer (ο προμηθευτής/εκδότης του τιμολογίου)
          - date (η ημερομηνία του τιμολογίου σε μορφή YYYY-MM-DD αν είναι δυνατόν)
          - documentNumber (ο αριθμός του τιμολογίου ή "Αριθμός Παραστατικού")
          - amount (το συνολικό ποσό ως αριθμός χωρίς σύμβολο νομίσματος)
          - currency (το σύμβολο ή κωδικός νομίσματος, π.χ., €, $, EUR, USD)
          
          ΣΗΜΑΝΤΙΚΕΣ ΟΔΗΓΙΕΣ:
          - Ο ΑΦΜ είναι 9 ψηφία και συνήθως έχει πρόθεμα "ΑΦΜ:" ή "Α.Φ.Μ."
          - Για το ποσό, ψάξε για "ΣΥΝΟΛΟ", "ΠΛΗΡΩΤΕΟ ΠΟΣΟ", "ΠΛΗΡΩΜΗ", "ΑΞΙΑ", "ΦΠΑ", "ΣΥΝΟΛΙΚΗ ΑΞΙΑ"
          - Επίστρεψε ΜΟΝΟ το JSON αντικείμενο, χωρίς άλλο κείμενο ή επεξήγηση
          
          Κείμενο τιμολογίου:
          ${truncatedText}`;
      } else {
        // Default prompt for non-Greek invoices
        finalPrompt = `
          Extract the following information from this invoice text. If you can't find a specific field, respond with "unknown" for that field.
          Return ONLY a JSON object with these keys:
          - vatNumber (the VAT/Tax ID of the client)
          - clientName (the name of the client/company receiving the invoice)
          - issuer (the supplier/vendor issuing the invoice)
          - date (the invoice date in YYYY-MM-DD format if possible)
          - documentNumber (the invoice number)
          - amount (the total amount as a number without currency symbol)
          - currency (the currency symbol or code, e.g., €, $, EUR, USD)
          
          IMPORTANT: 
          - Return only the JSON object, no additional text
          
          Here's the invoice text:
          ${truncatedText}`;
      }
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using the latest model for cost-efficiency and performance
        messages: [
          {
            role: "user",
            content: finalPrompt
          }
        ],
        temperature: containsGreek ? 0.3 : 0.2, // Slightly higher temperature for Greek to handle ambiguity
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${error.error?.message || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const responseData = await response.json();
    const content = responseData.choices?.[0]?.message?.content;
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No content returned from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to parse the response as JSON
    try {
      // Extract JSON if it's wrapped in markdown code blocks or other text
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      const extractedData = JSON.parse(jsonStr.trim());
      console.log("Successfully extracted data:", extractedData);
      
      // Greek-specific post-processing
      if (containsGreek) {
        // Handle typical Greek VAT number formats
        if (extractedData.vatNumber && extractedData.vatNumber !== "unknown") {
          extractedData.vatNumber = extractedData.vatNumber.replace(/[^0-9]/g, '');
          // Ensure it's 9 digits for Greek VAT
          if (extractedData.vatNumber.length !== 9) {
            console.log(`Warning: VAT number ${extractedData.vatNumber} is not 9 digits`);
          }
        }
        
        // Normalize currency for Greek invoices
        if (extractedData.currency === "ΕΥΡΩ" || extractedData.currency === "ευρώ" || 
            extractedData.currency === "EUR" || extractedData.currency === "euro") {
          extractedData.currency = "€";
        }
      }
      
      return new Response(
        JSON.stringify(extractedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
      console.log("Raw response:", content);
      
      // Attempt to extract structured data anyway using regex
      const extractedData = {
        vatNumber: extractPattern(content, /["']vatNumber["']\s*:\s*["']([^"']+)["']/) || "unknown",
        clientName: extractPattern(content, /["']clientName["']\s*:\s*["']([^"']+)["']/) || "unknown",
        issuer: extractPattern(content, /["']issuer["']\s*:\s*["']([^"']+)["']/) || "unknown",
        date: extractPattern(content, /["']date["']\s*:\s*["']([^"']+)["']/) || "unknown",
        documentNumber: extractPattern(content, /["']documentNumber["']\s*:\s*["']([^"']+)["']/) || "unknown",
        amount: extractPattern(content, /["']amount["']\s*:\s*["']?([^"',]+)["']?/) || "unknown",
        currency: extractPattern(content, /["']currency["']\s*:\s*["']([^"']+)["']/) || "unknown"
      };
      
      // Greek-specific post-processing for regex extracted data
      if (containsGreek && extractedData.vatNumber !== "unknown") {
        extractedData.vatNumber = extractedData.vatNumber.replace(/[^0-9]/g, '');
      }
      
      return new Response(
        JSON.stringify(extractedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error processing invoice text:", error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to extract patterns from text
function extractPattern(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match && match[1] ? match[1].trim() : null;
}
