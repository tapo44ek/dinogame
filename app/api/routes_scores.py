from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from app.models.models import Score
from app.core.database import get_db
from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Score
from fastapi.templating import Jinja2Templates

templates = Jinja2Templates(directory="templates")

router = APIRouter()

import logging
logger = logging.getLogger(__name__)

@router.post("/save-score/")
async def save_score(email: str = Form(...), points: int = Form(...), db: Session = Depends(get_db)):
    # Найти существующий результат для email
    existing_score = db.query(Score).filter(Score.email == email).first()

    if existing_score:
        # Обновить результат, если новый больше
        if points > existing_score.points:
            existing_score.points = points
            db.commit()
            db.refresh(existing_score)
            return {"message": f"Результат обновлён: {points} очков!"}
        else:
            return {"message": "Новый результат ниже текущего, запись не обновлена."}
    else:
        # Создать новую запись, если email не найден
        new_score = Score(email=email, points=points)
        db.add(new_score)
        db.commit()
        db.refresh(new_score)
        return {"message": f"Результат добавлен: {points} очков!"}


@router.get("/ratings/")
async def ratings(request: Request, db: Session = Depends(get_db)):
    scores = db.query(Score).order_by(Score.points.desc()).all()
    return templates.TemplateResponse("ratings.html", {"request": request, "scores": scores, "enumerate": enumerate})