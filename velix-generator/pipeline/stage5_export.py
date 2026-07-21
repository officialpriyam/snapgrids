"""
Stage 5 — Export to .schem (Sponge Schematic v2)

Converts the voxel grid to a gzipped NBT file using the custom NBTWriter.
"""

import logging
import gzip
from pathlib import Path
from typing import Dict, Any, Tuple, List

from .primitives import VoxelGrid, get_bounds
from utils.nbt_writer import NBTWriter, TAG_COMPOUND, write_varint

logger = logging.getLogger(__name__)


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

    width = x2 - x1 + 1
    height = y2 - y1 + 1
    length = z2 - z1 + 1

    logger.info(f"Stage 5: Exporting schematic {width}x{height}x{length} to {output_path}")

    # Build position -> block_id map, shift to origin
    block_map = {}
    for (x, y, z), block in grid.items():
        block_map[(x - x1, y - y1, z - z1)] = block

    # Build palette (blockstate string -> index)
    palette = {}
    next_idx = 0
    for block in grid.values():
        if block not in palette:
            palette[block] = next_idx
            next_idx += 1
    if 'minecraft:air' not in palette:
        palette['minecraft:air'] = next_idx

    # Build block data (varint-encoded palette indices), YZX order per Sponge spec
    block_data = bytearray()
    for y in range(height):
        for z in range(length):
            for x in range(width):
                block_id = block_map.get((x, y, z), 'minecraft:air')
                idx = palette.get(block_id, 0)
                block_data.extend(write_varint(idx))

    # Build NBT using NBTWriter
    w = NBTWriter()

    w.begin_compound('Schematic')

    # Metadata
    w.write_int('Version', 2)
    w.write_int('DataVersion', 3955)

    # Dimensions
    w.write_short('Width', width)
    w.write_short('Height', height)
    w.write_short('Length', length)
    w.write_int_array('Offset', [0, 0, 0])

    # Palette
    w.begin_compound('Palette')
    for blockstate, idx in palette.items():
        w.write_int(blockstate, idx)
    w.end_compound()

    w.write_int('PaletteMax', len(palette))

    # Block data
    w.write_byte_array('BlockData', bytes(block_data))

    # Empty lists
    w.begin_list('BlockEntities', TAG_COMPOUND, 0)
    w.begin_list('Entities', TAG_COMPOUND, 0)

    w.end_compound()  # end Schematic

    # Write gzipped
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    raw = w.get_bytes()
    with gzip.open(output_path, 'wb') as f:
        f.write(raw)

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
