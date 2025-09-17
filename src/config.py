import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://floatchat:floatchat123@127.0.0.1:5432/floatchat"
    
    # Vector Database
    CHROMA_PERSIST_DIR: str = "./data/vectordb"
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    
    # Data paths
    RAW_DATA_DIR: str = "./data/raw"
    PROCESSED_DATA_DIR: str = "./data/processed"
    
    # API
    API_HOST: str = "localhost"
    API_PORT: int = 8000
    
    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()
