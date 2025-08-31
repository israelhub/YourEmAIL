import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGmail } from '../../hooks/useGmail';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { GoogleIcon } from '../../components/icons';
import styles from './GmailConnect.module.css';

const GmailConnect: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error, signIn } = useGmail();

  useEffect(() => {
    if (isAuthenticated) navigate('/gmail/inbox');
  }, [isAuthenticated, navigate]);

  const handleSignIn = async () => {
    await signIn();
    if (isAuthenticated) navigate('/gmail/inbox');
  };

  return (
    <div className={styles.center}>
      <h1 className={styles.title}>Integração com o Gmail</h1>
      <p className={styles.lead}>
        Conecte sua conta do Google para permitir que a IA analise e classifique seus emails diretamente da sua caixa de entrada.
      </p>

      <div className={styles.card}>
        <div className={styles.stepsWrap}>
          <h3 className={styles.howtoTitle}>Como funciona</h3>
          <ul className={styles.ul}>
            <li className={styles.li}><span className={styles.liIndex}>1</span>Conecte sua conta Google de forma segura</li>
            <li className={styles.li}><span className={styles.liIndex}>2</span>Visualize seus emails e os analise</li>
            <li className={styles.li}><span className={styles.liIndex}>3</span>Tags são adicionadas automaticamente no seu Gmail</li>
            <li className={styles.li}><span className={styles.liIndex}>4</span>Gere respostas automáticas para os emails que quiser</li>
          </ul>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button onClick={handleSignIn} disabled={isLoading} className={styles.googleBtn}>
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <GoogleIcon style={{ width: 20, height: 20, marginRight: 12 }} />
          )}
          {isLoading ? 'Conectando...' : 'Conectar com o Google'}
        </button>

        <p className={styles.finePrint}>
          Solicitaremos apenas permissão para ler e adicionar tags aos seus emails. Seus dados estão seguros e não são armazenados em nossos servidores.
        </p>
      </div>
    </div>
  );
};

export default GmailConnect;
