"""
ArenaIQ — FastAPI Backend
Run:  python main.py
Docs: http://localhost:8000/docs
"""

import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

from database import get_db, init_db, Battle, Vote, ModelStat
from model import predict, load_model
from llm_clients import battle as llm_battle, get_model_list, call_llm, DEFAULT_MODEL_A, DEFAULT_MODEL_B
from elo import update_elo, get_leaderboard

app = FastAPI(title="ArenaIQ API", version="2.0.0",
              description="Human Preference Intelligence Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    load_model()
    print("🚀 ArenaIQ backend running on http://localhost:8000")
    print("📖 API docs at http://localhost:8000/docs")


# ── Pydantic schemas ──────────────────────────────────────────────────────────
class BattleReq(BaseModel):
    prompt:  str
    model_a: str = DEFAULT_MODEL_A
    model_b: str = DEFAULT_MODEL_B

class PredictReq(BaseModel):
    prompt:     str
    response_a: str
    response_b: str
    model_a:    str = "unknown"
    model_b:    str = "unknown"

class ArenaVoteReq(BaseModel):
    battle_id: int
    winner:    str   # "a", "b", "tie"

class HumanVoteReq(BaseModel):
    battle_id:  Optional[int] = None
    prompt:     str
    response_a: str
    response_b: str
    winner:     str
    model_a:    str = "unknown"
    model_b:    str = "unknown"

class OptimizeReq(BaseModel):
    response:     str
    prompt:       str
    target_model: str = DEFAULT_MODEL_B   # Use Groq by default (faster)


# ── Health & info ─────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "online", "app": "ArenaIQ", "version": "2.0.0"}

@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}

@app.get("/models")
def models():
    return {"models": get_model_list()}


# ── Arena: battle + predict + vote ────────────────────────────────────────────
@app.post("/arena/battle")
async def arena_battle(req: BattleReq, db: Session = Depends(get_db)):
    """Send prompt to two LLMs in parallel, run ML prediction, save to DB"""
    if req.model_a == req.model_b:
        raise HTTPException(400, "model_a and model_b must be different")

    responses = await llm_battle(req.prompt, req.model_a, req.model_b)
    pred      = predict(req.prompt, responses["response_a"], responses["response_b"])

    b = Battle(
        prompt=req.prompt,
        response_a=responses["response_a"],
        response_b=responses["response_b"],
        model_a=responses["model_a"],
        model_b=responses["model_b"],
        prob_a=pred["prob_a"],
        prob_b=pred["prob_b"],
        prob_tie=pred["prob_tie"],
        predicted_winner=pred["predicted_winner"],
        explanation=pred["explanation"],
        shap_features=pred["shap_features"],
    )
    db.add(b); db.commit(); db.refresh(b)
    return {"battle_id": b.id, "prompt": req.prompt, **responses, **pred}


@app.post("/arena/predict")
def arena_predict(req: PredictReq, db: Session = Depends(get_db)):
    """Predict winner for manually supplied responses (no LLM calls)"""
    pred = predict(req.prompt, req.response_a, req.response_b)
    b = Battle(
        prompt=req.prompt,
        response_a=req.response_a,
        response_b=req.response_b,
        model_a=req.model_a,
        model_b=req.model_b,
        prob_a=pred["prob_a"],
        prob_b=pred["prob_b"],
        prob_tie=pred["prob_tie"],
        predicted_winner=pred["predicted_winner"],
        explanation=pred["explanation"],
        shap_features=pred["shap_features"],
    )
    db.add(b); db.commit(); db.refresh(b)
    return {"battle_id": b.id, **pred}


@app.post("/arena/vote")
def arena_vote(req: ArenaVoteReq, db: Session = Depends(get_db)):
    """Record human vote on a battle — updates ELO"""
    b = db.query(Battle).filter(Battle.id == req.battle_id).first()
    if not b:
        raise HTTPException(404, "Battle not found")
    b.human_vote         = req.winner
    b.prediction_correct = (b.predicted_winner == req.winner)
    db.commit()
    if b.model_a not in ("unknown","") and b.model_b not in ("unknown",""):
        update_elo(db, b.model_a, b.model_b, req.winner)
    return {"message": "Vote recorded", "prediction_was_correct": b.prediction_correct}


