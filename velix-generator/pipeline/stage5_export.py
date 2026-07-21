"""
Stage 5 — Export to .schem (Sponge Schematic v2)

Converts the voxel grid to a gzipped NBT file using the custom NBT writer.
"""

import logging
import gzip
from pathlib import Path
from typing import Dict, Any, Tuple, List, Optional

from .primitives import VoxelGrid, get_bounds
from ..utils.nbt_writer import (
    write_schematic, NBTCompound, NBTByteArray, NBTInt, NBTShort,
    NBTString, NBTList, NBTByte,
)

logger = logging.getLogger(__name__)

BLOCK_ID_MAP = {
    "minecraft:air": 0,
    "minecraft:cave_air": 0,
    "minecraft:void_air": 0,
    "minecraft:stone": 1,
    "minecraft:grass_block": 2,
    "minecraft:dirt": 3,
    "minecraft:cobblestone": 4,
    "minecraft:planks": 5,
    "minecraft:spruce_planks": 5,
    "minecraft:birch_planks": 5,
    "minecraft:jungle_planks": 5,
    "minecraft:acacia_planks": 5,
    "minecraft:dark_oak_planks": 5,
    "minecraft:stone_bricks": 98,
    "minecraft:mossy_stone_bricks": 98,
    "minecraft:cracked_stone_bricks": 98,
    "minecraft:chiseled_stone_bricks": 98,
    "minecraft:glass_pane": 160,
    "minecraft:glass": 20,
    "minecraft:spruce_log": 17,
    "minecraft:dark_oak_log": 17,
    "minecraft:spruce_stairs": 134,
    "minecraft:dark_oak_stairs": 134,
    "minecraft:oak_stairs": 134,
    "minecraft:cobblestone_stairs": 134,
    "minecraft:sandstone_stairs": 134,
    "minecraft:quartz_stairs": 134,
    "minecraft:smooth_sandstone_stairs": 134,
    "minecraft:smooth_sandstone_slab": 44,
    "minecraft:sandstone_slab": 44,
    "minecraft:cobblestone_slab": 44,
    "minecraft:stone_brick_slab": 44,
    "minecraft:oak_slab": 44,
    "minecraft:spruce_slab": 44,
    "minecraft:dark_oak_slab": 44,
    "minecraft:quartz_slab": 44,
    "minecraft:white_concrete": 251,
    "minecraft:light_gray_concrete": 251,
    "minecraft:gray_concrete": 251,
    "minecraft:white_terracotta": 159,
    "minecraft:smooth_stone": 1,
    "minecraft:quartz_block": 155,
    "minecraft:quartz_pillar": 155,
    "minecraft:iron_bars": 101,
    "minecraft:sandstone": 24,
    "minecraft:cut_sandstone": 24,
    "minecraft:smooth_sandstone": 24,
    "minecraft:chiseled_sandstone": 24,
    "minecraft:acacia_planks": 5,
    "minecraft:orange_stained_glass_pane": 160,
    "minecraft:acacia_fence": 183,
    "minecraft:acacia_stairs": 134,
    "minecraft:acacia_door": 428,
    "minecraft:stripped_dark_oak_log": 17,
    "minecraft:stripped_spruce_log": 17,
    "minecraft:spruce_planks": 5,
    "minecraft:dark_oak_planks": 5,
    "minecraft:spruce_fence": 183,
    "minecraft:spruce_door": 428,
    "minecraft:cobblestone_wall": 139,
    "minecraft:stone_brick_wall": 139,
    "minecraft:oak_fence": 183,
    "minecraft:stone_brick_stairs": 134,
    "minecraft:dark_oak_fence": 183,
}

PALETTE_BLOCKS = list(dict.fromkeys(BLOCK_ID_MAP.keys()))  # deduplicate, keep order


