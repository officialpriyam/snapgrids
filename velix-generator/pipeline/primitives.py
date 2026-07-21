"""
Primitive geometry operations — pure code, no LLM.

Every function operates on a 3D voxel grid: dict[(x,y,z)] = "minecraft:block_name"
All functions are deterministic and seed-independent.
"""

from typing import Dict, Tuple, Optional, Set
import math

VoxelGrid = Dict[Tuple[int, int, int], str]


def fill_cuboid(grid: VoxelGrid, x1: int, y1: int, z1: int,
                 x2: int, y2: int, z2: int, block: str,
                 replace_only: Optional[Set[str]] = None) -> None:
    """Fill a solid cuboid from (x1,y1,z1) to (x2,y2,z2) inclusive."""
    for x in range(min(x1, x2), max(x1, x2) + 1):
        for y in range(min(y1, y2), max(y1, y2) + 1):
            for z in range(min(z1, z2), max(z1, z2) + 1):
                if replace_only is None or grid.get((x, y, z)) in replace_only:
                    grid[(x, y, z)] = block


def hollow_cuboid(grid: VoxelGrid, x1: int, y1: int, z1: int,
                   x2: int, y2: int, z2: int, block: str,
                   replace_only: Optional[Set[str]] = None) -> None:
    """Fill only the 6 faces of a cuboid (walls, floor, ceiling)."""
    x_min, x_max = min(x1, x2), max(x1, x2)
    y_min, y_max = min(y1, y2), max(y1, y2)
    z_min, z_max = min(z1, z2), max(z1, z2)

    for x in range(x_min, x_max + 1):
        for y in range(y_min, y_max + 1):
            for z in range(z_min, z_max + 1):
                is_face = (x == x_min or x == x_max or
                           y == y_min or y == y_max or
                           z == z_min or z == z_max)
                if is_face:
                    if replace_only is None or grid.get((x, y, z)) in replace_only:
                        grid[(x, y, z)] = block


def fill_floor(grid: VoxelGrid, x1: int, y: int, z1: int,
               x2: int, z2: int, block: str) -> None:
    """Fill a flat floor at height y."""
    fill_cuboid(grid, x1, y, z1, x2, y, z2, block)


def fill_walls(grid: VoxelGrid, x1: int, y1: int, z1: int,
               x2: int, y2: int, z2: int, block: str,
               exclude_interior: bool = True) -> None:
    """Fill only the 4 vertical walls of a structure."""
    x_min, x_max = min(x1, x2), max(x1, x2)
    y_min, y_max = min(y1, y2), max(y1, y2)
    z_min, z_max = min(z1, z2), max(z1, z2)

    for x in range(x_min, x_max + 1):
        for y in range(y_min, y_max + 1):
            for z in range(z_min, z_max + 1):
                is_wall = (x == x_min or x == x_max or z == z_min or z == z_max)
                is_interior = (x_min < x < x_max and z_min < z < z_max)
                if is_wall or (not exclude_interior):
                    grid[(x, y, z)] = block


def pitched_roof(grid: VoxelGrid, x1: int, base_y: int, z1: int,
                 x2: int, z2: int, block: str, direction: str = "z") -> None:
    """Add a pitched (A-frame) roof sloping along the given axis.

    direction="z": ridge runs along Z axis, slopes rise toward center Z
    direction="x": ridge runs along X axis, slopes rise toward center X
    """
    if direction == "z":
        z_min, z_max = min(z1, z2), max(z1, z2)
        width = z_max - z_min + 1
        ridge_y_offset = width // 2

        for z in range(z_min, z_max + 1):
            dist_from_center = abs(z - (z_min + z_max) / 2)
            slope_y = int(ridge_y_offset - dist_from_center)
            for x in range(min(x1, x2), max(x1, x2) + 1):
                for dy in range(slope_y + 1):
                    grid[(x, base_y + dy, z)] = block
    else:
        x_min, x_max = min(x1, x2), max(x1, x2)
        width = x_max - x_min + 1
        ridge_y_offset = width // 2

        for x in range(x_min, x_max + 1):
            dist_from_center = abs(x - (x_min + x_max) / 2)
            slope_y = int(ridge_y_offset - dist_from_center)
            for z in range(min(z1, z2), max(z1, z2) + 1):
                for dy in range(slope_y + 1):
                    grid[(x, base_y + dy, z)] = block


def flat_roof(grid: VoxelGrid, x1: int, y: int, z1: int,
              x2: int, z2: int, block: str,
              overhang: int = 1) -> None:
    """Add a flat roof with optional overhang."""
    fill_cuboid(grid,
                min(x1, x2) - overhang, y, min(z1, z2) - overhang,
                max(x1, x2) + overhang, y, max(z1, z2) + overhang,
                block)


