
import React, { useState } from 'react';
import { ClassificationResult } from '../../types';
import { CopyIcon, CheckIcon } from '../icons';
import styles from './ResultCard.module.css';

interface ResultCardProps {
    result: ClassificationResult;
    onClose?: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(result.suggested_reply);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isProductive = result.classification === 'Produtivo';

        return (
                <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.title}>Resultado da Análise</h3>
                            {onClose && (
                                <button type="button" className={styles.closeInline} onClick={onClose} aria-label="Fechar">✕</button>
                            )}
                        </div>
            <div className={styles.section}>
                <span className={styles.label}>Classificação: </span>
                <span className={`${styles.badge} ${isProductive?styles.productive:styles.unproductive}`}>
                    {result.classification}
                </span>
            </div>
            {(!isProductive && result.explanation) && (
                <div className={styles.section}>
                    <label className={styles.mutedLabel}>Motivo</label>
                    <div className={styles.explanation}>
                        {result.explanation}
                    </div>
                </div>
            )}
            <div>
                <label htmlFor="suggested-reply" className={styles.mutedLabel}>Resposta Sugerida</label>
                <div style={{position:'relative'}}>
                    <textarea
                        id="suggested-reply"
                        rows={5}
                        readOnly
                        className={styles.textarea}
                        value={result.suggested_reply}
                    />
                    <button
                        type="button"
                        onClick={handleCopy}
                        className={styles.copyBtn}
                        aria-label="Copiar resposta"
                    >
                        {copied ? <CheckIcon className={styles.iconsm} /> : <CopyIcon className={styles.iconsm} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultCard;
