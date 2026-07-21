import json
import uuid
import os
import time
import requests
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageEnhance
import numpy as np


# Minecraft-style color palettes for different entity types
PALETTES = {
    'humanoid': {
        'skin': (220, 180, 140),
        'skin_shadow': (180, 140, 100),
        'hair': (80, 50, 30),
        'hair_shadow': (60, 35, 20),
        'shirt': (60, 100, 180),
        'shirt_shadow': (40, 70, 140),
        'pants': (50, 50, 80),
        'pants_shadow': (35, 35, 60),
        'eyes': (255, 255, 255),
        'pupils': (40, 40, 40),
        'mouth': (180, 100, 80),
        'shoes': (60, 40, 25),
    },
    'knight': {
        'armor_light': (180, 180, 190),
        'armor_mid': (140, 140, 155),
        'armor_dark': (90, 90, 100),
        'armor_accent': (200, 180, 60),
        'visor': (30, 30, 40),
        'chainmail': (120, 120, 130),
        'plume': (200, 50, 50),
    },
    'tree': {
        'trunk': (100, 70, 40),
        'trunk_dark': (75, 50, 28),
        'trunk_bark': (85, 60, 35),
        'leaves': (60, 130, 45),
        'leaves_light': (80, 160, 55),
        'leaves_dark': (40, 100, 30),
        'leaves_shadow': (30, 80, 22),
    },
    'dragon': {
        'scale_main': (100, 30, 30),
        'scale_light': (140, 50, 40),
        'scale_dark': (60, 18, 18),
        'belly': (180, 140, 80),
        'belly_shadow': (140, 100, 50),
        'eye': (255, 200, 0),
        'wing_membrane': (80, 20, 20),
        'claw': (200, 200, 200),
    },
    'wizard': {
        'robe': (60, 40, 130),
        'robe_light': (80, 60, 170),
        'robe_dark': (40, 25, 90),
        'hat': (50, 30, 110),
        'hat_band': (200, 170, 50),
        'staff': (120, 80, 40),
        'orb': (100, 200, 255),
        'beard': (200, 200, 200),
    },
    'tool': {
        'handle': (120, 80, 40),
        'handle_dark': (90, 60, 30),
        'metal': (180, 180, 190),
        'metal_dark': (130, 130, 140),
        'metal_shine': (220, 220, 230),
        'gem': (50, 200, 100),
        'wrap': (160, 100, 50),
    },
    'chest': {
        'wood': (160, 120, 60),
        'wood_dark': (120, 85, 40),
        'wood_light': (180, 140, 75),
        'metal_band': (180, 160, 60),
        'lock': (200, 180, 80),
        'lock_dark': (140, 120, 40),
    },
}


def _get_palette(prompt):
    """Select the best color palette based on the prompt."""
    p = prompt.lower()
    if any(k in p for k in ['knight', 'armor', 'sword', 'shield', 'warrior']):
        return PALETTES['knight']
    elif any(k in p for k in ['tree', 'plant', 'nature', 'oak', 'spruce']):
        return PALETTES['tree']
    elif any(k in p for k in ['dragon', 'monster', 'creature', 'beast']):
        return PALETTES['dragon']
    elif any(k in p for k in ['wizard', 'mage', 'magic', 'staff']):
        return PALETTES['wizard']
    elif any(k in p for k in ['sword', 'weapon', 'axe', 'pickaxe', 'tool']):
        return PALETTES['tool']
    elif any(k in p for k in ['chest', 'barrel', 'box', 'crate']):
        return PALETTES['chest']
    return PALETTES['humanoid']