def export_schematic(grid: VoxelGrid, blueprint: Dict[str, Any],
                     output_path: str) -> Dict[str, Any]:
    """Export voxel grid to Sponge Schematic v2 (.schem file).

    Args:
        grid: Final voxel grid from Stage 4
        blueprint: Original blueprint (for metadata)
        output_path: Path to write .schem file

    Returns:
        Dict with export info: size, block count, palette size, file path
    """
    bounds = get_bounds(grid)
    if not bounds:
        raise ValueError("Empty grid — nothing to export")

    (x1, y1, z1), (x2, y2, z2) = bounds

    # Dimensions
    width = x2 - x1 + 1
    height = y2 - y1 + 1
    length = z2 - z1 + 1

    logger.info(f"Stage 5: Exporting schematic {width}x{height}x{length} to {output_path}")

    # Build palette (unique blocks in grid)
    used_blocks = set(grid.values())
    palette = [b for b in PALETTE_BLOCKS if b in used_blocks]

    # Ensure air is first
    if "minecraft:air" not in palette:
        palette.insert(0, "minecraft:air")

    # Map block name -> palette index
    palette_index = {name: i for i, name in enumerate(palette)}

    # Build block data array (palette indices)
    block_data = bytearray(width * height * length)

    def idx(x: int, y: int, z: int) -> int:
        """Convert 3D coords to 1D array index (YZX order for Sponge)."""
        # Sponge uses YZX ordering: index = (y * length + z) * width + x
        return ((y - y1) * length + (z - z1)) * width + (x - x1)

    for (x, y, z), block in grid.items():
        if x1 <= x <= x2 and y1 <= y <= y2 and z1 <= z <= z2:
            pi = palette_index.get(block, 0)
            block_data[idx(x, y, z)] = pi

    # Build NBT
    schematic = NBTCompound({
        "Width": NBTShort(width),
        "Height": NBTShort(height),
        "Length": NBTShort(length),
        "Palette": _build_palette_nbt(palette),
        "BlockData": NBTByteArray(bytes(block_data)),
        "Entities": NBTList([]),
        "TileEntities": NBTList([]),
        "Metadata": NBTCompound({
            "name": NBTString(blueprint.get("name", "unnamed")),
            "style": NBTString(blueprint.get("style", "medieval_stone")),
            "floors": NBTByte(blueprint.get("floors", {}).get("count", 1)),
            "generated_by": NBTString("velix-generator"),
        }),
    })

    # Write to file
    root = NBTCompound({"Schematic": schematic})
    write_schematic(root, output_path)

    file_size = Path(output_path).stat().st_size

    result = {
        "file_path": output_path,
        "width": width,
        "height": height,
        "length": length,
        "block_count": len(grid),
        "palette_size": len(palette),
        "file_size_bytes": file_size,
    }

    logger.info(f"Stage 5: Export complete — {result}")
    return result


def _build_palette_nbt(palette: List[str]) -> NBTList:
    """Build Palette NBT list from block names."""
    entries = []
    for name in palette:
        # Parse namespace and block name
        if ":" in name:
            ns, block = name.split(":", 1)
        else:
            ns, block = "minecraft", name

        # Properties (empty for now)
        properties = NBTCompound({})

        entry = NBTCompound({
            "Name": NBTString(name),
            "Properties": properties,
        })
        entries.append(entry)

    return NBTList(entries)


def load_schematic(file_path: str) -> Tuple[VoxelGrid, Dict[str, Any]]:
    """Load a .schem file back into a voxel grid (for testing/round-trip).

    Returns:
        (grid, metadata_dict)
    """
    from ..utils.nbt_writer import read_schematic, NBTCompound, NBTByteArray

    root = read_schematic(file_path)
    schematic = root.get("Schematic")

    if not isinstance(schematic, NBTCompound):
        raise ValueError("Invalid schematic: missing Schematics compound")

    width = schematic.get("Width").value if schematic.get("Width") else 0
    height = schematic.get("Height").value if schematic.get("Height") else 0
    length = schematic.get("Length").value if schematic.get("Length") else 0

    palette_nbt = schematic.get("Palette")
    block_data_nbt = schematic.get("BlockData")
    metadata_nbt = schematic.get("Metadata")

    if not all([palette_nbt, block_data_nbt]):
        raise ValueError("Invalid schematic: missing palette or block data")

    # Parse palette
    palette = []
    for entry in palette_nbt.value:
        name_comp = entry.get("Name")
        if name_comp:
            palette.append(name_comp.value)

    # Parse block data
    block_data = block_data_nbt.value if isinstance(block_data_nbt, NBTByteArray) else b""

    # Reconstruct grid
    grid: VoxelGrid = {}
    for y in range(height):
        for z in range(length):
            for x in range(width):
                idx = (y * length + z) * width + x
                if idx < len(block_data):
                    pi = block_data[idx]
                    if pi < len(palette) and palette[pi] != "minecraft:air":
                        grid[(x, y, z)] = palette[pi]

    metadata = {}
    if metadata_nbt:
        for key, val in metadata_nbt.value.items():
            if hasattr(val, 'value'):
                metadata[key] = val.value

    logger.info(f"Stage 5: Loaded schematic {width}x{height}x{length}, {len(grid)} blocks")
    return grid, metadata