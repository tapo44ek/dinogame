from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    points = Column(Integer)