import os
import uuid
import time
import requests
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np
from io import BytesIO


def generate_texture(prompt: str, resolution: int = 32, tex_type: str = 'item', output_dir: str = 'output') -> dict:
    file_id = str(uuid.uuid4())[:12]

    # Generate at higher resolution for quality, then downscale
    gen_size = max(256, resolution * 8)

    # Better prompt for Minecraft-style pixel art
    pixel_prompt = (
        f"{prompt}, Minecraft texture pack style, pixel art, "
        f"16-bit retro game sprite, flat shaded colors, "
        f"clean hard pixel edges, no anti-aliasing, no gradients, "
        f"centered on transparent background, "
        f"detailed pixel art illustration, game asset"
    )

    img = _generate_image_pollinations(pixel_prompt, gen_size)
    if img is None:
        raise Exception('Failed to generate image from Pollinations')

    img = img.convert('RGBA')

    # Step 1: Enhance contrast and sharpness before downscaling
    img = _enhance_quality(img)

    # Step 2: Quantize to clean Minecraft palette (16 colors for items, 24 for blocks)
    max_colors = 16 if tex_type == 'item' else 24
    img = _smart_quantize(img, max_colors)

    # Step 3: Downscale with nearest neighbor (pixel-perfect)
    img = img.resize((resolution, resolution), Image.Resampling.NEAREST)

    # Step 4: Clean up alpha channel
    img = _alpha_cleanup(img, threshold=128)

    # Step 5: Reinforce outlines (subtle, 1px dark border)
    img = _outline_reinforce(img, strength=0.6)

    # Step 6: Center the sprite
    if tex_type == 'item':
        img = _center_sprite(img)

    # Step 7: Final color adjustment
    img = _final_adjust(img)

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
    params = {
        'width': size,
        'height': size,
        'seed': int(time.time()) % 100000,
        'nologo': 'true',
        'model': 'flux'
    }
    try:
        resp = requests.get(url, params=params, timeout=180)
        resp.raise_for_status()
        return Image.open(BytesIO(resp.content))
    except Exception as e:
        print(f'[TextureGen] Pollinations error: {e}')
        return None


def _enhance_quality(img: Image.Image) -> Image.Image:
    """Enhance contrast and sharpness before quantization."""
    # Increase contrast slightly
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.3)

    # Increase sharpness
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(1.5)

    # Increase color saturation for vibrant pixel art
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(1.2)

    return img


def _smart_quantize(img: Image.Image, max_colors: int = 16) -> Image.Image:
    """Quantize to a clean palette while preserving edges."""
    # Convert to RGB for quantization
    rgb = img.convert('RGB')

    # Use MEDIANCUT for clean color separation
    quantized = rgb.quantize(colors=max_colors, method=Image.Quantize.MEDIANCUT)

    # Convert back to RGBA
    result = quantized.convert('RGBA')

    # Restore alpha channel from original
    if img.mode == 'RGBA':
        original_alpha = img.split()[3]
        # Use a threshold to create clean alpha
        alpha_data = np.array(original_alpha)
        clean_alpha = np.where(alpha_data > 100, 255, 0).astype(np.uint8)
        result.putalpha(Image.fromarray(clean_alpha))

    return result


def _alpha_cleanup(img: Image.Image, threshold: int = 128) -> Image.Image:
    """Clean up alpha channel - sharp threshold, no semi-transparent pixels."""
    data = np.array(img)
    alpha = data[:, :, 3]
    # Binary alpha: fully opaque or fully transparent
    data[:, :, 3] = np.where(alpha >= threshold, 255, 0).astype(np.uint8)
    return Image.fromarray(data)


def _outline_reinforce(img: Image.Image, strength: float = 0.6) -> Image.Image:
    """Add subtle dark outlines around the sprite for definition."""
    data = np.array(img)
    h, w = data.shape[:2]
    alpha = data[:, :, 3]

    # Create outline mask: pixels that are opaque but border transparent pixels
    outline_mask = np.zeros((h, w), dtype=bool)

    for dy in [-1, 0, 1]:
        for dx in [-1, 0, 1]:
            if dy == 0 and dx == 0:
                continue
            # Shifted alpha
            shifted = np.zeros_like(alpha)
            sy = max(0, dy)
            ey = min(h, h + dy)
            sx = max(0, dx)
            ex = min(w, w + dx)
            sy2 = max(0, -dy)
            ey2 = min(h, h - dy)
            sx2 = max(0, -dx)
            ex2 = min(w, w - dx)
            shifted[sy2:ey2, sx2:ex2] = alpha[sy:ey, sx:ex]
            # Edge: opaque pixel bordering transparent
            edge = (alpha > 128) & (shifted < 128)
            outline_mask |= edge

    # Darken the outline pixels
    outline_color = np.array([20, 20, 20, 255], dtype=np.uint8)
    for c in range(3):
        channel = data[:, :, c].astype(np.float32)
        channel[outline_mask] = channel[outline_mask] * (1 - strength)
        data[:, :, c] = channel.astype(np.uint8)
    data[outline_mask, 3] = 255

    return Image.fromarray(data)


def _center_sprite(img: Image.Image) -> Image.Image:
    """Center the sprite on a transparent canvas."""
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


def _final_adjust(img: Image.Image) -> Image.Image:
    """Final color adjustments for Minecraft-style look."""
    # Slight brightness boost
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(1.05)

    # Ensure clean pixel edges (no anti-aliasing artifacts)
    data = np.array(img)
    alpha = data[:, :, 3]
    # Remove any stray semi-transparent pixels
    data[:, :, 3] = np.where(alpha > 128, 255, np.where(alpha > 0, 0, 0)).astype(np.uint8)

    return Image.fromarray(data)
