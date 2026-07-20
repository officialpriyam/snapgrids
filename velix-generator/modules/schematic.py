import json
import uuid
import os
import time
import requests
import numpy as np
from PIL import Image
from io import BytesIO
from utils.block_palette import find_closest_block, can_float, BLOCK_PALETTE
from utils.nbt import write_schematic_nbt, write_gzip


def generate_schematic(prompt: str, size: int = 48, mode: str = 'fast', output_dir: str = 'output') -> dict:
    file_id = str(uuid.uuid4())[:12]

    if mode == 'fast':
        blocks = _llm_voxel_approach(prompt, size)
    else:
        blocks = _image_3d_voxelize_approach(prompt, size)

    if not blocks:
        print(f'[SchematicGen] LLM returned no blocks, using procedural fallback')
        blocks = _procedural_fallback(prompt, size)

    blocks = _deduplicate(blocks)
    blocks = _support_check(blocks)
    blocks = _bounding_box_check(blocks, size)

    if not blocks:
        print(f'[SchematicGen] No blocks after cleanup, generating basic structure')
        blocks = _procedural_fallback(prompt, size)

    block_count = len([b for b in blocks if b['id'] != 'minecraft:air'])

    schematic = _to_schematic(blocks, size)
    schem_bytes = write_schematic_nbt(schematic)
    gzipped = write_gzip(schem_bytes)

    out_path = os.path.join(output_dir, f'schematic_{file_id}.schem')
    with open(out_path, 'wb') as f:
        f.write(gzipped)

    print(f'[SchematicGen] Generated {block_count} blocks, {len(gzipped)} bytes')

    return {
        'file': f'schematic_{file_id}.schem',
        'download_url': f'/download/schematic_{file_id}.schem',
        'preview_url': f'/preview/schematic_{file_id}.schem',
        'block_count': block_count,
        'size': [size, size, size],
        'mode': mode
    }


def _procedural_fallback(prompt: str, size: int) -> list:
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


def _build_house(size: int) -> list:
    blocks = []
    s = min(size, 48)
    w = min(12, s - 2)

    for x in range(1, w + 1):
        for z in range(1, w + 1):
            blocks.append({'x': x, 'y': 0, 'z': z, 'id': 'minecraft:oak_planks'})

    for y in range(1, 7):
        for x in range(1, w + 1):
            blocks.append({'x': x, 'y': y, 'z': 1, 'id': 'minecraft:spruce_planks'})
            blocks.append({'x': x, 'y': y, 'z': w, 'id': 'minecraft:spruce_planks'})
        for z in range(2, w):
            blocks.append({'x': 1, 'y': y, 'z': z, 'id': 'minecraft:spruce_planks'})
            blocks.append({'x': w, 'y': y, 'z': z, 'id': 'minecraft:spruce_planks'})

    for y in range(1, 8):
        for pos in [(1, 1), (w, 1), (1, w), (w, w)]:
            blocks.append({'x': pos[0], 'y': y, 'z': pos[1], 'id': 'minecraft:spruce_log'})

    for x in range(1, w + 1):
        for z in range(1, w + 1):
            blocks.append({'x': x, 'y': 7, 'z': z, 'id': 'minecraft:spruce_planks'})
            if 2 <= x <= w - 1 and 2 <= z <= w - 1:
                blocks.append({'x': x, 'y': 8, 'z': z, 'id': 'minecraft:spruce_slab'})

    for y in [3, 4]:
        for x in range(3, w - 1):
            blocks.append({'x': x, 'y': y, 'z': 1, 'id': 'minecraft:glass'})
            blocks.append({'x': x, 'y': y, 'z': w, 'id': 'minecraft:glass'})
        for z in range(3, w - 1):
            blocks.append({'x': 1, 'y': y, 'z': z, 'id': 'minecraft:glass'})
            blocks.append({'x': w, 'y': y, 'z': z, 'id': 'minecraft:glass'})

    mid = w // 2
    blocks.append({'x': mid, 'y': 1, 'z': 1, 'id': 'minecraft:air'})
    blocks.append({'x': mid + 1, 'y': 1, 'z': 1, 'id': 'minecraft:air'})
    blocks.append({'x': mid, 'y': 2, 'z': 1, 'id': 'minecraft:air'})
    blocks.append({'x': mid + 1, 'y': 2, 'z': 1, 'id': 'minecraft:air'})

    blocks.append({'x': 3, 'y': 1, 'z': 3, 'id': 'minecraft:crafting_table'})
    blocks.append({'x': 4, 'y': 1, 'z': 3, 'id': 'minecraft:furnace'})
    blocks.append({'x': w - 2, 'y': 1, 'z': w - 2, 'id': 'minecraft:chest'})
    blocks.append({'x': mid, 'y': 6, 'z': mid, 'id': 'minecraft:lantern'})
    blocks.append({'x': mid - 1, 'y': 6, 'z': mid, 'id': 'minecraft:torch'})
    blocks.append({'x': mid + 1, 'y': 6, 'z': mid, 'id': 'minecraft:torch'})

    return blocks


