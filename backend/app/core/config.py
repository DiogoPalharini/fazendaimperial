# backend/app/core/config.py
from functools import lru_cache
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from pathlib import Path

# Carrega o .env da raiz do projeto (3 níveis acima de app/core)
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

class Settings(BaseSettings):
    # Obrigatórias
    DATABASE_URL: str
    SECRET_KEY: str
    # FOCUS_NFE_TOKEN removido - usar token do banco (Group.focus_nfe_token)


    # JWT
    ALGORITHM: str = "HS256"                              # ← ESSA FALTAVA!
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Admin inicial (usado só na primeira execução)
    FIRST_SYSTEM_ADMIN_EMAIL: str | None = None
    FIRST_SYSTEM_ADMIN_PASSWORD: str | None = None

    # CORS e outras configs
    BACKEND_CORS_ORIGINS: list[str] = []
    FOCUS_NFE_AMBIENTE: str = "homologacao"
    APP_NAME: str = "Integra Rural API"
    API_V1_STR: str = "/api/v1"

    model_config = {
        "env_file": str(Path(__file__).resolve().parent.parent.parent / ".env"),
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

@lru_cache
def get_settings() -> Settings:
    return Settings()