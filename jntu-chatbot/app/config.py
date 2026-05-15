from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    LLM_MODEL_NAME: str = "llama3-8b-8192" # qwen/qwen3-32b is often not valid depending on groq api update
    DATA_FILE: str = "data/exam_papers.txt"

    class Config:
        env_file = ".env"

settings = Settings()
