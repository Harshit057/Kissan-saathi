"""
FastAPI configuration settings for KisanSaathi & आपनGaon
"""

from typing import Optional
from pydantic_settings import BaseSettings
import os
from functools import lru_cache


class Settings(BaseSettings):
    """Application Settings"""
    
    # Core Settings
    APP_NAME: str = "KisanSaathi API"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    VERSION: str = "0.1.0"
    
    # API Configuration
    API_V1_STR: str = "/api/v1"
    ALLOWED_HOSTS: list = ["localhost", "127.0.0.1", "*"]
    
    # Database Configuration
    # Use SQLite for local development, PostgreSQL for production
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./kisaan_saathi.db"  # Local SQLite for development
    )
    SQLALCHEMY_POOL_SIZE: int = 10
    SQLALCHEMY_MAX_OVERFLOW: int = 20
    SQLALCHEMY_POOL_PRE_PING: bool = True
    
    # Redis Configuration
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = os.getenv("REDIS_PASSWORD")
    REDIS_URL: str = f"redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}"
    
    # Celery Configuration
    CELERY_BROKER_URL: str = REDIS_URL
    CELERY_RESULT_BACKEND: str = REDIS_URL
    
    # JWT Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Security & CORS
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]
    
    # External API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    BHASHINI_API_KEY: str = os.getenv("BHASHINI_API_KEY", "")
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "")
    SHIPROCKET_API_TOKEN: str = os.getenv("SHIPROCKET_API_TOKEN", "")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "kisaan-saathi")
    
    # Firebase Configuration
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    FIREBASE_PRIVATE_KEY: str = os.getenv("FIREBASE_PRIVATE_KEY", "")
    
    # Twilio Configuration (SMS)
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    
    # Vector Database (Qdrant)
    QDRANT_HOST: str = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT: int = int(os.getenv("QDRANT_PORT", "6333"))
    QDRANT_API_KEY: Optional[str] = os.getenv("QDRANT_API_KEY")
    
    # AI/ML Configuration
    EMBEDDING_MODEL: str = "sentence-transformers/indic-SBERT"
    LLM_MODEL: str = "gpt-4o"
    MAX_TOKENS: int = 2048
    TEMPERATURE: float = 0.7
    
    # Application Logic
    NEARBY_FARMERS_RADIUS_KM: int = 100
    REGIONAL_ORGANIC_RADIUS_KM: int = 300
    MANDI_PRICE_CACHE_TTL_HOURS: int = 1
    SCHEME_DATA_CACHE_TTL_HOURS: int = 24
    
    # Sentry Configuration
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get application settings (cached)"""
    return Settings()
