# Raw Reference Lab

Standalone static catalog for exploring original local HTML/CSS/JS glass and liquid-glass demos. Each demo opens as a **separate local page** — nothing is ported into the main React app.

## What this is

- A local reference browser at `/raw-reference-lab/`
- Exported CodePen demos, GitHub static HTML, and web archives served from `public/raw-reference-lab/demos/`
- Health audit metadata in `demo-health.json`
- Optional package runners (e.g. liquidGL) isolated under `.raw-reference-runners/`

## What this is not

- Not a React port of the demos
- Not a rewrite of original demo CSS or JS
- Not a mirror of all external CDN assets

## Local vs remote classification

**Has local files** means a local copied archive, source path, wrapper, demo URL, runner metadata, or runner folder exists. It does **not** mean the demo runs locally.

**Runs locally** means the demo can be opened from localhost and is expected to run primarily from local files, or an active local dev server is running (e.g. `http://localhost:5310`).

**Local static demo** — self-contained local demo pages that do not depend on the original remote site runtime.

**Local dev server** — active runner URL on localhost from `.raw-reference-runners/`.

**Partial archive** — a local web capture exists (JSFiddle editor shell, FreeFrontend listing page, incomplete Nuxt/SPA bundle) but is not a reliable standalone runnable demo.

**Needs internet** — the local page depends on remote JS, CSS, fonts, images, analytics, ads, or CDN scripts.

**Remote-dependent** — a local HTML file exists but runtime depends on remote assets or the original remote website.

## Correct demo targets

Every card must open the **exact** `localDemoUrl`, `generatedRunnableUrl`, or
`localDevUrl` stored on that card's own item.

- The open button is an anchor whose `href` is baked from `item.localDemoUrl`
  (or `localDevUrl`) at render time. The card-body click fallback reads
  `article[data-demo-url]`, also set from the item's own `localDemoUrl`. Copy
  buttons resolve via `data-id` → exact id lookup.
- Do **not** use the card title or array index as the source of truth for which
  URL to open. Sorting and filtering must never change which URL a card opens.
- Duplicate titles are allowed (e.g. two "glass refraction" entries — one
  external GitHub page, one local tuannm93 static demo). Stable unique `id`s and
  exact per-item URLs are required; duplicate titles must never drive behavior.
- Duplicate `localDemoUrl`s are allowed only when intentional (two catalog
  entries for the same web archive) and are reported by the link audit.

These guarantees are enforced by:

```bash
node scripts/audit-raw-reference-links.mjs   # writes repair-reports/link-target-audit.json
node scripts/verify-raw-reference-click-targets.mjs
node scripts/check-raw-reference-lab.mjs     # known title -> exact file mappings
```

The check script asserts known mappings, e.g. `liquid effect` →
`/raw-reference-lab/demos/github-static/tuannm93-liquid-effect/index.html`, and
that it never resolves to `tuannm93-glass-refraction/index.html`.

## Making more demos run locally

- Original demos are **preserved** and never rewritten.
- Generated runnable copies live under
  `public/raw-reference-lab/generated-runnable/`.
- Vendor/cached public assets live under `public/raw-reference-lab/vendor/`.
- Partial archives (JSFiddle editor shells, FreeFrontend listings, incomplete
  Nuxt/SPA bundles) are **not** mislabeled as local demos.
- A demo only gets `Runs locally` when it is verified local-only (no required
  remote assets, no fatal JS errors) or served by an active localhost runner.
  Without a headless browser (Playwright) available, promotion relies on
  `scripts/verify-runnable-demos.mjs` static local-only checks; browser
  verification is reported as skipped rather than assumed.

Candidate triage lives in
`repair-reports/local-runnable-candidate-inventory.json`.

## Rules for future repair

When fixing demos:

1. **Fix generated wrappers** — `entry.html`, `entry.generated.css`, path diagnostics
2. **Never edit original copied files** under `demos/**/src/`
3. **Never port into React** unless intentionally starting a separate implementation branch
4. **Never modify** `_reference_vault/` from this lab workflow

Generated wrappers may load `./src/script.js` with `type="module"` when needed, resolve asset paths, or compile SCSS into `entry.generated.css`. Original `src/` files stay unchanged.

## Useful commands

```bash
# One-shot dev workflow: build, audit, start main app + all runners, print summary
npm run raw-reference-lab:dev:all
# or: node scripts/dev-raw-reference-lab.mjs

# Discover runnable GitHub package runners
node scripts/discover-reference-runners.mjs

# Install dependencies for package runners (isolated under .raw-reference-runners/)
npm run raw-reference-lab:install-runners
# or: node scripts/install-reference-runners.mjs

# Audit package runner install/build/serve classification
node scripts/audit-package-runners.mjs

# Start a specific runner (isolated copy, not the app)
node scripts/start-reference-runners.mjs --id liquidGL

# Start all runnable runners
node scripts/start-reference-runners.mjs --all

# Stop one runner or all runners
node scripts/stop-reference-runners.mjs --id liquid-dom
node scripts/stop-reference-runners.mjs --all

# Check runner status (HTTP response + PID)
node scripts/status-reference-runners.mjs
# or: npm run raw-reference-lab:status

# Regenerate catalog and demo copies
node scripts/build-raw-reference-lab.mjs

# Run static health audit (writes classification fields)
node scripts/audit-raw-reference-demos.mjs

# Stabilization check (health, classification, wrappers, safety)
node scripts/check-raw-reference-lab.mjs

# App build (must still pass)
npm run build

# Dev server — open http://localhost:5173/raw-reference-lab/
npm run dev
```

Runner status is based on **HTTP response on the expected port**, not PID alone. A stale PID with a dead port is reported as `process-alive-port-dead`. The dev-all report is written to `repair-reports/runner-dev-all-report.json`.

## Health statuses

| Status | Meaning |
|--------|---------|
| **working** | Local page exists; no obvious local blocking issue (does not imply fully offline) |
| **warning** | Likely renders but missing decorative external fonts/images |
| **needs-preprocessor** | Source needs preprocessing (SCSS, Pug, TS, etc.) before full fidelity |
| **needs-external-assets** | Depends on remote JS or incomplete archive bundles |
| **needs-runner** | Runnable package runner exists but is not started |
| **source-only** | Vault copy exists; no local demo page |
| **external-only** | URL reference only; no local copy |
| **broken** | Fatal local issue likely prevents execution (should be 0 after repair passes) |

## Key files

| File | Purpose |
|------|---------|
| `raw-reference-index.json` | Catalog entries |
| `demo-health.json` | Audit results and classification fields |
| `reference-runners.json` | Runner metadata |
| `demos/codepen/*/entry.html` | Generated launchers (not original demos) |
| `demos/codepen/*/entry.generated.css` | Generated SCSS output when compiled |

## Verification

After changes, run:

```bash
node scripts/audit-raw-reference-demos.mjs
node scripts/check-raw-reference-lab.mjs
npm run build
```

Confirm:

- `broken: 0`
- partial archives are not marked `runsLocally`
- `git diff -- src` is empty
- `git diff -- src/styles` is empty
- `git diff -- 'public/raw-reference-lab/demos/**/src/**'` shows no original source edits
