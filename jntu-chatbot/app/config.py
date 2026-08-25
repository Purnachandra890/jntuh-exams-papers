from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    GROQ_API_KEY: str
    LLM_MODEL_NAME: str = "llama3-8b-8192"
    DATA_FILE: str = "data/exam_papers.txt"
    REDIS_URL: Optional[str] = None
    RATE_LIMIT_HOUR: Optional[int] = None
    RATE_LIMIT_DAY: Optional[int] = None

settings = Settings()

