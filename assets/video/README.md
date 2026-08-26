# Video slots

Drop files here and the page picks them up automatically — no code change:

| File | Where it plays |
|------|----------------|
| `hero.mp4` | full-bleed behind the hero (STEAM / SALT / SKIN) |
| `dark.mp4` | full-bleed behind **After Dark**, mounted only when that section is near |

Both are muted, looped, `playsinline`, and fade in over the photograph once the
first frame has decoded. If a file is missing or fails to decode, the photograph
stays and nothing else changes. Neither is loaded when the visitor asks for
reduced motion.

Encode wide and short: H.264 MP4, ~1920×1080, 6–12 s loop, no audio track,
CRF ~24 — aim for a couple of megabytes, not twenty.
