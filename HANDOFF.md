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
assets/img/steam/        120 WebP frames of the background film, 1.8 MB
assets/img/glass/        drops.webp — the wet-pane tile, 12 KB
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

120 WebP stills, 960 × 540, q68, 1.8 MB for the set, painted on a
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
python3 tools/film.py
```

There is no source clip. The film is built from the house photography itself: six
rooms, twenty frames each, a slow push through every one and a smoothstep dissolve
into the next across the last third of a segment. In scroll order —
`sauna-lamp` (the dark room and its lamp), `sauna-bench-dark` (the lit doorway),
`infrared-slats` (heat), `pool-night` (water), `shower-dark` (the darkest stretch,
under After Dark) and `towel-figure` (a quiet close).

Everything lives in the four constants and the `ROOMS` table at the top of the
script: count, output size, dissolve length, quality, and per room a start rect, an
end rect and an exposure trim. The trim is what keeps the film from flaring as it
moves from a near-black room to a lit one — `infrared-slats` runs at 0.62,
`shower-dark` at 1.16. The global grade is the house one: warm the reds, cool the
blues, brightness 0.86 so the cream type keeps its ground, contrast 1.06, then a
light unsharp mask to put back what the resize softened. Change `COUNT` and set
`F.count` in `main.js` to match.

The source photographs are 736 px wide on the whole (`sauna-lamp` is 1200), so the
crops sit close to full width and the push-in is shallow — that is the ceiling on
how far a room can be zoomed before the resize shows. Nothing is blurred anywhere in
this pipeline.

A clip can take the place of the photographs without touching anything else — chop
it into the same filenames:

```bash
ffmpeg -i clip.mp4 -vf "fps=6,scale=960:-2" -frames:v 120 assets/img/steam/s-%03d.png
```

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

## 8. The pane — `assets/img/glass/drops.webp`

In front of the film sits the glass it is seen through: a seamless **1024 px tile with
eighteen beads and nothing else** — four large, four mid, ten specks — placed by a
minimum-distance rule so the tile never clusters and the repeat never announces
itself. Each bead is drawn with a dark rim above, a bright refracted rim below and a
specular dot.

```css
.film__glass{position:absolute;inset:-6%;
  background-image:url(../img/glass/drops.webp);
  background-size:1100px 1100px;background-repeat:repeat;
  opacity:.72;animation:drift 74s linear infinite}
.film__glass::after{ /* four soft warm radials, mix-blend-mode:soft-light */
  animation:drift 112s linear infinite reverse}
```

Tiling at 1100 px puts roughly **eight to ten drops on a laptop screen** — a pane
someone has already wiped, not a downpour.

No mist and no sliding drips: at this density a tail reads as a stack of rings rather
than water. **No CSS blur on the canvas beneath** — the beads are what put the room
behind glass; softening the frame as well only cost definition.

The generator is short and worth keeping if you want to retune density — beads are
drawn at 2× and downsampled, with wraparound draws at ±W/±H for seamlessness.

---

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

A second, self-contained build exists for previewing without any network: CSS, JS, all
11 photos, 64 route frames, 120 steam frames and the droplet tile are inlined as data
URIs, and the remaining Unsplash frames are replaced with drawn SVG light studies.
Output is one ~4.6 MB HTML file. Worth keeping the idea if you need to hand someone a
single file.

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

## 14. The background film, and why it is built the way it is

Earlier the film came from a supplied clip, chopped into stills and reduced to
104 px before being enlarged again — the obscuring baked into the pixels, because
the clip was explicit and a CSS blur comes off in one devtools click. The client
asked for a background that reads clearly, and a frame carrying 104 px of detail
cannot be sharpened: the information is gone, and the clip is not in the
repository.

So the film is now built from the house photography instead — real rooms, at full
photographic detail, graded and dissolved into one continuous move down the page.
It is sharp because there is nothing in it that needs hiding, and it costs the
project nothing: the same eleven photographs the page already ships.

If footage does arrive later, the ffmpeg line in §7a drops it straight into the
same filenames and the whole scroll-scrub background works unchanged. Anything
that would need obscuring to be publishable does not belong on the page at all;
pick a clip that doesn't.
