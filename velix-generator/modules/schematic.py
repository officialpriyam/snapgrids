import json
import uuid
import os
import gzip
import struct
import io
import time
import requests
from utils.nbt_writer import write_schematic
from utils.block_palette import find_closest_block, can_float, BLOCK_PALETTE

NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

MODELS = [
    'minimaxai/minimax-m2.7',
    'minimaxai/minimax-m3',
    'nvidia/llama-3.3-nemotron-super-49b-v1.5',
    'meta/llama-3.1-70b-instruct',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
]


def generate_schematic(prompt, size=48, mode='generate', output_dir='output'):
    file_id = str(uuid.uuid4())[:12]

    blocks = []
    try:
        blocks = _llm_voxel_approach(prompt, size)
    except Exception as e:
        print(f'[SchematicGen] LLM failed: {e}')
        blocks = []

    if not blocks:
        print(f'[SchematicGen] Procedural fallback for: {prompt}')
        blocks = _procedural_fallback(prompt, size)

    blocks = _deduplicate(blocks)
    blocks = _support_check(blocks)
    blocks = _bounding_box_check(blocks, size)

    if not blocks:
        blocks = _procedural_fallback(prompt, size)

    block_count = len([b for b in blocks if b['id'] != 'minecraft:air'])

    print(f'[SchematicGen] Building schematic: {block_count} non-air blocks')

    schem_path = _write_schem_file(blocks, size, file_id, output_dir)

    file_size = os.path.getsize(schem_path)
    print(f'[SchematicGen] Written {file_size} bytes')

    return {
        'file': f'schematic_{file_id}.schem',
        'download_url': f'/download/schematic_{file_id}.schem',
        'preview_url': f'/preview/schematic_{file_id}.schem',
        'block_count': block_count,
        'size': [size, size, size],
        'mode': mode
    }


def _write_schem_file(blocks, size, file_id, output_dir):
    out_path = os.path.join(output_dir, f'schematic_{file_id}.schem')
    write_schematic(blocks, size, out_path)
    return out_path


def _procedural_fallback(prompt, size):
    blocks = []
    p = prompt.lower()
    s = min(size, 48)

    if any(k in p for k in ['castle', 'fortress', 'fort', 'keep', 'tower']):
        blocks = _build_castle(s)
    elif any(k in p for k in ['house', 'cottage', 'home', 'hut', 'cabin', 'wooden']):
        blocks = _build_house(s)
    elif any(k in p for k in ['temple', 'shrine', 'church', 'pyramid']):
        blocks = _build_temple(s)
    elif any(k in p for k in ['bridge']):
        blocks = _build_bridge(s)
    elif any(k in p for k in ['wall', 'fence', 'gate']):
        blocks = _build_wall(s)
    elif any(k in p for k in ['tree', 'forest', 'nature']):
        blocks = _build_tree(s)
    else:
        blocks = _build_house(s)

    return blocks


