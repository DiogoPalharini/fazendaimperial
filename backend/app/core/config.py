from functools import lru_cache
from typing import Annotated

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    APP_NAME: str = 'Imperial Platform API'
    API_V1_STR: str = '/api/v1'
    BACKEND_CORS_ORIGINS: Annotated[list[str], Field(default_factory=list)]

    SECRET_KEY: str = Field(..., min_length=32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(24 * 60, ge=15)
    ALGORITHM: str = 'HS256'

    DATABASE_URL: str = Field(..., alias='DATABASE_URL')

    FIRST_SYSTEM_ADMIN_EMAIL: str | None = None
    FIRST_SYSTEM_ADMIN_PASSWORD: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()

