import React, { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  hideHeader?: boolean;
  fullScreen?: boolean;
  size?: 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, hideHeader, fullScreen = false, size = 'md' }) => {
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
  const dialogClass = fullScreen
    ? styles.dialogFull
    : size === 'xl'
      ? `${styles.dialog} ${styles.dialogXl}`
      : size === 'lg'
        ? `${styles.dialog} ${styles.dialogLg}`
        : styles.dialog;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={dialogClass} onClick={(e)=>e.stopPropagation()}>
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