def _generate_default_texture(prompt):
    """Generate a proper Minecraft-style UV texture with labeled regions."""
    palette = _get_palette(prompt)
    colors = list(palette.values())

    # Create 64x64 texture (standard Minecraft model UV space)
    img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    pixels = img.load()

    # Fill with a pattern that looks like a real UV texture
    # Divide the 64x64 into UV regions (8x8 pixel blocks)
    for by in range(8):
        for bx in range(8):
            # Pick color based on position (simulating different body parts)
            ci = (by * 8 + bx) % len(colors)
            r, g, b = colors[ci]

            # Add subtle pixel-level variation for texture
            for py in range(by * 8, by * 8 + 8):
                for px in range(bx * 8, bx * 8 + 8):
                    # Checkerboard noise for texture detail
                    noise = ((px * 7 + py * 13) % 7) - 3
                    # Edge darkening within each 8x8 block
                    edge_x = 0 if (px % 8 == 0 or px % 8 == 7) else 1
                    edge_y = 0 if (py % 8 == 0 or py % 8 == 7) else 1
                    edge_mult = 0.85 if (edge_x == 0 or edge_y == 0) else 1.0

                    cr = max(0, min(255, int((r + noise) * edge_mult)))
                    cg = max(0, min(255, int((g + noise) * edge_mult)))
                    cb = max(0, min(255, int((b + noise) * edge_mult)))
                    pixels[px, py] = (cr, cg, cb, 255)

    # Draw face features on the head UV region (top-left area)
    # Head front is roughly at (8,8) to (16,16) in standard Minecraft UV
    for x in range(8, 16):
        for y in range(8, 16):
            px, py = x, y
            local_x = x - 8
            local_y = y - 8

            # Eyes (white with dark pupils)
            if (local_x in [2, 3] and local_y in [2, 3]) or (local_x in [5, 6] and local_y in [2, 3]):
                pixels[px, py] = (255, 255, 255, 255)  # Eye white
            if (local_x == 3 and local_y == 2) or (local_x == 6 and local_y == 2):
                pixels[px, py] = (40, 40, 40, 255)  # Pupil

            # Mouth
            if local_y == 5 and local_x in [3, 4, 5]:
                pixels[px, py] = (160, 80, 60, 255)  # Mouth

    # Add a subtle grid overlay for texture definition
    for y in range(64):
        for x in range(64):
            if x % 8 == 0 or y % 8 == 0:
                r, g, b, a = pixels[x, y]
                if a > 0:
                    pixels[x, y] = (max(0, r - 20), max(0, g - 20), max(0, b - 20), a)

    buf = BytesIO()
    img.save(buf, format='PNG')
    b64 = base64.b64encode(buf.getvalue()).decode('ascii')
    return f'data:image/png;base64,{b64}'


