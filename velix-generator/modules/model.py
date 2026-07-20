import json
import uuid
import os
import time
import requests
from PIL import Image
import numpy as np
from io import BytesIO


def generate_model(prompt: str, texture_ref: str, output_dir: str) -> dict:
    file_id = str(uuid.uuid4())[:12]

    cuboid_prompt = f"""You are a Minecraft model generator. Convert this description into a structured list of cuboids for a Blockbench model.

DESCRIPTION: {prompt}

OUTPUT FORMAT (JSON only, no commentary):
{{
  "elements": [
    {{
      "name": "part_name",
      "from": [x1, y1, z1],
      "to": [x2, y2, z2],
      "rotation": {{"angle": 0, "axis": "y", "origin": [0, 0, 0]}},
      "faces": {{
        "north": {{"uv": [0, 0, 8, 8], "texture": 0}},
        "south": {{"uv": [8, 0, 16, 8], "texture": 0}},
        "east": {{"uv": [16, 0, 24, 8], "texture": 0}},
        "west": {{"uv": [24, 0, 32, 8], "texture": 0}},
        "up": {{"uv": [0, 8, 8, 16], "texture": 0}},
        "down": {{"uv": [8, 8, 16, 16], "texture": 0}}
      }}
    }}
  ],
  "bones": ["root", "head", "body", "left_arm", "right_arm", "left_leg", "right_leg"]
}}

RULES:
- Each element: from/to must be within -16 to 32
- UV coordinates must be within 0 to 64
- Name each element descriptively
- Include ALL body parts relevant to the description
- Output ONLY valid JSON"""

    raw_json = _call_llm(cuboid_prompt)
    cuboids = _parse_cuboid_json(raw_json)
    cuboids = _validate_uv_bounds(cuboids, 64)
    cuboids = _check_overlaps(cuboids)

    bones = _build_bone_hierarchy(cuboids)
    idle_anim = _generate_idle_animation(bones)

    bbmodel = {
        'meta': {
            'format_version': '4.10',
            'model_format': 'free',
            'box_uv': False
        },
        'name': prompt[:50],
        'elements': cuboids,
        'outliner': bones,
        'textures': [
            {
                'path': texture_ref or 'texture.png',
                'name': 'texture',
                'uuid': str(uuid.uuid4())
            }
        ],
        'animations': [idle_anim] if idle_anim else []
    }

    out_path = os.path.join(output_dir, f'model_{file_id}.bbmodel')
    with open(out_path, 'w') as f:
        json.dump(bbmodel, f, indent=2)

    return {
        'file': f'model_{file_id}.bbmodel',
        'download_url': f'/download/model_{file_id}.bbmodel',
        'preview_url': f'/preview/model_{file_id}.bbmodel',
        'element_count': len(cuboids),
        'bone_count': len(bones),
        'has_animation': bool(idle_anim)
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
        print('[ModelGen] No OPENROUTER_API_KEY set')
        return json.dumps({'elements': [], 'bones': ['root']})

    last_error = None
    for model in FREE_MODELS:
        try:
            print(f'[ModelGen] Trying model: {model}')
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
                    'max_tokens': 4000
                },
                timeout=90
            )
            if resp.status_code == 402:
                print(f'[ModelGen] Model {model} requires payment, trying next...')
                last_error = 'insufficient_credits'
                continue
            resp.raise_for_status()
            content = resp.json()['choices'][0]['message']['content']
            content = content.strip()
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
            print(f'[ModelGen] Success with {model}')
            return content
        except Exception as e:
            print(f'[ModelGen] Model {model} failed: {e}')
            last_error = e
            continue

    print(f'[ModelGen] All models failed, last error: {last_error}')
    return json.dumps({'elements': [], 'bones': ['root']})


def _parse_cuboid_json(raw: str) -> list:
    try:
        data = json.loads(raw)
        return data.get('elements', [])
    except json.JSONDecodeError:
        try:
            start = raw.index('{')
            end = raw.rindex('}') + 1
            data = json.loads(raw[start:end])
            return data.get('elements', [])
        except Exception:
            return []


def _validate_uv_bounds(elements: list, texture_size: int) -> list:
    validated = []
    for elem in elements:
        if 'faces' not in elem:
            validated.append(elem)
            continue
        for face_name, face_data in elem['faces'].items():
            if 'uv' in face_data:
                uv = face_data['uv']
                face_data['uv'] = [
                    max(0, min(uv[0], texture_size)),
                    max(0, min(uv[1], texture_size)),
                    max(0, min(uv[2], texture_size)),
                    max(0, min(uv[3], texture_size))
                ]
        validated.append(elem)
    return validated


def _check_overlaps(elements: list) -> list:
    cleaned = []
    seen = set()
    for elem in elements:
        key = (tuple(elem.get('from', [0, 0, 0])), tuple(elem.get('to', [0, 0, 0])))
        if key not in seen:
            seen.add(key)
            cleaned.append(elem)
    return cleaned


def _build_bone_hierarchy(elements: list) -> list:
    bone_map = {}
    for elem in elements:
        name = elem.get('name', 'unknown')
        if name not in bone_map:
            bone_map[name] = []

    outliner = []
    root_children = []
    for bone_name in bone_map:
        if any(kw in bone_name.lower() for kw in ['head', 'hat']):
            outliner.append({'name': bone_name, 'origin': [0, 24, 0], 'children': [bone_name]})
        elif any(kw in bone_name.lower() for kw in ['body', 'torso', 'chest']):
            outliner.append({'name': bone_name, 'origin': [0, 16, 0], 'children': [bone_name]})
        elif 'left' in bone_name.lower() and 'arm' in bone_name.lower():
            outliner.append({'name': bone_name, 'origin': [-6, 16, 0], 'children': [bone_name]})
        elif 'right' in bone_name.lower() and 'arm' in bone_name.lower():
            outliner.append({'name': bone_name, 'origin': [6, 16, 0], 'children': [bone_name]})
        elif 'left' in bone_name.lower() and 'leg' in bone_name.lower():
            outliner.append({'name': bone_name, 'origin': [-2, 0, 0], 'children': [bone_name]})
        elif 'right' in bone_name.lower() and 'leg' in bone_name.lower():
            outliner.append({'name': bone_name, 'origin': [2, 0, 0], 'children': [bone_name]})
        else:
            root_children.append(bone_name)

    if root_children:
        outliner.insert(0, {'name': 'root', 'origin': [0, 0, 0], 'children': root_children})

    if not outliner:
        outliner = [{'name': 'root', 'origin': [0, 0, 0], 'children': [e.get('name', f'element_{i}') for i, e in enumerate(elements)]}]

    return outliner


def _generate_idle_animation(bones: list) -> dict | None:
    if not bones:
        return None

    return {
        'name': 'idle',
        'loop': True,
        'length': 2.0,
        'override': False,
        'anim_time_update': 0,
        'blend_weight': 1.0,
        'bones': {
            bone.get('name', 'root'): {
                'rotation': {
                    '0.0': [0, 0, 0],
                    '0.5': [0, 0, -2],
                    '1.0': [0, 0, 0],
                    '1.5': [0, 0, 2],
                    '2.0': [0, 0, 0]
                }
            } for bone in bones[:3]
        }
    }
