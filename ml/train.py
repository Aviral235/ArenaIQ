"""
ArenaIQ ML Training Pipeline
Place train.csv from Kaggle in ml/data/train.csv, then run: python train.py
Model saved to ml/model.pkl — copy to backend/model.pkl to use it.
"""
import os, sys, re, pickle, json
import numpy as np
import pandas as pd

try:
    import lightgbm as lgb
    from sklearn.model_selection import StratifiedKFold
    from sklearn.metrics import log_loss
except ImportError:
    print("Run: pip install --prefer-binary lightgbm scikit-learn pandas numpy")
    sys.exit(1)

try:
    import textstat
    TS = True
except ImportError:
    TS = False

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
    vader = SentimentIntensityAnalyzer()
    VADER = True
except ImportError:
    VADER = False

DATA  = "data/train.csv"
OUT   = "model.pkl"
STATS = "training_stats.json"

PARAMS = {
    "objective": "multiclass", "num_class": 3, "metric": "multi_logloss",
    "learning_rate": 0.04, "n_estimators": 800, "max_depth": 6,
    "num_leaves": 40, "subsample": 0.8, "colsample_bytree": 0.8,
    "min_child_samples": 25, "random_state": 42, "verbose": -1, "n_jobs": -1,
}

def read(t):
    if TS and len(t.split()) > 5:
        try: return textstat.flesch_reading_ease(t)
        except: pass
    return 50.0

def sent(t): return vader.polarity_scores(t)['compound'] if VADER else 0.0
def bullets(t): return len(re.findall(r'(?m)^[\s]*[-*•]\s', t))
def code(t):    return len(re.findall(r'```', t)) // 2
def headers(t): return len(re.findall(r'(?m)^#{1,4}\s', t))

def coverage(p, r):
    pw = set(p.lower().split()); rw = set(r.lower().split())
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

def featurize(df):
    rows = []
    p  = df['prompt'].values
    ra = df['response_a'].values
    rb = df['response_b'].values
    for i in range(len(df)):
        if i % 10000 == 0: print(f"   {i:,}/{len(df):,}")
        la, lb = len(ra[i]), len(rb[i])
        wa, wb = len(ra[i].split()), len(rb[i].split())
        rows.append([
            la, lb, lb-la, lb/(la+1),
            wa, wb, wb-wa, wb/(wa+1),
            read(ra[i]), read(rb[i]), read(rb[i])-read(ra[i]),
            sent(ra[i]), sent(rb[i]), sent(rb[i])-sent(ra[i]),
            bullets(ra[i]), bullets(rb[i]), bullets(rb[i])-bullets(ra[i]),
            code(ra[i]), code(rb[i]), code(rb[i])-code(ra[i]),
            headers(ra[i]), headers(rb[i]), headers(rb[i])-headers(ra[i]),
            coverage(p[i],ra[i]), coverage(p[i],rb[i]), coverage(p[i],rb[i])-coverage(p[i],ra[i]),
            ra[i].count('?'), rb[i].count('?'), len(p[i]), len(p[i].split()),
        ])
    return pd.DataFrame(rows, columns=FEAT_NAMES).astype(np.float32)

def label(row):
    if row.get('winner_model_a', 0) == 1: return 0
    if row.get('winner_model_b', 0) == 1: return 1
    return 2

def main():
    print("\n" + "="*52)
    print("  ArenaIQ — LightGBM Training Pipeline")
    print("="*52)

    if not os.path.exists(DATA):
        print(f"\n❌ {DATA} not found")
        print("  Download train.csv from Kaggle:")
        print("  https://www.kaggle.com/competitions/lmsys-chatbot-arena/data")
        print("  Place it in: ml/data/train.csv")
        sys.exit(1)

    print(f"\n📂 Loading {DATA}...")
    df = pd.read_csv(DATA).fillna({'prompt': '', 'response_a': '', 'response_b': ''})
    df['label'] = df.apply(label, axis=1)
    print(f"   {len(df):,} rows")
    print(f"   A={sum(df.label==0):,}  B={sum(df.label==1):,}  Tie={sum(df.label==2):,}")

    print("\n⚙️  Extracting features...")
    X = featurize(df)
    y = df['label'].values
    print(f"   Shape: {X.shape}")

    print("\n🌲 Training with 5-fold CV...")
    skf = StratifiedKFold(5, shuffle=True, random_state=42)
    oof = np.zeros((len(df), 3))
    scores = []
    models = []

    for fold, (tr, va) in enumerate(skf.split(X, y)):
        m = lgb.LGBMClassifier(**PARAMS)
        m.fit(X.iloc[tr], y[tr], eval_set=[(X.iloc[va], y[va])],
              callbacks=[lgb.early_stopping(50, verbose=False), lgb.log_evaluation(200)])
        oof[va] = m.predict_proba(X.iloc[va])
        s = log_loss(y[va], oof[va])
        scores.append(s); models.append(m)
        print(f"   Fold {fold+1}: log_loss = {s:.5f}")

    cv = log_loss(y, oof)
    best = models[int(np.argmin(scores))]
    print(f"\n📊 CV log_loss: {cv:.5f}")
    print(f"   Baseline:     1.09861")
    print(f"   Improvement:  {(1.09861 - cv)/1.09861*100:.1f}%")

    imp = best.feature_importances_
    top = sorted(zip(FEAT_NAMES, imp), key=lambda x: x[1], reverse=True)[:8]
    print("\n🔍 Top features:")
    for n, v in top:
        print(f"   {n:20s} {'█' * int(v/max(imp)*18)}")

    with open(OUT, "wb") as f: pickle.dump(best, f)
    print(f"\n💾 Saved: {OUT}")
    print("   → Copy to backend/model.pkl to use it in the app")

    with open(STATS, "w") as f:
        json.dump({
            "cv_log_loss": round(cv, 5),
            "improvement_pct": round((1.09861-cv)/1.09861*100, 1),
            "rows": len(df),
            "features": X.shape[1],
            "top_features": [n for n, _ in top[:5]],
            "fold_scores": [round(s, 5) for s in scores],
        }, f, indent=2)
    print(f"📈 Stats: {STATS}")
    print("="*52 + "\n")


if __name__ == "__main__":
    main()
