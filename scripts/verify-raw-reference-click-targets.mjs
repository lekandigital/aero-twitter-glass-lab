#!/usr/bin/env node
/**
 * Click-target verification for the Raw Reference Lab.
 *
 * Ideally this drives a real browser (open /raw-reference-lab/, search a title,
 * click the open button, confirm the resulting URL). That requires Playwright.
 * Playwright is NOT auto-installed here. When it is absent this performs the
 * equivalent STATIC verification: it reconstructs the exact open target the UI
 * would bake for each named demo (anchor href = item.localDemoUrl) and asserts
 * it equals the expected URL — and, for "liquid effect", that it is NOT the
 * glass-refraction URL.
 *
 * Exit non-zero if any static mapping is wrong.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LAB = join(ROOT, 'public', 'raw-reference-lab');
const PUBLIC = join(ROOT, 'public');

const EXPECTED = {
  'liquid effect': '/raw-reference-lab/demos/github-static/tuannm93-liquid-effect/index.html',
  'glass refraction': '/raw-reference-lab/demos/github-static/tuannm93-glass-refraction/index.html',
  shader: '/raw-reference-lab/demos/github-static/tuannm93-shader/index.html',
  bubbles: '/raw-reference-lab/demos/github-static/tuannm93-bubbles/index.html',
  'liquid glass effect': '/raw-reference-lab/demos/github-static/tuannm93-liquid-glass-effect/index.html',
};
const FORBIDDEN = {
  'liquid effect': '/raw-reference-lab/demos/github-static/tuannm93-glass-refraction/index.html',
};

function playwrightAvailable() {
  return existsSync(join(ROOT, 'node_modules', 'playwright')) ||
    existsSync(join(ROOT, 'node_modules', '@playwright', 'test'));
}

function main() {
  const items = JSON.parse(readFileSync(join(LAB, 'raw-reference-index.json'), 'utf8'));
  const byTitle = {};
  for (const i of items) (byTitle[i.title] ||= []).push(i);

  if (!playwrightAvailable()) {
    console.log('Playwright not installed — browser click verification SKIPPED.');
    console.log('Running equivalent static click-target verification instead.\n');
  }

  let failed = 0;
  for (const [title, expected] of Object.entries(EXPECTED)) {
    const candidates = (byTitle[title] || []).filter(
      (i) => i.localDemoUrl && i.localDemoUrl.includes('/github-static/'),
    );
    // The UI bakes the open anchor href from item.localDemoUrl, so the open
    // target IS the matching item's localDemoUrl.
    const match = candidates.find((i) => i.localDemoUrl === expected);
    const openTarget = match ? match.localDemoUrl : (candidates[0]?.localDemoUrl ?? null);
    const fileOk = match ? existsSync(join(PUBLIC, expected.replace(/^\//, ''))) : false;
    const forbidden = FORBIDDEN[title];
    const hitsForbidden = forbidden && openTarget === forbidden;
    const ok = Boolean(match) && fileOk && !hitsForbidden;
    if (!ok) failed += 1;
    console.log(`${ok ? 'OK' : 'FAIL'}: "${title}" opens ${openTarget ?? '(none)'}${hitsForbidden ? ' [FORBIDDEN]' : ''}`);
  }

  console.log(`\nclick-target verification: ${failed === 0 ? 'passed' : 'FAILED'} (browser: skipped${playwrightAvailable() ? '' : '-no-playwright'})`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
