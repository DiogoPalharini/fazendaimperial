import json
from functools import lru_cache
from typing import Annotated

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

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

    DATABASE_URL: str = Field(..., alias='DATABASE_URL')

    FIRST_SYSTEM_ADMIN_EMAIL: str | None = None
    FIRST_SYSTEM_ADMIN_PASSWORD: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()

