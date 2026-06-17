# Aero Twitter Glass Lab

Workspace for experimenting with Aero-style liquid glass on a Twitter-like panel layout. The repo contains the main React app, reference demos, and a public **Experiment Five showcase** that compares six model branches side by side.

## Live sites

| Site | URL | What it is |
|------|-----|------------|
| Main app | [aero-twitter-glass-lab.vercel.app](https://aero-twitter-glass-lab.vercel.app) | Interactive glass lab (Vite + React) |
| Experiment Five showcase | [aero-experiment-five-showcase.vercel.app](https://aero-experiment-five-showcase.vercel.app) | Static comparison viewer for six branches |

## Main app

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
```

Root [`vercel.json`](vercel.json) deploys the main app from `dist/`.

## Experiment Five showcase

A self-contained static site under [`showcase/`](showcase/) that renders the Experiment Five glass panel from **six branches** at the same background and geometry so treatments can be compared against the reference image.

- **Source:** [`showcase/src/`](showcase/src/) (`index.html`, `app.js`, `common.js`, CSS)
- **Built output:** [`showcase/dist/`](showcase/dist/) (committed; served as-is on Vercel)
- **Docs:** [`showcase/README.md`](showcase/README.md)

```bash
# Preview locally
python -m http.server 5199 --directory showcase/dist
# or: npx serve showcase/dist

# Rebuild panels (requires local branch worktrees — see showcase/README.md)
node showcase/build-showcase.mjs
```

[`showcase/vercel.json`](showcase/vercel.json) deploys the prebuilt `showcase/dist` folder as a separate Vercel project.

## Other directories

- `public/reference-demos/` — curated reference implementations
- `public/raw-reference-lab/` — browsable archive of raw reference demos
- `_reference_vault/` — local reference library (not deployed)
