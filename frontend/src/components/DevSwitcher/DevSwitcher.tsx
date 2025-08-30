import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDataSource } from '../../context/DataSourceContext';
import styles from './DevSwitcher.module.css';

const DevSwitcher: React.FC = () => {
  const { source, setSource } = useDataSource();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();


  const switchTo = (dst: 'google' | 'mock') => {
    setSource(dst);
    setOpen(false);
    // se estiver fora da inbox, manda para a rota correta
    if (dst === 'mock') {
      navigate('/gmail/inbox');
    } else {
      // volta para tela de conexão se não autenticado
      navigate('/gmail');
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        title="Dev Switcher"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir alternador de fonte de dados"
        style={{ right: 20, bottom: 20 }}
      >
        {source === 'google' ? 'G' : 'M'}
      </button>

      {open && (
        <div className={styles.menu} style={{ right: 20, bottom: 20 + 56 }}>
          <div className={styles.menuHeader}>Fonte de dados</div>
          <button type="button" className={styles.menuItem} onClick={() => switchTo('google')}>
            Conectar com Google
            {source === 'google' && <span className={styles.badge}>ativo</span>}
          </button>
          <button type="button" className={styles.menuItem} onClick={() => switchTo('mock')}>
            Conectar com base existente
            {source === 'mock' && <span className={styles.badge}>ativo</span>}
          </button>
          <div className={styles.hint}>Use para testar com dados mockados na Caixa de Entrada.</div>
        </div>
      )}
    </>
  );
};

export default DevSwitcher;
