"""
Style and palette configuration for schematic generation.

Each style defines block palettes for every structural element.
LLM blueprint stage only picks from these pre-defined styles.
"""

from typing import Dict, Any

STYLE_CONFIGS: Dict[str, Dict[str, Any]] = {
    "medieval_stone": {
        "display_name": "Medieval Stone",
        "description": "Dark stone bricks, spruce wood, cobblestone. Classic medieval castle/keep aesthetic.",
        "wall": {
            "primary": "minecraft:stone_bricks",
            "secondary": "minecraft:cobblestone",
            "accent": "minecraft:mossy_stone_bricks",
            "fill": "minecraft:andesite",
        },
        "floor": "minecraft:spruce_planks",
        "ceiling": "minecraft:spruce_planks",
        "roof": {
            "type": "pitched",
            "block": "minecraft:dark_oak_stairs",
            "ridge": "minecraft:dark_oak_slab",
            "trim": "minecraft:dark_oak_fence",
        },
        "window": {
            "glass": "minecraft:glass_pane",
            "frame": "minecraft:stone_brick_wall",
            "sill": "minecraft:stone_brick_stairs",
        },
        "door": {
            "frame": "minecraft:spruce_stairs",
            "door": "minecraft:spruce_door",
        },
        "trim": {
            "cornice": "minecraft:stone_brick_stairs",
            "ledge": "minecraft:cobblestone_wall",
            "pillar": "minecraft:stone_brick_wall",
        },
        "foundation": "minecraft:cobblestone",
        "pillar": "minecraft:stone_brick_wall",
        "stair": "minecraft:cobblestone_stairs",
        "chimney": "minecraft:stone_bricks",
    },

    "modern_glass": {
        "display_name": "Modern Glass",
        "description": "Clean white concrete, large glass panes, steel accents. Contemporary architectural style.",
        "wall": {
            "primary": "minecraft:white_concrete",
            "secondary": "minecraft:light_gray_concrete",
            "accent": "minecraft:gray_concrete",
            "fill": "minecraft:white_terracotta",
        },
        "floor": "minecraft:smooth_stone",
        "ceiling": "minecraft:white_concrete",
        "roof": {
            "type": "flat",
            "block": "minecraft:quartz_slab",
            "ridge": "minecraft:quartz_slab",
            "trim": "minecraft:iron_bars",
        },
        "window": {
            "glass": "minecraft:light_blue_stained_glass_pane",
            "frame": "minecraft:iron_bars",
            "sill": "minecraft:smooth_stone_slab",
        },
        "door": {
            "frame": "minecraft:quartz_stairs",
            "door": "minecraft:spruce_door",
        },
        "trim": {
            "cornice": "minecraft:quartz_slab",
            "ledge": "minecraft:iron_bars",
            "pillar": "minecraft:quartz_pillar",
        },
        "foundation": "minecraft:smooth_stone",
        "pillar": "minecraft:quartz_pillar",
        "stair": "minecraft:quartz_stairs",
        "chimney": "minecraft:smooth_stone",
    },

    "desert_sandstone": {
        "display_name": "Desert Sandstone",
        "description": "Warm sandstone, terracotta accents, acacia wood. North African / Middle Eastern aesthetic.",
        "wall": {
            "primary": "minecraft:sandstone",
            "secondary": "minecraft:cut_sandstone",
            "accent": "minecraft:smooth_sandstone",
            "fill": "minecraft:chiseled_sandstone",
        },
        "floor": "minecraft:acacia_planks",
        "ceiling": "minecraft:acacia_planks",
        "roof": {
            "type": "flat",
            "block": "minecraft:smooth_sandstone_slab",
            "ridge": "minecraft:smooth_sandstone_slab",
            "trim": "minecraft:acacia_fence",
        },
        "window": {
            "glass": "minecraft:orange_stained_glass_pane",
            "frame": "minecraft:acacia_fence",
            "sill": "minecraft:cut_sandstone_slab",
        },
        "door": {
            "frame": "minecraft:acacia_stairs",
            "door": "minecraft:acacia_door",
        },
        "trim": {
            "cornice": "minecraft:smooth_sandstone_stairs",
            "ledge": "minecraft:acacia_fence",
            "pillar": "minecraft:chiseled_sandstone",
        },
        "foundation": "minecraft:sandstone",
        "pillar": "minecraft:chiseled_sandstone",
        "stair": "minecraft:sandstone_stairs",
        "chimney": "minecraft:sandstone",
    },

    "rustic_wood": {
        "display_name": "Rustic Wood",
        "description": "Dark logs, stripped wood, stone foundation. Cozy cabin / mountain lodge aesthetic.",
        "wall": {
            "primary": "minecraft:stripped_dark_oak_log",
            "secondary": "minecraft:dark_oak_planks",
            "accent": "minecraft:stripped_spruce_log",
            "fill": "minecraft:spruce_planks",
        },
        "floor": "minecraft:spruce_planks",
        "ceiling": "minecraft:dark_oak_planks",
        "roof": {
            "type": "pitched",
            "block": "minecraft:spruce_stairs",
            "ridge": "minecraft:spruce_slab",
            "trim": "minecraft:spruce_fence",
        },
        "window": {
            "glass": "minecraft:glass_pane",
            "frame": "minecraft:spruce_fence",
            "sill": "minecraft:spruce_stairs",
        },
        "door": {
            "frame": "minecraft:spruce_stairs",
            "door": "minecraft:spruce_door",
        },
        "trim": {
            "cornice": "minecraft:spruce_stairs",
            "ledge": "minecraft:spruce_fence",
            "pillar": "minecraft:spruce_fence",
        },
        "foundation": "minecraft:cobblestone",
        "pillar": "minecraft:spruce_fence",
        "stair": "minecraft:spruce_stairs",
        "chimney": "minecraft:cobblestone",
    },
}

DEFAULT_STYLE = "medieval_stone"

VALID_STYLES = list(STYLE_CONFIGS.keys())

VALID_FEATURES = [
    "tower", "courtyard", "wall", "gate", "chapel", "cellar",
    "balcony", "bay_window", "chimney", "staircase", "pillar",
    "fountain", "garden", "bridge", "dungeon", "attic",
]

VALID_ROOF_TYPES = ["pitched", "flat", "dome", "pyramid"]

VALID_SHAPES = ["rectangular", "l_shaped", "u_shaped", "cross", "circular"]


def get_style(style_name: str) -> Dict[str, Any]:
    """Get a style config by name, defaulting to DEFAULT_STYLE."""
    return STYLE_CONFIGS.get(style_name, STYLE_CONFIGS[DEFAULT_STYLE])


def get_block(style_name: str, element: str, variant: str = "primary") -> str:
    """Get a specific block from a style.

    style_name: e.g. "medieval_stone"
    element: e.g. "wall", "floor", "roof"
    variant: for elements with sub-blocks, e.g. "primary", "secondary"
    """
    style = get_style(style_name)
    val = style.get(element, "")
    if isinstance(val, dict):
        return val.get(variant, val.get("primary", val.get("block", "minecraft:stone_bricks")))
    return str(val) if val else "minecraft:stone_bricks"
