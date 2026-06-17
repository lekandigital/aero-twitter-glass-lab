# Experiment Five — Six-Branch Showcase

A self-contained static site that renders the Experiment-Five glass panel from **six
branches** side by side, all against the **same background** at the **same fixed panel
geometry/position**, so the glass treatments can be compared directly against the reference.

`dist/index.html` is a single app with two modes:
- **Focus** — one branch, big and centred; switch via the left rail; optional **Reference**
  beside it; **Free move** (native drag → live-correct lighting); **Zoom**; **Screenshot**.
- **Grid** — every branch (+ the Reference target) as a tidy tile overview; click a tile to
  open it in Focus; **Screenshot**.

`archive/<slug>/` holds each branch's exact CSS, style-computing JS, compiled CSS bundle, and a
`meta.json` recipe (commit + applied geometry).

Each panel is a real build in a same-origin iframe, positioned **natively** at the snap point
(seeded at build time) so the edge-reflex lighting samples the wallpaper correctly; after a
panel settles/becomes visible we dispatch a `resize` so it re-samples (see `refreshReflex`).
Backgrounds live inside each iframe (backdrop-filter only samples its own document). Panels live
in fixed `.card`s that are only ever transformed, never reparented (that would reload them).

## How it works

Each branch is built **as-is** from its git worktree into `dist/panels/<slug>/` with a
relative asset base. The harness ([src/harness.js](src/harness.js)) loads each build in a
**same-origin iframe**, seeds the session to boot **Experiment Five**, navigates to the
Experiment-Set-1 route client-side, then injects [src/normalize.css](src/normalize.css) to
strip the app chrome and pin the geometry. Nothing in the six branches is modified.

### Fixed geometry (measured against `.aero-wallpaper__image`, 1440×1572, object-fit: contain)

| Panel | x | y | w | h | radius |
|-------|------|--------|-----|-----|--------|
| A `.experiment-four-layer-a` | 24.61 | 327.55 | 316 | 760 | 30 |
| B `.experiment-four-layer-b` | 30.61 | 333.55 | 304 | 748 | 24 |

Panel B is a centered 6px bezel inset of A, so sizing B + centering reproduces it exactly.

## Rebuild

The branch worktrees live under `/private/tmp/aero-branch-compare` and are **not** available
on Vercel, so the site is built locally and the output is committed:

```bash
node showcase/build-showcase.mjs   # builds all six + archive into showcase/dist
npx serve showcase/dist            # preview locally
git add showcase && git commit     # commit the refreshed static output
```

## Deploying to Vercel

`showcase/dist` is a prebuilt static folder. The repo root `vercel.json` currently deploys
the **main app** (`npm run build` → `dist`). To deploy this showcase instead, point Vercel's
**Output Directory** at `showcase/dist` with no build step — e.g.:

```json
{ "framework": null, "buildCommand": "echo prebuilt", "outputDirectory": "showcase/dist" }
```

(Left as a note rather than applied, so the existing app deployment isn't changed silently.)
