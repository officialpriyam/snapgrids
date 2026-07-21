"""
Stage 1 — Blueprint Generation (LLM Call #1)

The LLM receives the user request + style catalog + valid feature list,
and returns a small, constrained JSON blueprint.
No block placement — only high-level design parameters.
"""

import json
import logging
from typing import Dict, Any

from .llm_client import call_llm_json, BLUEPRINT_MODEL
from .styles import STYLE_CONFIGS, VALID_STYLES, VALID_FEATURES, VALID_ROOF_TYPES, VALID_SHAPES

logger = logging.getLogger(__name__)

BLUEPRINT_SCHEMA = """{
  "name": "string — short lowercase name with underscores",
  "style": "string — one of VALID_STYLES",
  "shape": "string — one of VALID_SHAPES",
  "footprint": {
    "width": "int — blocks along X (5-30)",
    "depth": "int — blocks along Z (5-30)",
    "wings": "int — 0 for simple, 1 for L/U, 2 for cross (0-2)"
  },
  "floors": {
    "count": "int — number of floors (1-4)",
    "floor_height": "int — blocks per floor (3-6)"
  },
  "roof": {
    "type": "string — one of VALID_ROOF_TYPES",
    "overhang": "int — 0-2 blocks of overhang",
    "chimney": "bool — whether to add a chimney"
  },
  "features": ["string — subset of VALID_FEATURES, max 4"],
  "foundation": {
    "height": "int — extra blocks below ground floor (0-3)",
    "material": "string — 'stone', 'cobble', or 'matching'"
  },
  "windows": {
    "pattern": "string — 'even_spaced', 'alternating', or 'pairs'",
    "spacing": "int — blocks between windows (2-5)"
  }
}"""

STYLE_CATALOG = "\n".join(
    f"- {k}: {v['description']}" for k, v in STYLE_CONFIGS.items()
)

SYSTEM_PROMPT = f"""You are an architectural blueprint generator for Minecraft builds.

You must return ONLY a valid JSON object matching this schema:
{BLUEPRINT_SCHEMA}

Available styles:
{STYLE_CATALOG}

Valid styles: {VALID_STYLES}
Valid shapes: {VALID_SHAPES}
Valid features (max 4): {VALID_FEATURES}
Valid roof types: {VALID_ROOF_TYPES}

Rules:
- Dimensions must be realistic for the requested style
- All values must be integers or simple strings/booleans
- Features array must contain only items from the valid features list
- No block names or IDs anywhere — those belong to later stages
- Return ONLY the JSON object, no explanation
"""


def generate_blueprint(user_request: str, seed: int | None = None) -> Dict[str, Any]:
    """Generate a blueprint JSON from a user request.

    Args:
        user_request: Natural language build request from the user
        seed: Optional seed for reproducibility (reserved for future use)

    Returns:
        Validated blueprint dict
    """
    user_prompt = f"Build request: {user_request}\n\nReturn the blueprint JSON."

    logger.info("Stage 1: Generating blueprint...")
    blueprint = call_llm_json(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        model=BLUEPRINT_MODEL,
        temperature=0.4,
        max_tokens=512,
    )

    blueprint = validate_blueprint(blueprint)
    logger.info(f"Stage 1: Blueprint generated — {blueprint['name']}, "
                f"{blueprint['footprint']['width']}x{blueprint['footprint']['depth']}, "
                f"{blueprint['floors']['count']} floors, style={blueprint['style']}")
    return blueprint


def validate_blueprint(bp: Dict[str, Any]) -> Dict[str, Any]:
    """Validate and clamp blueprint values to safe ranges."""
    # Required fields
    bp.setdefault("name", "unnamed_build")
    bp.setdefault("style", "medieval_stone")
    bp.setdefault("shape", "rectangular")

    # Clamp style
    if bp["style"] not in VALID_STYLES:
        bp["style"] = "medieval_stone"

    # Clamp shape
    if bp["shape"] not in VALID_SHAPES:
        bp["shape"] = "rectangular"

    # Footprint
    fp = bp.setdefault("footprint", {})
    fp["width"] = max(5, min(30, fp.get("width", 12)))
    fp["depth"] = max(5, min(30, fp.get("depth", 10)))
    fp["wings"] = max(0, min(2, fp.get("wings", 0)))

    # Floors
    fl = bp.setdefault("floors", {})
    fl["count"] = max(1, min(4, fl.get("count", 2)))
    fl["floor_height"] = max(3, min(6, fl.get("floor_height", 4)))

    # Roof
    rf = bp.setdefault("roof", {})
    rf["type"] = rf.get("type", "pitched") if rf.get("type", "pitched") in VALID_ROOF_TYPES else "pitched"
    rf["overhang"] = max(0, min(2, rf.get("overhang", 1)))
    rf["chimney"] = bool(rf.get("chimney", False))

    # Features
    feats = bp.get("features", [])
    if not isinstance(feats, list):
        feats = []
    feats = [f for f in feats if f in VALID_FEATURES][:4]
    bp["features"] = feats

    # Foundation
    fn = bp.setdefault("foundation", {})
    fn["height"] = max(0, min(3, fn.get("height", 1)))
    fn["material"] = fn.get("material", "stone") if fn.get("material", "stone") in ("stone", "cobble", "matching") else "stone"

    # Windows
    wn = bp.setdefault("windows", {})
    wn["pattern"] = wn.get("pattern", "even_spaced") if wn.get("pattern", "even_spaced") in ("even_spaced", "alternating", "pairs") else "even_spaced"
    wn["spacing"] = max(2, min(5, wn.get("spacing", 3)))

    return bp
