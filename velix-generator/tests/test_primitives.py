"""
Unit tests for pipeline primitives and validation.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from pipeline.primitives import (
    fill_cuboid, hollow_cuboid, fill_floor, fill_walls,
    pitched_roof, flat_roof, cylinder, spiral_staircase,
    get_bounds, block_count, block_count_by_type,
    _compute_window_positions,
)
from pipeline.styles import get_style, get_block, STYLE_CONFIGS, VALID_STYLES
from pipeline.stage1_blueprint import validate_blueprint
from pipeline.stage4_validation import validate_and_repair
from pipeline.stage2_structure import generate_structure


def test_fill_cuboid():
    grid = {}
    fill_cuboid(grid, 0, 0, 0, 2, 2, 2, "minecraft:stone_bricks")
    assert len(grid) == 27  # 3x3x3
    assert grid[(0, 0, 0)] == "minecraft:stone_bricks"
    assert grid[(2, 2, 2)] == "minecraft:stone_bricks"
    print("PASS: fill_cuboid")


def test_hollow_cuboid():
    grid = {}
    fill_cuboid(grid, 0, 0, 0, 2, 2, 2, "minecraft:air")
    hollow_cuboid(grid, 0, 0, 0, 2, 2, 2, "minecraft:stone_bricks")
    # 3x3x3 = 27 total entries: 26 stone bricks (faces) + 1 air (interior)
    assert len(grid) == 27
    assert grid[(1, 1, 1)] == "minecraft:air"  # interior untouched
    face_count = sum(1 for v in grid.values() if v == "minecraft:stone_bricks")
    assert face_count == 26
    print("PASS: hollow_cuboid")


def test_fill_floor():
    grid = {}
    fill_floor(grid, 0, 5, 0, 3, 3, "minecraft:oak_planks")
    assert block_count(grid) == 16  # 4x4
    assert grid[(0, 5, 0)] == "minecraft:oak_planks"
    print("PASS: fill_floor")


def test_pitched_roof():
    grid = {}
    pitched_roof(grid, 0, 10, 0, 4, 6, "minecraft:spruce_stairs", "z")
    count = block_count(grid)
    assert count > 0, "Pitched roof should produce blocks"
    # Ridge at center z should be higher than edges
    bounds = get_bounds(grid)
    assert bounds is not None
    (_, _, _), (_, y_max, _) = bounds
    assert y_max > 10, f"Roof should go above base y=10, got y_max={y_max}"
    # Edge z=0 should only be at base height
    assert grid.get((2, 10, 0)) is not None
    print("PASS: pitched_roof")


def test_cylinder():
    grid = {}
    cylinder(grid, 5, 0, 5, 3, 4, "minecraft:stone_bricks", filled=True)
    count = block_count(grid)
    assert count > 50, f"Cylinder should have >50 blocks, got {count}"
    print("PASS: cylinder")


def test_get_bounds():
    grid = {(0, 0, 0): "a", (5, 3, 2): "b"}
    (x1, y1, z1), (x2, y2, z2) = get_bounds(grid)
    assert x1 == 0 and y1 == 0 and z1 == 0
    assert x2 == 5 and y2 == 3 and z2 == 2
    print("PASS: get_bounds")


def test_block_count():
    grid = {(0, 0, 0): "a", (1, 0, 0): "b", (0, 0, 0): "c"}
    assert block_count(grid) == 2  # duplicate key
    print("PASS: block_count")


def test_window_positions():
    # Even spaced
    pos = _compute_window_positions(10, 3, "even_spaced")
    assert len(pos) > 0
    assert all(0 < p < 9 for p in pos)

    # Alternating
    pos2 = _compute_window_positions(8, 3, "alternating")
    assert len(pos2) > 0

    # Pairs
    pos3 = _compute_window_positions(12, 4, "pairs")
    assert len(pos3) > 0
    print("PASS: window_positions")


def test_styles():
    assert "medieval_stone" in STYLE_CONFIGS
    assert "modern_glass" in STYLE_CONFIGS
    assert "desert_sandstone" in STYLE_CONFIGS

    s = get_style("medieval_stone")
    assert "wall" in s
    assert "roof" in s

    block = get_block("medieval_stone", "wall", "primary")
    assert block.startswith("minecraft:")
    print("PASS: styles")


def test_validate_blueprint():
    bp = validate_blueprint({})
    assert bp["style"] in VALID_STYLES
    assert 5 <= bp["footprint"]["width"] <= 30
    assert 1 <= bp["floors"]["count"] <= 4
    print("PASS: validate_blueprint")


def test_full_structure():
    bp = validate_blueprint({
        "style": "medieval_stone",
        "shape": "rectangular",
        "footprint": {"width": 8, "depth": 6, "wings": 0},
        "floors": {"count": 1, "floor_height": 4},
        "roof": {"type": "flat", "overhang": 0, "chimney": False},
        "features": [],
        "foundation": {"height": 0, "material": "stone"},
        "windows": {"pattern": "even_spaced", "spacing": 3},
    })
    grid = generate_structure(bp)
    count = block_count(grid)
    assert count > 100, f"Structure should have >100 blocks, got {count}"
    print(f"PASS: full_structure ({count} blocks)")


def test_validation_repair():
    bp = validate_blueprint({
        "style": "medieval_stone",
        "shape": "rectangular",
        "footprint": {"width": 6, "depth": 6, "wings": 0},
        "floors": {"count": 1, "floor_height": 4},
        "roof": {"type": "flat", "overhang": 0, "chimney": False},
        "features": [],
        "foundation": {"height": 1, "material": "stone"},
        "windows": {"pattern": "even_spaced", "spacing": 3},
    })
    grid = generate_structure(bp)
    before = block_count(grid)
    stats = validate_and_repair(grid, bp)
    after = block_count(grid)
    assert after >= before - 10, "Repair should not remove too many blocks"
    print(f"PASS: validation_repair ({before} -> {after}, stats={stats})")


if __name__ == "__main__":
    test_fill_cuboid()
    test_hollow_cuboid()
    test_fill_floor()
    test_pitched_roof()
    test_cylinder()
    test_get_bounds()
    test_block_count()
    test_window_positions()
    test_styles()
    test_validate_blueprint()
    test_full_structure()
    test_validation_repair()
    print("\n=== ALL TESTS PASSED ===")
