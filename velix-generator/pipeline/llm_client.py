"""
LLM client for the 2-stage pipeline calls.

Stage 1 (Blueprint): Small JSON with footprint, floors, roof, style, features
Stage 2 (Detailing): Per-wall constrained JSON choices
"""

import os
import json
import httpx
import logging

logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

# Free models for pipeline stages — lightweight, fast
BLUEPRINT_MODEL = "google/gemini-2.0-flash-001"
DETAILING_MODEL = "google/gemini-2.0-flash-001"


def call_llm(system_prompt: str, user_prompt: str,
             model: str = BLUEPRINT_MODEL,
             temperature: float = 0.3,
             max_tokens: int = 1024) -> str:
    """Make a single LLM call and return the text response."""
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY not set")

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(OPENROUTER_BASE_URL, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            return content.strip()
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
        raise


def call_llm_json(system_prompt: str, user_prompt: str,
                  model: str = BLUEPRINT_MODEL,
                  temperature: float = 0.3,
                  max_tokens: int = 1024) -> dict:
    """Make an LLM call and parse the response as JSON.

    Handles markdown code fences (```json ... ```) automatically.
    """
    raw = call_llm(system_prompt, user_prompt, model, temperature, max_tokens)

    # Strip markdown code fences if present
    cleaned = raw
    if "```json" in cleaned:
        start = cleaned.index("```json") + 7
        end = cleaned.index("```", start)
        cleaned = cleaned[start:end].strip()
    elif "```" in cleaned:
        start = cleaned.index("```") + 3
        end = cleaned.index("```", start)
        cleaned = cleaned[start:end].strip()

    return json.loads(cleaned)
