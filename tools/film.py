"""The room behind the glass, drawn sharp.

Builds the 120 scroll-scrub stills in `assets/img/steam/` out of the house
photographs themselves: six rooms, a slow push through each, dissolved into
the next. No footage, nothing to obscure — every frame is at native
photographic detail.

    python3 tools/film.py

Frame count, size and grade are the four constants below. If you change
COUNT, set `F.count` in assets/js/main.js to match.
"""
import pathlib
from PIL import Image, ImageEnhance, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC  = ROOT / 'assets/img/photos'
OUT  = ROOT / 'assets/img/steam'

COUNT   = 120          # stills across the whole page
W, H    = 960, 540     # 16:9
OVERLAP = 0.34         # of a segment, spent dissolving into the next
QUALITY = 68

# file, start (centre x, centre y, width as a fraction of the source),
# end, and an exposure trim so no room flares brighter than its neighbours.
# The arc: the dark room, the doorway, the heat, the water, the dark again,
# and a quiet close.
ROOMS = [
    ('sauna-lamp.jpg',       (.50, .28, .98), (.54, .39, .86), 1.06),
    ('sauna-bench-dark.jpg', (.52, .31, .96), (.47, .41, .84), 1.00),
    ('infrared-slats.jpg',   (.46, .24, .86), (.52, .34, .98), 0.62),
    ('pool-night.jpg',       (.46, .34, .98), (.51, .44, .86), 0.74),
    ('shower-dark.jpg',      (.52, .36, .88), (.47, .46, .98), 1.16),
    ('towel-figure.jpg',     (.48, .30, .96), (.53, .40, .86), 1.00),
]

CACHE = {}


def source(name):
    if name not in CACHE:
        CACHE[name] = Image.open(SRC / name).convert('RGB')
    return CACHE[name]


def lerp(a, b, t):
    return a + (b - a) * t


def frame(room, u):
    """One room at local time u. u runs a little past 0 and 1 at the joins,
    so a room is already moving when it fades in."""
    im = source(room[0])
    sw, sh = im.size
    a, b = room[1], room[2]
    cx, cy, z = (lerp(a[i], b[i], u) for i in range(3))

    cw = min(sw * z, sw)             # never ask for more than the source has
    ch = cw * H / W
    if ch > sh:
        ch = sh
        cw = ch * W / H
    x = min(max(cx * sw - cw / 2, 0), sw - cw)
    y = min(max(cy * sh - ch / 2, 0), sh - ch)
    return im.resize((W, H), Image.LANCZOS,
                     box=(x, y, x + cw, y + ch))


def grade(im, exposure=1.0):
    if exposure != 1.0:
        im = ImageEnhance.Brightness(im).enhance(exposure)
    r, g, b = im.split()
    im = Image.merge('RGB', (r.point(lambda v: min(255, int(v * 1.05 + 2))),
                             g.point(lambda v: min(255, int(v * 1.00))),
                             b.point(lambda v: int(v * 0.92))))
    im = ImageEnhance.Brightness(im).enhance(0.86)
    im = ImageEnhance.Contrast(im).enhance(1.06)
    return im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=52, threshold=3))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for f in OUT.glob('*.webp'):
        f.unlink()

    span = COUNT / len(ROOMS)
    total = 0
    for i in range(COUNT):
        pos = i / span
        k = min(int(pos), len(ROOMS) - 1)
        u = pos - k

        im = grade(frame(ROOMS[k], u), ROOMS[k][3])
        if k + 1 < len(ROOMS) and u > 1 - OVERLAP:
            t = (u - (1 - OVERLAP)) / OVERLAP
            t = t * t * (3 - 2 * t)                       # smoothstep
            nxt = grade(frame(ROOMS[k + 1], u - 1), ROOMS[k + 1][3])
            im = Image.blend(im, nxt, t)

        p = OUT / ('s-%03d.webp' % i)
        im.save(p, quality=QUALITY, method=6)
        total += p.stat().st_size

    print('frames: %d | %dx%d | %.0f KB (%.1f KB each)'
          % (COUNT, W, H, total / 1024, total / 1024 / COUNT))


if __name__ == '__main__':
    main()
