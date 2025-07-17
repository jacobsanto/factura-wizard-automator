import { DocumentData, ExtractionFeedback } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for handling extraction feedback and improving extraction quality
 */
export class FeedbackService {
  private static instance: FeedbackService;

  private constructor() {
    console.log("FeedbackService initialized");
  }

  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  /**
   * Submit feedback for an extraction
   */
  async submitFeedback(feedback: ExtractionFeedback): Promise<boolean> {
    try {
      console.log("Submitting extraction feedback", feedback);
      
      // Store in localStorage for offline use
      this.storeLocalFeedback(feedback);
      
      // Try to submit to backend if available
      try {
        if (supabase) {
          // For now, just log that we would submit to backend
          // In the future, we could create an extraction_feedback table
          console.log("Backend submission would happen here if table existed");
        }
      } catch (e) {
        console.warn("Backend submission failed, feedback stored locally only:", e);
      }
      
      // Process the feedback to improve future extractions
      this.processFeedbackForLearning(feedback);
      
      return true;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      return false;
    }
  }
  
  /**
   * Store feedback in localStorage for offline use and local improvements
   */
  private storeLocalFeedback(feedback: ExtractionFeedback): void {
    try {
      // Get existing feedback array or initialize empty
      const storedFeedback = localStorage.getItem('extractionFeedback');
      const feedbackArray: ExtractionFeedback[] = storedFeedback 
        ? JSON.parse(storedFeedback) 
        : [];
      
      // Add new feedback with timestamp
      feedbackArray.push({
        ...feedback,
        feedbackDate: new Date().toISOString()
      });
      
      // Keep only last 50 items to avoid localStorage limits
      const trimmedArray = feedbackArray.slice(-50);
      
      // Save back to localStorage
      localStorage.setItem('extractionFeedback', JSON.stringify(trimmedArray));
      console.log("Feedback stored locally");
    } catch (e) {
      console.warn("Failed to store feedback locally:", e);
    }
  }
  
  /**
   * Process feedback to improve future extractions
   */
  private processFeedbackForLearning(feedback: ExtractionFeedback): void {
    // Analyze which fields were commonly corrected
    const fieldsWithIssues = Object.entries(feedback.fields)
      .filter(([_, details]) => !details.wasCorrect)
      .map(([field]) => field);
    
    // Store extraction method performance
    this.updateMethodPerformance(feedback.extractionMethod, feedback.rating, fieldsWithIssues);
    
    // Analyze patterns for specific fields
    if (fieldsWithIssues.includes('vatNumber')) {
      this.analyzeVatNumberCorrections(
        feedback.originalData.vatNumber || "", 
        feedback.correctedData.vatNumber || ""
      );
    }
    
    console.log("Feedback processed for learning:", { fieldsWithIssues });
  }
  
  /**
   * Update performance metrics for extraction methods
   */
  private updateMethodPerformance(
    method: string, 
    rating: number, 
    problemFields: string[]
  ): void {
    try {
      // Get existing performance data
      const performanceData = localStorage.getItem('extractionPerformance');
      const performance = performanceData 
        ? JSON.parse(performanceData) 
        : {};
      
      // Initialize method data if not exists
      if (!performance[method]) {
        performance[method] = {
          totalRatings: 0,
          sumRating: 0,
          problemFields: {},
          lastUpdated: new Date().toISOString()
        };
      }
      
      // Update ratings
      performance[method].totalRatings++;
      performance[method].sumRating += rating;
      
      // Update problem fields
      problemFields.forEach(field => {
        performance[method].problemFields[field] = 
          (performance[method].problemFields[field] || 0) + 1;
      });
      
      performance[method].lastUpdated = new Date().toISOString();
      
      // Save back to localStorage
      localStorage.setItem('extractionPerformance', JSON.stringify(performance));
    } catch (e) {
      console.warn("Failed to update method performance:", e);
    }
  }
  
  /**
   * Analyze patterns in VAT number corrections to improve extraction
   */
  private analyzeVatNumberCorrections(original: string, corrected: string): void {
    // Only proceed if we have both values and they differ
    if (!original || !corrected || original === corrected) {
      return;
    }
    
    // Check for common patterns in Greek VAT numbers
    const isGreekVat = corrected.length === 9 && /^\d+$/.test(corrected);
    
    if (isGreekVat) {
      console.log("Greek VAT number pattern identified:", {
        original,
        corrected,
        pattern: "9 digits"
      });
      
      // Store this correction pattern for future use
      this.storeVatPattern(original, corrected);
    }
  }
  
  /**
   * Store VAT correction patterns for learning
   */
  private storeVatPattern(original: string, corrected: string): void {
    try {
      // Get existing patterns
      const patternsData = localStorage.getItem('vatCorrectionPatterns');
      const patterns = patternsData 
        ? JSON.parse(patternsData) 
        : [];
      
      // Add new pattern
      patterns.push({
        original,
        corrected,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 patterns
      const trimmedPatterns = patterns.slice(-50);
      
      // Save back to localStorage
      localStorage.setItem('vatCorrectionPatterns', JSON.stringify(trimmedPatterns));
    } catch (e) {
      console.warn("Failed to store VAT pattern:", e);
    }
  }
  
  /**
   * Get extraction performance metrics
   */
  getExtractionPerformance(): Record<string, {
    averageRating: number;
    totalRatings: number;
    commonIssues: string[];
    lastUpdated: string;
  }> {
    try {
      const performanceData = localStorage.getItem('extractionPerformance');
      
      if (!performanceData) {
        return {};
      }
      
      const rawPerformance = JSON.parse(performanceData);
      const result: Record<string, any> = {};
      
      // Process raw data into more useful stats
      Object.entries(rawPerformance).forEach(([method, data]: [string, any]) => {
        // Calculate average rating
        const averageRating = data.totalRatings > 0 
          ? data.sumRating / data.totalRatings 
          : 0;
        
        // Sort problem fields by frequency
        const sortedIssues = Object.entries(data.problemFields || {})
          .sort((a: any, b: any) => b[1] - a[1])
          .map(([field]) => field);
        
        result[method] = {
          averageRating: parseFloat(averageRating.toFixed(2)),
          totalRatings: data.totalRatings,
          commonIssues: sortedIssues.slice(0, 3), // Top 3 issues
          lastUpdated: data.lastUpdated
        };
      });
      
      return result;
    } catch (e) {
      console.warn("Failed to get extraction performance:", e);
      return {};
    }
  }
}

// Export a singleton instance
export const feedbackService = FeedbackService.getInstance();
