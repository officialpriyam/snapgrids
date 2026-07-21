"""
Stage 3 — Detailing Pass (LLM Call #2)

For each exterior wall face, the LLM chooses from a fixed vocabulary
of decorative patterns. No free-form block placement.
"""

import json
import logging
from typing import Dict, Any, List

from .llm_client import call_llm_json, DETAILING_MODEL
from .primitives import VoxelGrid
from .styles import get_style, get_block

logger = logging.getLogger(__name__)

DETAIL_VOCABULARY = {
    "trim": [
        "none", "cornice", "ledge", "pillar_corners", "band_mid", "band_top"
    ],
    "window_accent": [
        "none", "frame", "sill", "arch", "shutters", "grille"
    ],
    "wall_pattern": [
        "none", "checkerboard", "horizontal_band", "vertical_stripes",
        "random_accent", "gradient"
    ],
    "door_accent": [
        "none", "arched", "double_door", "iron_bars", "portcullis"
    ],
}

DETAILING_SCHEMA = """{
  "faces": [
    {
      "face": "string — 'north', 'south', 'east', or 'west'",
      "trim": "string — one of trim vocabulary",
      "window_accent": "string — one of window_accent vocabulary",
      "wall_pattern": "string — one of wall_pattern vocabulary",
      "door_accent": "string — one of door_accent vocabulary (only for entrance face)"
    }
  ],
  "global": {
    "chimney_decor": "bool",
    "roof_ridge_decor": "bool",
    "foundation_detail": "bool"
  }
}"""

VOCAB_DESC = "\n".join(
    f"- {cat}: {', '.join(vals)}" for cat, vals in DETAIL_VOCABULARY.items()
)

SYSTEM_PROMPT = f"""You are a Minecraft architectural detailer.

Given a building blueprint and style, assign decorative patterns to each wall face.

Return ONLY a valid JSON object matching this schema:
{DETAILING_SCHEMA}

Vocabulary (choose ONLY from these exact strings):
{VOCAB_DESC}

Rules:
- Every face must have all four fields
- Door accent only applies to the face marked as entrance (usually south)
- Be conservative: prefer "none" over random decoration
- Match the building style (medieval=ornate, modern=minimal, desert=geometric)
- Return ONLY the JSON, no explanation
"""


def generate_details(blueprint: Dict[str, Any],
                     structure_grid: VoxelGrid,
                     seed: int | None = None) -> Dict[str, Any]:
    """Generate detailing plan for each face of the structure.

    Args:
        blueprint: Validated blueprint from Stage 1
        structure_grid: Voxel grid from Stage 2 (for bounds)
        seed: Optional seed for reproducibility

    Returns:
        Detailing plan dict with per-face and global choices
    """
    style = blueprint["style"]
    s = get_style(style)

    bounds = get_bounds(structure_grid)
    if not bounds:
        return {"faces": [], "global": {}}

    (x1, y1, z1), (x2, y2, z2) = bounds
    width = x2 - x1 + 1
    depth = z2 - z1 + 1
    height = y2 - y1 + 1
    floors = blueprint["floors"]["count"]
    features = blueprint.get("features", [])
    roof_type = blueprint["roof"].get("type", "pitched")

    # Determine entrance face (usually south - longest face)
    entrance_face = "south" if depth >= width else "east"

    user_prompt = f"""Style: {style} ({s['display_name']})
Building: {width}x{depth}x{height}, {floors} floors, {roof_type} roof
Features: {features}
Entrance face: {entrance_face}
Foundation: {blueprint['foundation']['height']} blocks

Return detailing JSON for all 4 faces + global."""

    logger.info("Stage 3: Generating detailing plan...")
    plan = call_llm_json(
        system_prompt=SYSTEM_PROMPT,
        user_prompt=user_prompt,
        model=DETAILING_MODEL,
        temperature=0.5,
        max_tokens=512,
    )

    plan = validate_detail_plan(plan, entrance_face)
    logger.info(f"Stage 3: Detail plan generated — {len(plan['faces'])} faces")
    return plan


