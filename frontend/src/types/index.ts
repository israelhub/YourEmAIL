
// Tipos de classificação
export type Classification = 'Produtivo' | 'Improdutivo';

// Resultados de classificação
export interface ClassificationResult {
  classification: Classification;
  suggested_reply: string;
  explanation?: string; // presente para casos Improdutivo
}

// Tipos de email
export interface MockEmail {
  id: number;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
}

export interface GmailEmail {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  classification: Classification | null;
  isRead: boolean;
}

export interface GmailEmailsResponse {
  emails: GmailEmail[];
  nextPageToken?: string | null;
}

// Configurações do usuário
export interface UserGuidelines {
  text: string; // livre: métricas/preferências do usuário para Produtivo/Improdutivo
}
