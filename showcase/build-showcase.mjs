#!/usr/bin/env node
/*
 * Builds the Experiment-Five six-branch showcase into showcase/dist (a static site)
 * and assembles a per-branch CSS/JS/settings archive into showcase/archive.
 *
 * Each branch is built from its existing git worktree under WORKTREES with a relative
 * asset base so it can be served from panels/<slug>/. The harness then drives each
 * iframe into Experiment Five and pins the panel geometry (see harness.js / normalize.css).
 *
 * Run locally (the worktrees are not available on Vercel):
 *   node showcase/build-showcase.mjs
 */

import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const SRC = join(__dirname, 'src');
const DIST = join(__dirname, 'dist');
const ARCHIVE = join(__dirname, 'archive');
const WORKTREES = '/private/tmp/aero-branch-compare';

// Ordered to match the provided table (ascending latest-save id). `save` is the exact
// Experiment-Five save each branch should open (a committed built-in save in that branch).
const BRANCHES = [
  { slug: 'opus-4.8-high', label: 'Opus 4.8 High', branch: 'claude-opus-4.8-high-experiment-five-attempt', save: 22 },
  { slug: 'opus-4.8-max-mistake', label: 'Opus 4.8 Max (mistake)', branch: 'claude-opus-4.8-max-experiment-five-attempt-mistake', save: 29 },
  { slug: 'opus-4.8-max', label: 'Opus 4.8 Max', branch: 'claude-opus-4.8-max-experiment-five-attempt', save: 32 },
  { slug: 'chatgpt-5.5', label: 'ChatGPT 5.5 veryhigh', branch: 'chatgpt-5.5-veryhigh-experiment-five-attempt', save: 45 },
  { slug: 'mix-opus-composer', label: 'Mix · Opus 4.8 + Composer 2.5', branch: 'mix-claude-opus-4.8-max-composer-2.5-experiment-five-attempt', save: 55 },
  { slug: 'opus-4.8-max-two', label: 'Opus 4.8 Max (two)', branch: 'claude-opus-4.8-max-experiment-five-attempt-two', save: 66 },
  { slug: 'composer-2-max', label: 'Composer 2 Max', branch: 'composer-2-max-experiment-five-attempt-two', save: 76 },
];

// Source files copied verbatim into each branch's archive (exact CSS + style-JS).
const ARCHIVE_JS = [
  'src/components/experiment-set-four/materialSettings.tsx',
  'src/components/experiment-set-five/primitives.tsx',
  'src/components/experiment-set-five/borderCornerRefinements.ts',
  'src/components/experiment-set-two/primitives.tsx',
  'src/components/shared/GlassFrostSurface.tsx',
  'src/components/shared/PwzzovOGlassCorners.tsx',
  'src/components/shared/edgeReflexBackdrop.ts',
  'src/components/experiment-set-one/combinedSettings.tsx',
  'src/components/experiment-set-one/sessionState.ts',
  'src/components/experiment-set-one/savedConfigs.ts',
];

const GEOMETRY = {
  background: { selector: '.aero-wallpaper__image', width: 1440, height: 1572, objectFit: 'contain' },
  panelA: { selector: '.experiment-four-layer-a', x: 24.61, y: 327.55, width: 316, height: 760, radius: 30 },
  panelB: { selector: '.experiment-four-layer-b', x: 30.61, y: 333.55, width: 304, height: 748, radius: 24 },
};

const sh = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString();

function gitSha(worktree) {
  try { return sh('git', ['rev-parse', '--short', 'HEAD'], worktree).trim(); }
  catch { return 'unknown'; }
}

// Heavy public/ extras each build copies but the panel never needs (the wallpaper is
// loaded from the site-root /aero-bg.png, not these per-build copies).
const PRUNE = ['raw-reference-lab', 'reference-demos', 'reference.png', 'aero-bg.png'];

/*
 * Inject a per-iframe localStorage SHIM into the built index.html so this branch boots
 * directly into Experiment Five with its specific save selected. The shim is in-memory
 * and per-iframe, so same-origin iframes don't share/clobber each other's session, and
 * the app's own resolveInitialE5() loads the committed built-in save. The branch SOURCE
 * is untouched — only this build artifact carries the seed.
 */
