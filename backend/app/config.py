import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GreenMetriX"
    PROJECT_TAGLINE: str = "Measure. Predict. Decarbonize."
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./greenmetrix.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "greenmetrix-secret-jwt-token-key-change-in-production-demo-32b")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini" if os.getenv("GEMINI_API_KEY") else "deterministic")
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", "./rag/vectorstore")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
