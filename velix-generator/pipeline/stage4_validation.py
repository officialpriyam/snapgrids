"""
Stage 4 — Validation & Repair (Pure Code)

Deterministic checks and auto-repair for structural integrity.
"""

import logging
from typing import Dict, Any, Set, List, Tuple, Optional

from .primitives import VoxelGrid, get_bounds, block_count, block_count_by_type

logger = logging.getLogger(__name__)

AIR_BLOCKS = {"minecraft:air", "minecraft:cave_air", "minecraft:void_air"}

NON_FLOORING = {
    "minecraft:air", "minecraft:cave_air", "minecraft:void_air",
    "minecraft:glass_pane", "minecraft:glass",
    "minecraft:chain", "minecraft:lantern", "minecraft:soul_lantern",
    "minecraft:torch", "minecraft:soul_torch",
    "minecraft:flower_pot", "minecraft:button", "minecraft:lever",
}

FLOATING_OK = {
    "minecraft:ladder", "minecraft:vine", "minecraft:cobweb",
    "minecraft:torch", "minecraft:soul_torch",
    "minecraft:lantern", "minecraft:soul_lantern",
    "minecraft:chain", "minecraft:bell",
}


def validate_and_repair(grid: VoxelGrid, blueprint: Dict[str, Any]) -> Dict[str, int]:
    """Run all validation checks and repair issues.

    Args:
        grid: Mutable voxel grid
        blueprint: Blueprint from Stage 1 (for context)

    Returns:
        Dict of repair action counts: {"floating_removed": n, "gaps_filled": n, ...}
    """
    stats = {
        "floating_removed": 0,
        "gaps_filled": 0,
        "interior_opened": 0,
        "height_fixed": 0,
        "palette_fixed": 0,
        "foundation_filled": 0,
    }

    bounds = get_bounds(grid)
    if not bounds:
        return stats

    logger.info("Stage 4: Starting validation & repair...")

    # 1. Remove floating blocks (no support below)
    stats["floating_removed"] = _remove_floating_blocks(grid, bounds)

    # 2. Fill roof-wall gaps
    stats["gaps_filled"] = _fill_roof_wall_gaps(grid, bounds)

    # 3. Ensure interior accessibility (no sealed rooms)
    stats["interior_opened"] = _ensure_interior_access(grid, bounds, blueprint)

    # 4. Floor height consistency
    stats["height_fixed"] = _fix_floor_heights(grid, bounds, blueprint)

    # 5. Palette leakage (blocks from wrong style)
    stats["palette_fixed"] = _fix_palette_leakage(grid, bounds, blueprint)

    # 6. Foundation completeness
    stats["foundation_filled"] = _fill_foundation(grid, bounds, blueprint)

    logger.info(f"Stage 4: Repair complete — {stats}")
    return stats


def _remove_floating_blocks(grid: VoxelGrid, bounds: Tuple) -> int:
    """Remove blocks with no support below (except allowed floating types)."""
    (x1, y1, z1), (x2, y2, z2) = bounds
    removed = 0

    for x in range(x1, x2 + 1):
        for z in range(z1, z2 + 1):
            for y in range(y1 + 1, y2 + 1):
                block = grid.get((x, y, z))
                if not block or block in AIR_BLOCKS or block in FLOATING_OK:
                    continue

                # Check support
                below = grid.get((x, y - 1, z))
                if below in AIR_BLOCKS or not below:
                    # Check diagonal support
                    supported = False
                    for dx, dz in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                        diag = grid.get((x + dx, y - 1, z + dz))
                        if diag and diag not in AIR_BLOCKS:
                            supported = True
                            break

                    if not supported:
                        del grid[(x, y, z)]
                        removed += 1

    return removed


