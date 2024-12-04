import re
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
async def start_game(email: str = Form(...)):
    pattern = r"^[a-zA-Z0-9._%+-]+@mos\.ru$"
    if not re.match(pattern, email):
        return HTMLResponse(content="""
                    <!DOCTYPE html>
                    <html>
                    <body>
                        <p style="color: red;">Email должен быть зарегистрирован на домене 2mos.ru</p>
                        <form action="/dinogame/start-game/" method="post">
                            <label for="email">Введите вашу почту:</label>
                            <input type="email" id="email" name="email" required>
                            <button type="submit">Начать игру</button>
                        </form>
                    </body>
                    </html>
                """, status_code=400)

    return RedirectResponse(url=f"/dinogame/game/?email={email}", status_code=303)


@router.get("/game/")
async def game(email: str, request: Request, db: Session = Depends(get_db)):
    # Получить текущий рекорд для данного email
    record = db.query(Score).filter(Score.email == email).first()
    max_score = db.query(func.max(Score.points)).scalar()
    highest_score = record.points if record else 0  # Если записи нет, рекорд = 0
    return templates.TemplateResponse(
        "game.html",
        {"request": request, "email": email, "highest_score": highest_score, "max_highest_score": max_score},
    )