function injectSaveSeed(outDir, b) {
  const file = join(outDir, 'index.html');
  const html = readFileSync(file, 'utf8');
  // e1/e2/e3 stubs are required only so loadExperimentSetOneSession() accepts the session
  // (it bails when any are missing). Experiment Five never reads them, so {} is safe; the
  // real driver is selectedSaveIdByExperiment.five, which resolveInitialE5() loads.
  const session = JSON.stringify({
    e1: {}, e2: {}, e3: {},
    activeExperiment: 'five',
    selectedSaveIdByExperiment: { five: b.save },
  });
  // Pre-set the one-time "download all e5 configs" flag so that dev-only auto-export
  // effect short-circuits instead of downloading files on every iframe load.
  const seed = `<script>(function(){var store={};store['experiment-set-1-session']=${JSON.stringify(session)};` +
    `store['exp-set-1:e5-download-all-v1']='1';` +
    `var shim={getItem:function(k){return Object.prototype.hasOwnProperty.call(store,k)?store[k]:null;},` +
    `setItem:function(k,v){store[k]=String(v);},removeItem:function(k){delete store[k];},` +
    `clear:function(){store={};},key:function(i){return Object.keys(store)[i]||null;},` +
    `get length(){return Object.keys(store).length;}};` +
    `try{Object.defineProperty(window,'localStorage',{configurable:true,get:function(){return shim;}});}catch(e){}})();</script>`;
  writeFileSync(file, html.replace('<head>', `<head>${seed}`));
}

function buildBranch(b) {
  const worktree = join(WORKTREES, b.branch);
  if (!existsSync(worktree)) throw new Error(`worktree missing: ${worktree}`);
  const vite = join(worktree, 'node_modules', '.bin', 'vite');
  const outDir = join(DIST, 'panels', b.slug);
  process.stdout.write(`  building ${b.slug.padEnd(22)} (${b.branch}) save ${b.save} ... `);
  sh(vite, ['build', '--base=./', `--outDir=${outDir}`, '--emptyOutDir'], worktree);
  for (const p of PRUNE) rmSync(join(outDir, p), { recursive: true, force: true });
  injectSaveSeed(outDir, b);
  process.stdout.write(`ok\n`);
  return { worktree, outDir };
}

function archiveBranch(b, worktree, outDir) {
  const dir = join(ARCHIVE, b.slug);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'styles'), { recursive: true });
  mkdirSync(join(dir, 'js'), { recursive: true });
  mkdirSync(join(dir, 'compiled'), { recursive: true });

  // Exact source CSS (whole styles dir) + the style-computing / structural JS modules.
  cpSync(join(worktree, 'src', 'styles'), join(dir, 'styles'), { recursive: true });
  for (const rel of ARCHIVE_JS) {
    const from = join(worktree, rel);
    if (existsSync(from)) cpSync(from, join(dir, 'js', rel.split('/').pop()));
  }
  // The fully compiled CSS bundle actually shipped for this branch.
  const assets = join(outDir, 'assets');
  if (existsSync(assets)) {
    for (const f of readdirSync(assets)) {
      if (f.endsWith('.css')) cpSync(join(assets, f), join(dir, 'compiled', f));
    }
  }
  writeFileSync(
    join(dir, 'meta.json'),
    JSON.stringify({ slug: b.slug, label: b.label, branch: b.branch, save: b.save, commit: gitSha(worktree), geometry: GEOMETRY }, null, 2),
  );
}

function copyHarness() {
  mkdirSync(DIST, { recursive: true });
  for (const f of readdirSync(SRC)) cpSync(join(SRC, f), join(DIST, f));
  // Shared background at the site root (branch builds hardcode an absolute /aero-bg.png).
  cpSync(join(REPO, 'public', 'aero-bg.png'), join(DIST, 'aero-bg.png'));
  writeFileSync(join(DIST, 'branches.json'), JSON.stringify(BRANCHES.map(({ slug, label, save }) => ({ slug, label, save })), null, 2));
}

function main() {
  console.log('Experiment-Five showcase build');
  rmSync(DIST, { recursive: true, force: true });
  copyHarness();
  for (const b of BRANCHES) {
    const { worktree, outDir } = buildBranch(b);
    archiveBranch(b, worktree, outDir);
  }
  const total = readdirSync(join(DIST, 'panels')).length;
  console.log(`\nDone. ${total} panel builds -> ${DIST}`);
  console.log(`Archive -> ${ARCHIVE}`);
  console.log('Preview: npx serve showcase/dist   (or any static server at the dist root)');
}

main();