def generate_model(prompt: str, texture_ref: str, output_dir: str) -> dict:
    file_id = str(uuid.uuid4())[:12]

    cuboid_prompt = f"""You are an expert Minecraft model builder. Convert this description into a detailed Blockbench model with precise cuboid elements.

DESCRIPTION: {prompt}

OUTPUT FORMAT (JSON only, no commentary):
{{
  "elements": [
    {{
      "name": "descriptive_part_name",
      "from": [x1, y1, z1],
      "to": [x2, y2, z2],
      "faces": {{
        "north": {{"uv": [x1, y1, x2, y2], "texture": 0}},
        "south": {{"uv": [x1, y1, x2, y2], "texture": 0}},
        "east": {{"uv": [x1, y1, x2, y2], "texture": 0}},
        "west": {{"uv": [x1, y1, x2, y2], "texture": 0}},
        "up": {{"uv": [x1, y1, x2, y2], "texture": 0}},
        "down": {{"uv": [x1, y1, x2, y2], "texture": 0}}
      }}
    }}
  ]
}}

CRITICAL RULES:
- Coordinates range: -16 to 32 (Blockbench standard)
- from must be strictly less than to on EACH axis
- Name each element descriptively (head, body, right_arm, left_leg, blade, handle, etc.)
- Include ALL body parts relevant to the description
- For characters: head (8x8x8), body (8x12x4), arms (4x12x4), legs (4x12x4)
- For weapons: handle (stick), blade/head (metal), crossguard
- For buildings: walls, floor, roof, windows, doors
- UV coordinates should be within 0-64 for standard Minecraft texture
- Each face needs its own UV mapping
- Create at MINIMUM 6 elements for characters, 3 for tools, 4 for buildings
- Output ONLY valid JSON, no markdown fences"""

    raw_json = ''
    try:
        raw_json = _call_llm(cuboid_prompt)
    except Exception as e:
        print(f'[ModelGen] LLM error: {e}')
        raw_json = ''

    cuboids = _parse_cuboid_json(raw_json) if raw_json else []

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

    tex_source = _generate_default_texture(prompt)

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
                'source': tex_source,
                'name': 'texture',
                'uuid': str(uuid.uuid4()),
                'folder': '',
                'namespace': ''
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
    """Build a detailed Minecraft-style character with proper UV mapping."""
    return [
        # Head (8x8x8)
        {'name': 'head', 'from': [-4, 24, -4], 'to': [4, 32, 4], 'faces': {
            'north': {'uv': [8, 8, 16, 16], 'texture': 0},
            'south': {'uv': [24, 8, 32, 16], 'texture': 0},
            'east': {'uv': [16, 8, 24, 16], 'texture': 0},
            'west': {'uv': [0, 8, 8, 16], 'texture': 0},
            'up': {'uv': [8, 0, 16, 8], 'texture': 0},
            'down': {'uv': [16, 0, 24, 8], 'texture': 0}
        }},
        # Hat layer (slightly larger head)
        {'name': 'hat', 'from': [-4.5, 23.5, -4.5], 'to': [4.5, 32.5, 4.5], 'faces': {
            'north': {'uv': [32, 8, 40, 16], 'texture': 0},
            'south': {'uv': [48, 8, 56, 16], 'texture': 0},
            'east': {'uv': [40, 8, 48, 16], 'texture': 0},
            'west': {'uv': [24, 8, 32, 16], 'texture': 0},
            'up': {'uv': [32, 0, 40, 8], 'texture': 0},
            'down': {'uv': [40, 0, 48, 8], 'texture': 0}
        }},
        # Body (8x12x4)
        {'name': 'body', 'from': [-4, 12, -2], 'to': [4, 24, 2], 'faces': {
            'north': {'uv': [20, 16, 28, 28], 'texture': 0},
            'south': {'uv': [8, 16, 16, 28], 'texture': 0},
            'east': {'uv': [16, 16, 20, 28], 'texture': 0},
            'west': {'uv': [28, 16, 32, 28], 'texture': 0},
            'up': {'uv': [20, 16, 28, 20], 'texture': 0},
            'down': {'uv': [28, 16, 36, 20], 'texture': 0}
        }},
        # Jacket layer
        {'name': 'jacket', 'from': [-4.5, 12, -2.5], 'to': [4.5, 24, 2.5], 'faces': {
            'north': {'uv': [36, 16, 44, 28], 'texture': 0},
            'south': {'uv': [52, 16, 60, 28], 'texture': 0},
            'east': {'uv': [44, 16, 52, 28], 'texture': 0},
            'west': {'uv': [28, 16, 36, 28], 'texture': 0},
            'up': {'uv': [36, 16, 44, 20], 'texture': 0},
            'down': {'uv': [44, 16, 52, 20], 'texture': 0}
        }},
        # Right arm (4x12x4)
        {'name': 'right_arm', 'from': [-6, 12, -2], 'to': [-4, 24, 2], 'faces': {
            'north': {'uv': [36, 16, 40, 28], 'texture': 0},
            'south': {'uv': [44, 16, 48, 28], 'texture': 0},
            'east': {'uv': [40, 16, 44, 28], 'texture': 0},
            'west': {'uv': [32, 16, 36, 28], 'texture': 0},
            'up': {'uv': [36, 16, 40, 20], 'texture': 0},
            'down': {'uv': [40, 16, 44, 20], 'texture': 0}
        }},
        # Right arm layer
        {'name': 'right_sleeve', 'from': [-6.5, 12, -2.5], 'to': [-3.5, 24, 2.5], 'faces': {
            'north': {'uv': [52, 16, 56, 28], 'texture': 0},
            'south': {'uv': [60, 16, 64, 28], 'texture': 0},
            'east': {'uv': [56, 16, 60, 28], 'texture': 0},
            'west': {'uv': [48, 16, 52, 28], 'texture': 0},
            'up': {'uv': [52, 16, 56, 20], 'texture': 0},
            'down': {'uv': [56, 16, 60, 20], 'texture': 0}
        }},
        # Left arm (4x12x4)
        {'name': 'left_arm', 'from': [4, 12, -2], 'to': [6, 24, 2], 'faces': {
            'north': {'uv': [44, 16, 48, 28], 'texture': 0},
            'south': {'uv': [52, 16, 56, 28], 'texture': 0},
            'east': {'uv': [48, 16, 52, 28], 'texture': 0},
            'west': {'uv': [40, 16, 44, 28], 'texture': 0},
            'up': {'uv': [44, 16, 48, 20], 'texture': 0},
            'down': {'uv': [48, 16, 52, 20], 'texture': 0}
        }},
        # Left arm layer
        {'name': 'left_sleeve', 'from': [3.5, 12, -2.5], 'to': [6.5, 24, 2.5], 'faces': {
            'north': {'uv': [60, 16, 64, 28], 'texture': 0},
            'south': {'uv': [48, 16, 52, 28], 'texture': 0},
            'east': {'uv': [52, 16, 56, 28], 'texture': 0},
            'west': {'uv': [44, 16, 48, 28], 'texture': 0},
            'up': {'uv': [60, 16, 64, 20], 'texture': 0},
            'down': {'uv': [52, 16, 56, 20], 'texture': 0}
        }},
        # Right leg (4x12x4)
        {'name': 'right_leg', 'from': [-4, 0, -2], 'to': [-2, 12, 2], 'faces': {
            'north': {'uv': [4, 16, 8, 28], 'texture': 0},
            'south': {'uv': [12, 16, 16, 28], 'texture': 0},
            'east': {'uv': [8, 16, 12, 28], 'texture': 0},
            'west': {'uv': [0, 16, 4, 28], 'texture': 0},
            'up': {'uv': [4, 16, 8, 20], 'texture': 0},
            'down': {'uv': [8, 16, 12, 20], 'texture': 0}
        }},
        # Right leg layer
        {'name': 'right_pants', 'from': [-4.5, 0, -2.5], 'to': [-1.5, 12, 2.5], 'faces': {
            'north': {'uv': [20, 16, 24, 28], 'texture': 0},
            'south': {'uv': [28, 16, 32, 28], 'texture': 0},
            'east': {'uv': [24, 16, 28, 28], 'texture': 0},
            'west': {'uv': [16, 16, 20, 28], 'texture': 0},
            'up': {'uv': [20, 16, 24, 20], 'texture': 0},
            'down': {'uv': [24, 16, 28, 20], 'texture': 0}
        }},
        # Left leg (4x12x4)
        {'name': 'left_leg', 'from': [2, 0, -2], 'to': [4, 12, 2], 'faces': {
            'north': {'uv': [12, 16, 16, 28], 'texture': 0},
            'south': {'uv': [20, 16, 24, 28], 'texture': 0},
            'east': {'uv': [16, 16, 20, 28], 'texture': 0},
            'west': {'uv': [8, 16, 12, 28], 'texture': 0},
            'up': {'uv': [12, 16, 16, 20], 'texture': 0},
            'down': {'uv': [16, 16, 20, 20], 'texture': 0}
        }},
        # Left leg layer
        {'name': 'left_pants', 'from': [1.5, 0, -2.5], 'to': [4.5, 12, 2.5], 'faces': {
            'north': {'uv': [28, 16, 32, 28], 'texture': 0},
            'south': {'uv': [36, 16, 40, 28], 'texture': 0},
            'east': {'uv': [32, 16, 36, 28], 'texture': 0},
            'west': {'uv': [24, 16, 28, 28], 'texture': 0},
            'up': {'uv': [28, 16, 32, 20], 'texture': 0},
            'down': {'uv': [32, 16, 36, 20], 'texture': 0}
        }},
        # Right shoe (4x1x4)
        {'name': 'right_shoe', 'from': [-4, 0, -2], 'to': [-2, 1, 2], 'faces': {
            'north': {'uv': [4, 0, 8, 4], 'texture': 0},
            'south': {'uv': [12, 0, 16, 4], 'texture': 0},
            'east': {'uv': [8, 0, 12, 4], 'texture': 0},
            'west': {'uv': [0, 0, 4, 4], 'texture': 0},
            'up': {'uv': [4, 0, 8, 4], 'texture': 0},
            'down': {'uv': [8, 0, 12, 4], 'texture': 0}
        }},
        # Left shoe (4x1x4)
        {'name': 'left_shoe', 'from': [2, 0, -2], 'to': [4, 1, 2], 'faces': {
            'north': {'uv': [12, 0, 16, 4], 'texture': 0},
            'south': {'uv': [20, 0, 24, 4], 'texture': 0},
            'east': {'uv': [16, 0, 20, 4], 'texture': 0},
            'west': {'uv': [8, 0, 12, 4], 'texture': 0},
            'up': {'uv': [12, 0, 16, 4], 'texture': 0},
            'down': {'uv': [16, 0, 20, 4], 'texture': 0}
        }},
    ]


