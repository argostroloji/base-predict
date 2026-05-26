"""Generate PNG assets from scratch using Pillow.
Creates: logo.png (256), icon.png (1024), og-image.png (1200x630)
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

OUT = os.path.dirname(os.path.abspath(__file__))
BLUE = (0, 82, 255, 255)
WHITE = (255, 255, 255, 255)
DARK = (10, 10, 26, 255)
GRAY = (170, 180, 200, 255)


def rounded_rect(draw, xy, radius, fill):
    """Draw a rounded rectangle."""
    draw.rounded_rectangle(xy, radius=radius, fill=fill)


def draw_logo_mark(img, cx, cy, size, blue_bg=True):
    """Draw the bullseye-on-blue-square logo mark centered at (cx, cy) with given size."""
    half = size // 2
    # Outer rounded blue square
    if blue_bg:
        d = ImageDraw.Draw(img)
        rounded_rect(d, (cx - half, cy - half, cx + half, cy + half), radius=int(size * 0.22), fill=BLUE)

    # White ring (outer circle stroke)
    ring_outer = int(size * 0.60)
    ring_inner = int(size * 0.48)
    d = ImageDraw.Draw(img)
    d.ellipse((cx - ring_outer // 2, cy - ring_outer // 2,
               cx + ring_outer // 2, cy + ring_outer // 2), fill=WHITE)
    d.ellipse((cx - ring_inner // 2, cy - ring_inner // 2,
               cx + ring_inner // 2, cy + ring_inner // 2), fill=BLUE if blue_bg else DARK)

    # Center dot
    dot = int(size * 0.20)
    d.ellipse((cx - dot // 2, cy - dot // 2,
               cx + dot // 2, cy + dot // 2), fill=WHITE)


def gen_logo():
    """Square logo, transparent background."""
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw_logo_mark(img, size // 2, size // 2, size, blue_bg=True)
    img.save(os.path.join(OUT, 'logo.png'), 'PNG')
    print('logo.png OK')


def gen_icon():
    """1024x1024 icon for Farcaster splash."""
    size = 1024
    img = Image.new('RGBA', (size, size), DARK)
    # Draw a smaller mark centered with padding
    mark_size = 640
    draw_logo_mark(img, size // 2, size // 2, mark_size, blue_bg=True)
    img.save(os.path.join(OUT, 'icon.png'), 'PNG')
    print('icon.png OK')


def _load_font(size):
    """Try several common Windows font paths, fall back to default."""
    for path in [
        'C:/Windows/Fonts/segoeuib.ttf',  # Segoe UI Bold
        'C:/Windows/Fonts/arialbd.ttf',   # Arial Bold
        'C:/Windows/Fonts/arial.ttf',
    ]:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def gen_og():
    """1200x630 OG image with logo + tagline."""
    W, H = 1200, 630
    img = Image.new('RGBA', (W, H), DARK)
    d = ImageDraw.Draw(img)

    # Subtle blue gradient glow (top-left)
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((-200, -200, 700, 700), fill=(0, 82, 255, 80))
    gd.ellipse((W - 500, H - 300, W + 200, H + 200), fill=(59, 130, 255, 60))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=120))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)

    # Logo mark on the left
    mark_size = 280
    draw_logo_mark(img, 200, H // 2, mark_size, blue_bg=True)
    d = ImageDraw.Draw(img)

    # Text on the right
    title_font = _load_font(82)
    sub_font = _load_font(34)
    brand_font = _load_font(28)

    x = 400
    d.text((x, 180), 'When Base Token?', fill=WHITE, font=title_font)
    d.text((x, 300), 'Mint your prediction.', fill=GRAY, font=sub_font)
    d.text((x, 345), 'Hold the winning date.', fill=GRAY, font=sub_font)
    d.text((x, 410), 'BASE PREDICT', fill=(59, 130, 255, 255), font=brand_font)

    # Footer line
    d.line((60, H - 60, W - 60, H - 60), fill=(255, 255, 255, 30), width=2)
    d.text((60, H - 50), 'ERC-1155 on Base  •  10 NFTs per date', fill=GRAY, font=brand_font)

    img.save(os.path.join(OUT, 'og-image.png'), 'PNG')
    print('og-image.png OK')


if __name__ == '__main__':
    gen_logo()
    gen_icon()
    gen_og()
    print('All assets generated.')
