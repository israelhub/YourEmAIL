import { useState, useCallback } from "react";
import { analyzeEmailContent } from "../services/geminiService";
import { gmailService } from "../services/gmailService";
import { ClassificationResult } from "../types";

export const useEmailClassifier = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  const handleError = useCallback((e: unknown) => {
    const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro desconhecido.";
    setError(errorMessage);
    return null;
  }, []);

  const validateContent = useCallback((content: string) => {
    if (!content.trim()) {
      setError("O conteúdo do email não pode estar vazio.");
      return false;
    }
    return true;
  }, []);

  const classifyEmail = useCallback(
    async (content: string, subject?: string, guidelines?: string) => {
      if (!validateContent(content)) return null;
      
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      try {
        const analysisResult = await analyzeEmailContent(content, subject, guidelines);
        setResult(analysisResult);
        return analysisResult;
      } catch (e) {
        return handleError(e);
      } finally {
        setIsLoading(false);
      }
    },
    [validateContent, handleError]
  );

  const generateReplyGivenClassification = useCallback(
    async (
      classification: "Produtivo" | "Improdutivo",
      content: string,
      subject?: string
    ) => {
      if (!validateContent(content)) return null;
      
      setIsLoading(true);
      setError(null);
      setResult(null);
      
      try {
        const r = await gmailService.generateReply({
          classification,
          body: content,
          subject,
        });
        setResult(r);
        return r;
      } catch (e) {
        return handleError(e);
      } finally {
        setIsLoading(false);
      }
    },
    [validateContent, handleError]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    isLoading,
    error,
    result,
    classifyEmail,
    generateReplyGivenClassification,
    reset,
  };
};
