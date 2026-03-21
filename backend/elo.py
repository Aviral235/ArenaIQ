from sqlalchemy.orm import Session
from database import ModelStat
from datetime import datetime

K = 32

def _expected(ra, rb): return 1.0 / (1.0 + 10 ** ((rb - ra) / 400))

def update_elo(db: Session, model_a: str, model_b: str, winner: str):
    def get_or_create(name):
        s = db.query(ModelStat).filter(ModelStat.model_name == name).first()
        if not s:
            s = ModelStat(model_name=name, elo_rating=1000.0)
            db.add(s); db.flush()
        return s

    sa = get_or_create(model_a)
    sb = get_or_create(model_b)
    ea = _expected(sa.elo_rating, sb.elo_rating)

    if winner == "a":   s1,s2=1,0; sa.wins+=1; sb.losses+=1
    elif winner == "b": s1,s2=0,1; sb.wins+=1; sa.losses+=1
    else:               s1,s2=.5,.5; sa.ties+=1; sb.ties+=1

    sa.elo_rating = round(sa.elo_rating + K*(s1 - ea),  1)
    sb.elo_rating = round(sb.elo_rating + K*(s2 - (1-ea)), 1)
    sa.total_battles += 1
    sb.total_battles += 1
    sa.updated_at = datetime.utcnow()
    sb.updated_at = datetime.utcnow()
    db.commit()


def get_leaderboard(db: Session):
    stats = db.query(ModelStat).order_by(ModelStat.elo_rating.desc()).all()
    return [{
        "rank":     i + 1,
        "model":    s.model_name,
        "elo":      s.elo_rating,
        "wins":     s.wins,
        "losses":   s.losses,
        "ties":     s.ties,
        "total":    s.total_battles,
        "win_rate": round(s.wins / max(s.total_battles, 1) * 100, 1),
    } for i, s in enumerate(stats)]
