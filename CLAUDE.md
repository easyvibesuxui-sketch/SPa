# NAMI — working rules

## Every change ships

**No change is finished until it is on the live link.** After any edit to
`index.html`, `assets/**`, or the copy:

1. Commit and `git push -u origin claude/batumi-spa-redesign-szk3ev`.
   The Pages workflow (`.github/workflows/pages.yml`) runs on every push to this
   branch and republishes **https://easyvibesuxui-sketch.github.io/SPa/**.
2. Rebuild the single-file preview and republish it to the same artifact URL:
   `python3 <scratchpad>/build_artifact.py` → publish `nami.html`
   (artifact `ec037096-8325-4c3d-b0c5-0d92fd93ba40` — always the same URL).
3. Check the workflow run finished green before reporting the change as live.

Never leave a change only in the working tree, and never publish a new artifact
URL — republish the existing one so the link the client holds keeps working.

## Repository settings this depends on

* **Actions must be enabled** for the repository (Settings → Actions → General →
  *Allow all actions and reusable workflows*). Without it the deploy job is never
  picked up by a runner and nothing publishes.
* **Pages source: GitHub Actions** (Settings → Pages → Source). The workflow
  enables Pages itself on its first successful run.

## The site

Static, no build step and no dependencies — `index.html`, one stylesheet, one
script. Paths are relative so the site serves from the `/SPa/` sub-path.
See `README.md` for the section map, the frame list, the motion inventory and
the type rules (no ordinal markers, no shouted micro-labels).
