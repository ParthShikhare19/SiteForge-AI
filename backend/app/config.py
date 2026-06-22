from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ai_website_gen"
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Mistral AI — text generation (free at console.mistral.ai)
    MISTRAL_API_KEY: str = ""
    MISTRAL_CHAT_MODEL: str = "mistral-large-latest"
    MISTRAL_FAST_MODEL: str = "mistral-small-latest"

    # Groq — audio transcription via Whisper (free at console.groq.com)
    GROQ_API_KEY: str = ""
    GROQ_WHISPER_MODEL: str = "whisper-large-v3"

    # Optional: free key at unsplash.com/developers
    UNSPLASH_ACCESS_KEY: str = ""

    # S3-compatible file storage (leave blank to use local disk)
    S3_BUCKET: str = ""
    S3_REGION: str = "us-east-1"
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_ENDPOINT_URL: str = ""  # leave blank for AWS; set for R2/MinIO

    # Redis for rate limiter (leave blank to use in-memory)
    REDIS_URL: str = ""

    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