def _build_castle(size: int) -> list:
    blocks = []
    s = min(size, 48)
    w = min(16, s - 2)

    for x in range(1, w + 1):
        for z in range(1, w + 1):
            blocks.append({'x': x, 'y': 0, 'z': z, 'id': 'minecraft:cobblestone'})

    for y in range(1, 10):
        for x in range(1, w + 1):
            blocks.append({'x': x, 'y': y, 'z': 1, 'id': 'minecraft:stone_bricks'})
            blocks.append({'x': x, 'y': y, 'z': w, 'id': 'minecraft:stone_bricks'})
        for z in range(2, w):
            blocks.append({'x': 1, 'y': y, 'z': z, 'id': 'minecraft:stone_bricks'})
            blocks.append({'x': w, 'y': y, 'z': z, 'id': 'minecraft:stone_bricks'})

    tower_pos = [(1, 1), (w, 1), (1, w), (w, w)]
    for tx, tz in tower_pos:
        for y in range(1, 14):
            for dx in range(-1, 2):
                for dz in range(-1, 2):
                    nx, nz = tx + dx, tz + dz
                    if 0 < nx <= w and 0 < nz <= w:
                        blocks.append({'x': nx, 'y': y, 'z': nz, 'id': 'minecraft:mossy_stone_bricks'})
        for x in range(max(1, tx - 1), min(w + 1, tx + 2)):
            blocks.append({'x': x, 'y': 11, 'z': tz, 'id': 'minecraft:cobblestone_wall'})
        for z in range(max(1, tz - 1), min(w + 1, tz + 2)):
            blocks.append({'x': tx, 'y': 11, 'z': z, 'id': 'minecraft:cobblestone_wall'})

    for y in range(3, 7):
        for x in range(2, w):
            if x % 3 == 0:
                blocks.append({'x': x, 'y': y, 'z': 1, 'id': 'minecraft:glass'})
                blocks.append({'x': x, 'y': y, 'z': w, 'id': 'minecraft:glass'})

    mid = w // 2
    blocks.append({'x': mid, 'y': 1, 'z': 1, 'id': 'minecraft:air'})
    blocks.append({'x': mid + 1, 'y': 1, 'z': 1, 'id': 'minecraft:air'})
    blocks.append({'x': mid, 'y': 2, 'z': 1, 'id': 'minecraft:air'})
    blocks.append({'x': mid + 1, 'y': 2, 'z': 1, 'id': 'minecraft:air'})

    return blocks


