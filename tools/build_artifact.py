"""Build the self-contained preview of NAMI.

    python3 build_artifact.py

Reads the repository and writes nami.html at its root: one file,
no local network dependencies. CSS and JS are inlined; every photograph, the
120 background stills, the 64 route stills, the droplet tile and the marks go in
as data URIs; the three Unsplash frames are replaced with drawn light studies.
Google Fonts stays as an @import — the artifact host allows that origin.

Gotcha worth keeping: write the image arrays with json.dumps(), never repr().
repr() emits single-quoted strings that nest badly inside the inline script and
kill it silently — the only symptom is a preloader that never leaves.
"""
import base64, json, mimetypes, pathlib, re, urllib.parse

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT  = ROOT / 'nami.html'          # gitignored — a build output, not a source


def data_uri(rel):
    p = ROOT / rel
    mime = mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
    if p.suffix == '.webp':
        mime = 'image/webp'
    return 'data:%s;base64,%s' % (mime, base64.b64encode(p.read_bytes()).decode())


def svg(body, w=1200, h=1200):
    """Square, with the composition in the middle band — these are cropped to
    both portrait and wide frames, and a centre crop has to keep working."""
    s = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 %d %d' "
         "width='%d' height='%d'>%s</svg>" % (w, h, w, h, body))
    return 'data:image/svg+xml;charset=utf8,' + urllib.parse.quote(s, safe='')


# ── three drawn light studies, standing in for the Unsplash frames ──────
RIDGE = svg("""
<defs>
<linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>
<stop offset='0' stop-color='#160D09'/><stop offset='.3' stop-color='#3E1E12'/>
<stop offset='.52' stop-color='#8E4520'/><stop offset='.64' stop-color='#D2823F'/>
<stop offset='.72' stop-color='#E8B478'/></linearGradient>
<radialGradient id='sun' cx='.56' cy='.66' r='.36'>
<stop offset='0' stop-color='#F7DDB4' stop-opacity='.95'/>
<stop offset='1' stop-color='#F7DDB4' stop-opacity='0'/></radialGradient>
</defs>
<rect width='1200' height='1200' fill='url(#sky)'/>
<rect width='1200' height='1200' fill='url(#sun)'/>
<path d='M0 560 L150 470 L300 528 L470 404 L640 500 L820 384 L980 470 L1120 412 L1200 452 L1200 1200 L0 1200 Z' fill='#3A2216' opacity='.75'/>
<path d='M0 690 L180 606 L360 664 L560 570 L760 660 L960 588 L1130 656 L1200 626 L1200 1200 L0 1200 Z' fill='#241509' opacity='.94'/>
<path d='M0 830 L220 756 L430 818 L650 736 L880 812 L1080 750 L1200 794 L1200 1200 L0 1200 Z' fill='#120B07'/>
<g stroke='#E8B478' stroke-width='2' opacity='.12' fill='none'>
<path d='M0 596 Q 300 566 600 596 T 1200 596'/><path d='M0 632 Q 300 602 600 632 T 1200 632'/></g>
<rect width='1200' height='1200' fill='#0B0908' opacity='.2'/>""")

WATER = svg("""
<defs>
<linearGradient id='w' x1='0' y1='0' x2='0' y2='1'>
<stop offset='0' stop-color='#0A0E0E'/><stop offset='.34' stop-color='#16211F'/>
<stop offset='.62' stop-color='#2B3A36'/><stop offset='1' stop-color='#0D1312'/></linearGradient>
</defs>
<rect width='1200' height='1200' fill='url(#w)'/>
<path d='M0 400 L210 250 L400 350 L610 188 L840 330 L1030 236 L1200 344 L1200 0 L0 0 Z' fill='#070A0A'/>
<path d='M0 412 L210 262 L400 362 L610 200 L840 342 L1030 248 L1200 356 L1200 412 Z' fill='#1B2422' opacity='.7'/>
<g stroke='#C7B49C' fill='none'>
<path d='M0 470 Q 300 440 600 470 T 1200 470' stroke-width='2.4' opacity='.3'/>
<path d='M0 530 Q 300 496 600 530 T 1200 530' stroke-width='2' opacity='.26'/>
<path d='M0 596 Q 300 560 600 596 T 1200 596' stroke-width='2.6' opacity='.3'/>
<path d='M0 664 Q 300 630 600 664 T 1200 664' stroke-width='1.8' opacity='.22'/>
<path d='M0 736 Q 300 700 600 736 T 1200 736' stroke-width='2.4' opacity='.26'/>
<path d='M0 812 Q 300 778 600 812 T 1200 812' stroke-width='2' opacity='.2'/>
<path d='M0 892 Q 300 856 600 892 T 1200 892' stroke-width='2.6' opacity='.24'/>
<path d='M0 976 Q 300 942 600 976 T 1200 976' stroke-width='1.8' opacity='.18'/>
</g>
<ellipse cx='600' cy='640' rx='430' ry='230' fill='#E0A469' opacity='.07'/>
<rect width='1200' height='1200' fill='#0B0908' opacity='.16'/>""")

