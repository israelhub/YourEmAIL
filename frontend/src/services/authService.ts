/**
 * Serviço de autenticação Google
 */

import { config } from '../config';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

class AuthService {
  private gapiInitialized = false;
  private gisInitialized = false;
  private tokenClient: any = null;

  async initialize(): Promise<void> {
    await Promise.all([
      this.initializeGapi(),
      this.initializeGis(),
    ]);
  }

  private async initializeGapi(): Promise<void> {
    if (this.gapiInitialized) return;

    // Carrega o script GAPI dinamicamente
    await this.loadScript(config.scripts.gapi);
    
    await new Promise<void>((resolve) => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: config.google.apiKey,
          discoveryDocs: config.google.discoveryDocs,
        });
        this.gapiInitialized = true;
        resolve();
      });
    });
  }

  private async initializeGis(): Promise<void> {
    if (this.gisInitialized) return;

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: config.google.clientId,
      scope: config.google.scopes,
      callback: () => {}, // Callback será definido em signIn
    });
    
    this.gisInitialized = true;
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  }

  isAuthenticated(): boolean {
    const token = window.gapi?.client?.getToken?.();
    return !!(token?.access_token);
  }

  async signIn(): Promise<void> {
    if (!this.gapiInitialized || !this.gisInitialized) {
      await this.initialize();
    }

    if (this.isAuthenticated()) return;

    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      };

      this.tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  signOut(): void {
    const token = window.gapi?.client?.getToken?.();
    if (token?.access_token) {
      window.google?.accounts?.oauth2?.revoke?.(token.access_token);
      window.gapi.client.setToken(null);
    }
  }

  getAccessToken(): string {
    if (!this.isAuthenticated()) {
      throw new Error('Usuário não autenticado');
    }
    return window.gapi.client.getToken().access_token;
  }
}

export const authService = new AuthService();
