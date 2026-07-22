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
BLUEPRINT_MODEL = "openai/gpt-oss-20b:free"
DETAILING_MODEL = "openai/gpt-oss-20b:free"


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

    last_error = None
    for attempt in range(3):
        try:
            with httpx.Client(timeout=90.0) as client:
                resp = client.post(OPENROUTER_BASE_URL, json=payload, headers=headers)
                resp.raise_for_status()
                data = resp.json()
                choices = data.get("choices", [])
                if not choices:
                    raise RuntimeError(f"No choices in response: {data}")
                message = choices[0].get("message", {})
                content = message.get("content")
                if content is None:
                    content = ""
                if not isinstance(content, str):
                    content = str(content)
                return content.strip() if content else ""
        except Exception as e:
            last_error = e
            logger.warning(f"LLM call attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                import time
                time.sleep(2)

    raise RuntimeError(f"LLM call failed after 3 attempts: {last_error}")


def call_llm_json(system_prompt: str, user_prompt: str,
                  model: str = BLUEPRINT_MODEL,
                  temperature: float = 0.3,
                  max_tokens: int = 1024) -> dict:
    """Make an LLM call and parse the response as JSON.

    Handles markdown code fences, single quotes, trailing commas,
    and other common LLM JSON quirks.
    """
    import re

    raw = call_llm(system_prompt, user_prompt, model, temperature, max_tokens)

    # DEBUG: Log raw response
    logger.debug(f"Raw LLM response: {raw[:500]}")

    # Strip markdown code fences if present
    cleaned = raw if raw is not None else ""
    if "```json" in cleaned:
        start = cleaned.index("```json") + 7
        end = cleaned.index("```", start)
        cleaned = cleaned[start:end].strip() if cleaned[start:end] else ""
    elif "```" in cleaned:
        start = cleaned.index("```") + 3
        end = cleaned.index("```", start)
        cleaned = cleaned[start:end].strip() if cleaned[start:end] else ""

    # Try standard parse first
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Fix common LLM JSON issues
    fixed = cleaned
    try:
        # Replace single quotes with double quotes (but not inside strings)
        fixed = re.sub(r"(?<=[{,\[]) *'([^']*?)' *(?=[},\]])", r'"\1"', fixed)
        # Remove trailing commas before } or ]
        fixed = re.sub(r",\s*([}\]])", r"\1", fixed)
        # Remove // comments
        fixed = re.sub(r"//[^\n]*", "", fixed)
        # Remove unquoted keys: word: -> "word":
        fixed = re.sub(r"(?<=[{,\n])\s*(\w+)\s*:", r' "\1":', fixed)
        # Fix null/None/undefined -> null
        fixed = re.sub(r":\s*(None|null|undefined)\s*([,}])", r": null\2", fixed, flags=re.IGNORECASE)
        # Fix missing values after colon (empty values)
        fixed = re.sub(r":\s*([,}])", r": null\1", fixed)
        # Fix True/False -> true/false
        fixed = re.sub(r":\s*True\s*([,}])", r": true\1", fixed)
        fixed = re.sub(r":\s*False\s*([,}])", r": false\1", fixed)
    except Exception as e:
        logger.warning(f"Regex fix failed: {e}")
        fixed = cleaned

    try:
        return json.loads(fixed)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse failed after fixes: {e}\nFixed: {fixed[:500] if fixed else 'EMPTY'}")
        # Last resort: find outermost { } or [ ] and extract
        for start_char, end_char in [('{', '}'), ('[', ']')]:
            si = cleaned.find(start_char)
            ei = cleaned.rfind(end_char)
            if si != -1 and ei > si:
                try:
                    return json.loads(cleaned[si:ei + 1])
                except json.JSONDecodeError:
                    continue
        raise RuntimeError(f"Failed to parse LLM JSON: {e}\nRaw: {raw[:500] if raw else 'EMPTY'}")
