import React, { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  hideHeader?: boolean;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, hideHeader }) => {
  useEffect(() => {
    if (!open) return;
    
    // Previne scroll do body quando o modal estiver aberto
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.dialog} onClick={(e)=>e.stopPropagation()}>
    {!hideHeader && (
          <div className={styles.header}>
      <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Fechar">✕</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;