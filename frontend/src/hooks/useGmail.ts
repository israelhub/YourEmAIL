import { useState, useEffect, useCallback } from "react";
import { gmailService } from "../services/gmailService";
import { GmailEmail } from "../types";
import { useDataSource } from "../context/DataSourceContext";
import { MOCK_EMAILS } from "../data";

interface UseGmailReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  emails: GmailEmail[];
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => void;
  refreshEmails: () => Promise<void>;
  loadNextPage: () => Promise<void>;
  loadPrevPage: () => Promise<void>;
  addLabelToEmail: (
    emailId: string,
    classification: "Produtivo" | "Improdutivo"
  ) => Promise<void>;
  updateClassificationLocal: (
    emailId: string,
    classification: "Produtivo" | "Improdutivo"
  ) => void;
}

export const useGmail = (): UseGmailReturn => {
  const { source } = useDataSource();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  // Verifica autenticação ao carregar
  useEffect(() => {
    if (source === 'mock') {
      setIsAuthenticated(true);
      return;
    }
    const id = setTimeout(() => setIsAuthenticated(gmailService.isAuthenticated()), 500);
    return () => clearTimeout(id);
  }, [source]);

  const refreshEmails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (source === 'mock') {
        const mapped: GmailEmail[] = MOCK_EMAILS.map((m, idx) => ({
          id: String(m.id),
          sender: m.sender,
          subject: m.subject,
          snippet: m.snippet,
          body: m.body,
          date: new Date(Date.now() - idx * 3600_000).toISOString(),
          classification: null,
          isRead: idx % 2 === 0,
        }));
        setEmails(mapped);
        setNextPageToken(null);
        setPage(1);
        setHasFetched(true);
        return;
      }
      const data = await gmailService.getEmails(20);
      setEmails(data.emails);
      setNextPageToken(data.nextPageToken || null);
      setPage(1);
      setHasFetched(true);
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar emails");
    } finally {
      setIsLoading(false);
    }
  }, [source]);

  // Carrega emails automaticamente quando autenticado
  useEffect(() => {
    if (isAuthenticated && !hasFetched && !isLoading) {
      refreshEmails();
    }
  }, [isAuthenticated, hasFetched, isLoading, refreshEmails]);

  const loadNextPage = useCallback(async () => {
    if (source === 'mock' || !nextPageToken) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await gmailService.getEmails(20, nextPageToken);
      setEmails(data.emails);
      setNextPageToken(data.nextPageToken || null);
      setPage(prev => prev + 1);
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar próxima página");
    } finally {
      setIsLoading(false);
    }
  }, [nextPageToken, source]);

  const loadPrevPage = useCallback(async () => {
    if (page <= 1) return;
    
    setIsLoading(true);
    setError(null);
    try {
      // Para simplificar, recarrega da primeira página
      await refreshEmails();
    } catch (e: any) {
      setError(e?.message || "Falha ao carregar página anterior");
    } finally {
      setIsLoading(false);
    }
  }, [page, refreshEmails]);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (source === 'mock') {
        setIsAuthenticated(true);
        await refreshEmails();
        return;
      }
      await gmailService.signIn();
      setIsAuthenticated(true);
      await refreshEmails();
    } catch (err: any) {
      setError(err.message || "Falha na autenticação com Google");
      console.error("Erro na autenticação:", err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshEmails, source]);

  const signOut = useCallback(() => {
    if (source === 'google') {
      gmailService.signOut();
    }
    setIsAuthenticated(false);
    setEmails([]);
    setError(null);
    setPage(1);
    setNextPageToken(null);
    setHasFetched(false);
  }, [source]);

  const addLabelToEmail = useCallback(
    async (emailId: string, classification: "Produtivo" | "Improdutivo") => {
      try {
        if (source === 'google') {
          await gmailService.addLabel(emailId, classification);
        }
        setEmails((prev) =>
          prev.map((e) => (e.id === emailId ? { ...e, classification } : e))
        );
      } catch (e: any) {
        setError(e?.message || "Falha ao adicionar label");
        throw e;
      }
    },
    [source]
  );

  const updateClassificationLocal = useCallback(
    (emailId: string, classification: "Produtivo" | "Improdutivo") => {
      setEmails((prev) =>
        prev.map((e) => (e.id === emailId ? { ...e, classification } : e))
      );
    },
    []
  );

  return {
    isAuthenticated,
    isLoading,
    emails,
    page,
    hasNextPage: !!nextPageToken,
    hasPrevPage: page > 1,
    error,
    signIn,
    signOut,
    refreshEmails,
    loadNextPage,
    loadPrevPage,
    addLabelToEmail,
    updateClassificationLocal,
  };
};
