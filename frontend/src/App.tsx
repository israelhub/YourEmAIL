
import React from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import ManualClassifier from './pages/ManualClassifier/ManualClassifier';
import GmailConnect from './pages/GmailConnect/GmailConnect';
import GmailClassifier from './pages/GmailClassifier/GmailClassifier';
import { InboxIcon, GoogleIcon } from './components/icons';
import logo from './assets/logo.png';
import styles from './App.module.css';
import { DataSourceProvider } from './context/DataSourceContext';
import DevSwitcher from './components/DevSwitcher/DevSwitcher';

const App: React.FC = () => {
  return (
    <HashRouter>
      <DataSourceProvider>
        <div className={styles.app}>
          <header className={styles.header}>
            <nav className={styles.nav}>
              <div className={styles.navInner}>
                <div className={styles.brand}>
                  <img src={logo} alt="YourEmail" className={styles.logoImg} />
                </div>
                <div className={styles.links}>
                  <NavLink
                    to="/"
                    className={({ isActive }) => 
                      `${styles.navLink} ${isActive ? styles.active : styles.inactive}`
                    }
                  >
                    <InboxIcon className={styles.icon} />
                    Análise Manual
                  </NavLink>
                  <NavLink
                    to="/gmail"
                    className={({ isActive }) => 
                      `${styles.navLink} ${isActive ? styles.active : styles.inactive}`
                    }
                  >
                    <GoogleIcon className={styles.icon} />
                    Integração Gmail
                  </NavLink>
                </div>
              </div>
            </nav>
          </header>

          <main>
            <div className={styles.container}>
              <Routes>
                <Route path="/" element={<ManualClassifier />} />
                <Route path="/gmail" element={<GmailConnect />} />
                <Route path="/gmail/inbox" element={<GmailClassifier />} />
              </Routes>
            </div>
          </main>
          
          <DevSwitcher />
        </div>
      </DataSourceProvider>
    </HashRouter>
  );
};

export default App;
