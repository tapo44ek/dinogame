from pydantic import BaseModel


class ScoreCreate(BaseModel):
    email: str
    points: int