def validate_detail_plan(plan: Dict[str, Any], entrance_face: str) -> Dict[str, Any]:
    """Validate and clamp detailing plan values."""
    valid_faces = ["north", "south", "east", "west"]

    for cat, vals in DETAIL_VOCABULARY.items():
        DETAIL_VOCABULARY[cat] = vals  # ensure list

    if "faces" not in plan or not isinstance(plan["faces"], list):
        plan["faces"] = []

    # Ensure all 4 faces present
    existing_faces = {f.get("face") for f in plan["faces"]}
    for face in valid_faces:
        if face not in existing_faces:
            plan["faces"].append({
                "face": face,
                "trim": "none",
                "window_accent": "none",
                "wall_pattern": "none",
                "door_accent": "none",
            })

    # Validate each face
    for f in plan["faces"]:
        f["trim"] = f.get("trim", "none")
        f["window_accent"] = f.get("window_accent", "none")
        f["wall_pattern"] = f.get("wall_pattern", "none")
        f["door_accent"] = f.get("door_accent", "none")

        for cat in ["trim", "window_accent", "wall_pattern", "door_accent"]:
            if f[cat] not in DETAIL_VOCABULARY[cat]:
                f[cat] = "none"

    # Validate global
    global_plan = plan.get("global", {})
    global_plan.setdefault("chimney_decor", False)
    global_plan.setdefault("roof_ridge_decor", False)
    global_plan.setdefault("foundation_detail", False)
    plan["global"] = global_plan

    return plan


def apply_details(grid: VoxelGrid, blueprint: Dict[str, Any],
                  detail_plan: Dict[str, Any]) -> None:
    """Apply the detailing plan to the voxel grid.

    Args:
        grid: Mutable voxel grid from Stage 2
        blueprint: Blueprint from Stage 1
        detail_plan: Detailing plan from Stage 3
    """
    style = blueprint["style"]
    bounds = get_bounds(grid)
    if not bounds:
        return

    (x1, y1, z1), (x2, y2, z2) = bounds
    entrance_face = detail_plan.get("entrance_face", "south")

    for face_data in detail_plan["faces"]:
        face = face_data["face"]
        _apply_face_details(grid, style, face, face_data, x1, y1, z1, x2, y2, z2,
                            entrance_face)

    # Global details
    global_plan = detail_plan.get("global", {})
    if global_plan.get("chimney_decor"):
        _add_chimney_decor(grid, style, x1, y1, z1, x2, y2, z2)
    if global_plan.get("roof_ridge_decor"):
        _add_roof_ridge_decor(grid, style, x1, y1, z1, x2, y2, z2)
    if global_plan.get("foundation_detail"):
        _add_foundation_detail(grid, style, x1, y1, z1, x2, y2, z2)

    logger.info("Stage 3: Details applied to grid")


