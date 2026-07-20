import os
import uuid
import time
import requests
from PIL import Image, ImageDraw
import numpy as np
from io import BytesIO

def generate_texture(prompt: str, resolution: int = 32, tex_type: str = 'item', output_dir: str = 'output') -> dict:
    file_id = str(uuid.uuid4())[:12]
    scale = 16
    gen_size = resolution * scale

    pixel_prompt = f"{prompt}, pixel art, Minecraft style, flat colors, hard edges, no gradients, no anti-aliasing, centered, transparent background, 16-bit, sprite sheet"

    img = _generate_image_pollinations(pixel_prompt, gen_size)
    if img is None:
        raise Exception('Failed to generate image from Pollinations')

    img = img.convert('RGBA')

    img = _palette_quantize(img, max_colors=32)
    img = _nearest_neighbor_downscale(img, resolution)
    img = _outline_reinforce(img)
    img = _alpha_cleanup(img, threshold=128)

    if tex_type == 'item':
        img = _center_sprite(img)

    out_path = os.path.join(output_dir, f'texture_{file_id}.png')
    img.save(out_path, 'PNG')

    palette_size = len(set(img.getdata()))

    return {
        'file': f'texture_{file_id}.png',
        'download_url': f'/download/texture_{file_id}.png',
        'preview_url': f'/preview/texture_{file_id}.png',
        'format': 'RGBA PNG',
        'width': resolution,
        'height': resolution,
        'palette_size': palette_size,
        'type': tex_type
    }


def _generate_image_pollinations(prompt: str, size: int) -> Image.Image | None:
    url = f"https://image.pollinations.ai/prompt/{requests.utils.quote(prompt)}"
    params = {'width': size, 'height': size, 'seed': int(time.time()), 'nologo': 'true'}
    try:
        resp = requests.get(url, params=params, timeout=120)
        resp.raise_for_status()
        return Image.open(BytesIO(resp.content))
    except Exception as e:
        print(f'[TextureGen] Pollinations error: {e}')
        return None


def _palette_quantize(img: Image.Image, max_colors: int = 32) -> Image.Image:
    img_rgb = img.convert('RGB')
    quantized = img_rgb.quantize(colors=max_colors, method=Image.Quantize.MEDIANCUT)
    result = quantized.convert('RGBA')
    if img.mode == 'RGBA':
        result.putalpha(img.split()[3])
    return result


def _nearest_neighbor_downscale(img: Image.Image, target_size: int) -> Image.Image:
    return img.resize((target_size, target_size), Image.Resampling.NEAREST)


def _outline_reinforce(img: Image.Image) -> Image.Image:
    data = np.array(img)
    h, w = data.shape[:2]
    alpha = data[:, :, 3]
    outline_mask = np.zeros((h, w), dtype=bool)

    for dy in [-1, 0, 1]:
        for dx in [-1, 0, 1]:
            if dy == 0 and dx == 0:
                continue
            shifted = np.zeros_like(alpha)
            sy = max(0, dy); ey = min(h, h + dy)
            sx = max(0, dx); ex = min(w, w + dx)
            sy2 = max(0, -dy); ey2 = min(h, h - dy)
            sx2 = max(0, -dx); ex2 = min(w, w - dx)
            shifted[sy2:ey2, sx2:ex2] = alpha[sy:ey, sx:ex]
            edge = (alpha > 128) & (shifted < 128)
            outline_mask |= edge

    data[outline_mask, 0] = 0
    data[outline_mask, 1] = 0
    data[outline_mask, 2] = 0
    data[outline_mask, 3] = 255

    return Image.fromarray(data)


def _alpha_cleanup(img: Image.Image, threshold: int = 128) -> Image.Image:
    data = np.array(img)
    alpha = data[:, :, 3]
    data[:, :, 3] = np.where(alpha >= threshold, 255, 0).astype(np.uint8)
    return Image.fromarray(data)


def _center_sprite(img: Image.Image) -> Image.Image:
    data = np.array(img)
    alpha = data[:, :, 3]
    rows = np.any(alpha > 0, axis=1)
    cols = np.any(alpha > 0, axis=0)
    if not rows.any() or not cols.any():
        return img
    rmin, rmax = np.where(rows)[0][[0, -1]]
    cmin, cmax = np.where(cols)[0][[0, -1]]
    crop = img.crop((cmin, rmin, cmax + 1, rmax + 1))
    w, h = crop.size
    canvas = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ox = (img.width - w) // 2
    oy = (img.height - h) // 2
    canvas.paste(crop, (ox, oy))
    return canvas
