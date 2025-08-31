import { useState, useCallback } from 'react';

interface UseGuidelinesReturn {
  guidelines: string;
  produtivoText: string;
  improdutivoText: string;
  setProdutivoText: (text: string) => void;
  setImprodutivoText: (text: string) => void;
  saveGuidelines: () => void;
  resetGuidelines: () => void;
}

export const useGuidelines = (): UseGuidelinesReturn => {
  const [guidelines, setGuidelines] = useState<string>('');
  const [produtivoText, setProdutivoText] = useState<string>('');
  const [improdutivoText, setImprodutivoText] = useState<string>('');

  const saveGuidelines = useCallback(() => {
    const newGuidelines = `Produtivo: ${produtivoText}. Improdutivo: ${improdutivoText}.`;
    setGuidelines(newGuidelines);
  }, [produtivoText, improdutivoText]);

  const resetGuidelines = useCallback(() => {
    setProdutivoText('');
    setImprodutivoText('');
    setGuidelines('');
  }, []);

  return {
    guidelines,
    produtivoText,
    improdutivoText,
    setProdutivoText,
    setImprodutivoText,
    saveGuidelines,
    resetGuidelines,
  };
};