def _build_tool_model() -> list:
    """Build a detailed Minecraft-style tool (sword/axe/pickaxe)."""
    return [
        # Handle (stick part)
        {'name': 'handle', 'from': [-0.5, 0, -0.5], 'to': [0.5, 10, 0.5], 'faces': {
            'north': {'uv': [2, 6, 4, 16], 'texture': 0},
            'south': {'uv': [10, 6, 12, 16], 'texture': 0},
            'east': {'uv': [6, 6, 8, 16], 'texture': 0},
            'west': {'uv': [14, 6, 16, 16], 'texture': 0},
            'up': {'uv': [6, 6, 8, 8], 'texture': 0},
            'down': {'uv': [8, 6, 10, 8], 'texture': 0}
        }},
        # Handle wrap
        {'name': 'handle_wrap', 'from': [-0.7, 3, -0.7], 'to': [0.7, 5, 0.7], 'faces': {
            'north': {'uv': [1, 11, 4, 13], 'texture': 0},
            'south': {'uv': [9, 11, 12, 13], 'texture': 0},
            'east': {'uv': [5, 11, 7, 13], 'texture': 0},
            'west': {'uv': [13, 11, 16, 13], 'texture': 0}
        }},
        # Blade head
        {'name': 'blade', 'from': [-2, 10, -0.5], 'to': [2, 14, 0.5], 'faces': {
            'north': {'uv': [0, 0, 8, 4], 'texture': 0},
            'south': {'uv': [12, 0, 20, 4], 'texture': 0},
            'east': {'uv': [8, 0, 12, 4], 'texture': 0},
            'west': {'uv': [20, 0, 24, 4], 'texture': 0},
            'up': {'uv': [4, 0, 12, 2], 'texture': 0},
            'down': {'uv': [12, 0, 20, 2], 'texture': 0}
        }},
        # Blade tip
        {'name': 'blade_tip', 'from': [-1.5, 14, -0.5], 'to': [1.5, 16, 0.5], 'faces': {
            'north': {'uv': [2, 0, 8, 2], 'texture': 0},
            'south': {'uv': [14, 0, 20, 2], 'texture': 0},
            'east': {'uv': [8, 0, 12, 2], 'texture': 0},
            'west': {'uv': [20, 0, 24, 2], 'texture': 0}
        }},
        # Crossguard
        {'name': 'crossguard', 'from': [-3, 9.5, -0.5], 'to': [3, 10.5, 0.5], 'faces': {
            'north': {'uv': [0, 5, 8, 6], 'texture': 0},
            'south': {'uv': [12, 5, 20, 6], 'texture': 0},
            'east': {'uv': [8, 5, 12, 6], 'texture': 0},
            'west': {'uv': [20, 5, 24, 6], 'texture': 0},
            'up': {'uv': [4, 5, 12, 6], 'texture': 0},
            'down': {'uv': [12, 5, 20, 6], 'texture': 0}
        }},
        # Gem on crossguard
        {'name': 'gem', 'from': [-0.5, 9, -0.8], 'to': [0.5, 10, -0.5], 'faces': {
            'north': {'uv': [6, 5, 8, 6], 'texture': 0}
        }},
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


NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions'

MODELS = [
    'minimaxai/minimax-m2.7',
    'minimaxai/minimax-m3',
    'nvidia/llama-3.3-nemotron-super-49b-v1.5',
    'meta/llama-3.1-70b-instruct',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
]


def _call_llm(prompt: str) -> str:
    api_key = os.environ.get('OPENROUTER_API_KEY', '')
    if not api_key:
        print('[ModelGen] No NVIDIA API key in env')
        return json.dumps({'elements': []})

    last_error = None
    for model in MODELS:
        try:
            print(f'[ModelGen] Trying {model}')
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
                    'max_tokens': 4000
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
            print(f'[ModelGen] Success with {model}')
            return content
        except Exception as e:
            print(f'[ModelGen] {model} failed: {e}')
            last_error = e
            continue

    print(f'[ModelGen] All models failed: {last_error}')
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
