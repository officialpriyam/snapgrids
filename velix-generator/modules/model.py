import json
import uuid
import os
import time
import requests


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
      "faces": {{
        "north": {{"uv": [0, 0, 8, 8], "texture": 0}},
        "south": {{"uv": [8, 0, 16, 8], "texture": 0}},
        "east": {{"uv": [16, 0, 24, 8], "texture": 0}},
        "west": {{"uv": [24, 0, 32, 8], "texture": 0}},
        "up": {{"uv": [0, 8, 8, 16], "texture": 0}},
        "down": {{"uv": [8, 8, 16, 16], "texture": 0}}
      }}
    }}
  ]
}}

RULES:
- Each element: from/to must be within -16 to 32
- from must be less than to on each axis
- Name each element descriptively (head, body, left_arm, etc.)
- Include ALL body parts relevant to the description
- Output ONLY valid JSON"""

    raw_json = _call_llm(cuboid_prompt)
    cuboids = _parse_cuboid_json(raw_json)

    if not cuboids:
        print(f'[ModelGen] LLM returned no elements, using procedural fallback')
        cuboids = _procedural_fallback(prompt)

    cuboids = _validate_elements(cuboids)
    cuboids = _validate_uv_bounds(cuboids, 64)
    cuboids = _check_overlaps(cuboids)

    if not cuboids:
        cuboids = _procedural_fallback(prompt)

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

    print(f'[ModelGen] Generated {len(cuboids)} elements, {len(bones)} bones')

    return {
        'file': f'model_{file_id}.bbmodel',
        'download_url': f'/download/model_{file_id}.bbmodel',
        'preview_url': f'/preview/model_{file_id}.bbmodel',
        'element_count': len(cuboids),
        'bone_count': len(bones),
        'has_animation': bool(idle_anim)
    }


def _procedural_fallback(prompt: str) -> list:
    p = prompt.lower()

    if any(k in p for k in ['tree', 'plant', 'flower', 'mushroom']):
        return _build_tree_model()
    elif any(k in p for k in ['house', 'building', 'castle', 'tower', 'structure']):
        return _build_house_model()
    elif any(k in p for k in ['sword', 'weapon', 'axe', 'pickaxe', 'tool']):
        return _build_tool_model()
    elif any(k in p for k in ['chest', 'barrel', 'box', 'crate']):
        return _build_chest_model()
    else:
        return _build_character_model()


def _build_character_model() -> list:
    return [
        {'name': 'head', 'from': [-4, 24, -4], 'to': [4, 32, 4], 'faces': {
            'north': {'uv': [8, 8, 16, 16], 'texture': 0},
            'south': {'uv': [24, 8, 32, 16], 'texture': 0},
            'east': {'uv': [16, 8, 24, 16], 'texture': 0},
            'west': {'uv': [0, 8, 8, 16], 'texture': 0},
            'up': {'uv': [8, 0, 16, 8], 'texture': 0},
            'down': {'uv': [16, 0, 24, 8], 'texture': 0}
        }},
        {'name': 'body', 'from': [-4, 8, -2], 'to': [4, 24, 2], 'faces': {
            'north': {'uv': [20, 16, 28, 32], 'texture': 0},
            'south': {'uv': [8, 16, 16, 32], 'texture': 0},
            'east': {'uv': [16, 16, 20, 32], 'texture': 0},
            'west': {'uv': [28, 16, 32, 32], 'texture': 0},
            'up': {'uv': [20, 16, 28, 20], 'texture': 0},
            'down': {'uv': [28, 16, 36, 20], 'texture': 0}
        }},
        {'name': 'right_arm', 'from': [-6, 8, -2], 'to': [-4, 20, 2], 'faces': {
            'north': {'uv': [36, 16, 40, 28], 'texture': 0},
            'south': {'uv': [44, 16, 48, 28], 'texture': 0},
            'east': {'uv': [40, 16, 44, 28], 'texture': 0},
            'west': {'uv': [32, 16, 36, 28], 'texture': 0},
            'up': {'uv': [36, 16, 40, 20], 'texture': 0},
            'down': {'uv': [40, 16, 44, 20], 'texture': 0}
        }},
        {'name': 'left_arm', 'from': [4, 8, -2], 'to': [6, 20, 2], 'faces': {
            'north': {'uv': [44, 16, 48, 28], 'texture': 0},
            'south': {'uv': [52, 16, 56, 28], 'texture': 0},
            'east': {'uv': [48, 16, 52, 28], 'texture': 0},
            'west': {'uv': [40, 16, 44, 28], 'texture': 0},
            'up': {'uv': [44, 16, 48, 20], 'texture': 0},
            'down': {'uv': [48, 16, 52, 20], 'texture': 0}
        }},
        {'name': 'right_leg', 'from': [-4, 0, -2], 'to': [-2, 8, 2], 'faces': {
            'north': {'uv': [4, 16, 8, 24], 'texture': 0},
            'south': {'uv': [12, 16, 16, 24], 'texture': 0},
            'east': {'uv': [8, 16, 12, 24], 'texture': 0},
            'west': {'uv': [0, 16, 4, 24], 'texture': 0},
            'up': {'uv': [4, 16, 8, 20], 'texture': 0},
            'down': {'uv': [8, 16, 12, 20], 'texture': 0}
        }},
        {'name': 'left_leg', 'from': [2, 0, -2], 'to': [4, 8, 2], 'faces': {
            'north': {'uv': [12, 16, 16, 24], 'texture': 0},
            'south': {'uv': [20, 16, 24, 24], 'texture': 0},
            'east': {'uv': [16, 16, 20, 24], 'texture': 0},
            'west': {'uv': [8, 16, 12, 24], 'texture': 0},
            'up': {'uv': [12, 16, 16, 20], 'texture': 0},
            'down': {'uv': [16, 16, 20, 20], 'texture': 0}
        }}
    ]


def _build_tool_model() -> list:
    return [
        {'name': 'handle', 'from': [-1, 0, -1], 'to': [1, 12, 1], 'faces': {
            'north': {'uv': [0, 4, 4, 16], 'texture': 0},
            'south': {'uv': [8, 4, 12, 16], 'texture': 0},
            'east': {'uv': [4, 4, 8, 16], 'texture': 0},
            'west': {'uv': [12, 4, 16, 16], 'texture': 0},
            'up': {'uv': [4, 0, 8, 4], 'texture': 0},
            'down': {'uv': [8, 0, 12, 4], 'texture': 0}
        }},
        {'name': 'blade', 'from': [-3, 12, -1], 'to': [3, 16, 1], 'faces': {
            'north': {'uv': [0, 0, 8, 4], 'texture': 0},
            'south': {'uv': [12, 0, 20, 4], 'texture': 0},
            'east': {'uv': [8, 0, 12, 4], 'texture': 0},
            'west': {'uv': [20, 0, 24, 4], 'texture': 0},
            'up': {'uv': [4, 0, 12, 4], 'texture': 0},
            'down': {'uv': [12, 0, 20, 4], 'texture': 0}
        }}
    ]


def _build_tree_model() -> list:
    elements = [
        {'name': 'trunk', 'from': [-2, 0, -2], 'to': [2, 10, 2], 'faces': {
            'north': {'uv': [0, 6, 8, 16], 'texture': 0},
            'south': {'uv': [16, 6, 24, 16], 'texture': 0},
            'east': {'uv': [8, 6, 16, 16], 'texture': 0},
            'west': {'uv': [24, 6, 32, 16], 'texture': 0},
            'up': {'uv': [8, 0, 16, 8], 'texture': 0},
            'down': {'uv': [16, 0, 24, 8], 'texture': 0}
        }}
    ]
    for dx in [-3, 0, 3]:
        for dz in [-3, 0, 3]:
            if dx == 0 and dz == 0:
                continue
            elements.append({
                'name': 'leaves',
                'from': [dx - 2, 8, dz - 2],
                'to': [dx + 2, 12, dz + 2],
                'faces': {
                    'north': {'uv': [0, 0, 8, 8], 'texture': 0},
                    'south': {'uv': [16, 0, 24, 8], 'texture': 0},
                    'east': {'uv': [8, 0, 16, 8], 'texture': 0},
                    'west': {'uv': [24, 0, 32, 8], 'texture': 0},
                    'up': {'uv': [8, 0, 16, 8], 'texture': 0},
                    'down': {'uv': [16, 0, 24, 8], 'texture': 0}
                }
            })
    elements.append({
        'name': 'top_leaves', 'from': [-2, 12, -2], 'to': [2, 16, 2],
        'faces': {
            'north': {'uv': [0, 0, 8, 8], 'texture': 0},
            'south': {'uv': [16, 0, 24, 8], 'texture': 0},
            'east': {'uv': [8, 0, 16, 8], 'texture': 0},
            'west': {'uv': [24, 0, 32, 8], 'texture': 0},
            'up': {'uv': [8, 0, 16, 8], 'texture': 0},
            'down': {'uv': [16, 0, 24, 8], 'texture': 0}
        }
    })
    return elements


def _build_house_model() -> list:
    return [
        {'name': 'floor', 'from': [-8, 0, -8], 'to': [8, 1, 8], 'faces': {
            'up': {'uv': [0, 0, 32, 32], 'texture': 0}
        }},
        {'name': 'front_wall', 'from': [-8, 1, -8], 'to': [8, 10, -7], 'faces': {
            'north': {'uv': [0, 0, 32, 18], 'texture': 0}
        }},
        {'name': 'back_wall', 'from': [-8, 1, 7], 'to': [8, 10, 8], 'faces': {
            'south': {'uv': [0, 0, 32, 18], 'texture': 0}
        }},
        {'name': 'left_wall', 'from': [-8, 1, -7], 'to': [-7, 10, 7], 'faces': {
            'west': {'uv': [0, 0, 28, 18], 'texture': 0}
        }},
        {'name': 'right_wall', 'from': [7, 1, -7], 'to': [8, 10, 7], 'faces': {
            'east': {'uv': [0, 0, 28, 18], 'texture': 0}
        }},
        {'name': 'roof', 'from': [-9, 10, -9], 'to': [9, 11, 9], 'faces': {
            'up': {'uv': [0, 0, 36, 36], 'texture': 0}
        }}
    ]


def _build_chest_model() -> list:
    return [
        {'name': 'bottom', 'from': [-4, 0, -3], 'to': [4, 6, 3], 'faces': {
            'north': {'uv': [0, 6, 16, 18], 'texture': 0},
            'south': {'uv': [32, 6, 48, 18], 'texture': 0},
            'east': {'uv': [16, 6, 32, 18], 'texture': 0},
            'west': {'uv': [48, 6, 64, 18], 'texture': 0},
            'up': {'uv': [16, 0, 32, 12], 'texture': 0},
            'down': {'uv': [32, 0, 48, 12], 'texture': 0}
        }},
        {'name': 'lid', 'from': [-4, 6, -3], 'to': [4, 8, 3], 'faces': {
            'north': {'uv': [0, 0, 16, 4], 'texture': 0},
            'south': {'uv': [32, 0, 48, 4], 'texture': 0},
            'east': {'uv': [16, 0, 32, 4], 'texture': 0},
            'west': {'uv': [48, 0, 64, 4], 'texture': 0},
            'up': {'uv': [16, 0, 32, 12], 'texture': 0},
            'down': {'uv': [16, 4, 32, 8], 'texture': 0}
        }},
        {'name': 'lock', 'from': [-1, 3, -3.5], 'to': [1, 5, -3], 'faces': {
            'north': {'uv': [14, 10, 18, 14], 'texture': 0}
        }}
    ]


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
        return json.dumps({'elements': []})

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
    return json.dumps({'elements': []})


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


def _validate_elements(elements: list) -> list:
    valid = []
    for elem in elements:
        fr = elem.get('from', [])
        to = elem.get('to', [])
        if len(fr) != 3 or len(to) != 3:
            continue
        if not all(isinstance(v, (int, float)) for v in fr + to):
            continue
        if fr[0] >= to[0] or fr[1] >= to[1] or fr[2] >= to[2]:
            continue
        valid.append(elem)
    return valid


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
