
/**
 * Base extractor class with common functionality
 */
import { DocumentData } from "@/types";

export abstract class BaseExtractor {
  /**
   * Clean and normalize VAT number
   */
  protected cleanVatNumber(vatNumber: string): string {
    if (!vatNumber || vatNumber === "unknown") return "Unknown";
    
    // Remove common prefixes and non-alphanumeric characters
    return vatNumber
      .replace(/^(ΑΦΜ|ΑΦΜ:|Α\.?Φ\.?Μ\.?|VAT|VAT:)\s*/i, '')
      .replace(/[^0-9A-Za-z]/g, '')
      .trim();
  }

  /**
   * Check if text contains Greek characters
   */
  protected containsGreekCharacters(text: string): boolean {
    return /[\u0370-\u03FF\u1F00-\u1FFF]/.test(text);
  }

  /**
   * Get user settings from localStorage
   */
  protected getUserSettings() {
    try {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (e) {
      console.error("Error reading settings:", e);
    }
    return {
      enableAI: true,
      enableDocumentAI: false,
      preferGreekExtraction: true,
      documentAIPreferredForGreek: false,
      aiConfidenceThreshold: 70
    };
  }

  /**
   * Extract data from a source
   * This is the main method that all extractors must implement
   */
  abstract extract(source: any): Promise<DocumentData>;
}
