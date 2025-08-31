import os
from dotenv import load_dotenv

# Carrega sempre o .env da RAIZ do projeto
_ROOT_ENV = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir, os.pardir, '.env'))
load_dotenv(_ROOT_ENV, override=True)

# Variáveis de ambiente (usar apenas GEMINI_API_KEY)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# CORS: lista de origens permitidas separadas por vírgula.
# Use "*" para liberar geral (apenas DEV). Ex.: "http://localhost:5173,http://localhost:4173"
_cors_env = (os.getenv("CORS_ALLOWED_ORIGINS") or "http://localhost:5173").strip()
if _cors_env == "*":
    CORS_ALLOWED_ORIGINS: list[str] | str = "*"
else:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_env.split(",") if o.strip()]

# Porta e Debug - Render usa a variável PORT
PORT = int(os.getenv("PORT") or os.getenv("BACKEND_PORT") or 10000)
DEBUG = (os.getenv("FLASK_DEBUG") or os.getenv("DEBUG") or "false").lower() in {"1", "true", "yes", "on"}