def _build_house(size):
    """Build a detailed Minecraft cottage with proper layering."""
    blocks = []
    s = max(12, min(size, 48))
    w = s - 2

    # Foundation
    for x in range(-1, w + 3):
        for z in range(-1, w + 3):
            blocks.append({'x': x, 'y': -1, 'z': z, 'id': 'minecraft:cobblestone'})
            blocks.append({'x': x, 'y': -2, 'z': z, 'id': 'minecraft:stone'})

    # Floor
    for x in range(0, w + 2):
        for z in range(0, w + 2):
            blocks.append({'x': x, 'y': 0, 'z': z, 'id': 'minecraft:spruce_planks'})
            blocks.append({'x': x, 'y': 1, 'z': z, 'id': 'minecraft:oak_planks'})

    # Walls (2 blocks thick for depth)
    for y in range(2, 9):
        # Outer wall
        for x in [0, w + 1]:
            for z in range(0, w + 2):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:spruce_planks'})
        for z in [0, w + 1]:
            for x in range(0, w + 2):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:spruce_planks'})
        # Inner wall detail
        for x in [1, w]:
            for z in range(1, w + 1):
                if y <= 3:
                    blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:stripped_spruce_log'})

    # Corner logs
    for y in range(2, 10):
        for corner in [(0, 0), (w + 1, 0), (0, w + 1), (w + 1, w + 1)]:
            blocks.append({'x': corner[0], 'y': y, 'z': corner[1], 'id': 'minecraft:spruce_log'})

    # Windows (glass panes at regular intervals)
    for y in [4, 5, 6]:
        for x in range(3, w - 1, 4):
            blocks.append({'x': x, 'y': y, 'z': 0, 'id': 'minecraft:glass_pane'})
            blocks.append({'x': x, 'y': y, 'z': w + 1, 'id': 'minecraft:glass_pane'})
        for z in range(3, w - 1, 4):
            blocks.append({'x': 0, 'y': y, 'z': z, 'id': 'minecraft:glass_pane'})
            blocks.append({'x': w + 1, 'y': y, 'z': z, 'id': 'minecraft:glass_pane'})

    # Door opening
    mid = (w + 1) // 2
    for y in range(2, 5):
        blocks.append({'x': mid, 'y': y, 'z': 0, 'id': 'minecraft:air'})
        blocks.append({'x': mid + 1, 'y': y, 'z': 0, 'id': 'minecraft:air'})

    # Roof (slab-based for clean look)
    for x in range(-1, w + 3):
        for z in range(-1, w + 3):
            blocks.append({'x': x, 'y': 9, 'z': z, 'id': 'minecraft:spruce_slab'})
            dist_x = min(x, w + 1 - x)
            dist_z = min(z, w + 1 - z)
            min_dist = min(dist_x, dist_z)
            if min_dist >= 2:
                blocks.append({'x': x, 'y': 10, 'z': z, 'id': 'minecraft:spruce_slab'})
            if min_dist >= 3:
                blocks.append({'x': x, 'y': 11, 'z': z, 'id': 'minecraft:spruce_slab'})
            if min_dist >= 4:
                blocks.append({'x': x, 'y': 12, 'z': z, 'id': 'minecraft:spruce_slab'})

    # Interior furniture
    blocks.append({'x': 2, 'y': 2, 'z': 2, 'id': 'minecraft:crafting_table'})
    blocks.append({'x': 3, 'y': 2, 'z': 2, 'id': 'minecraft:furnace'})
    blocks.append({'x': w - 1, 'y': 2, 'z': 2, 'id': 'minecraft:chest'})
    blocks.append({'x': w - 2, 'y': 2, 'z': 2, 'id': 'minecraft:barrel'})
    blocks.append({'x': mid, 'y': 2, 'z': mid, 'id': 'minecraft:crafting_table'})
    blocks.append({'x': mid + 1, 'y': 2, 'z': mid, 'id': 'minecraft:anvil'})

    # Lighting
    blocks.append({'x': mid, 'y': 8, 'z': mid, 'id': 'minecraft:lantern'})
    blocks.append({'x': 2, 'y': 8, 'z': 2, 'id': 'minecraft:lantern'})
    blocks.append({'x': w - 1, 'y': 8, 'z': w - 1, 'id': 'minecraft:lantern'})

    # Carpet
    for x in range(mid - 1, mid + 2):
        for z in range(mid - 1, mid + 2):
            blocks.append({'x': x, 'y': 2, 'z': z, 'id': 'minecraft:red_carpet'})

    # Outside path
    for x in range(mid - 1, mid + 2):
        blocks.append({'x': x, 'y': 0, 'z': -1, 'id': 'minecraft:gravel'})
        blocks.append({'x': x, 'y': 0, 'z': -2, 'id': 'minecraft:gravel'})
        blocks.append({'x': x, 'y': 0, 'z': -3, 'id': 'minecraft:cobblestone'})

    # Garden
    for x in range(-2, w + 4):
        blocks.append({'x': x, 'y': 0, 'z': -1, 'id': 'minecraft:grass_block'})
        if x % 3 == 0:
            blocks.append({'x': x, 'y': 1, 'z': -1, 'id': 'minecraft:poppy'})
        elif x % 3 == 1:
            blocks.append({'x': x, 'y': 1, 'z': -1, 'id': 'minecraft:dandelion'})

    return blocks


