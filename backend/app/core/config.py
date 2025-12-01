import json
from pathlib import Path
import os
from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Caminho absoluto do .env (monorepo com backend/ na subpasta)
# backend/app/core/config.py -> app/core/ -> app/ -> backend/ -> fazendaimperial/ (raiz)
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
ENV_PATH = BASE_DIR / ".env"

# ==================== CARREGAMENTO DO .env 100% À PROVA DE BALA ====================
if not ENV_PATH.exists():
    raise FileNotFoundError(f"❌ .env não encontrado em: {ENV_PATH}")

print(f"\n✅ Carregando .env de: {ENV_PATH}")

with open(ENV_PATH, "r", encoding="utf-8") as f:
    for line_num, raw_line in enumerate(f, 1):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue

        # Remove espaços em volta do =
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        if not key:
            continue

        os.environ[key] = value
        print(f"   {key} = {value[:40]}{'...' if len(value) > 40 else ''}")

print(f"✅ .env carregado com sucesso!\n")

# ==================== Settings com pydantic-settings ====================

class Settings(BaseSettings):
    APP_NAME: str = 'IntegraRural Platform API'
    API_V1_STR: str = '/api/v1'
    BACKEND_CORS_ORIGINS: Annotated[list[str], Field(default_factory=list)]

    @field_validator('BACKEND_CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v if isinstance(v, list) else []

    SECRET_KEY: str = Field(..., min_length=32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(24 * 60, ge=15)
    ALGORITHM: str = 'HS256'

    DATABASE_URL: str = Field(...)

    FIRST_SYSTEM_ADMIN_EMAIL: str | None = None
    FIRST_SYSTEM_ADMIN_PASSWORD: str | None = None

    # Focus NFe Configuration
    FOCUS_NFE_TOKEN: str = Field(..., description='Token de autenticação Focus NFe')
    FOCUS_NFE_AMBIENTE: str = Field(default='homologacao', description='Ambiente: homologacao ou producao')

    model_config = SettingsConfigDict(
        env_file=None,  # ← TOTALMENTE DESATIVADO
        env_file_encoding='utf-8',
        extra='ignore',
        case_sensitive=False,
    )


@lru_cache()
def get_settings() -> Settings:
    print("🔍 get_settings() chamado → criando Settings...")
    print(f"   Verificando DATABASE_URL: {'SIM' if os.getenv('DATABASE_URL') else 'NÃO'}")
    if os.getenv('DATABASE_URL'):
        print(f"   Valor: {os.getenv('DATABASE_URL')[:50]}...")
    settings = Settings()
    print(f"✅ Settings criado com sucesso!")
    return settings


# Função para limpar cache (útil em desenvolvimento)
def clear_settings_cache():
    get_settings.cache_clear()