def _fill_roof_wall_gaps(grid: VoxelGrid, bounds: Tuple) -> int:
    """Fill single-block gaps between roof and walls."""
    (x1, y1, z1), (x2, y2, z2) = bounds
    filled = 0

    # Find roof level (highest non-air blocks)
    roof_heights = {}
    for x in range(x1, x2 + 1):
        for z in range(z1, z2 + 1):
            for y in range(y2, y1 - 1, -1):
                if grid.get((x, y, z)) and grid[(x, y, z)] not in AIR_BLOCKS:
                    roof_heights[(x, z)] = y
                    break

    # Check each wall top for gaps
    for x in range(x1, x2 + 1):
        for z in [z1, z2]:
            roof_y = roof_heights.get((x, z))
            wall_top = None
            for y in range(roof_y - 1 if roof_y else y2, y1 - 1, -1):
                if grid.get((x, y, z)) and grid[(x, y, z)] not in AIR_BLOCKS:
                    wall_top = y
                    break

            if roof_y and wall_top and roof_y - wall_top == 2:
                # Single block gap — fill it
                grid[(x, wall_top + 1, z)] = grid.get((x, roof_y, z), "minecraft:stone_bricks")
                filled += 1

    for z in range(z1, z2 + 1):
        for x in [x1, x2]:
            roof_y = roof_heights.get((x, z))
            wall_top = None
            for y in range(roof_y - 1 if roof_y else y2, y1 - 1, -1):
                if grid.get((x, y, z)) and grid[(x, y, z)] not in AIR_BLOCKS:
                    wall_top = y
                    break

            if roof_y and wall_top and roof_y - wall_top == 2:
                grid[(x, wall_top + 1, z)] = grid.get((x, roof_y, z), "minecraft:stone_bricks")
                filled += 1

    return filled


def _ensure_interior_access(grid: VoxelGrid, bounds: Tuple, blueprint: Dict) -> int:
    """Ensure all interior spaces are reachable from entrance."""
    (x1, y1, z1), (x2, y2, z2) = bounds
    opened = 0

    entrance_face = blueprint.get("entrance_face", "south")
    floor_h = blueprint["floors"]["floor_height"]

    # Find entrance position
    if entrance_face == "south":
        entrance_x = (x1 + x2) // 2
        entrance_z = z2
    elif entrance_face == "north":
        entrance_x = (x1 + x2) // 2
        entrance_z = z1
    elif entrance_face == "east":
        entrance_x = x2
        entrance_z = (z1 + z2) // 2
    else:  # west
        entrance_x = x1
        entrance_z = (z1 + z2) // 2

    entrance_y = y1 + 1  # Ground floor level

    # BFS from entrance to find reachable air spaces
    from collections import deque
    reachable = set()
    queue = deque()

    start = (entrance_x, entrance_y, entrance_z)
    if start not in grid or grid[start] in AIR_BLOCKS:
        queue.append(start)
        reachable.add(start)

    dirs = [(1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)]

    while queue:
        x, y, z = queue.popleft()
        for dx, dy, dz in dirs:
            nx, ny, nz = x + dx, y + dy, z + dz
            if x1 <= nx <= x2 and y1 <= ny <= y2 and z1 <= nz <= z2:
                if (nx, ny, nz) not in reachable:
                    blk = grid.get((nx, ny, nz))
                    if blk in AIR_BLOCKS or not blk:
                        reachable.add((nx, ny, nz))
                        queue.append((nx, ny, nz))

    # Find interior air pockets that are sealed (not reachable)
    for x in range(x1 + 1, x2):
        for z in range(z1 + 1, z2):
            for y in range(y1 + 1, y2):
                if (x, y, z) in reachable:
                    continue
                blk = grid.get((x, y, z))
                if blk in AIR_BLOCKS or not blk:
                    # Sealed interior pocket — carve a 1-block opening
                    # Find nearest wall block to replace
                    for dx, dy, dz in dirs:
                        wx, wy, wz = x + dx, y + dy, z + dz
                        wall_blk = grid.get((wx, wy, wz))
                        if wall_blk and wall_blk not in AIR_BLOCKS:
                            grid[(wx, wy, wz)] = "minecraft:air"
                            opened += 1
                            break

    return opened