def _build_castle(size):
    blocks = []
    s = max(16, min(size, 48))
    w = s - 2

    for x in range(0, w + 2):
        for z in range(0, w + 2):
            blocks.append({'x': x, 'y': 0, 'z': z, 'id': 'minecraft:cobblestone'})
            blocks.append({'x': x, 'y': -1, 'z': z, 'id': 'minecraft:stone_bricks'})

    for y in range(1, 12):
        for x in [0, w + 1]:
            for z in range(0, w + 2):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:stone_bricks'})
        for z in [0, w + 1]:
            for x in range(0, w + 2):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:stone_bricks'})

    for y in range(1, 12):
        for x in range(1, w + 1):
            for z in range(1, w + 1):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:cobblestone'})

    for y in range(12, 16):
        for x in [0, w + 1]:
            for z in range(0, w + 2):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:stone_brick_stairs'})
        for z in [0, w + 1]:
            for x in range(0, w + 2):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:stone_brick_stairs'})

    tower_pos = [(0, 0), (w + 1, 0), (0, w + 1), (w + 1, w + 1)]
    for tx, tz in tower_pos:
        for y in range(1, 18):
            for dx in range(-1, 2):
                for dz in range(-1, 2):
                    bx = tx + dx
                    bz = tz + dz
                    if 0 <= bx <= w + 1 and 0 <= bz <= w + 1:
                        blocks.append({'x': bx, 'y': y, 'z': bz, 'id': 'minecraft:mossy_stone_bricks'})
        for x in range(max(0, tx - 1), min(w + 2, tx + 2)):
            blocks.append({'x': x, 'y': 17, 'z': tz, 'id': 'minecraft:cobblestone_wall'})
            blocks.append({'x': x, 'y': 18, 'z': tz, 'id': 'minecraft:cobblestone_wall'})
        for z in range(max(0, tz - 1), min(w + 2, tz + 2)):
            blocks.append({'x': tx, 'y': 17, 'z': z, 'id': 'minecraft:cobblestone_wall'})
            blocks.append({'x': tx, 'y': 18, 'z': z, 'id': 'minecraft:cobblestone_wall'})
        blocks.append({'x': tx, 'y': 19, 'z': tz, 'id': 'minecraft:beacon'})

    mid = (w + 1) // 2
    for y in range(2, 6):
        for x in range(mid - 2, mid + 3):
            blocks.append({'x': x, 'y': y, 'z': 0, 'id': 'minecraft:air'})
    blocks.append({'x': mid, 'y': 2, 'z': -1, 'id': 'minecraft:air'})
    blocks.append({'x': mid + 1, 'y': 2, 'z': -1, 'id': 'minecraft:air'})

    for y in range(3, 9):
        for x in range(2, w, 3):
            blocks.append({'x': x, 'y': y, 'z': 0, 'id': 'minecraft:glass'})
            blocks.append({'x': x, 'y': y, 'z': w + 1, 'id': 'minecraft:glass'})
        for z in range(2, w, 3):
            blocks.append({'x': 0, 'y': y, 'z': z, 'id': 'minecraft:glass'})
            blocks.append({'x': w + 1, 'y': y, 'z': z, 'id': 'minecraft:glass'})

    for x in range(1, w + 1):
        for z in range(1, w + 1):
            blocks.append({'x': x, 'y': 1, 'z': z, 'id': 'minecraft:stone_bricks'})
            blocks.append({'x': x, 'y': 2, 'z': z, 'id': 'minecraft:cobblestone'})

    blocks.append({'x': mid, 'y': 3, 'z': mid, 'id': 'minecraft:enchanting_table'})
    blocks.append({'x': mid - 1, 'y': 3, 'z': mid, 'id': 'minecraft:crafting_table'})
    blocks.append({'x': mid + 1, 'y': 3, 'z': mid, 'id': 'minecraft:anvil'})
    blocks.append({'x': mid, 'y': 11, 'z': mid, 'id': 'minecraft:chandelier'})

    return blocks


