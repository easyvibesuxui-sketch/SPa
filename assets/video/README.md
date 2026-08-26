# Video slots

Two frames can take a video instead of their photograph. Put the file here and
name it in `VIDEOS` at the top of `assets/js/main.js`:

```js
var VIDEOS = {
  hero: 'assets/video/hero.mp4',
  dark: 'assets/video/dark.mp4'
};
```

| Key | Where it plays |
|-----|----------------|
| `hero` | full-bleed behind the hero (STEAM / SALT / SKIN) |
| `dark` | full-bleed behind **After Dark**, mounted only when that section is near |

Both are muted, looped, `playsinline`, and fade in over the photograph once the
first frame has decoded. Leave a key empty and nothing is requested at all. Neither
is loaded when the visitor asks for reduced motion.

Encode wide and short: H.264 MP4, ~1920×1080, 6–12 s loop, no audio track, CRF ~24 —
a couple of megabytes, not twenty.

**The road up** does not use this. That clip is chopped into stills in
`assets/img/route/` and drawn on a canvas by scroll position — see the README at the
repository root.
