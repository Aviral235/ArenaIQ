from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./arenaiq.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Battle(Base):
    __tablename__ = "battles"
    id                 = Column(Integer, primary_key=True, index=True)
    prompt             = Column(Text)
    response_a         = Column(Text)
    response_b         = Column(Text)
    model_a            = Column(String(100), default="unknown")
    model_b            = Column(String(100), default="unknown")
    prob_a             = Column(Float, default=0.33)
    prob_b             = Column(Float, default=0.33)
    prob_tie           = Column(Float, default=0.33)
    predicted_winner   = Column(String(10), default="tie")
    human_vote         = Column(String(10), nullable=True)
    prediction_correct = Column(Boolean, nullable=True)
    explanation        = Column(Text, nullable=True)
    shap_features      = Column(Text, nullable=True)
    created_at         = Column(DateTime, default=datetime.utcnow)


class Vote(Base):
    __tablename__ = "votes"
    id         = Column(Integer, primary_key=True, index=True)
    battle_id  = Column(Integer, nullable=True)
    prompt     = Column(Text)
    response_a = Column(Text)
    response_b = Column(Text)
    winner     = Column(String(10))
    model_a    = Column(String(100), default="unknown")
    model_b    = Column(String(100), default="unknown")
    created_at = Column(DateTime, default=datetime.utcnow)


class ModelStat(Base):
    __tablename__ = "model_stats"
    id            = Column(Integer, primary_key=True, index=True)
    model_name    = Column(String(100), unique=True, index=True)
    elo_rating    = Column(Float, default=1000.0)
    wins          = Column(Integer, default=0)
    losses        = Column(Integer, default=0)
    ties          = Column(Integer, default=0)
    total_battles = Column(Integer, default=0)
    updated_at    = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Database ready (SQLite)")
