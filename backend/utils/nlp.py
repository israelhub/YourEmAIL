from __future__ import annotations

import re
from typing import List

try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.stem import RSLPStemmer
    _NLTK_AVAILABLE = True
except Exception:
    _NLTK_AVAILABLE = False


_PORTUGUESE_STOPWORDS: List[str] | None = None
_STEMMER: RSLPStemmer | None = None


def _ensure_nltk():
    global _PORTUGUESE_STOPWORDS, _STEMMER
    if not _NLTK_AVAILABLE:
        return
    try:
        # Tenta carregar, se falhar tenta baixar
        if _PORTUGUESE_STOPWORDS is None:
            try:
                _PORTUGUESE_STOPWORDS = stopwords.words('portuguese')
            except LookupError:
                nltk.download('stopwords', quiet=True)
                _PORTUGUESE_STOPWORDS = stopwords.words('portuguese')
        if _STEMMER is None:
            try:
                _STEMMER = RSLPStemmer()
            except LookupError:
                nltk.download('rslp', quiet=True)
                _STEMMER = RSLPStemmer()
    except Exception:
        # Em caso de erro, usa fallback simples sem NLTK
        _PORTUGUESE_STOPWORDS = []
        _STEMMER = None


def preprocess_text(text: str) -> str:
    """
    Limpa o texto aplicando:
    - lowercase
    - remoção de URLs, menções e caracteres não alfanuméricos (mantém acentos)
    - remoção de stopwords PT-BR (se disponível)
    - stemming RSLP (se disponível)
    """
    if not text:
        return ""

    _ensure_nltk()

    # Lowercase
    t = text.lower()

    # Remove URLs e menções
    t = re.sub(r"https?://\S+|www\.\S+", " ", t)
    t = re.sub(r"@[\w_]+", " ", t)

    # Mantém letras, números, espaços e acentos comuns
    t = re.sub(r"[^0-9a-zà-úãõâêîôûáéíóúç\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()

    tokens = t.split()

    if _PORTUGUESE_STOPWORDS:
        sw = set(_PORTUGUESE_STOPWORDS)
        tokens = [tok for tok in tokens if tok not in sw]

    if _STEMMER is not None:
        tokens = [_STEMMER.stem(tok) for tok in tokens]

    return " ".join(tokens)
