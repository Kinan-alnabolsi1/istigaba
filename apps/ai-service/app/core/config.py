"""Service settings from environment variables (prefix AI_) or apps/ai-service/.env."""

from functools import lru_cache
from pathlib import Path
from typing import Final

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

#: The service binds to loopback only (apps/ai-service/CLAUDE.md). Not configurable on purpose.
BIND_HOST: Final = "127.0.0.1"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AI_", env_file=".env", extra="ignore")

    internal_key: SecretStr = SecretStr("")
    models_dir: Path | None = None
    model_version: str = "unset"


@lru_cache
def get_settings() -> Settings:
    return Settings()