def _build_temple(size: int) -> list:
    blocks = []
    s = min(size, 48)
    w = min(14, s - 2)

    for x in range(1, w + 1):
        for z in range(1, w + 1):
            blocks.append({'x': x, 'y': 0, 'z': z, 'id': 'minecraft:quartz_block'})

    for y in range(1, 9):
        for x in range(1, w + 1):
            blocks.append({'x': x, 'y': y, 'z': 1, 'id': 'minecraft:quartz_block'})
            blocks.append({'x': x, 'y': y, 'z': w, 'id': 'minecraft:quartz_block'})
        for z in range(2, w):
            blocks.append({'x': 1, 'y': y, 'z': z, 'id': 'minecraft:quartz_block'})
            blocks.append({'x': w, 'y': y, 'z': z, 'id': 'minecraft:quartz_block'})

    for y in range(1, 10):
        for pos in [(1, 1), (w, 1), (1, w), (w, w)]:
            blocks.append({'x': pos[0], 'y': y, 'z': pos[1], 'id': 'minecraft:quartz_pillar'})

    for x in range(1, w + 1):
        for z in range(1, w + 1):
            blocks.append({'x': x, 'y': 9, 'z': z, 'id': 'minecraft:quartz_block'})
            for level in range(4):
                inner = level + 1
                if inner <= w // 2:
                    for x2 in range(inner, w + 1 - inner):
                        for z2 in range(inner, w + 1 - inner):
                            blocks.append({'x': x2, 'y': 10 + level, 'z': z2, 'id': 'minecraft:quartz_block'})

    blocks.append({'x': w // 2, 'y': 1, 'z': 1, 'id': 'minecraft:air'})
    blocks.append({'x': w // 2, 'y': 2, 'z': 1, 'id': 'minecraft:air'})

    blocks.append({'x': w // 2, 'y': 1, 'z': w // 2, 'id': 'minecraft:beacon'})
    blocks.append({'x': w // 2 - 1, 'y': 1, 'z': w // 2, 'id': 'minecraft:sea_lantern'})
    blocks.append({'x': w // 2 + 1, 'y': 1, 'z': w // 2, 'id': 'minecraft:sea_lantern'})

    return blocks


def _build_bridge(size: int) -> list:
    blocks = []
    s = min(size, 48)

    for x in range(s):
        for z in range(s // 2 - 2, s // 2 + 2):
            blocks.append({'x': x, 'y': 4, 'z': z, 'id': 'minecraft:oak_planks'})
        blocks.append({'x': x, 'y': 5, 'z': s // 2 - 2, 'id': 'minecraft:oak_fence'})
        blocks.append({'x': x, 'y': 5, 'z': s // 2 + 1, 'id': 'minecraft:oak_fence'})

    for x in range(0, s, 4):
        for y in range(4):
            for z in range(s // 2 - 2, s // 2 + 2):
                blocks.append({'x': x, 'y': y, 'z': z, 'id': 'minecraft:stone_bricks'})

    for x in range(s):
        for z in range(0, s // 2 - 2):
            blocks.append({'x': x, 'y': 0, 'z': z, 'id': 'minecraft:dirt'})
        for z in range(s // 2 + 2, s):
            blocks.append({'x': x, 'y': 0, 'z': z, 'id': 'minecraft:dirt'})

    return blocks


def _build_wall(size: int) -> list:
    blocks = []
    s = min(size, 48)

    for x in range(s):
        for y in range(8):
            blocks.append({'x': x, 'y': y, 'z': s // 2, 'id': 'minecraft:stone_bricks'})
        for y in range(8, 10):
            blocks.append({'x': x, 'y': y, 'z': s // 2, 'id': 'minecraft:cobblestone_wall'})

    for x in range(0, s, 5):
        for y in range(11):
            blocks.append({'x': x, 'y': y, 'z': s // 2, 'id': 'minecraft:stone_bricks'})

    return blocks


def _build_tree(size: int) -> list:
    blocks = []
    s = min(size, 48)
    cx, cz = s // 2, s // 2

    for y in range(10):
        blocks.append({'x': cx, 'y': y, 'z': cz, 'id': 'minecraft:oak_log'})
        if y > 6:
            blocks.append({'x': cx + 1, 'y': y, 'z': cz, 'id': 'minecraft:oak_log'})

    for dy in range(8, 15):
        radius = max(1, 5 - max(0, dy - 11))
        for dx in range(-radius, radius + 1):
            for dz in range(-radius, radius + 1):
                if dx * dx + dz * dz <= radius * radius + 2:
                    bx, bz = cx + dx, cz + dz
                    if 0 <= bx < s and 0 <= bz < s and dy < s:
                        blocks.append({'x': bx, 'y': dy, 'z': bz, 'id': 'minecraft:oak_leaves'})

    for x in range(max(0, cx - 3), min(s, cx + 4)):
        for z in range(max(0, cz - 3), min(s, cz + 4)):
            blocks.append({'x': x, 'y': 0, 'z': z, 'id': 'minecraft:grass_block'})

    return blocks


def _llm_voxel_approach(prompt: str, size: int) -> list:
    block_list = '\n'.join(sorted(BLOCK_PALETTE.keys()))

    llm_prompt = f"""You are a Minecraft schematic generator. Generate a list of blocks for this structure.

DESCRIPTION: {prompt}
MAX SIZE: {size}x{size}x{size}

VALID BLOCK IDS (use ONLY these):
{block_list}

OUTPUT FORMAT (JSON only, no commentary):
{{
  "blocks": [
    {{"x": 0, "y": 0, "z": 0, "id": "minecraft:stone_bricks"}},
    {{"x": 0, "y": 1, "z": 0, "id": "minecraft:oak_planks"}}
  ]
}}

RULES:
- x, z range: 0 to {size-1}
- y range: 0 to {size-1}
- Every block id MUST be from the list above
- Build a complete, recognizable structure with at least 50 blocks
- Include foundation, walls, roof, and details
- Output ONLY valid JSON"""

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


def _image_3d_voxelize_approach(prompt: str, size: int) -> list:
    return _llm_voxel_approach(prompt, size)


def _deduplicate(blocks: list) -> list:
    seen = {}
    for block in blocks:
        key = (block['x'], block['y'], block['z'])
        seen[key] = block
    return list(seen.values())


def _support_check(blocks: list) -> list:
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


def _bounding_box_check(blocks: list, max_size: int) -> list:
    return [b for b in blocks if 0 <= b['x'] < max_size and 0 <= b['y'] < max_size and 0 <= b['z'] < max_size]


def _to_schematic(blocks: list, size: int) -> dict:
    block_map = {}
    for b in blocks:
        block_map[(b['x'], b['y'], b['z'])] = b['id']

    palette = {'minecraft:air': 0}
    next_idx = 1

    block_data = []
    for y in range(size):
        for z in range(size):
            for x in range(size):
                block_id = block_map.get((x, y, z), 'minecraft:air')
                if block_id not in palette:
                    palette[block_id] = next_idx
                    next_idx += 1
                idx = palette[block_id]
                val = idx
                while True:
                    byte_val = val & 0x7F
                    val >>= 7
                    if val != 0:
                        byte_val |= 0x80
                    block_data.append(byte_val)
                    if val == 0:
                        break

    return {
        'version': 2,
        'data_version': 3955,
        'width': size,
        'height': size,
        'length': size,
        'offset': [0, 0, 0],
        'palette': palette,
        'block_data': block_data,
        'block_entities': []
    }


FREE_MODELS = [
    'openai/gpt-oss-120b:free',
    'qwen/qwen3-coder:free',
    'google/gemma-4-31b-it:free',
    'openai/gpt-oss-20b:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
]


def _call_llm(prompt: str) -> str:
    api_key = os.environ.get('OPENROUTER_API_KEY', '')
    if not api_key:
        print('[SchematicGen] No OPENROUTER_API_KEY set')
        return json.dumps({'blocks': []})

    last_error = None
    for model in FREE_MODELS:
        try:
            print(f'[SchematicGen] Trying model: {model}')
            resp = requests.post(
                'https://openrouter.ai/api/v1/chat/completions',
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
                timeout=90
            )
            if resp.status_code == 402:
                print(f'[SchematicGen] Model {model} requires payment, trying next...')
                last_error = 'insufficient_credits'
                continue
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
            print(f'[SchematicGen] Model {model} failed: {e}')
            last_error = e
            continue

    print(f'[SchematicGen] All models failed, last error: {last_error}')
    return json.dumps({'blocks': []})
