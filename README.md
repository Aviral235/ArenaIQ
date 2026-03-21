# ⚔️ ArenaIQ v2 — Human Preference Intelligence Platform

## 🚀 Quick Start (3 Steps)

### Step 1 — Get FREE API Keys
Open `backend\.env` and fill in your keys:

| Key | Where to get it | Free tier |
|-----|----------------|-----------|
| `GEMINI_API_KEY` | https://aistudio.google.com/app/apikey | 15 RPM, 1500 RPD |
| `GROQ_API_KEY` | https://console.groq.com/keys | 14,400 RPD (very generous) |

### Step 2 — Install packages
Double-click `install_packages.bat`

### Step 3 — Run
Double-click `start.bat`
→ Opens http://localhost:3000 automatically

---

## 📁 Project Structure

```
arenaiq_v2/
├── start.bat              ← Run this to start everything
├── install_packages.bat   ← Run this first if start.bat fails
│
├── backend/
│   ├── main.py            ← FastAPI — all 8 endpoints
│   ├── llm_clients.py     ← Gemini + Groq + OpenAI
│   ├── model.py           ← ML inference + SHAP explanations
│   ├── database.py        ← SQLite via SQLAlchemy
│   ├── elo.py             ← ELO rating system
│   ├── requirements.txt
│   └── .env               ← YOUR API KEYS HERE
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── index.jsx
│       ├── App.jsx
│       ├── api.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── ProbBar.jsx
│       └── pages/
│           ├── Landing.jsx
│           ├── Arena.jsx
│           ├── Dashboard.jsx
│           └── OtherPages.jsx  (Vote, Bias, Optimizer, Leaderboard)
│
└── ml/
    ├── train.py           ← Train LightGBM on Kaggle data
    └── data/              ← Put train.csv from Kaggle here
```

---

## 🔗 URLs When Running

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Frontend app |
| http://localhost:8000 | Backend API |
| http://localhost:8000/docs | Swagger API documentation |

---

## 🧠 LLM Models Available

| Model | Provider | Free? |
|-------|----------|-------|
| Gemini 2.5 Flash | Google | ✅ 15 RPM |
| Gemini 2.0 Flash | Google | ✅ 15 RPM |
| Gemini 1.5 Flash | Google | ✅ 15 RPM |
| Llama 3.3 70B | Groq | ✅ Very generous |
| Llama 3.1 8B | Groq | ✅ Very generous |
| Mixtral 8x7B | Groq | ✅ Very generous |
| Gemma 2 9B | Groq | ✅ Very generous |
| GPT-4o Mini | OpenAI | ❌ Paid |
| GPT-4o | OpenAI | ❌ Paid |

**Tip:** Use Groq models for high-volume demos — their free tier is far more generous than Gemini.

---

## 🏋️ Training the ML Model (Optional)

The app works without a trained model (uses heuristic scoring).
To train LightGBM for better predictions:

```cmd
cd ml
pip install -r requirements.txt
# Put train.csv from Kaggle in ml/data/train.csv
python train.py
# Copy model to backend:
copy model.pkl ..\backend\model.pkl
```

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| Gemini rate limit (429) | Free tier: 15 RPM. Wait 1 min between battles |
| Gemini 404 model not found | Check .env has correct key, use gemini-2.5-flash |
| Groq invalid API key | Regenerate at console.groq.com/keys |
| Port in use | Close old terminal windows, re-run start.bat |
| node_modules missing | Run install_packages.bat |
| Backend import error | Run: pip install --prefer-binary -r backend/requirements.txt |

---

## 🗣️ Demo Script for Jury

> "We built ArenaIQ — a full-stack AI research platform that replicates
> the core technology behind ChatGPT's training: human preference prediction.
>
> Watch: I'll type a live prompt. Two real AI models — Gemini and Llama —
> respond simultaneously. Our ML model predicts which response humans prefer
> before we vote... and shows WHY it made that prediction.
>
> We also discovered three cognitive biases in human AI evaluation:
> verbosity bias (58%), position bias (54%), and structure bias (2.3x).
> Our Adversarial Optimizer exploits these to rewrite any response to win more.
>
> This is exactly how OpenAI, Anthropic, and Google train their models.
> We built a miniature version from scratch — 55,000 training samples,
> LightGBM + feature engineering, full REST API, React frontend, SQLite database,
> ELO rating system, and live deployment."