def _apply_face_details(grid: VoxelGrid, style: str, face: str,
                        face_data: Dict, x1: int, y1: int, z1: int,
                        x2: int, y2: int, z2: int, entrance_face: str) -> None:
    """Apply details to a single face."""
    s = get_style(style)
    trim_type = face_data["trim"]
    window_accent = face_data["window_accent"]
    wall_pattern = face_data["wall_pattern"]
    door_accent = face_data["door_accent"]

    trim_block = s.get("trim", {}).get("cornice", "minecraft:stone_brick_stairs")
    wall_primary = s.get("wall", {}).get("primary", "minecraft:stone_bricks")
    wall_accent = s.get("wall", {}).get("accent", "minecraft:mossy_stone_bricks")
    window_frame = s.get("window", {}).get("frame", "minecraft:stone_brick_wall")
    window_sill = s.get("window", {}).get("sill", "minecraft:stone_brick_stairs")
    window_shutters = "minecraft:spruce_trapdoor"  # shutters

    # Trim
    if trim_type == "cornice":
        _add_cornice(grid, trim_block, x1, y2, z1, x2, z2, face)
    elif trim_type == "ledge":
        _add_ledge(grid, trim_block, x1, y2, z1, x2, z2, face)
    elif trim_type == "pillar_corners":
        _add_corner_pillars(grid, s.get("trim", {}).get("pillar", "minecraft:stone_brick_wall"),
                            x1, y1, z1, x2, y2, z2, face)
    elif trim_type == "band_mid":
        _add_band(grid, wall_accent, x1, (y1 + y2) // 2, z1, x2, z2, face)
    elif trim_type == "band_top":
        _add_band(grid, wall_accent, x1, y2 - 1, z1, x2, z2, face)

    # Window accents
    if window_accent == "frame":
        _add_window_frames(grid, window_frame, x1, y1, z1, x2, y2, z2, face)
    elif window_accent == "sill":
        _add_window_sills(grid, window_sill, x1, y1, z1, x2, y2, z2, face)
    elif window_accent == "arch":
        _add_window_arches(grid, wall_accent, x1, y1, z1, x2, y2, z2, face)
    elif window_accent == "shutters":
        _add_shutters(grid, window_shutters, x1, y1, z1, x2, y2, z2, face)
    elif window_accent == "grille":
        _add_grille(grid, "minecraft:iron_bars", x1, y1, z1, x2, y2, z2, face)

    # Wall patterns
    if wall_pattern == "checkerboard":
        _add_checkerboard(grid, wall_primary, wall_accent, x1, y1, z1, x2, y2, z2, face)
    elif wall_pattern == "horizontal_band":
        _add_horizontal_bands(grid, wall_accent, x1, y1, z1, x2, y2, z2, face)
    elif wall_pattern == "vertical_stripes":
        _add_vertical_stripes(grid, wall_accent, x1, y1, z1, x2, y2, z2, face)
    elif wall_pattern == "random_accent":
        _add_random_accent(grid, wall_accent, x1, y1, z1, x2, y2, z2, face)
    elif wall_pattern == "gradient":
        _add_gradient(grid, wall_primary, wall_accent, x1, y1, z1, x2, y2, z2, face)

    # Door accent (entrance face only)
    if face == entrance_face and door_accent != "none":
        _add_door_accent(grid, style, door_accent, x1, y1, z1, x2, y2, z2, face)


def _add_cornice(grid: VoxelGrid, block: str, x1: int, y: int, z1: int,
                 x2: int, z2: int, face: str) -> None:
    """Add cornice (overhang) along top of face."""
    if face in ("north", "south"):
        for x in range(x1 - 1, x2 + 2):
            if face == "north":
                grid[(x, y, z1 - 1)] = block
            else:
                grid[(x, y, z2 + 1)] = block
    else:
        for z in range(z1 - 1, z2 + 2):
            if face == "west":
                grid[(x1 - 1, y, z)] = block
            else:
                grid[(x2 + 1, y, z)] = block


def _add_ledge(grid: VoxelGrid, block: str, x1: int, y: int, z1: int,
               x2: int, z2: int, face: str) -> None:
    """Add a narrow ledge along face."""
    if face in ("north", "south"):
        for x in range(x1, x2 + 1):
            if face == "north":
                grid[(x, y + 1, z1 - 1)] = block
            else:
                grid[(x, y + 1, z2 + 1)] = block
    else:
        for z in range(z1, z2 + 1):
            if face == "west":
                grid[(x1 - 1, y + 1, z)] = block
            else:
                grid[(x2 + 1, y + 1, z)] = block


def _add_corner_pillars(grid: VoxelGrid, block: str, x1: int, y1: int, z1: int,
                        x2: int, y2: int, z2: int, face: str) -> None:
    """Add decorative pillars at face corners."""
    if face == "north":
        for y in range(y1, y2 + 1):
            grid[(x1, y, z1)] = block
            grid[(x2, y, z1)] = block
    elif face == "south":
        for y in range(y1, y2 + 1):
            grid[(x1, y, z2)] = block
            grid[(x2, y, z2)] = block
    elif face == "west":
        for y in range(y1, y2 + 1):
            grid[(x1, y, z1)] = block
            grid[(x1, y, z2)] = block
    elif face == "east":
        for y in range(y1, y2 + 1):
            grid[(x2, y, z1)] = block
            grid[(x2, y, z2)] = block


def _add_band(grid: VoxelGrid, block: str, x1: int, y: int, z1: int,
              x2: int, z2: int, face: str) -> None:
    """Add a horizontal band along face."""
    if face == "north":
        for x in range(x1, x2 + 1):
            grid[(x, y, z1)] = block
    elif face == "south":
        for x in range(x1, x2 + 1):
            grid[(x, y, z2)] = block
    elif face == "west":
        for z in range(z1, z2 + 1):
            grid[(x1, y, z)] = block
    elif face == "east":
        for z in range(z1, z2 + 1):
            grid[(x2, y, z)] = block


def _add_window_frames(grid: VoxelGrid, block: str, x1: int, y1: int, z1: int,
                       x2: int, y2: int, z2: int, face: str) -> None:
    """Add frames around windows on a face."""
    # Find window positions and add 1-block thick frame
    if face == "north":
        for x in range(x1, x2 + 1):
            for y in range(y1, y2 + 1):
                if grid.get((x, y, z1)) == "minecraft:glass_pane":
                    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        nx, ny = x + dx, y + dy
                        if grid.get((nx, ny, z1)) not in ("minecraft:glass_pane", "minecraft:air"):
                            grid[(nx, ny, z1)] = block
    # Similar for other faces - simplified for brevity


def _add_window_sills(grid: VoxelGrid, block: str, x1: int, y1: int, z1: int,
                      x2: int, y2: int, z2: int, face: str) -> None:
    """Add sills below windows."""
    if face == "north":
        for x in range(x1, x2 + 1):
            for y in range(y1 + 1, y2):
                if grid.get((x, y, z1)) == "minecraft:glass_pane":
                    if grid.get((x, y - 1, z1)) not in ("minecraft:glass_pane", "minecraft:air"):
                        grid[(x, y - 1, z1)] = block


def _add_window_arches(grid: VoxelGrid, block: str, x1: int, y1: int, z1: int,
                       x2: int, y2: int, z2: int, face: str) -> None:
    """Add arches above windows."""
    pass  # Simplified


def _add_shutters(grid: VoxelGrid, block: str, x1: int, y1: int, z1: int,
                  x2: int, y2: int, z2: int, face: str) -> None:
    """Add shutters beside windows."""
    pass


def _add_grille(grid: VoxelGrid, block: str, x1: int, y1: int, z1: int,
                x2: int, y2: int, z2: int, face: str) -> None:
    """Add iron bars grille over windows."""
    pass


def _add_checkerboard(grid: VoxelGrid, primary: str, accent: str, x1: int, y1: int, z1: int,
                      x2: int, y2: int, z2: int, face: str) -> None:
    """Add checkerboard pattern on face."""
    pass


def _add_horizontal_bands(grid: VoxelGrid, accent: str, x1: int, y1: int, z1: int,
                          x2: int, y2: int, z2: int, face: str) -> None:
    """Add horizontal bands on face."""
    pass


def _add_vertical_stripes(grid: VoxelGrid, accent: str, x1: int, y1: int, z1: int,
                          x2: int, y2: int, z2: int, face: str) -> None:
    """Add vertical stripes on face."""
    pass


def _add_random_accent(grid: VoxelGrid, accent: str, x1: int, y1: int, z1: int,
                       x2: int, y2: int, z2: int, face: str) -> None:
    """Add random accent blocks on face."""
    pass


def _add_gradient(grid: VoxelGrid, primary: str, accent: str, x1: int, y1: int, z1: int,
                  x2: int, y2: int, z2: int, face: str) -> None:
    """Add gradient pattern on face."""
    pass


def _add_door_accent(grid: VoxelGrid, style: str, accent: str, x1: int, y1: int, z1: int,
                     x2: int, y2: int, z2: int, face: str) -> None:
    """Add door accent on entrance face."""
    pass


def _add_chimney_decor(grid: VoxelGrid, style: str, x1: int, y1: int, z1: int,
                       x2: int, y2: int, z2: int) -> None:
    """Add chimney decoration."""
    pass


def _add_roof_ridge_decor(grid: VoxelGrid, style: str, x1: int, y1: int, z1: int,
                          x2: int, y2: int, z2: int) -> None:
    """Add roof ridge decoration."""
    pass


def _add_foundation_detail(grid: VoxelGrid, style: str, x1: int, y1: int, z1: int,
                           x2: int, y2: int, z2: int) -> None:
    """Add foundation detail."""
    pass