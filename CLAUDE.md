# NAMI — working rules

## Every change ships to the live link

**No change is finished until it is published.** After any edit to `index.html`,
`assets/**`, or the copy, do all three, in this order:

1. **Commit and push** to `claude/batumi-spa-redesign-szk3ev`. That branch is the
   repository default and GitHub Pages serves it directly, so the push *is* the
   deploy — https://easyvibesuxui-sketch.github.io/SPa/ rebuilds within a minute.
2. **Rebuild and republish the preview** — run `python3 tools/build_artifact.py`,
   then publish the `nami.html` it writes to the **same** artifact URL:
   `https://claude.ai/code/artifact/ec037096-8325-4c3d-b0c5-0d92fd93ba40`
   Never publish to a new artifact URL — the client holds this one. Publishing
   the same file path republishes in place.
3. **Say it is live only after both have gone out.**

Never leave a change only in the working tree.

### The two links

| Link | What it is |
|------|-----------|
| `https://easyvibesuxui-sketch.github.io/SPa/` | The site. Served straight from this branch's root, so a push publishes it. Loads the three remaining Unsplash frames and Google Fonts from the network. |
| `https://claude.ai/code/artifact/ec037096-8325-4c3d-b0c5-0d92fd93ba40` | The preview, republished on every change. Self-contained — photography and the 64 route frames are inlined — so it needs no network, and three scenic frames stand in as drawn light studies. |

### Do not add a deploy workflow

This repository blocks marketplace actions: any workflow using `actions/checkout`,
`actions/configure-pages`, `actions/upload-pages-artifact` or `actions/deploy-pages`
ends in `startup_failure` in under a second, with no log and no steps. A runner is
reachable and `pages: write` / `id-token: write` are grantable — probes with plain
`run:` steps pass — so the block is the actions policy alone. Pages therefore
serves from the branch (Settings → Pages → Source: *Deploy from a branch*,
branch `claude/batumi-spa-redesign-szk3ev`, folder `/ (root)`), which needs no
workflow at all. `.nojekyll` at the root keeps the files served verbatim.

## The site

Static, no build step and no dependencies — `index.html`, one stylesheet, one
script. Paths are relative, so it serves correctly from the `/SPa/` sub-path.
See `README.md` for the section map, the frame list, the motion inventory, and
the type rules (no ordinal markers, no shouted micro-labels).
