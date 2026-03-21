"""
model.py — ML inference engine
Loads a trained LightGBM model if available.
Falls back to heuristic scoring (no model needed to run the app).
"""

import os, re, json
import numpy as np
from dotenv import load_dotenv
load_dotenv()

# Optional imports with graceful fallback
try:
    import lightgbm as lgb
    import pickle
    LGB_OK = True
except ImportError:
    LGB_OK = False

try:
    import textstat
    TS_OK = True
except ImportError:
    TS_OK = False

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    _vader = SentimentIntensityAnalyzer()
    VADER_OK = True
except ImportError:
    VADER_OK = False

MODEL_PATH = os.getenv("MODEL_PATH", "../ml/model.pkl")
_model = None


def load_model():
    global _model
    if not LGB_OK:
        print("⚠️  LightGBM not installed — using heuristic scoring")
        return
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        print(f"✅ ML model loaded from {MODEL_PATH}")
    else:
        print("⚠️  No model.pkl found — using heuristic scoring")
        print("   (Train the model: cd ml && python train.py)")


# ── Feature helpers ───────────────────────────────────────────────────────────
def _bullets(t):  return len(re.findall(r'(?m)^[\s]*[-*•]\s', t))
def _code(t):     return len(re.findall(r'```', t)) // 2
def _headers(t):  return len(re.findall(r'(?m)^#{1,4}\s', t))

def _readability(t):
    if TS_OK and len(t.split()) > 5:
        try: return textstat.flesch_reading_ease(t)
        except: pass
    return 50.0

def _sentiment(t):
    return _vader.polarity_scores(t)['compound'] if VADER_OK else 0.0

def _coverage(prompt, response):
    pw = set(prompt.lower().split())
    rw = set(response.lower().split())
    return len(pw & rw) / max(len(pw), 1)

FEAT_NAMES = [
    "len_a","len_b","len_diff","len_ratio",
    "word_a","word_b","word_diff","word_ratio",
    "read_a","read_b","read_diff",
    "senti_a","senti_b","senti_diff",
    "bullet_a","bullet_b","bullet_diff",
    "code_a","code_b","code_diff",
    "header_a","header_b","header_diff",
    "cov_a","cov_b","cov_diff",
    "q_a","q_b","len_p","word_p",
]


def _extract(prompt, ra, rb):
    la, lb = len(ra), len(rb)
    wa, wb = len(ra.split()), len(rb.split())
    return np.array([
        la, lb, lb-la, lb/(la+1),
        wa, wb, wb-wa, wb/(wa+1),
        _readability(ra), _readability(rb), _readability(rb)-_readability(ra),
        _sentiment(ra), _sentiment(rb), _sentiment(rb)-_sentiment(ra),
        _bullets(ra), _bullets(rb), _bullets(rb)-_bullets(ra),
        _code(ra), _code(rb), _code(rb)-_code(ra),
        _headers(ra), _headers(rb), _headers(rb)-_headers(ra),
        _coverage(prompt,ra), _coverage(prompt,rb), _coverage(prompt,rb)-_coverage(prompt,ra),
        ra.count('?'), rb.count('?'),
        len(prompt), len(prompt.split()),
    ], dtype=np.float32).reshape(1, -1)


def _heuristic(prompt, ra, rb):
    """Rule-based scoring based on known human preference biases"""
    f = _extract(prompt, ra, rb)[0]
    score = 0.0
    # Verbosity bias (+/- based on length ratio)
    lr = f[3]
    if lr > 1.3:   score += 0.12
    elif lr < 0.77: score -= 0.12
    # Structure bias
    score += min(float(f[16]) * 0.04, 0.10)
    # Code bias
    score += float(f[19]) * 0.05
    # Coverage bias
    score += float(f[25]) * 0.08
    p_b   = float(np.clip(0.35 + score, 0.10, 0.78))
    p_tie = 0.12
    p_a   = max(0.10, 1.0 - p_b - p_tie)
    total = p_a + p_b + p_tie
    return p_a/total, p_b/total, p_tie/total


def _importance(f):
    imp = {
        "Length Difference": abs(float(f[2])) / 500,
        "Bullet Points (B)": float(f[15]) * 0.3,
        "Code Blocks (B)":   float(f[18]) * 0.4,
        "Prompt Coverage":   float(f[25]) * 0.5,
        "Readability Diff":  abs(float(f[10])) / 100,
    }
    top = sorted(imp.items(), key=lambda x: abs(x[1]), reverse=True)[:4]
    return json.dumps([{"feature": k, "value": round(v, 3)} for k, v in top])


def _explain(f, winner, pa, pb, ptie):
    labels = {"a": "Response A", "b": "Response B", "tie": "Neither"}
    conf   = max(pa, pb, ptie)
    parts  = [f"{labels[winner]} is predicted to win ({conf*100:.0f}% confidence)."]
    if abs(f[2]) > 100:
        longer = "B" if f[2] > 0 else "A"
        parts.append(f"Response {longer} is {abs(int(f[2]))} chars longer — verbosity bias favors it.")
    bd = int(f[16])
    if bd > 0:   parts.append(f"Response B uses {int(f[15])} bullet point(s) — structure strongly boosts preference.")
    elif bd < 0: parts.append(f"Response A uses {int(f[14])} bullet point(s) — structure strongly boosts preference.")
    cd = int(f[19])
    if cd != 0:  parts.append(f"Response {'B' if cd>0 else 'A'} contains code blocks, which raises perceived quality.")
    if len(parts) == 1:
        parts.append("Both responses are similar in structure — outcome uncertain.")
    return " ".join(parts)


def predict(prompt: str, ra: str, rb: str) -> dict:
    feats = _extract(prompt, ra, rb)
    if _model is not None:
        try:
            probs = _model.predict_proba(feats)[0]
            p_a, p_b, p_tie = float(probs[0]), float(probs[1]), float(probs[2])
        except Exception:
            p_a, p_b, p_tie = _heuristic(prompt, ra, rb)
    else:
        p_a, p_b, p_tie = _heuristic(prompt, ra, rb)

    winner = "tie"
    if p_a > p_b and p_a > p_tie:   winner = "a"
    elif p_b > p_a and p_b > p_tie: winner = "b"

    return {
        "prob_a":            round(p_a, 4),
        "prob_b":            round(p_b, 4),
        "prob_tie":          round(p_tie, 4),
        "predicted_winner":  winner,
        "explanation":       _explain(feats[0], winner, p_a, p_b, p_tie),
        "shap_features":     _importance(feats[0]),
    }
