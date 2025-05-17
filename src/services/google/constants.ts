
/**
 * Constants for Google OAuth configuration
 */

// OAuth endpoints
export const GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token";

// Scopes needed for the application
// Using more specific scopes for better security:
// - gmail.readonly - for reading emails
// - drive.file - for file operations on files created by the app
// - spreadsheets - for Google Sheets operations
export const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
].join(" ");
