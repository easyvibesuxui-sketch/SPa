# NAMI — working rules

## Every change ships to the live link

**No change is finished until it is published.** After any edit to `index.html`,
`assets/**`, or the copy, do all three, in this order:

1. **Commit and push** to `claude/batumi-spa-redesign-szk3ev`.
2. **Rebuild and republish the preview** — run the scratchpad's
   `build_artifact.py` to regenerate the single-file build, then publish
   `nami.html` to the **same** artifact URL:
   `https://claude.ai/code/artifact/ec037096-8325-4c3d-b0c5-0d92fd93ba40`
   Never publish to a new artifact URL — the client holds this one. Passing the
   same file path republishes in place.
3. **Report it as live only after the republish returns that URL.**

Never leave a change only in the working tree.

### The two links

| Link | State |
|------|-------|
| `https://claude.ai/code/artifact/ec037096-8325-4c3d-b0c5-0d92fd93ba40` | **The live one.** Always current — republished on every change. Self-contained: photography and the 64 route frames are inlined, so it needs no network. Private until shared from the artifact's own share menu. |
| `https://easyvibesuxui-sketch.github.io/SPa/` | Waiting on the repository. `.github/workflows/pages.yml` republishes it on every push, but the job is never picked up by a runner — Actions is disabled for this repository, so the run fails in two seconds with no steps. It will start working, with no further changes, once **Settings → Actions → General → Allow all actions** is enabled and **Settings → Pages → Source** is set to **GitHub Actions**. |

The GitHub Pages build is the truer one when it runs — it loads the three
remaining Unsplash frames and Google Fonts from the network, which the inlined
preview stands in for.

## The site

Static, no build step and no dependencies — `index.html`, one stylesheet, one
script. Paths are relative, so it serves correctly from the `/SPa/` sub-path.
See `README.md` for the section map, the frame list, the motion inventory, and
the type rules (no ordinal markers, no shouted micro-labels).
