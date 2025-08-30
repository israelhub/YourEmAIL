import React from 'react';
import Modal from '../Modal/Modal';
import styles from './GuidelinesModal.module.css';

interface GuidelinesModalProps {
  open: boolean;
  onClose: () => void;
  produtivoText: string;
  improdutivoText: string;
  setProdutivoText: (text: string) => void;
  setImprodutivoText: (text: string) => void;
  onSave: () => void;
  showGmailTags?: boolean;
  applyGmailTags?: boolean;
  setApplyGmailTags?: (apply: boolean) => void;
}

const GuidelinesModal: React.FC<GuidelinesModalProps> = ({
  open,
  onClose,
  produtivoText,
  improdutivoText,
  setProdutivoText,
  setImprodutivoText,
  onSave,
  showGmailTags = false,
  applyGmailTags = false,
  setApplyGmailTags,
}) => {
  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Personalizar Diretrizes</h3>
        <p className={styles.description}>
          Aqui você pode personalizar o que você acha produtivo e improdutivo. Se deixar em branco, nossa IA se baseará nos princípios originais dela.
        </p>
        
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>O que você considera Produtivo?</label>
            <textarea 
              className={styles.textarea} 
              rows={3} 
              value={produtivoText} 
              onChange={(e) => setProdutivoText(e.target.value)} 
              placeholder="Ex.: clientes, prazos, cobrança, propostas, reuniões, status." 
            />
          </div>
          
          <div className={styles.field}>
            <label className={styles.label}>O que você considera Improdutivo?</label>
            <textarea 
              className={styles.textarea} 
              rows={3} 
              value={improdutivoText} 
              onChange={(e) => setImprodutivoText(e.target.value)} 
              placeholder="Ex.: promoções, marketing, redes sociais, newsletter, spam." 
            />
          </div>
        </div>

        {showGmailTags && setApplyGmailTags && (
          <>
            <div className={styles.divider} />
            <div className={styles.field}>
              <span className={styles.label}>Aplicação de Tags no Gmail</span>
              <p className={styles.helper}>
                Quando ativado, a classificação aplicada aqui adicionará/removerá as tags diretamente na sua conta do Gmail. Quando desativado, as tags aparecerão apenas nesta interface, sem alterar nada no seu Gmail.
              </p>
              <label className={styles.switchRow}>
                <input 
                  type="checkbox" 
                  className={styles.switchInput} 
                  checked={applyGmailTags} 
                  onChange={(e) => setApplyGmailTags(e.target.checked)} 
                />
                <span className={styles.switchTrack}>
                  <span className={styles.switchThumb} />
                </span>
                <span className={styles.switchLabel}>Aplicar tags diretamente no Gmail</span>
              </label>
            </div>
          </>
        )}

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.saveBtn} onClick={handleSave}>
            Salvar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GuidelinesModal;
