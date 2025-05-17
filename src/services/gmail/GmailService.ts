
/**
 * Core GmailService class that coordinates between all Gmail operations
 */
import { getValidAccessToken } from '../googleAuth';
import { fetchEmailsWithLabel } from './emails';
import { downloadAttachment } from './attachments';
import { addLabel } from './labels';
import { sendNotificationEmail } from './notifications';
import { EmailData, AttachmentData } from '@/types';

export class GmailService {
  private static instance: GmailService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Check if we have valid auth
      const accessToken = await getValidAccessToken();
      this.isInitialized = !!accessToken;
      console.log("Gmail service initialized:", this.isInitialized);
      return this.isInitialized;
    } catch (error) {
      console.error("Failed to initialize Gmail service:", error);
      this.isInitialized = false;
      return false;
    }
  }

  async fetchEmailsWithLabel(label: string): Promise<EmailData[]> {
    if (!this.isInitialized) {
      throw new Error("Gmail service not initialized");
    }
    return fetchEmailsWithLabel(label);
  }

  async downloadAttachment(emailId: string, attachmentId: string): Promise<Blob | null> {
    if (!this.isInitialized) {
      throw new Error("Gmail service not initialized");
    }
    return downloadAttachment(emailId, attachmentId);
  }

  async addLabel(emailId: string, label: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("Gmail service not initialized");
    }
    return addLabel(emailId, label);
  }

  async sendNotificationEmail(to: string, subject: string, body: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error("Gmail service not initialized");
    }
    return sendNotificationEmail(to, subject, body);
  }
}
