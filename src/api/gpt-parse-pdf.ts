
import { extractTextFromPdf } from "@/utils/pdfUtils";

/**
 * API endpoint to parse PDF files using GPT
 * This is a mock implementation that would be replaced by a real API endpoint
 * in a production environment
 */
export async function handlePdfParsingRequest(req: Request): Promise<Response> {
  try {
    // For demo purposes, we'll extract text from the PDF and use pattern matching
    // In a real implementation, this would send the text to OpenAI API
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
    
    // In a real implementation, this would be sent to OpenAI API
    // For now, we'll use some pattern matching to extract data
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
    
    // Add random delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Extracted data:", result);
    
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
