from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FastAPI Modular App"
    database_url: str = "sqlite:///./app.db"

    class Config:
        env_file = ".env"

settings = Settings()