import re
from fastapi.responses import JSONResponse
from fastapi.responses import HTMLResponse
from fastapi import Form, HTTPException
from fastapi import APIRouter, Form, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from app.models.models import Score
from app.core.database import get_db
from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Score
from fastapi.templating import Jinja2Templates
from sqlalchemy.sql import func

templates = Jinja2Templates(directory="templates")
router = APIRouter()


@router.get("/")
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@router.post("/start-game/")
async def start_game(email: str = Form(...), db: Session = Depends(get_db)):
    email = email.lower()
    pattern = r"^[a-zA-Z0-9._%+-]+@mos\.ru$"
    if not re.match(pattern, email):
        # Возвращаем JSON-ответ с ошибкой
        return JSONResponse(
            content={"detail": "Введите почту @mos.ru"},
            status_code=400,
        )

    try:
        # Проверка существования записи с указанным email
        existing_record = db.query(Score).filter(Score.email == email).first()
        if not existing_record:
            # Если записи нет, добавляем новую
            new_score = Score(email=email, points=0)
            db.add(new_score)
            db.commit()
            print("Запись успешно добавлена!")
        else:
            print("Запись с таким email уже существует.")
    except Exception as e:
        db.rollback()  # Откат транзакции в случае ошибки
        db.close()
        return JSONResponse(
            content={"detail": f"Ошибка: {e}"},
            status_code=400,
        )

    finally:
        db.close()

    return RedirectResponse(url=f"/dinogame/game/?email={email}", status_code=303)


@router.get("/game/")
async def game(email: str, request: Request, db: Session = Depends(get_db)):
    email = email.lower()
    # Получить текущий рекорд для данного email
    record = db.query(Score).filter(Score.email == email).first()
    max_score = db.query(func.max(Score.points)).scalar()
    highest_score = record.points if record else 0  # Если записи нет, рекорд = 0
    existing_record = db.query(Score).filter(Score.email == email).first()
    if not existing_record:
        return JSONResponse(
            content={"detail": f"А эту дырку я закрыл, лол"},
            status_code=400,
        )
    return templates.TemplateResponse(
        "game.html",
        {"request": request, "email": email, "highest_score": highest_score, "max_highest_score": max_score},
    )