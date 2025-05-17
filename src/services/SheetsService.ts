
import { getValidAccessToken } from './googleAuth';

export class SheetsService {
  private static instance: SheetsService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): SheetsService {
    if (!SheetsService.instance) {
      SheetsService.instance = new SheetsService();
    }
    return SheetsService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Check if we have valid auth
      const accessToken = await getValidAccessToken();
      this.isInitialized = !!accessToken;
      console.log("Sheets service initialized:", this.isInitialized);
      return this.isInitialized;
    } catch (error) {
      console.error("Failed to initialize Sheets service:", error);
      this.isInitialized = false;
      return false;
    }
  }

  async createLogSheet(): Promise<string> {
    if (!this.isInitialized) {
      throw new Error("Sheets service not initialized");
    }

    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        throw new Error("No valid access token available");
      }

      // Create a new spreadsheet
      const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `Παραστατικά Log ${new Date().toISOString().substring(0, 10)}`,
          },
          sheets: [
            {
              properties: {
                title: 'Καταχωρήσεις',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 9
                }
              }
            }
          ]
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error("Error creating sheet:", errorData);
        throw new Error("Failed to create spreadsheet");
      }

      const data = await createResponse.json();
      const sheetId = data.spreadsheetId;

      // Add headers to the first row
      await this.appendRow(sheetId, [
        'Ημερομηνία Καταχώρησης',
        'ΑΦΜ',
        'Ημερομηνία Παραστατικού',
        'Αριθμός Παραστατικού',
        'Προμηθευτής',
        'Ποσό',
        'Νόμισμα',
        'Φάκελος',
        'Όνομα Αρχείου'
      ]);

      console.log("Created new log sheet with ID:", sheetId);
      return sheetId;
    } catch (error) {
      console.error("Error creating log sheet:", error);
      throw error;
    }
  }

  async appendRow(sheetId: string, rowData: string[]): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("Sheets service not initialized");
    }

    try {
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        throw new Error("No valid access token available");
      }

      // Append values to the sheet
      const appendResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:I:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: [rowData]
          })
        }
      );

      if (!appendResponse.ok) {
        const errorData = await appendResponse.json();
        console.error("Error appending row:", errorData);
        return false;
      }

      console.log("Successfully appended row to sheet:", sheetId);
      return true;
    } catch (error) {
      console.error("Error appending row:", error);
      return false;
    }
  }
}
