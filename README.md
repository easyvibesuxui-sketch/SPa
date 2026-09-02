# NAMI — Bathhouse & Mountain Garden, Goderdzi Pass

A concept **redesign of [vabali spa](https://www.vabali.de/en/berlin/)**: the content structure is
kept (sauna world, pools, treatments, restaurant, day tickets, opening hours, vouchers, location),
everything else is new — brand, name, logo, city, art direction and motion.

* **Name / brand:** NAMI (ქართ. *ნამი* — "dew"), a textile-free bathhouse and mountain garden
* **Location:** the Goderdzi Pass, 2,025 m, ninety-five kilometres above Batumi in Adjara, Georgia — instead of Berlin
* **Idea:** calm, intimacy and a quiet erotic charge — adults-only, candlelight, private hammam suites
* **UI direction:** taken from the three reference images — deep walnut/espresso ground, warm cove
  lighting, oversized editorial serif split across lines, hairline crosshair rules, thin dividers,
  small letterspaced sans labels, soft glow and film grain

Single page, no framework, no build step. Open `index.html` — that is the whole site.

---

## Structure

| # | Section | Source content it replaces |
|---|---------|---------------------------|
| — | Hero — *Steam / Salt / Skin* | vabali landing claim |
| 01 | Intro — "a house for slowness" | Welcome / about text |
| 02 | The House — materials, stats | The spa, facilities |
| 03 | Rituals — horizontal pinned scroll | Aufguss infusions, peelings, sauna programme |
| 04 | Water — layered parallax | Indoor pool, outdoor pool, plunge pools |
| 05 | Touch — treatment list with hover preview | Massages & beauty treatments |
| 06 | After Dark — 18+, private hammam, Nocturne nights | (new) the intimacy/erotic angle |
| 07 | Table — bathrobe dining | Restaurant / gastronomy |
| 08 | Hours & Tickets — 2h / 4h / day / after dark | Day tickets & opening hours |
| — | Voucher marquee | Gift vouchers |
| 09 | The road up — the drive drawn on a map as you scroll | Location & getting here |

Prices are in Georgian lari (₾), hours and rules are rewritten for a house on the pass.
**All business details are fictional** — address, phone, e-mail and prices are placeholders.

## House rules for the type

Two things are deliberately absent, and should stay absent:

* **No ordinal markers.** No `01 / 02 / 03` on sections, cards, rows, tickets or menu
  items, and no section counter in the corner. Nothing here is a numbered sequence, so a
  number would decorate rather than inform. Numbers appear only where the number *is* the
  content — temperatures, durations, prices, opening hours.
* **No shouted micro-labels.** Captions, card meta, durations and list labels are set in
  sentence case; letterspaced uppercase is reserved for the few places it acts as a stamp —
  navigation, buttons, and the two facts in the hero's top corners.

## Motion

Everything is hand-written vanilla JS in `assets/js/main.js` (~430 lines, no dependencies):

* **Lenis-style smooth scroll** — wheel/keyboard intercepted, lerped, real `window.scrollTo`
  (so `position: sticky` keeps working). Disabled on touch and for `prefers-reduced-motion`.
* **Parallax** — every `[data-parallax="0.14"]` element; images move inside their frame (frames
  are `overflow:hidden`, images 118–132% tall, so nothing ever exposes an edge)
* **Pinned horizontal scroll** for the Rituals section, with lerped catch-up
* **Clip-path cover reveals** on every image, blur/rise reveals on text, staggered
* **Word-by-word lighting** — lede paragraphs brighten word by word as they cross the viewport
* **Char-split hero title**, released by the preloader
* **Scroll-velocity marquees** — speed and direction respond to scrolling
* Scroll progress bar and a direction-aware header
* **Custom cursor** with contextual labels, and a cursor-following image preview on the
  treatments list
* Preloader with a real progress read, film grain, vignette, breathing glow

## Images

Fourteen frames use the supplied photography, kept in `assets/img/photos/` (re-encoded as
progressive JPEG, quality 82, EXIF stripped — 703 KB for the set):

| File | Where it appears |
|------|------------------|
| `sauna-lamp.jpg` | The Silence Room |
| `bath-window.jpg` | intro · treatment preview 05 |
| `sauna-cabin.jpg` | The House, left frame |
| `infrared-slats.jpg` | The House, right frame |
| `sauna-bench-dark.jpg` | Sea Aufguss · After Dark background · preview 03 |
| `rain-face.jpg` | Honey & Salt · preview 01 |
| `towel-figure.jpg` | Walnut Oil |
| `wet-glass.jpg` | The Ice Well |
| `pool-night.jpg` | Water, first frame · preview 04 |
| `shower-dark.jpg` | Water, second frame · After Dark diptych, right |
| `back-night.jpg` | After Dark diptych, left · preview 02 |

Four scenic frames — Sunset Deck, the third water frame, the table and Find Us — still point at
**Unsplash** and carry a `data-fallback` second URL; if both fail the frame degrades to a warm
gradient rather than a broken image. The menu overlay's set lives in `MENU_IMGS` in
`assets/js/main.js`.

## The room behind the glass

The whole page sits on one scroll-driven background: **120 stills**, 960 × 540,
WebP quality 68, 1.8 MB for the set. They are drawn at full photographic
detail — wood grain, the filament in the lamp, water, tile — because they are
built from the house photography itself rather than from footage.

`tools/film.py` is the recipe. Six rooms, twenty frames each, a slow push
through every one and a smoothstep dissolve into the next across the last third
of a segment:

| Frames | Room | What the visitor is scrolling past |
|---|---|---|
| 0 – 19 | `sauna-lamp.jpg` | the dark room and its one lamp — the hero |
| 20 – 39 | `sauna-bench-dark.jpg` | the lit doorway, the walnut |
| 40 – 59 | `infrared-slats.jpg` | heat: slats, cove light |
| 60 – 79 | `pool-night.jpg` | water, candles, steam |
| 80 – 99 | `shower-dark.jpg` | the darkest stretch — After Dark |
| 100 – 119 | `towel-figure.jpg` | a quiet close |

Everything is tuned in the four constants and the `ROOMS` table at the top of
the script: frame count, output size, dissolve length, quality, and per room a
start rect, an end rect and an exposure trim. The trim is what keeps the film
from flaring as it moves from a near-black room to a lit one — `infrared-slats`
runs at 0.62, `shower-dark` at 1.16. The global grade is the house one: warm
the reds, cool the blues, brightness 0.86 so the cream type keeps its ground,
contrast 1.06, then a light unsharp mask to put back what the resize softened.

Re-run it after any change to the photographs:

```bash
python3 tools/film.py
```

If you change `COUNT`, set `F.count` in `assets/js/main.js` to match.

A clip can take the place of the photographs — chop it into the same filenames
and nothing else changes:

```bash
ffmpeg -i clip.mp4 -vf "fps=6,scale=960:-2" -frames:v 120 assets/img/steam/s-%03d.png
```

Two things to keep. **No autoplay, in either direction** — the frames are
picked by scroll position and by nothing else; there is no `<video>` anywhere in
the page. And nothing brighter than the grade above: the text carries its own
ground with a shadow, and the moment the background flares, the ground stops
working.

### The pane

In front of the film sits the glass it is seen through: `assets/img/glass/drops.webp`,
a seamless 1024 px tile carrying **eighteen beads and nothing else** — four large,
four mid-sized, ten specks — scattered by a minimum-distance rule so the tile never
clusters and the repeat never announces itself. Each bead is drawn with a dark rim
above, a bright refracted rim below and a specular dot. It tiles at 1100 px, which
puts roughly **eight to ten drops on a laptop screen**: a pane someone has already
wiped, not a downpour.

No mist, and no sliding drips. At this density a tail reads as a stack of rings
rather than water, so there are none; adding beads back to make drips work would
undo the point.

The tile sits at 72% opacity on a 74-second drift, with a warm soft-light wash over
it on a slower counter-drift. The canvas beneath carries **no CSS blur at all** — the
beads are what puts the room behind glass, and they read sharper against a frame that
isn't softened twice — and now that the frames themselves are sharp, that is the
whole of the effect: a clear room, seen through beaded glass.

The pane and the film are both tuned by eye; the pane is the faster of the two,
since it costs no re-render.

The hero has no image of its own: the room is what the visitor opens on, and the
first frames of the film play as they leave it.

The canvas also drifts as the page scrolls — a slow zoom out from 1.14 with a
little pan — so the background reads as moving footage rather than a still wash.

A fixed canvas draws one frame per scroll position across the entire document —
nothing plays on its own — under a condensation layer (droplets and streaks that
drift over 44 s) and a scrim that keeps text legible. Sections that used to be
opaque are now translucent so the room shows through; the hero, After Dark and
the road up keep their own imagery on top. Under `prefers-reduced-motion` a
single mid-clip frame is drawn and never changes.

## The road up

The location section runs on the supplied route clip (8 s, 1280×720), chopped into
**64 stills** at 8 fps and scaled to 1100 px wide — `assets/img/route/r-000.webp` …
`r-063.webp`, WebP quality 62, 1.3 MB for the whole set.

Nothing plays. A canvas fills the sticky frame and the scroll position picks the
frame: the section is 340 vh tall, and progress through it maps to frame index, so
the road draws forward when the visitor scrolls down and unwinds when they scroll
back. The distance readout counts to 95 km on the same progress, and the three legs
(Batumi · Khulo · Goderdzi) light as the line reaches them. Frames load only when the
section is within 1.5 viewports, at half resolution in frame count below 760 px wide.
Under `prefers-reduced-motion` a single frame — the finished route — is drawn once.

To re-chop a new clip: extract with `fps=8,scale=1100:-2`, save as WebP q62 into
`assets/img/route/`, and set `R.count` in `assets/js/main.js` to the number of files.

## Video

`assets/video/hero.mp4` plays full-bleed behind the hero and `assets/video/dark.mp4` behind
*After Dark*; both are picked up automatically when the file is there, fade in over the
photograph, and are skipped entirely under `prefers-reduced-motion`. See
`assets/video/README.md` for the encoding notes.

## Accessibility

Semantic landmarks, skip link, focus-visible rings, `aria-expanded`/`aria-hidden` on the menu,
Escape closes it, and a full `prefers-reduced-motion` path that disables the smooth scroll,
parallax, preloader and grain while showing all content.

## Run

```bash
npx http-server -p 8099 .   # or any static server
```

Files:

```
index.html
assets/css/style.css    design system + sections
assets/js/main.js       scroll engine
assets/img/logo.svg     wordmark + dew mark
assets/img/favicon.svg
```
