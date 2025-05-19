
import * as pdfjs from 'pdfjs-dist';
import { DocumentInitParameters } from 'pdfjs-dist/types/src/display/api';
import * as Tesseract from 'tesseract.js';

// Set the worker path
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Extract text content from a PDF file using PDF.js
 */
export async function extractTextFromPdf(pdfFile: File | Blob, options?: { maxPages?: number }): Promise<string> {
  try {
    console.log("Starting PDF text extraction with PDF.js");
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer
    } as DocumentInitParameters);
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    // Extract text from each page
    const maxPages = options?.maxPages || pdf.numPages;
    for (let i = 1; i <= Math.min(maxPages, pdf.numPages); i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + ' ';
    }
    
    const extractedText = fullText.trim();
    
    // If minimal text is extracted, it might be a scanned PDF
    // We consider less than 100 characters as potentially a scanned document
    if (extractedText.length < 100) {
      console.log("Minimal text extracted with PDF.js, trying OCR with Tesseract");
      return extractTextWithOcr(pdfFile);
    }
    
    console.log("Successfully extracted text with PDF.js", {
      textLength: extractedText.length,
      textSample: extractedText.substring(0, 100) + '...'
    });
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF with PDF.js:', error);
    console.log("Falling back to OCR with Tesseract.js");
    return extractTextWithOcr(pdfFile);
  }
}

/**
 * Extract text from a PDF using OCR (Optical Character Recognition)
 */
async function extractTextWithOcr(pdfFile: File | Blob): Promise<string> {
  try {
    console.log("Starting OCR text extraction with Tesseract.js");

    // Convert PDF to images and then OCR
    // For simplicity, we'll just process the first page for now
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer
    } as DocumentInitParameters);
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    // Process the first few pages (limiting for performance)
    const maxPagesToOcr = Math.min(pdf.numPages, 3);
    
    // Configure Tesseract
    await Tesseract.createWorker();
    const worker = await Tesseract.createWorker('eng+ell'); // English + Greek
    
    console.log(`Processing ${maxPagesToOcr} pages with OCR`);
    
    for (let i = 1; i <= maxPagesToOcr; i++) {
      console.log(`OCR processing page ${i}/${maxPagesToOcr}`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 }); // Higher scale for better OCR
      
      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context!,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Get image data from canvas
      const imageData = canvas.toDataURL('image/png');
      
      // Perform OCR on the image
      const result = await worker.recognize(imageData);
      
      fullText += result.data.text + ' ';
      console.log(`Completed OCR for page ${i}, extracted ${result.data.text.length} characters`);
    }
    
    // Terminate Tesseract worker
    await worker.terminate();
    
    const extractedText = fullText.trim();
    console.log("Successfully extracted text with Tesseract OCR", {
      textLength: extractedText.length, 
      textSample: extractedText.substring(0, 100) + '...'
    });
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF with OCR:', error);
    throw new Error('Failed to extract text from PDF using OCR');
  }
}

/**
 * Extract text from PDF with multi-tiered approach
 * Tries PDF.js first, then OCR if needed, with fallbacks
 */
export async function extractTextFromPdfAdvanced(pdfFile: File | Blob): Promise<string> {
  try {
    // Try PDF.js first (fastest method)
    let extractedText = await extractTextFromPdf(pdfFile);
    
    // If minimal text extracted, try OCR
    if (extractedText.length < 100) {
      console.log("Minimal text extracted with primary method, trying OCR");
      extractedText = await extractTextWithOcr(pdfFile);
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error in advanced PDF text extraction:', error);
    throw new Error('Failed to extract text from PDF using all available methods');
  }
}
