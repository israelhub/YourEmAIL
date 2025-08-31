import { ClassificationResult } from '../types';
import { httpService } from './httpService';

export const analyzeEmailContent = async (
  emailContent: string, 
  subject?: string, 
  guidelines?: string
): Promise<ClassificationResult> => {
  if (!emailContent?.trim()) {
    throw new Error('Conteúdo vazio.');
  }

  return httpService.post<ClassificationResult>('/api/classify', {
    email_content: emailContent,
    subject,
    guidelines,
  });
};
