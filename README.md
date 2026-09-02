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

The whole page sits on one scroll-driven background: the supplied 25-second clip,
chopped into **120 stills** at 4.8 fps and frosted in the pixels themselves —
each frame is reduced to 104 px wide, blurred, enlarged again to 560 px and
blurred a second time, then warmed and lifted in contrast. The figure is backlit
in every frame, so what survives the reduction is a dark silhouette against the
steam: a body's shape, an arm, the light behind it, and nothing else. The set is
484 KB.

Do not sharpen it further. 104 px is where the footage reads as footage rather
than a gradient while the source stays unrecoverable; past it the reduction
stops doing its job.

The frames live in `assets/img/steam/`. **The source video is deliberately not in
the repository** — only the frosted stills, and they are not recoverable back to
the original. Do not replace this with a `<video>` under a CSS blur: a CSS filter
is removed in one devtools click, and the point of the treatment is that the
obscuring is baked in.

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
