"""
Stage 2 — Structural Generation (Pure Code)

Takes the blueprint from Stage 1 and builds the full voxel structure
using primitive geometry functions. No LLM calls.
"""

import logging
from typing import Dict, Any

from .primitives import (
    VoxelGrid, fill_cuboid, hollow_cuboid, fill_floor,
    fill_walls, pitched_roof, flat_roof, cylinder,
    spiral_staircase, symmetrical_facade, cornice_trim,
    get_bounds,
)
from .styles import get_block, get_style

logger = logging.getLogger(__name__)


def generate_structure(blueprint: Dict[str, Any]) -> VoxelGrid:
    """Build the full structural voxel grid from a blueprint.

    Args:
        blueprint: Validated blueprint from Stage 1

    Returns:
        VoxelGrid dict mapping (x,y,z) to block name strings
    """
    grid: VoxelGrid = {}
    style = blueprint["style"]
    fp = blueprint["footprint"]
    fl = blueprint["floors"]
    rf = blueprint["roof"]
    fn = blueprint["foundation"]
    windows = blueprint["windows"]
    features = blueprint["features"]

    width = fp["width"]
    depth = fp["depth"]
    floor_h = fl["floor_height"]
    floors = fl["count"]
    foundation_h = fn["height"]

    total_h = floors * floor_h
    x_max = width - 1
    z_max = depth - 1
    y_base = -foundation_h
    y_top = y_base + total_h

    logger.info(f"Stage 2: Building structure {width}x{depth}x{total_h} ({floors} floors)")

    # === Foundation ===
    if foundation_h > 0:
        _build_foundation(grid, style, fn, x_max, z_max, y_base, foundation_h)

    # === Floors & Walls per level ===
    for floor_i in range(floors):
        y_floor = y_base + floor_i * floor_h
        y_ceil = y_floor + floor_h - 1

        # Floor slab
        fill_floor(grid, 0, y_floor, 0, x_max, z_max,
                   get_block(style, "floor"))

        # Walls
        _build_walls(grid, style, 0, y_floor, 0, x_max, y_ceil, z_max)

        # Windows
        _build_windows(grid, style, windows, 0, y_floor, 0, x_max, y_ceil, z_max, floor_h)

    # Ceiling of top floor
    fill_floor(grid, 0, y_top, 0, x_max, z_max, get_block(style, "ceiling"))

    # === Roof ===
    _build_roof(grid, style, rf, 0, y_top + 1, 0, x_max, z_max)

    # === Pillars at corners ===
    _build_pillars(grid, style, 0, y_base, 0, x_max, z_max, y_top)

    # === Features ===
    if "tower" in features:
        _build_tower(grid, style, fp, rf, floors, floor_h, foundation_h)

    if "chimney" in features or rf.get("chimney"):
        _build_chimney(grid, style, x_max, z_max, y_top, rf)

    if "staircase" in features:
        _build_staircase(grid, style, x_max, y_base, z_max, total_h)

    if "balcony" in features:
        _build_balcony(grid, style, 0, y_top - floor_h, 0, x_max, z_max)

    if "bay_window" in features:
        _build_bay_window(grid, style, 0, y_base + floor_h, z_max // 2, x_max)

    if "courtyard" in features:
        _build_courtyard(grid, style, 0, y_base, 0, x_max, z_max)

    if "garden" in features:
        _build_garden(grid, style, 0, y_base, 0, x_max, z_max)

    if "gate" in features:
        _build_gate(grid, style, 0, y_base, 0, x_max, z_max)

    if "wall" in features:
        _build_perimeter_wall(grid, style, 0, y_base, 0, x_max, z_max)

    if "fountain" in features:
        _build_fountain(grid, style, x_max // 2, y_base, z_max // 2)

    if "chapel" in features:
        _build_chapel_addon(grid, style, 0, y_base, 0, x_max, z_max)

    if "cellar" in features:
        _build_cellar(grid, style, 0, y_base, 0, x_max, z_max)

    if "pillar" in features:
        _build_interior_pillars(grid, style, 0, y_base, 0, x_max, z_max, y_top)

    if "dungeon" in features:
        _build_dungeon(grid, style, 0, y_base, 0, x_max, z_max)

    if "attic" in features:
        _build_attic(grid, style, 0, y_top, 0, x_max, z_max)

    # === Interior detail (always) ===
    _build_interior_furniture(grid, style, 0, y_base, 0, x_max, z_max, floor_h)
    _build_interior_lighting(grid, style, 0, y_base, 0, x_max, z_max, y_top)

    logger.info(f"Stage 2: Structure complete — {len(grid)} blocks")
    return grid


def _build_foundation(grid: VoxelGrid, style: str, fn: Dict, x_max: int, z_max: int,
                      y_base: int, height: int) -> None:
    """Build foundation below ground floor."""
    mat = fn["material"]
    if mat == "stone":
        block = "minecraft:cobblestone"
    elif mat == "cobble":
        block = "minecraft:cobblestone"
    else:
        block = get_block(style, "foundation")

    for y in range(y_base, 0):
        fill_cuboid(grid, 0, y, 0, x_max, y, z_max, block)


def _build_walls(grid: VoxelGrid, style: str, x1: int, y1: int, z1: int,
                 x2: int, y2: int, z2: int) -> None:
    """Build 4 walls with primary and accent blocks."""
    s = get_style(style)
    wall_blocks = s.get("wall", {})
    primary = wall_blocks.get("primary", "minecraft:stone_bricks")
    accent = wall_blocks.get("accent", "minecraft:mossy_stone_bricks")

    fill_walls(grid, x1, y1, z1, x2, y2, z2, primary)

    # Accent the bottom row and top row
    for x in range(x1, x2 + 1):
        for z in [z1, z2]:
            grid[(x, y1, z)] = accent
            grid[(x, y2, z)] = accent
    for z in range(z1, z2 + 1):
        for x in [x1, x2]:
            grid[(x, y1, z)] = accent
            grid[(x, y2, z)] = accent


def _build_windows(grid: VoxelGrid, style: str, windows_cfg: Dict,
                   x1: int, y1: int, z1: int, x2: int, y2: int, z2: int,
                   floor_h: int) -> None:
    """Carve window openings in walls."""
    s = get_style(style)
    window_b = s.get("window", {}).get("glass", "minecraft:glass_pane")
    frame_b = s.get("window", {}).get("frame", "minecraft:stone_brick_wall")

    pattern = windows_cfg.get("pattern", "even_spaced")
    spacing = windows_cfg.get("spacing", 3)

    window_height = max(1, (floor_h - 2) // 2)
    window_y = y1 + (floor_h - window_height) // 2

    # North wall (z = z1)
    _carve_windows_on_face(grid, window_b, "north", z1, x1, x2, window_y, window_height, spacing, pattern)
    # South wall (z = z2)
    _carve_windows_on_face(grid, window_b, "south", z2, x1, x2, window_y, window_height, spacing, pattern)
    # West wall (x = x1)
    _carve_windows_on_face(grid, window_b, "west", x1, z1, z2, window_y, window_height, spacing, pattern)
    # East wall (x = x2)
    _carve_windows_on_face(grid, window_b, "east", x2, z1, z2, window_y, window_height, spacing, pattern)


def _carve_windows_on_face(grid: VoxelGrid, window_block: str, face: str,
                           fixed: int, start: int, end: int,
                           y: int, height: int, spacing: int, pattern: str) -> None:
    """Carve windows on one face of the building."""
    length = end - start + 1
    positions = _window_positions(length, spacing, pattern)

    for pos in positions:
        actual = start + pos
        for dy in range(height):
            if face == "north" or face == "south":
                coord = (actual, y + dy, fixed)
            else:
                coord = (fixed, y + dy, actual)
            if coord in grid:
                grid[coord] = window_block


def _window_positions(length: int, spacing: int, pattern: str) -> list:
    """Compute window column indices within a wall face."""
    positions = []
    if pattern == "even_spaced":
        i = max(1, spacing // 2)
        while i < length - 1:
            positions.append(i)
            i += spacing
    elif pattern == "alternating":
        for i in range(1, length - 1, 2):
            positions.append(i)
    elif pattern == "pairs":
        i = max(1, spacing // 2)
        while i < length - 2:
            positions.append(i)
            positions.append(i + 1)
            i += spacing
    return positions


def _build_roof(grid: VoxelGrid, style: str, rf: Dict,
                x1: int, y: int, z1: int, x2: int, z2: int) -> None:
    """Build roof based on blueprint type."""
    roof_type = rf.get("type", "pitched")
    overhang = rf.get("overhang", 1)
    s = get_style(style)
    roof_blocks = s.get("roof", {})
    roof_block = roof_blocks.get("block", "minecraft:oak_stairs")

    if roof_type == "pitched":
        # Determine ridge direction based on which axis is longer
        width = x2 - x1 + 1
        depth = z2 - z1 + 1
        direction = "z" if depth >= width else "x"
        pitched_roof(grid, x1, y, z1, x2, z2, roof_block, direction)
    elif roof_type == "flat":
        flat_roof(grid, x1, y, z1, x2, z2, roof_block, overhang)
    elif roof_type == "dome":
        _build_dome_roof(grid, x1, y, z1, x2, z2, roof_block)
    elif roof_type == "pyramid":
        _build_pyramid_roof(grid, x1, y, z1, x2, z2, roof_block)


def _build_dome_roof(grid: VoxelGrid, x1: int, y: int, z1: int,
                     x2: int, z2: int, block: str) -> None:
    """Build a dome-shaped roof."""
    cx = (x1 + x2) / 2
    cz = (z1 + z2) / 2
    rx = (x2 - x1) / 2
    rz = (z2 - z1) / 2
    height = int(min(rx, rz))

    for dy in range(height + 1):
        ratio = 1 - (dy / max(height, 1))
        r_x = rx * ratio
        r_z = rz * ratio
        for x in range(x1, x2 + 1):
            for z in range(z1, z2 + 1):
                dx = (x - cx) / max(r_x, 0.1)
                dz = (z - cz) / max(r_z, 0.1)
                if dx * dx + dz * dz <= 1.0:
                    grid[(x, y + dy, z)] = block


def _build_pyramid_roof(grid: VoxelGrid, x1: int, y: int, z1: int,
                        x2: int, z2: int, block: str) -> None:
    """Build a pyramid-shaped roof."""
    width = x2 - x1 + 1
    depth = z2 - z1 + 1
    height = min(width, depth) // 2

    for dy in range(height + 1):
        shrink = dy
        nx1 = x1 + shrink
        nz1 = z1 + shrink
        nx2 = x2 - shrink
        nz2 = z2 - shrink
        if nx1 > nx2 or nz1 > nz2:
            break
        fill_cuboid(grid, nx1, y + dy, nz1, nx2, y + dy, nz2, block)


def _build_pillars(grid: VoxelGrid, style: str, x1: int, y1: int, z1: int,
                   x2: int, z2: int, y_top: int) -> None:
    """Add decorative pillars at corners."""
    pillar_block = get_block(style, "pillar")
    for x in [x1, x2]:
        for z in [z1, z2]:
            for y in range(y1, y_top + 1):
                grid[(x, y, z)] = pillar_block


def _build_tower(grid: VoxelGrid, style: str, fp: Dict, rf: Dict,
                 floors: int, floor_h: int, foundation_h: int) -> None:
    """Add a tower in one corner of the structure."""
    width = fp["width"]
    depth = fp["depth"]
    tower_size = max(3, min(6, width // 3))

    tx1, tz1 = 0, 0
    tx2, tz2 = tower_size - 1, tower_size - 1
    y_base = -foundation_h
    tower_height = (floors + 1) * floor_h

    s = get_style(style)
    wall_b = s.get("wall", {}).get("primary", "minecraft:stone_bricks")

    # Tower walls
    hollow_cuboid(grid, tx1, y_base, tz1, tx2, y_base + tower_height, tz2, wall_b)

    # Tower floor
    fill_floor(grid, tx1, y_base, tz1, tx2, tz2,
               get_block(style, "floor"))

    # Tower roof
    roof_b = s.get("roof", {}).get("block", "minecraft:oak_stairs")
    pitched_roof(grid, tx1, y_base + tower_height + 1, tz1, tx2, tz2, roof_b)

    logger.info(f"Stage 2: Added tower ({tower_size}x{tower_size}, height {tower_height})")


def _build_chimney(grid: VoxelGrid, style: str, x_max: int, z_max: int,
                   y_top: int, rf: Dict) -> None:
    """Add a chimney stack."""
    chimney_b = get_block(style, "chimney")
    # Place chimney in back corner
    cx, cz = x_max - 2, z_max - 2
    for y in range(y_top - 1, y_top + 4):
        grid[(cx, y, cz)] = chimney_b
        grid[(cx + 1, y, cz)] = chimney_b
        grid[(cx, y, cz + 1)] = chimney_b
        grid[(cx + 1, y, cz + 1)] = chimney_b

    logger.info("Stage 2: Added chimney")


def _build_staircase(grid: VoxelGrid, style: str, x: int, y_base: int,
                     z: int, total_h: int) -> None:
    """Add an internal spiral staircase."""
    stair_b = get_block(style, "stair")
    spiral_staircase(grid, x - 2, y_base, z - 2, 1, total_h, stair_b)
    logger.info("Stage 2: Added spiral staircase")


def _build_balcony(grid: VoxelGrid, style: str, x1: int, y: int,
                   z1: int, x2: int, z2: int) -> None:
    """Add a balcony on one side of the top floor."""
    s = get_style(style)
    floor_b = get_block(style, "floor")
    fence_b = s.get("trim", {}).get("ledge", "minecraft:oak_fence")

    # Balcony on south face
    balcony_depth = 2
    for x in range(x1, x2 + 1):
        for dz in range(balcony_depth):
            grid[(x, y, z2 + 1 + dz)] = floor_b
    # Railing
    for x in range(x1, x2 + 1):
        grid[(x, y + 1, z2 + balcony_depth)] = fence_b

    logger.info("Stage 2: Added balcony")


def _build_bay_window(grid: VoxelGrid, style: str, x1: int, y: int,
                      z_center: int, x_max: int) -> None:
    """Add a bay window protruding from one wall."""
    s = get_style(style)
    wall_b = s.get("wall", {}).get("secondary", "minecraft:cobblestone")
    window_b = s.get("window", {}).get("glass", "minecraft:glass_pane")

    bx = x_max + 1
    bz_start = z_center - 1
    bz_end = z_center + 1

    # Small protruding cuboid
    hollow_cuboid(grid, bx, y, bz_start, bx + 1, y + 2, bz_end, wall_b)
    # Window in front
    grid[(bx + 1, y + 1, z_center)] = window_b

    logger.info("Stage 2: Added bay window")


def _build_courtyard(grid: VoxelGrid, style: str, x1: int, y_base: int, z1: int,
                     x2: int, z2: int) -> None:
    """Add a walled courtyard extending from the south face."""
    wall_b = get_block(style, "wall", "primary")
    floor_b = get_block(style, "floor")
    width = x2 - x1 + 1
    courtyard_depth = max(4, width // 2)

    cz1 = z2 + 1
    cz2 = z2 + courtyard_depth

    fill_floor(grid, x1, y_base, cz1, x2, cz2, floor_b)
    fill_walls(grid, x1, y_base + 1, cz1, x2, y_base + 3, cz2, wall_b)
    for x in range(x1, x2 + 1):
        for y in range(y_base + 1, y_base + 4):
            grid[(x, y, z2)] = "minecraft:air"
    logger.info(f"Stage 2: Added courtyard ({width}x{courtyard_depth})")


def _build_garden(grid: VoxelGrid, style: str, x1: int, y_base: int, z1: int,
                  x2: int, z2: int) -> None:
    """Add a garden with paths and greenery on the south side."""
    path_b = "minecraft:gravel"
    grass_b = "minecraft:grass_block"
    flower_blocks = ["minecraft:poppy", "minecraft:dandelion", "minecraft:blue_orchid",
                     "minecraft:azure_bluet", "minecraft:red_tulip"]

    gz1 = z2 + 1
    gz2 = z2 + 5

    for x in range(x1 - 1, x2 + 2):
        for z in range(gz1, gz2 + 1):
            grid[(x, y_base, z)] = grass_b

    mid_x = (x1 + x2) // 2
    for z in range(gz1, gz2 + 1):
        grid[(mid_x, y_base, z)] = path_b
        if mid_x + 1 <= x2 + 1:
            grid[(mid_x + 1, y_base, z)] = path_b

    for x in range(x1, x2 + 1, 2):
        for z in [gz1, gz2]:
            grid[(x, y_base + 1, z)] = "minecraft:oak_fence"
        grid[(x, y_base + 1, gz1)] = flower_blocks[(x - x1) % len(flower_blocks)]

    logger.info("Stage 2: Added garden")


def _build_gate(grid: VoxelGrid, style: str, x1: int, y_base: int, z1: int,
                x2: int, z2: int) -> None:
    """Add an arched gate on the south face."""
    gate_b = get_block(style, "wall", "primary")
    mid_x = (x1 + x2) // 2

    for y in range(y_base + 1, y_base + 4):
        grid[(mid_x, y, z2)] = "minecraft:air"
        grid[(mid_x + 1, y, z2)] = "minecraft:air"

    for y in range(y_base + 1, y_base + 5):
        grid[(mid_x - 1, y, z2)] = gate_b
        grid[(mid_x + 2, y, z2)] = gate_b

    grid[(mid_x, y_base + 4, z2)] = gate_b
    grid[(mid_x + 1, y_base + 4, z2)] = gate_b

    stair_b = get_block(style, "stair")
    grid[(mid_x - 1, y_base + 5, z2)] = stair_b
    grid[(mid_x + 2, y_base + 5, z2)] = stair_b

    logger.info("Stage 2: Added gate")


def _build_perimeter_wall(grid: VoxelGrid, style: str, x1: int, y_base: int, z1: int,
                          x2: int, z2: int) -> None:
    """Add a low perimeter wall around the structure."""
    wall_b = get_block(style, "wall", "secondary")
    fence_b = get_block(style, "pillar")

    offset = 4
    wx1 = x1 - offset
    wz1 = z1 - offset
    wx2 = x2 + offset
    wz2 = z2 + offset

    for x in range(wx1, wx2 + 1):
        grid[(x, y_base + 1, wz1)] = wall_b
        grid[(x, y_base + 2, wz1)] = fence_b
        grid[(x, y_base + 1, wz2)] = wall_b
        grid[(x, y_base + 2, wz2)] = fence_b
    for z in range(wz1 + 1, wz2):
        grid[(wx1, y_base + 1, z)] = wall_b
        grid[(wx1, y_base + 2, z)] = fence_b
        grid[(wx2, y_base + 1, z)] = wall_b
        grid[(wx2, y_base + 2, z)] = fence_b

    logger.info("Stage 2: Added perimeter wall")


def _build_fountain(grid: VoxelGrid, style: str, cx: int, y_base: int, cz: int) -> None:
    """Add a decorative fountain."""
    stone_b = "minecraft:stone_bricks"
    water_b = "minecraft:water"
    slab_b = "minecraft:stone_brick_slab"

    for dx in range(-2, 3):
        for dz in range(-2, 3):
            if abs(dx) == 2 or abs(dz) == 2:
                grid[(cx + dx, y_base, cz + dz)] = stone_b
            elif dx == 0 and dz == 0:
                grid[(cx + dx, y_base, cz + dz)] = water_b
            else:
                grid[(cx + dx, y_base, cz + dz)] = slab_b

    grid[(cx, y_base + 1, cz)] = "minecraft:stone_brick_wall"
    grid[(cx, y_base + 2, cz)] = water_b

    logger.info("Stage 2: Added fountain")


def _build_chapel_addon(grid: VoxelGrid, style: str, x1: int, y_base: int, z1: int,
                        x2: int, z2: int) -> None:
    """Add a small chapel wing attached to the building."""
    wall_b = get_block(style, "wall", "primary")
    floor_b = get_block(style, "floor")
    roof_b = get_block(style, "roof", "block")

    cw = max(4, (x2 - x1 + 1) // 3)
    cx1 = x2 + 1
    cx2 = cx1 + cw - 1
    cz1 = z1 + (z2 - z1) // 4
    cz2 = z2 - (z2 - z1) // 4
    ch = 5

    hollow_cuboid(grid, cx1, y_base, cz1, cx2, y_base + ch, cz2, wall_b)
    fill_floor(grid, cx1, y_base, cz1, cx2, cz2, floor_b)
    for z in range(cz1, cz2 + 1):
        for y in range(y_base + 1, y_base + ch):
            grid[(x2, y, z)] = "minecraft:air"
    pitched_roof(grid, cx1, y_base + ch + 1, cz1, cx2, cz2, roof_b, "x")

    grid[((cx1 + cx2) // 2), y_base + 1, cz1] = "minecraft:glass_pane"

    logger.info(f"Stage 2: Added chapel ({cw}x{cz2 - cz1 + 1})")


def _build_cellar(grid: VoxelGrid, style: str, x1: int, y_base: int, z1: int,
                  x2: int, z2: int) -> None:
    """Add a cellar below the main floor."""
    cellar_b = "minecraft:cobblestone"
    fill_cuboid(grid, x1 + 1, y_base - 2, z1 + 1, x2 - 1, y_base - 1, z2 - 1, cellar_b)
    fill_cuboid(grid, x1 + 1, y_base - 2, z1 + 1, x2 - 1, y_base - 1, z2 - 1, "minecraft:air")
    fill_cuboid(grid, x1 + 1, y_base - 2, z1 + 1, x2 - 1, y_base - 1, z2 - 1, cellar_b,
                replace_only={"minecraft:air"})
    hollow_cuboid(grid, x1 + 1, y_base - 2, z1 + 1, x2 - 1, y_base - 1, z2 - 1, cellar_b)
    grid[((x1 + x2) // 2), y_base - 1, z1] = "minecraft:air"
    grid[((x1 + x2) // 2), y_base, z1] = "minecraft:ladder"
    grid[((x1 + x2) // 2), y_base - 1, z1] = "minecraft:ladder"

    logger.info("Stage 2: Added cellar")


def _build_interior_pillars(grid: VoxelGrid, style: str, x1: int, y_base: int, z1: int,
                            x2: int, z2: int, y_top: int) -> None:
    """Add interior support pillars."""
    pillar_b = get_block(style, "pillar")
    width = x2 - x1 + 1
    depth = z2 - z1 + 1
    spacing = max(4, min(6, width // 2))

    for x in range(x1 + spacing, x2, spacing):
        for y in range(y_base + 1, y_top):
            grid[(x, y, z1 + 1)] = pillar_b
            grid[(x, y, z2 - 1)] = pillar_b

    logger.info("Stage 2: Added interior pillars")


def _build_dungeon(grid: VoxelGrid, style: str, x1: int, y_base: int, z1: int,
                   x2: int, z2: int) -> None:
    """Add dungeon cells below the structure."""
    cell_b = "minecraft:cobblestone"
    bar_b = "minecraft:iron_bars"
    cell_size = 3

    for cx in range(x1 + 1, x2 - 1, cell_size + 1):
        for cz in range(z1 + 1, z2 - 1, cell_size + 1):
            fill_cuboid(grid, cx, y_base - 3, cz, cx + cell_size - 1, y_base - 1, cz + cell_size - 1, cell_b)
            fill_cuboid(grid, cx + 1, y_base - 2, cz + 1, cx + cell_size - 2, y_base - 1, cz + cell_size - 2, "minecraft:air")
            grid[(cx + cell_size // 2, y_base - 2, cz)] = bar_b
            grid[(cx + cell_size // 2, y_base - 1, cz)] = bar_b

    logger.info("Stage 2: Added dungeon")


def _build_attic(grid: VoxelGrid, style: str, x1: int, y_top: int, z1: int,
                 x2: int, z2: int) -> None:
    """Add an attic floor above the top floor."""
    floor_b = get_block(style, "floor")
    fill_floor(grid, x1, y_top + 1, z1, x2, z2, floor_b)
    logger.info("Stage 2: Added attic")


def _build_interior_furniture(grid: VoxelGrid, style: str, x1: int, y_base: int,
                              z1: int, x2: int, z2: int, floor_h: int) -> None:
    """Add basic furniture on each floor."""
    mid_x = (x1 + x2) // 2
    mid_z = (z1 + z2) // 2

    grid[(x1 + 2, y_base + 1, z1 + 2)] = "minecraft:crafting_table"
    grid[(x1 + 3, y_base + 1, z1 + 2)] = "minecraft:furnace"
    grid[(x2 - 2, y_base + 1, z1 + 2)] = "minecraft:chest"
    grid[(x2 - 3, y_base + 1, z1 + 2)] = "minecraft:barrel"
    grid[(mid_x, y_base + 1, mid_z)] = "minecraft:crafting_table"
    grid[(mid_x + 1, y_base + 1, mid_z)] = "minecraft:anvil"
    grid[(mid_x, y_base + 1, mid_z - 1)] = "minecraft:cauldron"

    for dx in range(-1, 2):
        for dz in range(-1, 2):
            if 0 <= mid_x + dx <= x2 and 0 <= mid_z + dz <= z2:
                grid[(mid_x + dx, y_base + 1, mid_z + dz)] = "minecraft:red_carpet"

    logger.info("Stage 2: Added interior furniture")


def _build_interior_lighting(grid: VoxelGrid, style: str, x1: int, y_base: int,
                             z1: int, x2: int, z2: int, y_top: int) -> None:
    """Add lanterns and torches throughout interior."""
    mid_x = (x1 + x2) // 2
    mid_z = (z1 + z2) // 2

    for y in range(y_base + 1, y_top):
        grid[(mid_x, y, mid_z)] = "minecraft:lantern"
        grid[(x1 + 2, y, z1 + 2)] = "minecraft:torch"
        grid[(x2 - 2, y, z2 - 2)] = "minecraft:torch"
        grid[(x1 + 2, y, z2 - 2)] = "minecraft:torch"
        grid[(x2 - 2, y, z1 + 2)] = "minecraft:torch"

    logger.info("Stage 2: Added interior lighting")