def cylinder(grid: VoxelGrid, cx: int, y_base: int, cz: int,
             radius: int, height: int, block: str,
             filled: bool = True) -> None:
    """Place a cylinder centered on (cx, cz) at y_base."""
    for dy in range(height):
        for dx in range(-radius, radius + 1):
            for dz in range(-radius, radius + 1):
                dist = math.sqrt(dx * dx + dz * dz)
                if filled and dist <= radius + 0.5:
                    grid[(cx + dx, y_base + dy, cz + dz)] = block
                elif not filled and radius - 1 < dist <= radius + 0.5:
                    grid[(cx + dx, y_base + dy, cz + dz)] = block


def spiral_staircase(grid: VoxelGrid, cx: int, y_start: int, cz: int,
                     radius: int, total_height: int, block: str,
                     direction: str = "ccw") -> None:
    """Place a spiral staircase. direction: 'ccw' (counter-clockwise) or 'cw'."""
    steps = total_height * 4  # 4 steps per block of height
    for i in range(steps):
        angle = (2 * math.pi * i) / 4 if direction == "ccw" else -(2 * math.pi * i) / 4
        sx = int(cx + radius * math.cos(angle))
        sz = int(cz + radius * math.sin(angle))
        sy = y_start + i // 4
        grid[(sx, sy, sz)] = block


