
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
        
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                setEmailText(e.target?.result as string);
            };
            reader.readAsText(file);
        } else if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
                try {
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let textContent = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const text = await page.getTextContent();
                        textContent += text.items.map((s: any) => s.str).join(' ');
                    }
                    setEmailText(textContent);
                } catch (pdfError) {
                    console.error('Error parsing PDF:', pdfError);
                    // setError from hook won't work here since it's outside the hook's flow
                    alert('Erro ao processar o arquivo PDF.');
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('Formato de arquivo não suportado. Use .txt ou .pdf.');
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