# ── Vote mode ─────────────────────────────────────────────────────────────────
@app.post("/vote")
def submit_vote(req: HumanVoteReq, db: Session = Depends(get_db)):
    """Standalone vote mode — no ML prediction needed"""
    v = Vote(
        battle_id=req.battle_id,
        prompt=req.prompt,
        response_a=req.response_a,
        response_b=req.response_b,
        winner=req.winner,
        model_a=req.model_a,
        model_b=req.model_b,
    )
    db.add(v); db.commit(); db.refresh(v)
    if req.model_a not in ("unknown","") and req.model_b not in ("unknown",""):
        update_elo(db, req.model_a, req.model_b, req.winner)
    return {"message": "Vote saved", "vote_id": v.id}


# ── Optimizer ─────────────────────────────────────────────────────────────────
@app.post("/optimize")
async def optimize(req: OptimizeReq):
    """Rewrite a response to maximize predicted win probability"""
    placeholder  = "I don't know."
    orig         = predict(req.prompt, req.response, placeholder)
    orig_prob    = orig["prob_a"]

    enhance_prompt = f"""You are an expert at making AI responses more persuasive to human evaluators.

Original prompt asked: {req.prompt}

Original response to improve: {req.response}

Rewrite this response to maximize its chance of winning in a human preference comparison.
Apply these research-backed tactics (based on analysis of 55,000 human votes):
1. Make it 30-50% longer with more detail and concrete examples
2. Add bullet points or numbered lists where appropriate
3. Use clear headers (##) if the response is long
4. Improve readability — simple, clear sentences
5. Directly address ALL parts of the original prompt
6. Add a brief summary or conclusion at the end

Return ONLY the improved response. No preamble, no meta-commentary."""

    optimized = await call_llm(enhance_prompt, req.target_model)
    opt        = predict(req.prompt, optimized, placeholder)

    return {
        "original_response":   req.response,
        "optimized_response":  optimized,
        "original_win_prob":   round(orig_prob, 3),
        "optimized_win_prob":  round(opt["prob_a"], 3),
        "improvement_pct":     round((opt["prob_a"] - orig_prob) * 100, 1),
        "explanation":         opt["explanation"],
    }


# ── Stats & history ───────────────────────────────────────────────────────────
@app.get("/stats")
def stats(db: Session = Depends(get_db)):
    total    = db.query(Battle).count()
    votes    = db.query(Vote).count()
    voted_b  = db.query(Battle).filter(Battle.human_vote != None).count()
    correct  = db.query(Battle).filter(Battle.prediction_correct == True).count()
    wins_a   = db.query(Battle).filter(Battle.predicted_winner == "a").count()
    wins_b   = db.query(Battle).filter(Battle.predicted_winner == "b").count()
    wins_t   = db.query(Battle).filter(Battle.predicted_winner == "tie").count()
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent   = db.query(Battle).filter(Battle.created_at >= week_ago).count()
    return {
        "total_battles":    total,
        "total_votes":      votes,
        "voted_battles":    voted_b,
        "accuracy_pct":     round(correct / max(voted_b, 1) * 100, 1),
        "recent_battles_7d": recent,
        "win_distribution": {"model_a": wins_a, "model_b": wins_b, "tie": wins_t},
        "bias_findings":    {
            "verbosity_bias_pct":    58,
            "position_bias_pct":     54,
            "structure_multiplier":  2.3,
            "tie_rate_pct":          12,
        },
    }


@app.get("/history")
def history(limit: int = 20, offset: int = 0, db: Session = Depends(get_db)):
    battles = db.query(Battle).order_by(Battle.created_at.desc()).offset(offset).limit(limit).all()
    return {
        "total": db.query(Battle).count(),
        "battles": [{
            "id":               b.id,
            "prompt":           b.prompt[:120] + ("..." if len(b.prompt) > 120 else ""),
            "model_a":          b.model_a,
            "model_b":          b.model_b,
            "predicted_winner": b.predicted_winner,
            "human_vote":       b.human_vote,
            "prob_a":           b.prob_a,
            "prob_b":           b.prob_b,
            "prob_tie":         b.prob_tie,
            "explanation":      b.explanation,
            "correct":          b.prediction_correct,
            "created_at":       b.created_at.isoformat(),
        } for b in battles],
    }


@app.get("/leaderboard")
def leaderboard(db: Session = Depends(get_db)):
    return {"leaderboard": get_leaderboard(db)}


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