TABLE = svg("""
<defs>
<radialGradient id='lamp' cx='.5' cy='.42' r='.5'>
<stop offset='0' stop-color='#F5D4A6' stop-opacity='.42'/>
<stop offset='1' stop-color='#F5D4A6' stop-opacity='0'/></radialGradient>
</defs>
<rect width='1200' height='1200' fill='#150F0C'/>
<rect x='0' y='0' width='1200' height='700' fill='#26190F'/>
<g stroke='#4A3423' stroke-width='2' opacity='.5'>
<path d='M0 120 H1200'/><path d='M0 250 H1200'/><path d='M0 380 H1200'/><path d='M0 510 H1200'/><path d='M0 640 H1200'/></g>
<rect width='1200' height='1200' fill='url(#lamp)'/>
<rect x='0' y='700' width='1200' height='500' fill='#1C1411'/>
<ellipse cx='600' cy='706' rx='430' ry='30' fill='#0B0908' opacity='.55'/>
<g fill='#F5D4A6' opacity='.13'>
<ellipse cx='330' cy='648' rx='72' ry='52'/><ellipse cx='600' cy='632' rx='90' ry='64'/>
<ellipse cx='872' cy='650' rx='72' ry='52'/></g>
<g fill='#E0A469'>
<circle cx='330' cy='648' r='7'/><circle cx='600' cy='632' r='9'/><circle cx='872' cy='650' r='7'/></g>
<g stroke='#C7B49C' stroke-width='1.6' opacity='.14' fill='none'>
<rect x='196' y='752' width='190' height='120' rx='6'/>
<rect x='506' y='766' width='190' height='120' rx='6'/>
<rect x='816' y='752' width='190' height='120' rx='6'/></g>
<rect width='1200' height='1200' fill='#0B0908' opacity='.2'/>""")

STUDIES = {
    'photo-1464822759023-fed622ff2c3b': RIDGE,
    'photo-1519681393784-d120267933ba': RIDGE,
    'photo-1506905925346-21bda4d32df4': WATER,
    'photo-1441974231531-c6227db76b6e': WATER,
    'photo-1414235077428-338989a2e8c0': TABLE,
    'photo-1517248135467-4c7edcad34c4': TABLE,
}


def main():
    html = (ROOT / 'index.html').read_text()
    css  = (ROOT / 'assets/css/style.css').read_text()
    js   = (ROOT / 'assets/js/main.js').read_text()

    # the droplet tile, referenced from the stylesheet
    css = css.replace('url(../img/glass/drops.webp)',
                      'url(%s)' % data_uri('assets/img/glass/drops.webp'))

    # photographs and marks, referenced from both the markup and the script
    for p in sorted((ROOT / 'assets/img/photos').glob('*.jpg')) + \
             [ROOT / 'assets/img/logo.svg', ROOT / 'assets/img/favicon.svg']:
        rel = str(p.relative_to(ROOT))
        uri = data_uri(rel)
        html = html.replace(rel, uri)
        js = js.replace(rel, uri)

    # the two frame sets: swap the path builders for array lookups
    steam = [data_uri('assets/img/steam/s-%03d.webp' % i) for i in range(120)]
    route = [data_uri('assets/img/route/r-%03d.webp' % i) for i in range(64)]
    js = re.sub(r"function fSrc\(i\) \{[^}]*\}", "function fSrc(i) { return STEAM[i]; }", js)
    js = re.sub(r"function rSrc\(i\) \{[^}]*\}", "function rSrc(i) { return ROUTE[i]; }", js)
    js = ('var STEAM = %s;\nvar ROUTE = %s;\n' % (json.dumps(steam), json.dumps(route))) + js

    # the scenic frames become drawn studies
    for pid, study in STUDIES.items():
        html = re.sub(r'https://images\.unsplash\.com/' + pid + r'[^"\']*', study, html)

    # strip the document shell — the artifact host supplies it
    body = html[html.index('<body>') + len('<body>'):html.index('</body>')]
    body = body.replace('<script src="assets/js/main.js"></script>', '')

    # the artifact host allows fonts.googleapis.com, so the type survives
    fonts = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
             '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
             '<link href="https://fonts.googleapis.com/css2?'
             'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400'
             '&family=Inter:wght@300;400;500'
             '&family=Noto+Serif+Georgian:wght@300;400&display=swap" rel="stylesheet">\n')

    # the title is the artifact's name and must not drift between republishes
    out = ('<title>NAMI Bathhouse</title>\n' + fonts +
           '<style>\n' + css + '\n</style>\n'
           "<script>document.documentElement.classList.remove('no-js');"
           "document.documentElement.classList.add('js');</script>\n"
           + body +
           '\n<script>\n' + js + '\n</script>\n')

    OUT.write_text(out)
    print('%s — %.1f MB' % (OUT, OUT.stat().st_size / 1024 / 1024))


if __name__ == '__main__':
    main()
