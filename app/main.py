from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.api import routes_game, routes_scores
from app.core.database import Base, engine

app = FastAPI(title="FastAPI Dino Game")

# Создание таблиц базы данных
Base.metadata.create_all(bind=engine)

# Подключение статических файлов
app.mount("/static", StaticFiles(directory="static"), name="static")

# Подключение маршрутов
app.include_router(routes_game.router, tags=["Game"])
app.include_router(routes_scores.router, tags=["Scores"])