def _build_temple(size):
    blocks = []
    s = max(14, min(size, 48))
    w = s - 2

    for x in range(-1, w + 3):
        for z in range(-1, w + 3):
            blocks.append({'x': x, 'y': 0, 'z': z, 'id': 'minecraft:quartz_block'})
            blocks.append({'x': x, 'y': -1, 'z': z, 'id': 'minecraft:smooth_stone'})

    for y in range(1, 12):
        for x in [0, w + 1]:
            for z in range(0, w + 2):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:quartz_block'})
        for z in [0, w + 1]:
            for x in range(0, w + 2):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:quartz_block'})

    for y in range(1, 13):
        for pos in [(0, 0), (w + 1, 0), (0, w + 1), (w + 1, w + 1)]:
            blocks.append({'x': pos[0], 'y': y, 'z': pos[1], 'id': 'minecraft:quartz_pillar'})

    for y in range(1, 12):
        for x in range(1, w + 1):
            for z in range(1, w + 1):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:quartz_block'})

    for x in range(0, w + 2):
        for z in range(0, w + 2):
            blocks.append({'x': x, 'y': 12, 'z': z, 'id': 'minecraft:quartz_block'})
    for level in range(5):
        inner = level + 1
        for x in range(inner, w + 2 - inner):
            for z in range(inner, w + 2 - inner):
                blocks.append({'x': x, 'y': 13 + level, 'z': z, 'id': 'minecraft:quartz_block'})
                if inner + 1 <= (w + 2) // 2:
                    blocks.append({'x': x, 'y': 13 + level, 'z': z, 'id': 'minecraft:quartz_block'})

    blocks.append({'x': (w + 1) // 2, 'y': 1, 'z': 0, 'id': 'minecraft:air'})
    blocks.append({'x': (w + 1) // 2, 'y': 2, 'z': 0, 'id': 'minecraft:air'})

    for x in range(1, w + 1):
        for z in range(1, w + 1):
            if (x + z) % 2 == 0:
                blocks.append({'x': x, 'y': 1, 'z': z, 'id': 'minecraft:quartz_block'})
            else:
                blocks.append({'x': x, 'y': 1, 'z': z, 'id': 'minecraft:chiseled_quartz_block'})
            blocks.append({'x': x, 'y': 2, 'z': z, 'id': 'minecraft:smooth_quartz'})

    mid = (w + 1) // 2
    blocks.append({'x': mid, 'y': 3, 'z': mid, 'id': 'minecraft:beacon'})
    blocks.append({'x': mid - 1, 'y': 3, 'z': mid, 'id': 'minecraft:sea_lantern'})
    blocks.append({'x': mid + 1, 'y': 3, 'z': mid, 'id': 'minecraft:sea_lantern'})
    blocks.append({'x': mid, 'y': 3, 'z': mid - 1, 'id': 'minecraft:sea_lantern'})
    blocks.append({'x': mid, 'y': 3, 'z': mid + 1, 'id': 'minecraft:sea_lantern'})
    blocks.append({'x': mid, 'y': 11, 'z': mid, 'id': 'minecraft:glowstone'})

    return blocks


def _build_bridge(size):
    blocks = []
    s = max(16, min(size, 48))

    for x in range(0, s):
        for z in range(s // 2 - 3, s // 2 + 3):
            blocks.append({'x': x, 'y': 5, 'z': z, 'id': 'minecraft:oak_planks'})
            blocks.append({'x': x, 'y': 4, 'z': z, 'id': 'minecraft:spruce_planks'})
        blocks.append({'x': x, 'y': 6, 'z': s // 2 - 3, 'id': 'minecraft:oak_fence'})
        blocks.append({'x': x, 'y': 6, 'z': s // 2 + 2, 'id': 'minecraft:oak_fence'})
        blocks.append({'x': x, 'y': 7, 'z': s // 2 - 3, 'id': 'minecraft:oak_fence'})
        blocks.append({'x': x, 'y': 7, 'z': s // 2 + 2, 'id': 'minecraft:oak_fence'})
        for y in range(0, 4):
            blocks.append({'x': x, 'y': y, 'z': s // 2 - 1, 'id': 'minecraft:stone_bricks'})
            blocks.append({'x': x, 'y': y, 'z': s // 2, 'id': 'minecraft:stone_bricks'})
            blocks.append({'x': x, 'y': y, 'z': s // 2 + 1, 'id': 'minecraft:stone_bricks'})

    for x in range(0, s, 3):
        for y in range(0, 6):
            blocks.append({'x': x, 'y': y, 'z': s // 2 - 3, 'id': 'minecraft:mossy_stone_bricks'})
            blocks.append({'x': x, 'y': y, 'z': s // 2 + 2, 'id': 'minecraft:mossy_stone_bricks'})

    for x in range(0, s):
        for z in range(0, s // 2 - 3):
            blocks.append({'x': x, 'y': 0, 'z': z, 'id': 'minecraft:dirt'})
            blocks.append({'x': x, 'y': -1, 'z': z, 'id': 'minecraft:stone'})
            blocks.append({'x': x, 'y': -2, 'z': z, 'id': 'minecraft:stone'})
        for z in range(s // 2 + 3, s):
            blocks.append({'x': x, 'y': 0, 'z': z, 'id': 'minecraft:dirt'})
            blocks.append({'x': x, 'y': -1, 'z': z, 'id': 'minecraft:stone'})
            blocks.append({'x': x, 'y': -2, 'z': z, 'id': 'minecraft:stone'})
        for z in range(s // 2 - 3, s // 2 + 3):
            blocks.append({'x': x, 'y': -3, 'z': z, 'id': 'minecraft:water'})

    return blocks


def _build_wall(size):
    blocks = []
    s = max(16, min(size, 48))

    for x in range(0, s):
        for z in range(s // 2 - 1, s // 2 + 2):
            for y in range(0, 10):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:stone_bricks'})
            for y in range(10, 13):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:cobblestone_wall'})

    for x in range(0, s, 4):
        for y in range(0, 14):
            blocks.append({'x': x, 'y': y, 'z': s // 2 - 1, 'id': 'minecraft:mossy_stone_bricks'})
            blocks.append({'x': x, 'y': y, 'z': s // 2 + 1, 'id': 'minecraft:mossy_stone_bricks'})
        blocks.append({'x': x, 'y': 14, 'z': s // 2, 'id': 'minecraft:torch'})

    for x in range(0, s):
        for z in range(s // 2 - 1, s // 2 + 2):
            blocks.append({'x': x, 'y': -1, 'z': z, 'id': 'minecraft:cobblestone'})
            blocks.append({'x': x, 'y': -2, 'z': z, 'id': 'minecraft:stone'})

    return blocks


def _build_tree(size):
    blocks = []
    s = max(12, min(size, 48))
    cx, cz = s // 2, s // 2

    for y in range(0, 12):
        blocks.append({'x': cx, 'y': y, 'z': cz, 'id': 'minecraft:oak_log'})
        if y >= 8:
            blocks.append({'x': cx + 1, 'y': y, 'z': cz, 'id': 'minecraft:oak_log'})
            blocks.append({'x': cx, 'y': y, 'z': cz + 1, 'id': 'minecraft:oak_log'})

    for dy in range(8, 20):
        radius = max(1, 7 - max(0, dy - 14))
        for dx in range(-radius, radius + 1):
            for dz in range(-radius, radius + 1):
                if dx * dx + dz * dz <= radius * radius + 3:
                    bx, bz = cx + dx, cz + dz
                    if 0 <= bx < s and 0 <= bz < s and dy < s:
                        existing = [b for b in blocks if b['x'] == bx and b['y'] == dy and b['z'] == bz]
                        if not existing:
                            blocks.append({'x': bx, 'y': dy, 'z': bz, 'id': 'minecraft:oak_leaves'})

    for x in range(max(0, cx - 4), min(s, cx + 5)):
        for z in range(max(0, cz - 4), min(s, cz + 5)):
            blocks.append({'x': x, 'y': 0, 'z': z, 'id': 'minecraft:grass_block'})
            blocks.append({'x': x, 'y': -1, 'z': z, 'id': 'minecraft:dirt'})
            dist = ((x - cx) ** 2 + (z - cz) ** 2) ** 0.5
            if dist < 2:
                blocks.append({'x': x, 'y': -2, 'z': z, 'id': 'minecraft:dirt'})

    return blocks


def _llm_voxel_approach(prompt, size):
    block_list = '\n'.join(sorted(BLOCK_PALETTE.keys()))

    llm_prompt = f"""You are an expert Minecraft builder. Generate a detailed block-by-block schematic for this structure.

DESCRIPTION: {prompt}
MAX SIZE: {size}x{size}x{size}

VALID BLOCK IDS (use ONLY these exact strings):
{block_list}

OUTPUT FORMAT (JSON only, no commentary):
{{
  "blocks": [
    {{"x": 0, "y": 0, "z": 0, "id": "minecraft:stone_bricks"}},
    {{"x": 1, "y": 0, "z": 0, "id": "minecraft:cobblestone"}}
  ]
}}

CRITICAL RULES:
- x, z range: 0 to {size-1}
- y range: 0 to {size-1}
- Every block id MUST be from the list above exactly
- Build a COMPLETE, DETAILED structure with at least 200-500 blocks
- Include these layers:
  1. FOUNDATION: solid base (stone, cobblestone, or material-appropriate)
  2. FLOOR: interior flooring (planks, stone bricks, etc.)
  3. WALLS: 2-3 blocks thick walls with windows and doors
  4. ROOF: sloped or flat roof with overhang
  5. DETAILS: furniture, lighting (torches, lanterns), decoration
  6. EXTERIOR: path, garden, or terrain around the structure
- Use variety: mix similar blocks (stone_bricks + mossy_stone_bricks + cobblestone)
- Add depth: walls should not be flat single-layer
- Include door openings (air blocks) and window openings (glass blocks)
- Output ONLY valid JSON with complete block list"""

    raw_json = _call_llm(llm_prompt)

    try:
        data = json.loads(raw_json)
        return data.get('blocks', [])
    except json.JSONDecodeError:
        try:
            start = raw_json.index('{')
            end = raw_json.rindex('}') + 1
            data = json.loads(raw_json[start:end])
            return data.get('blocks', [])
        except Exception:
            return []


def _deduplicate(blocks):
    seen = {}
    for block in blocks:
        key = (block['x'], block['y'], block['z'])
        seen[key] = block
    return list(seen.values())


def _support_check(blocks):
    positions = {(b['x'], b['y'], b['z']): b for b in blocks}
    result = []
    for block in blocks:
        if can_float(block['id']):
            result.append(block)
            continue
        x, y, z = block['x'], block['y'], block['z']
        if y == 0:
            result.append(block)
            continue
        has_support = False
        for dy in [-1, 0]:
            for dx in [-1, 0, 1]:
                for dz in [-1, 0, 1]:
                    neighbor = positions.get((x + dx, y + dy, z + dz))
                    if neighbor and neighbor['id'] != 'minecraft:air':
                        has_support = True
                        break
                if has_support:
                    break
            if has_support:
                break
        if has_support:
            result.append(block)
    return result


def _bounding_box_check(blocks, max_size):
    return [b for b in blocks if 0 <= b['x'] < max_size and 0 <= b['y'] < max_size and 0 <= b['z'] < max_size]


def _call_llm(prompt):
    api_key = os.environ.get('OPENROUTER_API_KEY', '')
    if not api_key:
        print('[SchematicGen] No NVIDIA API key in env')
        return json.dumps({'blocks': []})

    last_error = None
    for model in MODELS:
        try:
            print(f'[SchematicGen] Trying {model}')
            resp = requests.post(
                NVIDIA_URL,
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': model,
                    'messages': [
                        {'role': 'system', 'content': 'Output only valid JSON. No commentary.'},
                        {'role': 'user', 'content': prompt}
                    ],
                    'temperature': 0.3,
                    'max_tokens': 8000
                },
                timeout=60
            )
            resp.raise_for_status()
            content = resp.json()['choices'][0]['message']['content']
            content = content.strip()
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
            print(f'[SchematicGen] Success with {model}')
            return content
        except Exception as e:
            print(f'[SchematicGen] {model} failed: {e}')
            last_error = e
            continue

    print(f'[SchematicGen] All models failed: {last_error}')
    return json.dumps({'blocks': []})
