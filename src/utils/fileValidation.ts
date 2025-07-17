export interface FileValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export function validatePdfFile(file: File | null): FileValidationResult {
  if (!file) {
    console.log("Parse PDF aborted: No file selected");
    return {
      isValid: false,
      errorMessage: "Παρακαλώ επιλέξτε ένα αρχείο PDF πρώτα"
    };
  }

  if (!file.type.includes('pdf')) {
    console.log("Parse PDF aborted: File is not a PDF", { 
      fileType: file.type,
      fileName: file.name 
    });
    return {
      isValid: false,
      errorMessage: "Το αρχείο πρέπει να είναι τύπου PDF"
    };
  }

  return { isValid: true };
}