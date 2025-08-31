
import React, { useState, useCallback, useRef } from 'react';
import { useEmailClassifier } from '../../hooks/useEmailClassifier';
import { useGuidelines } from '../../hooks/useGuidelines';
import { useDropdown } from '../../hooks/useDropdown';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import ResultCard from '../../components/ResultCard/ResultCard';
import Modal from '../../components/Modal/Modal';
import GuidelinesModal from '../../components/GuidelinesModal/GuidelinesModal';
import { UploadIcon, ClearIcon, PlusIcon, SettingsIcon } from '../../components/icons';
import styles from './ManualClassifier.module.css';

declare const pdfjsLib: any;

const ManualClassifier: React.FC = () => {
    const [emailText, setEmailText] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showGuidelines, setShowGuidelines] = useState(false);
    
    const { isLoading, error, result, classifyEmail, reset } = useEmailClassifier();
    const { 
        guidelines, 
        produtivoText, 
        improdutivoText, 
        setProdutivoText, 
        setImprodutivoText, 
        saveGuidelines 
    } = useGuidelines();
    const { isOpen: showDropdown, toggle: toggleDropdown, close: closeDropdown, dropdownRef } = useDropdown();
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fechar dropdown quando clicar fora - já está no hook useDropdown

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        resetState();
        setFileName(file.name);
        
        try {
            if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    if (content) {
                        setEmailText(content);
                    } else {
                        alert('Erro: arquivo de texto vazio ou não pôde ser lido.');
                        setFileName(null);
                    }
                };
                reader.onerror = () => {
                    alert('Erro ao ler o arquivo de texto.');
                    setFileName(null);
                };
                reader.readAsText(file);
            } else if (file.type === 'application/pdf') {
                // Verificar se o PDF.js está disponível
                if (typeof pdfjsLib === 'undefined') {
                    alert('Erro: PDF.js não foi carregado. Recarregue a página e tente novamente.');
                    setFileName(null);
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    if (!arrayBuffer) {
                        alert('Erro ao ler o arquivo PDF.');
                        setFileName(null);
                        return;
                    }
                    
                    try {
                        const typedArray = new Uint8Array(arrayBuffer);
                        const pdf = await pdfjsLib.getDocument(typedArray).promise;
                        let textContent = '';
                        
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const text = await page.getTextContent();
                            textContent += text.items.map((s: any) => s.str || '').join(' ') + '\n';
                        }
                        
                        if (textContent.trim()) {
                            setEmailText(textContent.trim());
                        } else {
                            alert('Aviso: O PDF não contém texto legível ou está vazio.');
                            setEmailText('');
                        }
                    } catch (pdfError) {
                        console.error('Error parsing PDF:', pdfError);
                        alert(`Erro ao processar o arquivo PDF: ${pdfError.message || 'Arquivo pode estar corrompido ou protegido.'}`);
                        setFileName(null);
                    }
                };
                reader.onerror = () => {
                    alert('Erro ao ler o arquivo PDF.');
                    setFileName(null);
                };
                reader.readAsArrayBuffer(file);
            } else {
                alert('Formato de arquivo não suportado. Use apenas arquivos .txt ou .pdf.');
                setFileName(null);
            }
        } catch (generalError) {
            console.error('General file processing error:', generalError);
            alert('Erro inesperado ao processar o arquivo. Tente novamente.');
            setFileName(null);
        }
    }, []);

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        resetState();
        setEmailText(event.target.value);
    };

    const resetState = () => {
        setFileName(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        reset();
    };

    const handleClear = () => {
        setEmailText('');
        resetState();
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        classifyEmail(emailText, undefined, guidelines);
        setShowModal(true);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
        closeDropdown();
    };

    const handleGuidelinesClick = () => {
        setShowGuidelines(true);
        closeDropdown();
    };

    return (
        <div className={styles.page}>
            <div className={styles.titleWrap}>
                <h1 className={styles.title}>Cole o corpo do seu e-mail ou faça upload do arquivo, e receba em instantes a sua classificação e uma sugestão de resposta — rápida, prática e sem complicação.</h1>
            </div>

            <div className={styles.card}>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email-content" className={styles.label}>Conteúdo do Email</label>
                        <textarea
                            id="email-content"
                            rows={10}
                            className={styles.textarea}
                            placeholder="Cole o corpo do seu e-mail aqui..."
                            value={emailText}
                            onChange={handleTextChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={styles.row}>
                        <div style={{display:'inline-flex',alignItems:'center',position:'relative'}} ref={dropdownRef}>
                           <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".txt,.pdf"
                                className="hidden"
                                id="file-upload"
                                disabled={isLoading}
                           />
                           
                           <button 
                                type="button"
                                onClick={toggleDropdown}
                                className={styles.plusButton}
                                disabled={isLoading}
                           >
                               <PlusIcon style={{width:20,height:20}} />
                           </button>

                           {showDropdown && (
                                <div className={styles.dropdown}>
                                    <button 
                                        type="button" 
                                        onClick={handleUploadClick}
                                        className={styles.dropdownItem}
                                        disabled={isLoading}
                                    >
                                        <UploadIcon className={styles.dropdownIcon} />
                                        Upload (.txt, .pdf)
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleGuidelinesClick}
                                        className={styles.dropdownItem}
                                        disabled={isLoading}
                                    >
                                        <SettingsIcon className={styles.dropdownIcon} />
                                        Personalizar Diretrizes
                                    </button>
                                </div>
                           )}

                           {fileName && <span className={styles.fileName}>{fileName}</span>}
                        </div>
                        <div className={styles.buttons}>
                             {emailText && (
                                <button type="button" onClick={handleClear} disabled={isLoading} className={styles.clearBtn}>
                                    <ClearIcon style={{width:20,height:20,marginRight:8}} />
                                    Limpar
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading || !emailText}
                                className={styles.submitBtn}
                            >
                                {isLoading ? <LoadingSpinner /> : 'Analisar Email'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className={styles.results}>
                {error && <div className={styles.alert} role="alert">{error}</div>}
            </div>
            <Modal open={!!result && showModal} onClose={() => setShowModal(false)}>
                {result && <ResultCard result={result} />}
            </Modal>

            <GuidelinesModal
                open={showGuidelines}
                onClose={() => setShowGuidelines(false)}
                produtivoText={produtivoText}
                improdutivoText={improdutivoText}
                setProdutivoText={setProdutivoText}
                setImprodutivoText={setImprodutivoText}
                onSave={saveGuidelines}
            />
        </div>
    );
};

export default ManualClassifier;
