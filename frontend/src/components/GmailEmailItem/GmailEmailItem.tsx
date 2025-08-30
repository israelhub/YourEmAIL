import React, { useState } from 'react';
import { GmailEmail } from '../../types';
import { useEmailClassifier } from '../../hooks/useEmailClassifier';
import { gmailService } from '../../services/gmailService';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import styles from './GmailEmailItem.module.css';

interface GmailEmailItemProps {
  email: GmailEmail;
  onClassificationComplete: (emailId: string, classification: 'Produtivo' | 'Improdutivo') => Promise<void>;
  onReplyGenerated: (result: any) => void;
  guidelines?: string;
  variant?: 'default' | 'compact';
  applyGmailTags?: boolean;
}

const GmailEmailItem: React.FC<GmailEmailItemProps> = ({ email, onClassificationComplete, onReplyGenerated, guidelines, variant = 'default', applyGmailTags = true }) => {
  const { error, classifyEmail, generateReplyGivenClassification } = useEmailClassifier();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [localClassification, setLocalClassification] = useState<'Produtivo' | 'Improdutivo' | null>(email.classification);
  const [explanation, setExplanation] = useState<string | undefined>(undefined);

  // Garante que o e-mail esteja classificado (e aplica tags se habilitado), retornando a classificação atual
  const ensureClassified = async (): Promise<'Produtivo' | 'Improdutivo'> => {
    let classification = localClassification || email.classification;
    if (!classification) {
      if (applyGmailTags) setIsAddingLabel(true);
      classification = await gmailService.classifyOnly({ body: email.body, subject: email.subject, guidelines });
      setLocalClassification(classification);
      await onClassificationComplete(email.id, classification);
    }
    return classification;
  };

  const handleExpand = async () => {
    const next = !isExpanded;
    setIsExpanded(next);
    // Removido: não classifica automaticamente ao expandir
  };

  const handleAnalyze = async () => {
    // Apenas classifica (aplica label se necessário) e busca motivo; não gera resposta.
    try {
      setIsAnalyzing(true);
      await ensureClassified();
      const analysis = await classifyEmail(email.body, email.subject);
      setExplanation(analysis?.explanation);
      setIsExpanded(true);
    } catch (err) {
      console.error('Erro ao analisar email:', err);
    } finally {
      setIsAddingLabel(false);
      setIsAnalyzing(false);
    }
  };

  const handleGenerateReply = async () => {
    try {
      setIsReplying(true);
      const classification = await ensureClassified();
      const r = await generateReplyGivenClassification(classification, email.body, email.subject);
      onReplyGenerated(r);
    } catch (err) {
      console.error('Erro ao gerar resposta:', err);
    } finally {
      setIsAddingLabel(false);
      setIsReplying(false);
    }
  };

  const getClassificationBadge = () => {
    const cls = localClassification || email.classification;
    if (cls) {
      const isProductive = cls === 'Produtivo';
      return (
        <span className={`${styles.badge} ${isProductive?styles.badgeProductive:styles.badgeUnproductive}`}>
          {isProductive ? '🎯' : '🚫'} {cls}
        </span>
      );
    }
    return null;
  };

  return (
    <div className={`${styles.item} ${!email.isRead ? styles.itemUnread : ''} ${variant==='compact'?styles.itemCompact:''}`}>
      <div className={styles.row}>
        <button type="button" className={styles.pill} onClick={handleExpand} aria-label={isExpanded? 'Recolher' : 'Expandir'}>
          <span className={`${styles.sender} ${!email.isRead ? styles.senderUnread : ''}`}>{email.sender}</span>
          <span className={`${styles.subject} ${!email.isRead ? styles.subjectUnread : ''}`}>{email.subject}</span>
          {getClassificationBadge()}
        </button>
        <div className={styles.right}>
          <button type="button" onClick={handleAnalyze} disabled={isAnalyzing || isAddingLabel} className={styles.primary}>
            {isAnalyzing || isAddingLabel ? <LoadingSpinner size="sm" /> : 'Analisar'}
          </button>
          <button type="button" onClick={handleGenerateReply} disabled={isReplying} className={styles.secondary}>
            {isReplying ? <LoadingSpinner size="sm" /> : 'Gerar Resposta'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.details}>
          {explanation && (
            <div className={styles.info} style={{marginTop:'.75rem'}}>
              Motivo: {explanation}
            </div>
          )}
          <h4 className={styles.detailsTitle}>Conteúdo Completo:</h4>
          <div className={styles.detailsBody}>
            {email.body || 'Conteúdo não disponível'}
          </div>
          <div style={{ marginTop: '1rem' }}>
            {error && (
              <div className={styles.error}>{error}</div>
            )}
            {isAddingLabel && (
              <div className={styles.info}>
                <LoadingSpinner size="sm" className="" />
                Adicionando tag ao email no Gmail...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GmailEmailItem;
