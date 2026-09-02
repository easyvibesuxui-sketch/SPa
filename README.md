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
WebP quality 70, 818 KB for the set, drawn at full detail.

They come from a sauna clip, and only **the top third of its frame** is used —
wall, steam, a head in profile. Nothing below that line goes on the page. The
crop window is 16:9 inside that band and pans slowly across it over the 120
frames, so the shot drifts as the visitor scrolls while the steam moves on its
own. `tools/film.py` is the recipe:

```bash
ffmpeg -i clip.mp4 -t 20 -vf "fps=6" -frames:v 120 -q:v 2 raw/f-%03d.jpg
python3 tools/film.py raw
```

Everything is tuned in the constants at the top of the script: `COUNT`, output
size, `BAND` (the fraction of the source frame taken from the top), `PAN` (the
window centre, start → end) and the grade. The grade matters more here than it
did with the photographs: steam holds a great deal of light, so exposure runs at
**0.62** and the warm trim puts the walnut back — the page's type carries only a
text-shadow for ground, and a bright background takes it away.

Two things worth knowing about a clip before it goes in:

* **Check the band frame by frame.** `BAND` is a line someone looked at across
  every still, not a guess. Raising it is a decision, not a tweak.
* **Check the tail.** This clip tears — horizontal RGB streaks — after about
  twenty seconds, which is why the ffmpeg line stops at `-t 20`. Generated
  footage tends to come apart at the end.

The clip itself is **not in the repository**; the stills are the deliverable.
An earlier version of this film was built from the house photographs instead —
six rooms, a slow push through each — and is in the history at `a7dcb4d` if it
is ever wanted back.

Nothing plays. There is no `<video>` element anywhere in the page: the scroll
position picks the frame and nothing else does. Scroll stops, the image stops;
scroll back and it unwinds.

### The section grounds

The film runs behind everything, but a single continuous shot leaves the
sections without identity of their own. Each one therefore carries a
photograph of its own underneath its content — `.secbg`, the pattern
`.dark` already used: an absolutely positioned layer at `z-index:-2` inside a
section that is `position:relative; isolation:isolate`.

| Section | Ground |
|---|---|
| Intro | `sauna-lamp.jpg` |
| The House | `towel-figure.jpg` |
| Rituals (inside `.hs__sticky`) | `infrared-slats.jpg` |
| Water | `back-night.jpg` — the one cool ground, against the warm ones either side |
| Touch | `rain-face.jpg` |
| After Dark | `sauna-bench-dark.jpg`, its own `.dark__media` from before |
| Table | `bath-window.jpg` |
| Hours & Tickets | `pool-night.jpg` |

**The Road Up has none**, deliberately: the map is drawn on a canvas and needs
black under it.

Two things make them sit rather than shout. The image is dimmed —
`saturate(.6) brightness(.42) contrast(1.05)`, and .34 below 760 px — with a
vertical scrim and a soft radial over it. And the whole layer is feathered top
and bottom with `mask-image`, transparent for the first and last 15%, so the
film reads between sections instead of the page cutting from one photograph
to the next. Each ground also takes `data-parallax="0.08"`, so it drifts a
little against the content.

Keep a section's ground different from the photographs shown inside it, and
keep the type's contrast: the text carries only a `text-shadow` for ground.

### The surface

The room is seen through water, and the water answers the pointer. There is no
image in it at all — one height field, described in a shader and never stored:

* a slow ambient swell, two long shallow waves that never stop;
* a ring for every place the pointer has been, spreading outward at 300 px a
  second and dying over about three seconds. Fourteen are alive at once, in a
  ring buffer; a new one overwrites the oldest.

Two passes read that field. The lower one, `#waterCanvas`, samples the film
canvas and offsets the sample by the slope of the surface — refraction, so the
room bends where the water moves. The upper one, `#waterLight`, is fixed over
the whole page at `z-index:88` on a `mix-blend-mode:soft-light`, and draws only
the light the slope throws back, so the sections are under the same water as
the film rather than sitting on top of it. Both are the same shader; `LIGHT` is
`#define`d into one of them.

`#filmCanvas` stays in the document as the texture source and is hidden with
`visibility`, which keeps its backing store. It is only re-uploaded when the
film actually paints a new frame — which is to say, only while scrolling.

Pointer moves are throttled to one ring per 70 ms and 20 px, so a fast sweep
leaves a wake rather than a wall. `pointerdown` always makes one.

**Without WebGL, or under `prefers-reduced-motion`, none of it runs**: both
canvases are hidden and the film shows exactly as it did before.

This replaced a tile of drawn water beads on a pane of glass. At any real size
a bead read as a smudge rather than a drop, and eighteen of them tiling across
a photograph was a texture the page did not need.

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
