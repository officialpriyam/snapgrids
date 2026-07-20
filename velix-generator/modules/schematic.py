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

    blocks = _deduplicate(blocks)
    blocks = _support_check(blocks)
    blocks = _bounding_box_check(blocks, size)

    schematic = _to_schematic(blocks, size)
    schem_bytes = write_schematic_nbt(schematic)
    gzipped = write_gzip(schem_bytes)

    out_path = os.path.join(output_dir, f'schematic_{file_id}.schem')
    with open(out_path, 'wb') as f:
        f.write(gzipped)

    block_count = len([b for b in blocks if b['id'] != 'minecraft:air'])

    return {
        'file': f'schematic_{file_id}.schem',
        'download_url': f'/download/schematic_{file_id}.schem',
        'preview_url': f'/preview/schematic_{file_id}.schem',
        'block_count': block_count,
        'size': [size, size, size],
        'mode': mode
    }


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
    {{"x": 0, "y": 1, "z": 0, "id": "minecraft:stone_brick_stairs", "state": {{"facing": "north"}}}}
  ]
}}

RULES:
- x, z range: 0 to {size-1}
- y range: 0 to {size-1}
- Every block id MUST be from the list above
- Build a complete, recognizable structure
- Include foundation, walls, roof, and details
- Use stairs, slabs, walls for detail
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
    img = _text_to_image(prompt)
    if img is None:
        return _llm_voxel_approach(prompt, size)

    mesh_data = _image_to_3d(img)
    if mesh_data is None:
        return _llm_voxel_approach(prompt, size)

    blocks = _voxelize_mesh(mesh_data, size)
    return blocks


def _text_to_image(prompt: str) -> Image.Image | None:
    url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt + ', 3d render, white background, centered')}"
    params = {'width': 512, 'height': 512, 'seed': int(time.time()), 'nologo': 'true'}
    try:
        resp = requests.get(url, params=params, timeout=120)
        resp.raise_for_status()
        return Image.open(BytesIO(resp.content))
    except Exception as e:
        print(f'[SchematicGen] Image gen error: {e}')
        return None


def _image_to_3d(img: Image.Image) -> dict | None:
    return None


def _voxelize_mesh(mesh_data: dict, size: int) -> list:
    return []


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
        for dy in [-1, 0, 1]:
            for dx in [-1, 0, 1]:
                for dz in [-1, 0, 1]:
                    if dy == 0 and dx == 0 and dz == 0:
                        continue
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
    palette = {}
    next_idx = 0

    block_array = []
    for y in range(size):
        for z in range(size):
            for x in range(size):
                block = None
                for b in blocks:
                    if b['x'] == x and b['y'] == y and b['z'] == z:
                        block = b
                        break
                if block is None:
                    block_id = 'minecraft:air'
                else:
                    block_id = block['id']

                if block_id not in palette:
                    palette[block_id] = next_idx
                    next_idx += 1

                block_array.append(palette[block_id])

    block_data = []
    for idx in block_array:
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
