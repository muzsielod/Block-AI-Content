"""Generates the toolbar icons (dark green "A" when enabled, gray when disabled).
Usage: python3 make-icons.py   (needs Pillow)"""
from PIL import Image, ImageDraw

SIZES = [16, 32, 48, 128]
SUPERSAMPLE = 8
STATES = {
    "enabled": {"letter": "#1B5E20", "background": "#E8F5E9"},
    "disabled": {"letter": "#9E9E9E", "background": "#EEEEEE"},
}

APEX = (0.50, 0.17)
BASE_LEFT = (0.23, 0.84)
BASE_RIGHT = (0.77, 0.84)
CROSSBAR = ((0.34, 0.63), (0.66, 0.63))
STROKE = 0.15
CROSSBAR_STROKE = 0.11
CORNER_RADIUS = 0.22


def draw_round_line(draw, start, end, width, color, scale):
    points = [(x * scale, y * scale) for x, y in (start, end)]
    draw.line(points, fill=color, width=round(width * scale))
    radius = width * scale / 2
    for x, y in points:
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=color)


def render_icon(size, colors):
    scale = size * SUPERSAMPLE
    image = Image.new("RGBA", (scale, scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle([0, 0, scale - 1, scale - 1], radius=CORNER_RADIUS * scale, fill=colors["background"])
    draw_round_line(draw, BASE_LEFT, APEX, STROKE, colors["letter"], scale)
    draw_round_line(draw, APEX, BASE_RIGHT, STROKE, colors["letter"], scale)
    draw_round_line(draw, *CROSSBAR, CROSSBAR_STROKE, colors["letter"], scale)
    return image.resize((size, size), Image.LANCZOS)


for state, colors in STATES.items():
    for size in SIZES:
        render_icon(size, colors).save(f"icon-{state}-{size}.png")
print("icons written")
