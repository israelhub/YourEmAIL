
import React, { useMemo, useState } from 'react';
import { useGmail } from '../../hooks/useGmail';
import { useGuidelines } from '../../hooks/useGuidelines';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import GmailEmailItem from '../../components/GmailEmailItem/GmailEmailItem';
import ResultCard from '../../components/ResultCard/ResultCard';
import GuidelinesModal from '../../components/GuidelinesModal/GuidelinesModal';
import { SearchIcon, CloseIcon } from '../../components/icons';
import Modal from '../../components/Modal/Modal';
import styles from './GmailClassifier.module.css';
import { gmailService } from '../../services/gmailService';

const GmailClassifier: React.FC = () => {
    const [bulkLoading, setBulkLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'Produtivo' | 'Improdutivo'>('all');
    const [query, setQuery] = useState('');
    const [showGuidelines, setShowGuidelines] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [applyGmailTags, setApplyGmailTags] = useState(true);
    const [replyResult, setReplyResult] = useState<any>(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    
    const { 
        isAuthenticated, 
        isLoading, 
        emails, 
        page,
        hasNextPage,
        hasPrevPage,
        error, 
        signOut, 
        refreshEmails,
        loadNextPage,
        loadPrevPage,
        addLabelToEmail, 
        updateClassificationLocal 
    } = useGmail();

    const { 
        guidelines, 
        produtivoText, 
        improdutivoText, 
        setProdutivoText, 
        setImprodutivoText, 
        saveGuidelines 
    } = useGuidelines();
    

    const filteredEmails = useMemo(() => {
        const byLabel = filter === 'all' ? emails : emails.filter(e => e.classification === filter);
        if (!query.trim()) return byLabel;
        const q = query.toLowerCase();
        return byLabel.filter(e =>
            e.subject?.toLowerCase().includes(q) ||
            e.sender?.toLowerCase().includes(q) ||
            e.snippet?.toLowerCase().includes(q)
        );
    }, [emails, filter, query]);

    // Garante que os emails sejam carregados quando o usuário entra já autenticado
    React.useEffect(() => {
        if (isAuthenticated && emails.length === 0 && !isLoading && !error) {
            refreshEmails();
        }
    }, [isAuthenticated, emails.length, isLoading, error, refreshEmails]);

    const handleRefresh = async () => {
        await refreshEmails();
    };

    const handleBulkAnalyze = async () => {
        // Classifica em lote os 20 e aplica label. Evita travar UI individualmente.
        try {
            setBulkLoading(true);
            const pageEmails = filteredEmails.slice(0, 20);
            const list = pageEmails.map(e => ({ id: e.id, subject: e.subject, body: e.body }));
            const map = await gmailService.classifyBatch(list, guidelines);
            // aplica labels de forma sequencial para não estourar cotas
            for (const e of pageEmails) {
                const cls = map[e.id];
                if (cls && e.classification !== cls) {
                    try {
                        if (applyGmailTags) {
                            await addLabelToEmail(e.id, cls);
                        } else {
                            updateClassificationLocal(e.id, cls);
                        }
                    } catch (err) {
                        console.error('Falha ao aplicar label para', e.id, err);
                    }
                }
            }
        } catch (err) {
            console.error('Falha na análise automática em lote:', err);
        } finally {
            setBulkLoading(false);
        }
    };

    const handleClassificationComplete = async (emailId: string, classification: 'Produtivo' | 'Improdutivo') => {
        try {
            if (applyGmailTags) {
                await addLabelToEmail(emailId, classification);
            } else {
                // Atualiza apenas no estado local (UI), sem chamar a API do Gmail
                updateClassificationLocal(emailId, classification);
            }
        } catch (err) {
            console.error('Erro ao adicionar label:', err);
            // O erro já é tratado no hook useGmail
        }
    };

    const handleReplyGenerated = (result: any) => {
        setReplyResult(result);
        setShowReplyModal(true);
    };

    if (!isAuthenticated) return null;

    

        return (
        <div className={styles.workspace}>
            {/* Sidebar desktop */}
            <aside className={styles.sidebar}>
                <div className={styles.searchBox}>
                    <SearchIcon className={styles.searchIcon} width={18} height={18} />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search"
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.sidebarGroup}>
                    <button onClick={() => setFilter('all')} className={`${styles.sideBtn} ${styles.sideBtnSm} ${filter==='all'?styles.sideBtnActive:''}`}>Todos</button>
                    <button onClick={() => setFilter('Produtivo')} className={`${styles.sideBtn} ${styles.sideBtnSm} ${filter==='Produtivo'?styles.sideBtnActive:''}`}>Produtivos</button>
                    <button onClick={() => setFilter('Improdutivo')} className={`${styles.sideBtn} ${styles.sideBtnSm} ${filter==='Improdutivo'?styles.sideBtnActive:''}`}>Improdutivos</button>
                </div>
                <div className={styles.sidebarFooter}>
                    <button onClick={signOut} className={`${styles.logoutBtn} ${styles.logoutBtnSm}`}>Desconectar</button>
                </div>
            </aside>

            {/* Drawer mobile */}
            {drawerOpen && <div className={`${styles.backdrop} ${styles.backdropShow}`} onClick={()=>setDrawerOpen(false)} />}
            <aside className={`${styles.sidebarDrawer} ${drawerOpen?styles.drawerOpen:''}`} aria-hidden={!drawerOpen}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <h3 style={{margin:0}}>Menu</h3>
                    <button className={styles.menuBtn} onClick={()=>setDrawerOpen(false)} aria-label="Fechar menu">
                        <CloseIcon className={styles.menuIcon} />
                    </button>
                </div>
                <div className={styles.sidebarGroup}>
                    <button onClick={() => {setFilter('all'); setDrawerOpen(false);}} className={`${styles.sideBtn} ${styles.sideBtnSm} ${filter==='all'?styles.sideBtnActive:''}`}>Todos</button>
                    <button onClick={() => {setFilter('Produtivo'); setDrawerOpen(false);}} className={`${styles.sideBtn} ${styles.sideBtnSm} ${filter==='Produtivo'?styles.sideBtnActive:''}`}>Produtivos</button>
                    <button onClick={() => {setFilter('Improdutivo'); setDrawerOpen(false);}} className={`${styles.sideBtn} ${styles.sideBtnSm} ${filter==='Improdutivo'?styles.sideBtnActive:''}`}>Improdutivos</button>
                </div>
                <div className={styles.divider} />
                <div className={styles.sidebarGroup} style={{marginTop:8}}>
                    <button onClick={() => { setShowGuidelines(true); setDrawerOpen(false); }} className={styles.ctaGhost}>Personalizar Diretrizes</button>
                </div>
                <div className={styles.divider} />
                <div className={styles.sidebarGroup}>
                    <button onClick={() => { setDrawerOpen(false); signOut(); }} className={styles.logoutBtn}>Desconectar</button>
                </div>
            </aside>

            {/* Main content */}
            <section className={styles.content}>
                <div className={styles.contentHeader}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                        <h1 className={styles.titleBoard}>Caixa de Entrada</h1>
                    </div>
                    {/* Desktop actions mantidas no header */}
                    <div className={styles.headerActions}>
                        <button onClick={handleBulkAnalyze} disabled={isLoading || bulkLoading} className={`${styles.ctaPrimary} ${styles.onlyDesktop}`}>
                            {bulkLoading ? <LoadingSpinner size="sm" /> : 'Analise Automatica'}
                        </button>
                        <button onClick={() => setShowGuidelines(true)} className={`${styles.ctaGhost} ${styles.onlyDesktop}`}>
                            Personalizar Diretrizes
                        </button>
                    </div>
                </div>

                {/* Ações móveis logo abaixo do título */}
                <div className={styles.titleActionsRow}>
                    <button onClick={handleBulkAnalyze} disabled={isLoading || bulkLoading} className={styles.ctaPrimary}>
                        {bulkLoading ? <LoadingSpinner size="sm" /> : 'Analise Automatica'}
                    </button>
                    <button onClick={()=>setDrawerOpen(true)} className={`${styles.menuTextBtn} ${styles.onlyMobile}`} aria-label="Abrir menu lateral">Menu</button>
                </div>

                {/* Busca fora do menu: ampla para todas as telas */}
                <div className={styles.searchBoxFull}>
                    <SearchIcon className={styles.searchIcon} width={18} height={18} />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search"
                        className={styles.searchInputFull}
                    />
                </div>

                {/* Secondary row with pager/refresh to manter funcionalidade */}
                <div className={styles.toolsRow}>
                    <div className={styles.pageInfo}>Página {page}</div>
                                <div className={styles.pager}>
                        <div className={styles.pagerBox}>
                            <button onClick={loadPrevPage} disabled={!hasPrevPage || isLoading} className={styles.pagerBtn} aria-label="Página anterior">◀</button>
                            <button onClick={loadNextPage} disabled={!hasNextPage || isLoading} className={styles.pagerBtn} aria-label="Próxima página">▶</button>
                        </div>
                    </div>
                </div>

                <GuidelinesModal
                    open={showGuidelines}
                    onClose={() => setShowGuidelines(false)}
                    produtivoText={produtivoText}
                    improdutivoText={improdutivoText}
                    setProdutivoText={setProdutivoText}
                    setImprodutivoText={setImprodutivoText}
                    onSave={saveGuidelines}
                    showGmailTags={true}
                    applyGmailTags={applyGmailTags}
                    setApplyGmailTags={setApplyGmailTags}
                />

            {/* Error display */}
            {error && (
                <div className={styles.banner}>
                    {error}
                </div>
            )}

            {/* Loading state */}
            {(isLoading && emails.length === 0) && (
                <div className={styles.centerPad}>
                    <LoadingSpinner size="lg" />
            <p className={styles.muted}>Carregando seus emails...</p>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && emails.length === 0 && (
                <div className={styles.centerPad}>
                    <p style={{fontSize:'1.125rem',color:'var(--gray-500)'}}>
                        Nenhum email encontrado na sua caixa de entrada.
                    </p>
                    <button
                        onClick={handleRefresh}
                        className={styles.tryAgain}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

                        {/* Email list */}
                        {isLoading && emails.length > 0 && (
                            <div className={styles.loadingHint}>Carregando mais emails...</div>
                        )}

                        {filteredEmails.length > 0 && (
                            <div className={styles.list}>
                            {filteredEmails.slice(0, 20).map((email) => (
                                    <GmailEmailItem
                                        key={email.id}
                                        email={email}
                                        guidelines={guidelines}
                                        onClassificationComplete={handleClassificationComplete}
                                        onReplyGenerated={handleReplyGenerated}
                                        applyGmailTags={applyGmailTags}
                                        variant="compact"
                                    />
                                ))}
                            </div>
                        )}
                        {!isLoading && filteredEmails.length === 0 && emails.length > 0 && (
                            <div className={styles.empty}>Nenhum email nesse filtro.</div>
                        )}
                </section>

                {/* Modal de resposta centralizado */}
                <Modal open={showReplyModal} onClose={() => setShowReplyModal(false)} hideHeader>
                    {replyResult && <ResultCard result={replyResult} onClose={() => setShowReplyModal(false)} />}
                </Modal>
        </div>
    );
};

export default GmailClassifier;
