"""The room behind the glass: the supplied clip reduced past recovery.

    ffmpeg -i clip.mp4 -vf "fps=6,scale=960:-2" -frames:v 120 raw/f-%03d.png
    python3 tools/frost.py raw

104 px is the working number — the footage still reads as footage, the
source does not survive it. See README, 'The room behind the glass'.
"""
import sys, pathlib
from PIL import Image, ImageFilter, ImageEnhance

RAW = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'raw')
OUT = pathlib.Path(__file__).resolve().parent.parent / 'assets/img/steam'
OUT.mkdir(parents=True, exist_ok=True)
for f in OUT.glob('*.webp'):
    f.unlink()

SMALL, BIG = 104, 560

for i, src in enumerate(sorted(RAW.glob('*.png'))):
    im = Image.open(src).convert('RGB')
    w, h = im.size
    im = im.resize((SMALL, max(1, round(h * SMALL / w))), Image.LANCZOS)
    im = im.filter(ImageFilter.GaussianBlur(1.7))
    im = im.resize((BIG, max(1, round(h * BIG / w))), Image.LANCZOS)
    im = im.filter(ImageFilter.GaussianBlur(6.2))

    # warm it, then lift the contrast the blur flattened
    r, g, b = im.split()
    im = Image.merge('RGB', (r.point(lambda v: min(255, int(v * 1.07 + 4))),
                             g.point(lambda v: min(255, int(v * 1.00 + 1))),
                             b.point(lambda v: min(255, int(v * 0.90)))))
    im = ImageEnhance.Contrast(im).enhance(1.14)
    im = ImageEnhance.Brightness(im).enhance(1.03)
    im.save(OUT / ('s-%03d.webp' % i), quality=74, method=6)

n = len(list(OUT.glob('*.webp')))
print('frames:', n, '| size:', Image.open(OUT / 's-000.webp').size)
