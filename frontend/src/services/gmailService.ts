import { GmailEmail, GmailEmailsResponse, ClassificationResult, Classification } from '../types';
import { httpService } from './httpService';
import { authService } from './authService';
import { config } from '../config';

class GmailService {
  async initialize(): Promise<void> {
    return authService.initialize();
  }

  isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }

  async signIn(): Promise<void> {
    return authService.signIn();
  }

  signOut(): void {
    authService.signOut();
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${authService.getAccessToken()}`,
    };
  }

  async getEmails(maxResults: number = config.defaults.maxEmailResults, pageToken?: string | null): Promise<GmailEmailsResponse> {
    const params = new URLSearchParams({ maxResults: String(maxResults) });
    if (pageToken) params.set('pageToken', pageToken);

    return httpService.get<GmailEmailsResponse>(
      `/api/emails?${params.toString()}`,
      this.getAuthHeaders()
    );
  }

  async addLabel(messageId: string, labelName: string): Promise<void> {
    await httpService.post(
      `/api/emails/${messageId}/label`,
      { label: labelName },
      this.getAuthHeaders()
    );
  }

  async classifyBatch(
    emails: Array<{ id: string; subject?: string; body: string }>, 
    guidelines?: string
  ): Promise<Record<string, Classification>> {
    const response = await httpService.post<{ classifications: Record<string, Classification> }>(
      '/api/classify-batch',
      { emails, guidelines }
    );
    
    return response.classifications || {};
  }

  async generateReply(params: {
    classification: Classification;
    body: string;
    subject?: string;
  }): Promise<ClassificationResult> {
    return httpService.post<ClassificationResult>('/api/generate-reply', {
      classification: params.classification,
      email_content: params.body,
      subject: params.subject,
    });
  }

  async classifyOnly(params: {
    body: string;
    subject?: string;
    guidelines?: string;
  }): Promise<Classification> {
    const response = await httpService.post<{ classification: Classification }>(
      '/api/classify-only',
      {
        email_content: params.body,
        subject: params.subject,
        guidelines: params.guidelines,
      }
    );
    
    return response.classification || 'Improdutivo';
  }
}

export const gmailService = new GmailService();
