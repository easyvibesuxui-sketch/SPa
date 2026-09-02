"""The room behind the glass: the clip's clean band, drawn sharp.

    ffmpeg -i clip.mp4 -vf "fps=COUNT/DURATION" -frames:v 120 -q:v 2 raw/f-%03d.jpg
    python3 tools/film.py raw

The source is a 16:9 sauna clip. Only the top third of its frame is used —
wall, steam, a head in profile — and the crop window pans slowly across that
band over the 120 stills. The band was checked frame by frame before it was
chosen; BAND is the line it was checked at and is not a number to raise
casually. Nothing below it goes on the page.

The clip itself is not in the repository. Re-run this against a fresh set of
stills to swap it, and keep COUNT in step with `F.count` in assets/js/main.js.
"""
import pathlib
import sys
from PIL import Image, ImageEnhance, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT  = ROOT / 'assets/img/steam'

COUNT   = 120           # stills across the whole page
W, H    = 960, 540      # 16:9
BAND    = 0.345         # of the source frame, from the top — the checked line
PAN     = (0.335, 0.235)  # window centre, start → end, as a fraction of width
QUALITY = 70

# the band is bright — steam holds a lot of light — and the page's type carries
# only a text-shadow for ground, so it is brought down hard and warmed back up
EXPOSURE = 0.62
WARM     = (1.06, 1.00, 0.90)
CONTRAST = 1.08


def lerp(a, b, t):
    return a + (b - a) * t


def build(src, u):
    im = Image.open(src).convert('RGB')
    sw, sh = im.size
    bh = round(sh * BAND)
    cw = round(bh * W / H)
    if cw > sw:                      # never ask for more than the source has
        cw = sw
        bh = round(cw * H / W)
    x = min(max(lerp(PAN[0], PAN[1], u) * sw - cw / 2, 0), sw - cw)
    return im.resize((W, H), Image.LANCZOS, box=(x, 0, x + cw, bh))


def grade(im):
    im = ImageEnhance.Brightness(im).enhance(EXPOSURE)
    r, g, b = im.split()
    im = Image.merge('RGB', (r.point(lambda v: min(255, int(v * WARM[0] + 2))),
                             g.point(lambda v: min(255, int(v * WARM[1]))),
                             b.point(lambda v: int(v * WARM[2]))))
    im = ImageEnhance.Contrast(im).enhance(CONTRAST)
    return im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=70, threshold=2))


def main():
    raw = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'raw')
    srcs = sorted(p for p in raw.iterdir()
                  if p.suffix.lower() in ('.jpg', '.jpeg', '.png'))
    if len(srcs) < COUNT:
        raise SystemExit('need %d stills in %s, found %d' % (COUNT, raw, len(srcs)))

    OUT.mkdir(parents=True, exist_ok=True)
    for f in OUT.glob('*.webp'):
        f.unlink()

    total = 0
    for i in range(COUNT):
        p = OUT / ('s-%03d.webp' % i)
        grade(build(srcs[i], i / (COUNT - 1))).save(p, quality=QUALITY, method=6)
        total += p.stat().st_size

    print('frames: %d | %dx%d | %.0f KB (%.1f KB each)'
          % (COUNT, W, H, total / 1024, total / 1024 / COUNT))


if __name__ == '__main__':
    main()
