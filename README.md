# NAMI — Bathhouse & Sea Garden, Batumi

A concept **redesign of [vabali spa](https://www.vabali.de/en/berlin/)**: the content structure is
kept (sauna world, pools, treatments, restaurant, day tickets, opening hours, vouchers, location),
everything else is new — brand, name, logo, city, art direction and motion.

* **Name / brand:** NAMI (ქართ. *ნამი* — "dew"), a textile-free bathhouse and sea garden
* **Location:** Batumi, Adjara, Georgia (Black Sea) — instead of Berlin
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
| 09 | Find Us — address, arrival | Location & contact |

Prices are in Georgian lari (₾), hours and rules are rewritten for a Batumi house.
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
| `sauna-lamp.jpg` | hero · The Silence Room |
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