def _fix_floor_heights(grid: VoxelGrid, bounds: Tuple, blueprint: Dict) -> int:
    """Ensure all floors have consistent height."""
    (x1, y1, z1), (x2, y2, z2) = bounds
    fixed = 0
    floor_h = blueprint["floors"]["floor_height"]
    floors = blueprint["floors"]["count"]
    foundation_h = blueprint["foundation"]["height"]

    for f in range(floors):
        floor_y = y1 + foundation_h + f * floor_h
        ceiling_y = floor_y + floor_h - 1

        # Check floor blocks at floor_y
        for x in range(x1 + 1, x2):
            for z in range(z1 + 1, z2):
                blk = grid.get((x, floor_y, z))
                if blk in AIR_BLOCKS or not blk:
                    # Missing floor block — fill with style floor
                    style = blueprint["style"]
                    floor_block = _get_floor_block(style)
                    grid[(x, floor_y, z)] = floor_block
                    fixed += 1

                # Check ceiling
                ceil_blk = grid.get((x, ceiling_y, z))
                if ceil_blk in AIR_BLOCKS or not ceil_blk:
                    style = blueprint["style"]
                    ceil_block = _get_ceiling_block(style)
                    grid[(x, ceiling_y, z)] = ceil_block
                    fixed += 1

    return fixed


def _fix_palette_leakage(grid: VoxelGrid, bounds: Tuple, blueprint: Dict) -> int:
    """Replace blocks that don't match the style palette."""
    (x1, y1, z1), (x2, y2, z2) = bounds
    fixed = 0

    style = blueprint["style"]
    valid_blocks = _get_valid_style_blocks(style)

    for (x, y, z), block in list(grid.items()):
        if block not in valid_blocks and block not in AIR_BLOCKS:
            # Find closest valid replacement
            replacement = _closest_palette_block(block, valid_blocks)
            grid[(x, y, z)] = replacement
            fixed += 1

    return fixed


def _fill_foundation(grid: VoxelGrid, bounds: Tuple, blueprint: Dict) -> int:
    """Ensure foundation is solid below ground floor."""
    (x1, y1, z1), (x2, y2, z2) = bounds
    filled = 0
    foundation_h = blueprint["foundation"]["height"]
    style = blueprint["style"]

    if foundation_h <= 0:
        return 0

    foundation_block = _get_foundation_block(style)

    for x in range(x1, x2 + 1):
        for z in range(z1, z2 + 1):
            for y in range(y1, y1 + foundation_h):
                blk = grid.get((x, y, z))
                if blk in AIR_BLOCKS or not blk:
                    grid[(x, y, z)] = foundation_block
                    filled += 1

    return filled


def _get_valid_style_blocks(style: str) -> Set[str]:
    """Get all valid block IDs for a style."""
    from .styles import get_style

    s = get_style(style)
    valid = set()

    for key, val in s.items():
        if isinstance(val, dict):
            for v in val.values():
                if isinstance(v, str) and v.startswith("minecraft:"):
                    valid.add(v)
        elif isinstance(val, str) and val.startswith("minecraft:"):
            valid.add(val)

    # Add common structural blocks that are style-neutral
    valid.update({
        "minecraft:air", "minecraft:cave_air", "minecraft:void_air",
        "minecraft:glass_pane", "minecraft:glass",
        "minecraft:iron_bars", "minecraft:chain", "minecraft:lantern",
        "minecraft:soul_lantern", "minecraft:torch", "minecraft:soul_torch",
    })

    return valid


def _closest_palette_block(block: str, valid_blocks: Set[str]) -> str:
    """Find closest palette block (simple fallback)."""
    # For now, just return a default stone brick
    if "stone" in block or "brick" in block:
        return "minecraft:stone_bricks"
    if "wood" in block or "plank" in block or "log" in block:
        return "minecraft:oak_planks"
    if "sand" in block or "terracotta" in block:
        return "minecraft:sandstone"
    if "concrete" in block:
        return "minecraft:white_concrete"
    return "minecraft:stone_bricks"


def _get_floor_block(style: str) -> str:
    from .styles import get_block
    return get_block(style, "floor")


def _get_ceiling_block(style: str) -> str:
    from .styles import get_block
    return get_block(style, "ceiling")


def _get_foundation_block(style: str) -> str:
    from .styles import get_block
    return get_block(style, "foundation")