def symmetrical_facade(grid: VoxelGrid, x1: int, y1: int, z1: int,
                       x2: int, y2: int, z2: int,
                       blocks: Dict[str, str],
                       window_pattern: str = "even_spaced",
                       window_spacing: int = 3) -> None:
    """Build a symmetric facade with walls, windows, and decorative trim.

    blocks dict keys: wall, window, trim, frame
    window_pattern: 'even_spaced', 'alternating', 'pairs'
    """
    wall_b = blocks.get("wall", "minecraft:stone_bricks")
    window_b = blocks.get("window", "minecraft:glass_pane")
    trim_b = blocks.get("trim", "minecraft:stone_brick_stairs")
    frame_b = blocks.get("frame", "minecraft:stone_brick_wall")

    x_min, x_max = min(x1, x2), max(x1, x2)
    y_min, y_max = min(y1, y2), max(y1, y2)
    z_min, z_max = min(z1, z2), max(z1, z2)

    # Build solid walls
    fill_walls(grid, x1, y1, z1, x2, y2, z2, wall_b)

    # Carve windows on each face
    width = x_max - x_min + 1
    depth = z_max - z_min + 1
    floor_height = y_max - y_min + 1

    window_height = max(1, floor_height // 3)
    window_y_start = y_min + floor_height // 3

    for face in ["north", "south", "east", "west"]:
        if face in ("north", "south"):
            face_len = width
            perp = "z"
            fixed_z = z_min if face == "north" else z_max
        else:
            face_len = depth
            perp = "x"
            fixed_x = x_min if face == "west" else x_max

        positions = _compute_window_positions(face_len, window_spacing, window_pattern)
        for pos in positions:
            for wy in range(window_y_start, min(window_y_start + window_height, y_max)):
                if perp == "z":
                    wx = x_min + pos
                    if (wx, wy, fixed_z) in grid:
                        grid[(wx, wy, fixed_z)] = window_b
                else:
                    wz = z_min + pos
                    if (fixed_x, wy, wz) in grid:
                        grid[(fixed_x, wy, wz)] = window_b

    # Add trim along top
    for x in range(x_min, x_max + 1):
        for z in [z_min, z_max]:
            if (x, y_max + 1, z) not in grid:
                grid[(x, y_max + 1, z)] = trim_b
    for z in range(z_min, z_max + 1):
        for x in [x_min, x_max]:
            if (x, y_max + 1, z) not in grid:
                grid[(x, y_max + 1, z)] = trim_b


def window_row(grid: VoxelGrid, face: str, fixed_coord: int,
               start: int, end: int, y: int, height: int,
               block: str) -> None:
    """Place a row of windows along a wall face.

    face: 'north', 'south', 'east', 'west'
    fixed_coord: the fixed axis value (z for north/south, x for east/west)
    start, end: range along the varying axis
    """
    for i in range(start, end + 1):
        for dy in range(height):
            if face in ("north", "south"):
                grid[(i, y + dy, fixed_coord)] = block
            else:
                grid[(fixed_coord, y + dy, i)] = block


def cornice_trim(grid: VoxelGrid, x1: int, y: int, z1: int,
                 x2: int, z2: int, stair_block: str,
                 slab_block: Optional[str] = None) -> None:
    """Add a cornice (decorative overhang) around the top of a structure."""
    x_min, x_max = min(x1, x2), max(x1, x2)
    z_min, z_max = min(z1, z2), max(z1, z2)

    # Stair blocks around the perimeter
    for x in range(x_min - 1, x_max + 2):
        for z_off in [-1, 0]:
            z = z_min + z_off if z_off == -1 else z_max + 1 - z_off
            z = z_min - 1 if z_off == -1 else z_max + 1
            grid[(x, y, z)] = stair_block
            if slab_block:
                grid[(x, y + 1, z)] = slab_block

    for z in range(z_min, z_max + 1):
        grid[(x_min - 1, y, z)] = stair_block
        grid[(x_max + 1, y, z)] = stair_block
        if slab_block:
            grid[(x_min - 1, y + 1, z)] = slab_block
            grid[(x_max + 1, y + 1, z)] = slab_block


def mirror_module(grid: VoxelGrid, x1: int, y1: int, z1: int,
                  x2: int, y2: int, z2: int,
                  mirror_axis: str = "x") -> None:
    """Copy a voxel region and mirror it across the given axis.

    mirror_axis='x': mirrors along X (copies from negative side to positive)
    mirror_axis='z': mirrors along Z
    """
    source = {}
    for x in range(min(x1, x2), max(x1, x2) + 1):
        for y in range(min(y1, y2), max(y1, y2) + 1):
            for z in range(min(z1, z2), max(z1, z2) + 1):
                if (x, y, z) in grid:
                    source[(x, y, z)] = grid[(x, y, z)]

    offset_x = max(x1, x2) + 1
    offset_z = max(z1, z2) + 1

    for (x, y, z), block in source.items():
        if mirror_axis == "x":
            new_x = offset_x + (offset_x - 1 - x)
            grid[(new_x, y, z)] = block
        elif mirror_axis == "z":
            new_z = offset_z + (offset_z - 1 - z)
            grid[(x, y, new_z)] = block


def tile_module(grid: VoxelGrid, x1: int, y1: int, z1: int,
                x2: int, y2: int, z2: int,
                tx: int, ty: int, tz: int) -> None:
    """Tile a voxel region tx times in X, ty times in Y, tz times in Z.

    Tiles are placed adjacent to each other, repeating the pattern.
    """
    source = {}
    for x in range(min(x1, x2), max(x1, x2) + 1):
        for y in range(min(y1, y2), max(y1, y2) + 1):
            for z in range(min(z1, z2), max(z1, z2) + 1):
                if (x, y, z) in grid:
                    source[(x, y, z)] = grid[(x, y, z)]

    if not source:
        return

    orig_min_x = min(x for (x, y, z) in source)
    orig_min_y = min(y for (x, y, z) in source)
    orig_min_z = min(z for (x, y, z) in source)
    size_x = max(x for (x, y, z) in source) - orig_min_x + 1
    size_y = max(y for (x, y, z) in source) - orig_min_y + 1
    size_z = max(z for (x, y, z) in source) - orig_min_z + 1

    for tx_i in range(tx):
        for ty_i in range(ty):
            for tz_i in range(tz):
                if tx_i == 0 and ty_i == 0 and tz_i == 0:
                    continue  # skip original
                for (x, y, z), block in source.items():
                    nx = x - orig_min_x + orig_min_x + tx_i * size_x
                    ny = y - orig_min_y + orig_min_y + ty_i * size_y
                    nz = z - orig_min_z + orig_min_z + tz_i * size_z
                    grid[(nx, ny, nz)] = block


def get_bounds(grid: VoxelGrid) -> Optional[Tuple[Tuple[int, int, int], Tuple[int, int, int]]]:
    """Return (min_corner, max_corner) of the grid, or None if empty."""
    if not grid:
        return None
    xs = [x for (x, y, z) in grid]
    ys = [y for (x, y, z) in grid]
    zs = [z for (x, y, z) in grid]
    return (min(xs), min(ys), min(zs)), (max(xs), max(ys), max(zs))


def block_count(grid: VoxelGrid) -> int:
    """Count total blocks in grid."""
    return len(grid)


def block_count_by_type(grid: VoxelGrid) -> Dict[str, int]:
    """Count blocks by type."""
    counts: Dict[str, int] = {}
    for block in grid.values():
        counts[block] = counts.get(block, 0) + 1
    return counts


def _compute_window_positions(length: int, spacing: int, pattern: str) -> list:
    """Compute window column positions along a face of given length."""
    positions = []
    if pattern == "even_spaced":
        i = spacing // 2
        while i < length - 1:
            positions.append(i)
            i += spacing
    elif pattern == "alternating":
        for i in range(1, length - 1, 2):
            positions.append(i)
    elif pattern == "pairs":
        i = 1
        while i < length - 2:
            positions.append(i)
            positions.append(i + 1)
            i += spacing
    return positions
