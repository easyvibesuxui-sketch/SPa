# NAMI — full project handoff

Everything needed to rebuild, continue or move this site elsewhere. Written to be
read on its own: the three source files (`index.html`, `assets/css/style.css`,
`assets/js/main.js`) are the authority, this is the map and the reasoning.

**Live:** https://easyvibesuxui-sketch.github.io/SPa/
**Repo branch:** `claude/batumi-spa-redesign-szk3ev` (also the default branch)

---

## 1. What it is

A concept **redesign of [vabali spa Berlin](https://www.vabali.de/en/berlin/)**. The
content structure is kept — sauna world, pools, treatments, restaurant, day tickets,
opening hours, vouchers, location. Everything else is new.

| | |
|---|---|
| Name | **NAMI** — Georgian *ნამი*, "dew" |
| Type | textile-free bathhouse & mountain garden, adults only |
| Place | **Goderdzi Pass, 2,025 m**, 95 km above Batumi, Adjara, Georgia |
| Idea | calm, intimacy, a quiet erotic charge; candlelight, private hammam suites |
| Currency | Georgian lari ₾ |

**All business details are fictional** — address, phone, e-mail, prices are placeholders.

### Art direction

Taken from three reference interiors: deep walnut/espresso ground, warm cove lighting
that comes from behind things, oversized editorial serif split across lines, hairline
crosshair rules, thin dividers, small letterspaced sans labels, soft glow, film grain.

Nothing is polished to a shine. Warmth is the only decoration.

---

## 2. Stack

Static. **No framework, no build step, no dependencies.** Three files plus images.
Paths are relative, so it serves correctly from a sub-path like `/SPa/`.

```
index.html               458 lines — all markup and copy
assets/css/style.css     591 lines — tokens + every section
assets/js/main.js        611 lines — the whole scroll engine, vanilla
assets/img/photos/       11 supplied JPEGs, 703 KB
assets/img/route/        64 WebP frames of the map, 1.3 MB
assets/img/steam/        120 WebP frames of the background film, 818 KB
assets/img/logo.svg      wordmark + dew mark
assets/img/favicon.svg
tools/film.py            the background-film recipe
.nojekyll                so GitHub Pages serves the files verbatim
```

External at runtime: **Google Fonts** (Cormorant Garamond, Inter, Noto Serif Georgian)
and **four Unsplash frames**. Everything else is local.

Run it:

```bash
npx http-server -p 8099 .      # or python3 -m http.server 8099
```

---

## 3. Page structure

| Section | `id` | Replaces |
|---|---|---|
| Hero — *STEAM / SALT / SKIN* | `top` | landing claim |
| Marquee | — | — |
| Intro — "a house for slowness" | `intro` | welcome / about |
| The House — materials, stats | `house` | the spa, facilities |
| Rituals — pinned horizontal scroll, 6 cards | `rituals` | Aufguss, peelings, programme |
| Water — layered parallax, 4 temperatures | `water` | pools |
| Touch — treatment list with cursor preview | `touch` | massages & beauty |
| After Dark — 18+, private hammam, Nocturne | `nocturne` | *(new)* the intimacy angle |
| Table — bathrobe dining | `table` | restaurant |
| Hours & Tickets — 2h / 4h / day / after dark | `tickets` | day tickets & hours |
| Voucher marquee | — | gift vouchers |
| The Road Up — scroll-drawn map | `find` | location & getting here |
| Footer | — | — |

Header nav: House · Rituals · Water · Touch · After Dark · Tickets, plus a single
**Book** button and a burger opening a full-screen menu with a hover image.

---

## 4. House rules for the type

Two things are deliberately absent and should stay absent.

**No ordinal markers.** No `01 / 02 / 03` on sections, cards, rows, tickets or menu
items; no section counter in the corner. Nothing here is a numbered sequence, so a
number decorates rather than informs. Numbers appear only where the number *is* the
content — temperatures, durations, prices, hours.

**No shouted micro-labels.** Captions, card meta, durations and list labels are
sentence case. Letterspaced uppercase is reserved for the few places it acts as a
stamp: navigation, buttons, and the two facts in the hero's top corners.

Both rules came from the client directly ("01 02 03 და მსგავსი … არ მინდა"). They are
the difference between this and a template.

---

## 5. Design tokens

```css
:root{
  --ink:#0B0908;      /* page ground */
  --ink-2:#100B09;
  --walnut:#1C1411;
  --clay:#3A2C23;
  --clay-2:#544134;
  --sand:#C7B49C;     /* dim body text */
  --sand-d:#A6947E;   /* meta, captions */
  --cream:#F2ECE4;    /* headings */
  --amber:#E0A469;    /* the one accent */
  --amber-l:#F5D4A6;
  --olive:#4E5340;

  --line:rgba(199,180,156,.16);
  --line-s:rgba(199,180,156,.30);

  --f-display:"Cormorant Garamond",Times,serif;
  --f-sans:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --f-ka:"Noto Serif Georgian","Cormorant Garamond",serif;
  --f-price:"Cormorant Garamond","Noto Serif Georgian",Times,serif;

  --pad:clamp(22px,7vw,140px);   /* horizontal page padding */
  --gut:clamp(52px,8vw,150px);   /* vertical rhythm between blocks */
  --ease:cubic-bezier(.19,1,.22,1);    /* expo-out, for motion */
  --ease-s:cubic-bezier(.4,0,.2,1);    /* standard, for fades */
}
```

Type scale is all `clamp()`. The display serif runs to ~15vw in the hero and stays
oversized everywhere; body copy is Inter 300 at 16px/1.6. Georgian text uses
`--f-ka`.

Whitespace was raised once after client feedback ("მეტი ჰაერი") — `--gut` and `--pad`
are the two knobs; raise them, don't add margins per section.

---

## 6. Motion inventory

All hand-written in `assets/js/main.js`. Numbered modules in the file:

| # | Module | What it does |
|---|---|---|
| 1 | image fallbacks | every remote `<img>` has `data-fallback`; on error swaps, then degrades to a warm gradient |
| 2 | split text | `data-split="chars"` / `"words"` wraps each unit in a span |
| 3 | smooth scroll | lenis-lite, see below |
| 4 | parallax | `[data-parallax="0.14"]` |
| 5 | horizontal scroll | pinned Rituals track |
| 6 | reveals | IntersectionObserver, curtain wipe + blur/rise |
| 7 | nav state | active link by section |
| 8 | header | direction-aware hide/show, solid past 40px |
| 9 | cursor | custom dot + ring with contextual label |
| 10 | treatment preview | image follows cursor over the `.tlist` rows |
| 11 | marquees | speed and direction driven by scroll velocity |
| 12 | menu | full-screen overlay, hover images, Escape closes |
| 12b | video slots | `VIDEOS = { hero:'', dark:'' }` — drop in a path and it mounts |
| 12c | the road up | scroll-scrubbed map canvas |
| 12d | the room behind the glass | scroll-scrubbed background canvas |
| 12e | the surface | the water it is seen through, and the rings the pointer leaves |
| 13 | loader | real progress read, releases the hero split |
| 14 | rAF loop | everything above is driven from one loop |
| 15 | boot | |

### Smooth scroll (the important one)

```js
var SM = { on: !touch && !reduce, target: scrollY, current: scrollY, ease: 0.088 };
// wheel/keyboard are intercepted and accumulate into SM.target
// each frame:  SM.current = lerp(SM.current, SM.target, SM.ease);
//              window.scrollTo(0, SM.current);
```

It drives a **real** `window.scrollTo`, not a transformed wrapper. That is deliberate:
`position:sticky` — which both pinned sections depend on — keeps working. Disabled on
touch and under `prefers-reduced-motion`.

### Parallax

`cacheParallax()` measures once per resize; each frame the node is translated by
`((y + vh/2) - elementCenter) * speed`. It targets
`:scope > video, :scope > img, :scope > .ph` — the *child*, not the frame, so frames
stay `overflow:hidden` and images at 118–132% height never expose an edge.

### Word-by-word lighting

Lede paragraphs (`data-split="words"`) brighten word by word as they cross the
viewport: opacity `0.14 → 1`, offset by index, driven by scroll progress through a
0.52 vh window.

---

## 7. The two frame-scrub canvases

Both work the same way and **neither ever plays on its own** — this was a hard client
rule ("rule no autoplay"). There is no `<video>` element in the page at all. A clip is
chopped into stills, and the scroll position picks which still is painted. Scroll
stops, image stops. Scroll back, it unwinds.

### 7a. The background film — `assets/img/steam/`

120 WebP stills, 960 × 540, q70, 818 KB for the set, painted on a
`position:fixed` canvas behind everything.

```js
var F = { count:120, imgs:[], step:1, ctx:null, cur:0, shown:-1 };
// each frame, with fp = y / maxScroll:
F.cur = lerp(F.cur, fp * (F.count - 1), 0.12);
fPaint(Math.round(F.cur / F.step) * F.step);
fCanvas.style.transform =
  'scale(' + (1.14 - fp*0.12) + ') translate3d(' + (fp*1.6-0.8) + '%,' + (1.4-fp*2.8) + '%,0)';
```

Notes that matter:

* `fPaint` walks backwards to the nearest **loaded** frame, so it never blanks while
  images stream in. `F.shown` guards against redrawing the same frame.
* `F.step = 2` below 760 px — half the frames on phones.
* First frame loads eagerly, the rest on `requestIdleCallback`.
* DPR is capped at 1.5. A full-viewport canvas at DPR 3 is the one thing that will
  cost you frames.
* `cover` fit is computed by hand (`Math.max(w/naturalWidth, h/naturalHeight)`).
* Under `prefers-reduced-motion` one mid-clip frame is drawn and never changes.
* The canvas also slow-zooms and pans as you scroll, so it reads as footage rather
  than a still wash.
* Minor inconsistency to know about: CSS sets `transform:scale(1.16)` for the pre-JS
  state, the loop starts from `1.14`. Harmless; unify if it bothers you.

**Making the frames** — `tools/film.py`:

```bash
ffmpeg -i clip.mp4 -t 20 -vf "fps=6" -frames:v 120 -q:v 2 raw/f-%03d.jpg
python3 tools/film.py raw
```

The source is a sauna clip, and **only the top third of its frame is used** —
`BAND = 0.345` — because that is the part of it that belongs on a public page:
wall, steam, a head in profile. The 16:9 window inside that band pans from
0.335 to 0.235 of the width across the 120 stills, so the shot drifts as the
page scrolls while the steam moves on its own.

`BAND` is a line that was checked against every one of the 120 stills before it
was set. Raising it is a decision about what the page shows, not a tweak.

The grade is heavier than it was for the photographs: steam holds a lot of
light, so exposure runs at 0.62, warmed back (R×1.06, B×0.90) and lifted 1.08 in
contrast, then a light unsharp mask for what the 2.2× resize softens. The page's
type carries only a text-shadow for ground; a bright background takes it away.

Two traps in the source, both likely in any generated clip:

* It tears after about twenty seconds — horizontal RGB streaks across the band —
  hence `-t 20` in the ffmpeg line. Look at the tail before you use it.
* A raised limb crosses into the band late in the clip. Same fix.

The clip is **not in the repository**; the stills are. An earlier film built
from the house photographs — six rooms, a slow push through each, dissolved
together — is in the history at `a7dcb4d`.

### 7b. The road up — `assets/img/route/`

64 WebP stills of a Batumi→Goderdzi map animation, 1100 px wide, q62.

The section is **340 vh** tall with a sticky inner frame. Progress through it maps to
frame index, so the road draws forward on the way down and unwinds on the way back up.
On the same progress: a **distance readout counts to 95 km**, and three legs (Batumi ·
Khulo · Goderdzi) light as the line reaches them (`data-at="0.04|0.52|0.88"`).

Frames load only when the section is within 1.5 viewports. The canvas fades in over
1.25 vh on approach and back out past the end, with a CSS blur (`--soft`, up to 22 px)
tied to the same value — that soft dissolve exists because the hard cut into the map
was called out twice as too abrupt.

To re-chop: `fps=8,scale=1100:-2`, WebP q62 into `assets/img/route/`, set `R.count`.

---

### 7c. The section grounds

The film alone left the page reading empty — one continuous shot behind
everything gives no section an identity. Each section now carries its own
photograph under its content: `.secbg`, an absolute layer at `z-index:-2`
inside a `position:relative; isolation:isolate` section — the pattern `.dark`
already used, generalised.

Intro `sauna-lamp` · House `towel-figure` · Rituals `infrared-slats` (inside
`.hs__sticky`, which is the pinned frame) · Water `back-night`, the one cool
ground among warm ones · Touch `rain-face` · After Dark its existing
`.dark__media` · Table `bath-window` · Tickets `pool-night`. **The Road Up gets
none** — the map canvas needs black under it.

The image runs at `saturate(.6) brightness(.42) contrast(1.05)` (.34 on phones)
under a vertical scrim and a soft radial, and the layer is feathered top and
bottom with `mask-image` — transparent for the first and last 15% — so the film
still breathes between sections rather than the page cutting photograph to
photograph. `data-parallax="0.08"` on each drifts it against the content.

## 8. The surface — no file at all

The room is seen through water, and the water answers the pointer. Nothing here
is an image: one height field, described in the shader and never stored.

```glsl
h += sin(px.x*0.0072 + t*0.5)*19.0*amb;          // the ambient swell,
h += sin((px.x*0.5+px.y)*0.0059 - t*0.38)*15.0*amb;   // two long shallow waves
for (int i=0;i<14;i++){                          // and the rings
  float age  = t - rip[i].z;   if (age<0.0||age>3.4) continue;
  float d    = distance(px, rip[i].xy);
  float ring = d - age*300.0;                    // px per second
  h += sin(ring*0.082)
     * exp(-age*1.05)                            // it dies out
     * exp(-ring*ring/6000.0)                    // only near the ring
     * (1.0/(1.0+d*0.0055))                      // and near its origin
     * 9.0;
}
vec2 g = vec2(dFdx(h), dFdy(h));                 // the slope is the whole effect
```

Fourteen rings are alive at once in a ring buffer — a new one overwrites the
oldest. `OES_standard_derivatives` is required, and its absence is one of the
two ways this turns itself off.

**Two passes, one shader.** `LIGHT` is `#define`d into the second.

| Canvas | Where | What it does |
|---|---|---|
| `#waterCanvas` | inside `.film`, under the page | samples the film canvas at `v - g*11/res` — refraction, so the room bends |
| `#waterLight` | `position:fixed`, `z-index:88`, `mix-blend-mode:soft-light` | draws only the light the slope throws back, over the whole page, so the sections are under the same water as the film |

`0.5` is soft-light's no-op, so the light pass writes `vec3(0.5)` plus the
highlight and minus the shadow, with alpha only where the surface is tilted.
Its ambient term runs at 0.42 of the refraction pass's, so an untouched page is
almost still.

`#filmCanvas` stays in the document as the texture source, hidden with
`visibility:hidden` — which keeps its backing store, where `display:none` would
be riskier. It is re-uploaded only when the film paints a new frame, i.e. only
while scrolling; the rings animate off the same texture for free.

Pointer moves are throttled to one ring per 70 ms and 20 px of travel, so a fast
sweep leaves a wake rather than a wall. `pointerdown` always makes one.

**Off by default in two cases**, and then the film simply shows as it always
did: no WebGL (or no derivatives extension), and `prefers-reduced-motion`.

### What it replaced

A seamless 1024 px tile of eighteen drawn water beads on a pane of glass,
tiled at 1100 px. The idea was a pane someone had already wiped. In practice a
bead at that size read as a smudge rather than a drop, and the repeat sat on
every photograph on the page. The tile is deleted; nothing references it.

## 9. Images

Eleven supplied photographs in `assets/img/photos/` (progressive JPEG q82, EXIF
stripped, 703 KB for the set):

| File | Where it appears |
|---|---|
| `sauna-lamp.jpg` | The Silence Room |
| `bath-window.jpg` | intro · treatment preview |
| `sauna-cabin.jpg` | The House, left frame |
| `infrared-slats.jpg` | The House, right frame |
| `sauna-bench-dark.jpg` | Sea Aufguss · After Dark background · preview |
| `rain-face.jpg` | Honey & Salt · preview |
| `towel-figure.jpg` | Walnut Oil |
| `wet-glass.jpg` | The Ice Well |
| `pool-night.jpg` | Water, first frame · preview |
| `shower-dark.jpg` | Water, second frame · After Dark diptych, right |
| `back-night.jpg` | After Dark diptych, left · preview |

Three scenic frames — Sunset Deck, the third water frame, the table — still point at
**Unsplash** with a `data-fallback` second URL. The menu overlay's set lives in
`MENU_IMGS` in `main.js`.

The hero has **no image of its own**: the room behind the glass is what you open on,
and the first frames of the film play as you leave it. A video slot can mount into
`.hero__media` if you want one back.

---

## 10. Accessibility

Semantic landmarks, skip link, `:focus-visible` rings, `aria-expanded` /
`aria-hidden` on the menu, Escape closes it. A full `prefers-reduced-motion` path
disables smooth scroll, parallax, preloader, grain and both canvas scrubs while
showing every piece of content.

---

## 11. Deployment

GitHub Pages serves **straight from the branch root** — Settings → Pages → Source:
*Deploy from a branch*, branch `claude/batumi-spa-redesign-szk3ev`, folder `/ (root)`.
A push is the deploy; the site rebuilds within a minute. `.nojekyll` keeps the files
verbatim.

### Do not add a deploy workflow

This repository blocks marketplace actions. Any workflow using `actions/checkout`,
`actions/configure-pages`, `actions/upload-pages-artifact` or `actions/deploy-pages`
ends in `startup_failure` in under a second, with no log and no steps. This was
bisected: a plain `run:` job succeeds, a job requesting `pages: write` /
`id-token: write` succeeds, the real workflow fails instantly. A runner is reachable
and the permissions are grantable — the actions policy alone is the block. Branch
serving needs no workflow at all.

### The preview artifact

A second, self-contained build exists for previewing without any network:
`python3 tools/build_artifact.py` writes `nami.html` at the repository root — CSS, JS,
all 11 photos, 64 route frames, 120 background stills and the droplet tile inlined as
data URIs, the three Unsplash frames replaced with drawn SVG light studies, and the
document shell stripped because the artifact host supplies its own. Google Fonts stays
a `<link>`: that origin is allowed there, so the type survives. Output is one ~6.3 MB
file.

Gotcha from building it: use `json.dumps()`, not `repr()`, when writing image arrays
into inline JS — `repr()` produced nested unescaped quotes that killed the entire
script silently, and the only symptom was a preloader that never went away.

---

## 12. Traps already hit — do not re-discover these

**IntersectionObserver + `clip-path`.** The original reveal was
`.cover{clip-path:inset(0 0 100% 0)}`. Chromium computes the intersection rect *after*
`clip-path`, so a fully clipped element never intersects and never reveals — 10 of 16
image frames stayed invisible. Fixed by replacing the clip with a curtain wipe on a
pseudo-element:

```css
.cover::before{content:"";position:absolute;inset:-1px;z-index:2;background:var(--ink);
  transform-origin:50% 100%;transform:scaleY(1);transition:transform 1.25s var(--ease)}
.cover.is-in::before{transform:scaleY(0)}
```

**Shared declaration blocks and regex edits.** Removing a section with
`re.sub(r'\.find\{[^}]*\}\n', ...)` deleted the shared `padding` of
`.intro,.house,.touch,.table,.tickets,.find{…}` and silently broke five sections'
spacing. Delete selectors by hand.

**`mix-blend-mode: difference` on the header.** Looks clever on a dark page; the nav
and Book button vanish the moment the background brightens. Replaced with a
normal-mode gradient.

**Text legibility over a bright background.** When the overlays came off, every text
class needed to carry its own ground:

```css
.h-display,.lede,.p,.sig,.facts,.caption,.minor,/* …and the rest… */
{text-shadow:0 1px 32px rgba(6,5,4,.96),0 1px 10px rgba(6,5,4,.8),0 0 3px rgba(6,5,4,.5)}
```

**Network in this environment.** unsplash.com, images.unsplash.com, Netlify's API,
`*.github.io` and several CDNs are unreachable from the build sandbox. Photo IDs were
validated by code search instead, every remote `<img>` carries a fallback, and the
preview build inlines everything.

---

## 13. Copy

The full copy lives in `index.html` and reads cleanly there — it is not extracted into
data, on purpose. Voice notes if you rewrite:

* Short declaratives. Concrete nouns — basalt, larch, sulguni, qvevri, 8°.
* Instructions rather than adjectives: *"Breathe out longer than you breathe in."*
* The erotic charge is in restraint and implication, never in description:
  *"We leave the wine on the ledge and disappear."*
* Georgian appears three times only — the mark `ნამი`, the loader, the hero's
  `ნამი — dew`. It is a signature, not a translation.
* House rule copy is plain and unembarrassed: *"Ask before you look, ask before you
  touch, and take the answer as given."*

---

## 14. The background film, and what does not go on it

Three versions of this film exist, and the reasoning matters more than any of
them.

The first came from a supplied clip that was explicit, chopped into stills and
reduced to 104 px before being enlarged again — the obscuring baked into the
pixels, because a CSS blur comes off in one devtools click. When the client
asked for a background that reads clearly, that film could not deliver it: at
104 px the detail is gone, and the clip was never in the repository.

The second was built from the house photographs — six rooms at full detail. It
is in the history at `a7dcb4d` and remains the fallback if there is ever no
usable footage.

The third is the current one: a sauna clip, with only the clean top third of its
frame on the page. That is the shape of the answer whenever footage is too much
for a public site — **crop to what belongs there**, rather than covering what
does not. A few drops or a blur over the rest is the same material with a sticker
on it; a band that never contained it is simply a different shot. Check the band
against every frame, then set `BAND` once.

If footage arrives that needs no cropping at all, raise `BAND` to 1.0 and the
whole pipeline works unchanged.
