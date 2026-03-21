"""
llm_clients.py — Multi-LLM client
Uses:
  - Gemini via google-generativeai SDK  (gemini-2.5-flash)
  - Groq  via openai-compatible SDK     (llama-3.3-70b-versatile)
  - OpenAI via openai SDK               (gpt-4o-mini)

All model names verified from official API docs March 2025.
"""

import os, asyncio
from dotenv import load_dotenv
load_dotenv()

# ── Model registry ────────────────────────────────────────────────────────────
# All models verified working as of March 2025
AVAILABLE_MODELS = {
    # Gemini models (google-generativeai SDK)
    "gemini-2.5-flash":        {"provider": "gemini", "display": "Gemini 2.5 Flash",      "free": True},
    "gemini-2.0-flash":        {"provider": "gemini", "display": "Gemini 2.0 Flash",      "free": True},
    "gemini-1.5-flash-latest": {"provider": "gemini", "display": "Gemini 1.5 Flash",      "free": True},

    # Groq models — OpenAI-compatible, very fast, generous free tier
    "llama-3.3-70b-versatile": {"provider": "groq",   "display": "Llama 3.3 70B (Groq)", "free": True},
    "llama-3.1-8b-instant":    {"provider": "groq",   "display": "Llama 3.1 8B (Groq)",  "free": True},
    "mixtral-8x7b-32768":      {"provider": "groq",   "display": "Mixtral 8x7B (Groq)",  "free": True},
    "gemma2-9b-it":            {"provider": "groq",   "display": "Gemma 2 9B (Groq)",    "free": True},

    # OpenAI models (paid)
    "gpt-4o-mini":             {"provider": "openai", "display": "GPT-4o Mini",           "free": False},
    "gpt-4o":                  {"provider": "openai", "display": "GPT-4o",                "free": False},
}

DEFAULT_MODEL_A = "gemini-2.5-flash"
DEFAULT_MODEL_B = "llama-3.3-70b-versatile"


# ── Gemini (google-generativeai SDK) ─────────────────────────────────────────
async def call_gemini(prompt: str, model: str = "gemini-2.5-flash") -> str:
    try:
        import google.generativeai as genai
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key or api_key == "your_gemini_api_key_here":
            return "[Gemini error: API key not set in backend/.env]"
        genai.configure(api_key=api_key)
        m = genai.GenerativeModel(model)
        response = m.generate_content(prompt)
        return response.text
    except Exception as e:
        err = str(e)
        if "API_KEY_INVALID" in err or "API key" in err:
            return "[Gemini error: Invalid API key — check backend/.env]"
        if "quota" in err.lower() or "429" in err:
            return "[Gemini error: Rate limit hit — free tier allows 5 RPM. Wait 1 minute.]"
        return f"[Gemini error: {err[:200]}]"


# ── Groq (OpenAI-compatible via openai SDK) ───────────────────────────────────
# Using openai SDK with Groq base_url as shown in official Groq docs
async def call_groq(prompt: str, model: str = "llama-3.3-70b-versatile") -> str:
    try:
        from openai import OpenAI
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key or api_key == "your_groq_api_key_here":
            return "[Groq error: API key not set in backend/.env]"
        client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1",
        )
        completion = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024,
        )
        return completion.choices[0].message.content
    except Exception as e:
        err = str(e)
        if "401" in err or "Invalid API Key" in err:
            return "[Groq error: Invalid API key — check backend/.env]"
        if "decommissioned" in err or "404" in err:
            return f"[Groq error: Model '{model}' not available — try llama-3.1-8b-instant]"
        if "429" in err or "rate" in err.lower():
            return "[Groq error: Rate limit hit — wait a moment and try again]"
        return f"[Groq error: {err[:200]}]"


# ── OpenAI ────────────────────────────────────────────────────────────────────
async def call_openai(prompt: str, model: str = "gpt-4o-mini") -> str:
    try:
        from openai import OpenAI
        api_key = os.getenv("OPENAI_API_KEY", "")
        if not api_key or api_key == "your_openai_api_key_here":
            return "[OpenAI error: API key not set in backend/.env]"
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1024,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"[OpenAI error: {str(e)[:200]}]"


# ── Router ────────────────────────────────────────────────────────────────────
async def call_llm(prompt: str, model: str) -> str:
    """Route to correct provider based on model registry"""
    info = AVAILABLE_MODELS.get(model)
    if not info:
        return f"[Unknown model: {model}. Available: {list(AVAILABLE_MODELS.keys())}]"
    provider = info["provider"]
    if provider == "gemini": return await call_gemini(prompt, model)
    if provider == "groq":   return await call_groq(prompt, model)
    if provider == "openai": return await call_openai(prompt, model)
    return f"[No provider for: {model}]"


async def battle(prompt: str, model_a: str, model_b: str) -> dict:
    """Call both models in parallel"""
    resp_a, resp_b = await asyncio.gather(
        call_llm(prompt, model_a),
        call_llm(prompt, model_b),
    )
    return {
        "response_a": resp_a,
        "response_b": resp_b,
        "model_a": AVAILABLE_MODELS.get(model_a, {}).get("display", model_a),
        "model_b": AVAILABLE_MODELS.get(model_b, {}).get("display", model_b),
    }


def get_model_list() -> list:
    return [
        {
            "id": k,
            "display": v["display"],
            "provider": v["provider"],
            "free": v["free"],
        }
        for k, v in AVAILABLE_MODELS.items()
    ]
