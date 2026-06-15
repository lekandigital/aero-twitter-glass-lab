#!/usr/bin/env node
/**
 * Stabilization check for Raw Reference Lab.
 * Verifies catalog, health audit, wrappers, safety, and runner metadata.
 */
import { access, readFile, readdir, stat } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LAB = join(ROOT, 'public', 'raw-reference-lab');
const RUNNERS_DIR = join(ROOT, '.raw-reference-runners');

const REQUIRED_FILES = [
  'public/raw-reference-lab/index.html',
  'public/raw-reference-lab/raw-reference-lab.js',
  'public/raw-reference-lab/raw-reference-lab.css',
  'public/raw-reference-lab/raw-reference-index.json',
  'public/raw-reference-lab/demo-health.json',
  'public/raw-reference-lab/reference-runners.json',
  'scripts/build-raw-reference-lab.mjs',
  'scripts/audit-raw-reference-demos.mjs',
  'scripts/discover-reference-runners.mjs',
];

const IMPORTANT_WRAPPERS = [
  'public/raw-reference-lab/demos/codepen/glass-button-css-only/entry.html',
  'public/raw-reference-lab/demos/codepen/svg-liquid-glass/entry.html',
  'public/raw-reference-lab/demos/codepen/apple-liquid-glass/entry.html',
  'public/raw-reference-lab/demos/codepen/liquid-glass-form-beautiful-backgrounds-js/entry.html',
  'public/raw-reference-lab/demos/codepen/liquid-glass-svg-filter-configurator-chrome-firefox-safari/entry.html',
  'public/raw-reference-lab/demos/codepen/glass-theme-page-and-menu/entry.html',
  'public/raw-reference-lab/demos/codepen/liquid-glass-navbar-switcher/entry.html',
];

const IMPORTANT_SCSS_OUTPUT = [
  'public/raw-reference-lab/demos/codepen/liquid-glass-svg-filter-configurator-chrome-firefox-safari/entry.generated.css',
  'public/raw-reference-lab/demos/codepen/glass-theme-page-and-menu/entry.generated.css',
];

const PARTIAL_ARCHIVE_CHECKS = [
  { label: 'freefrontend css liquid glass', id: 'archive-freefrontend-css-liquid-glass' },
  { label: 'jsfiddle 6hmpa1ax', id: 'archive-jsfiddle-6hmpa1ax' },
  { label: 'jsfiddle nallenscott', id: 'archive-jsfiddle-nallenscott' },
  { label: 'css glass', id: 'archive-css-glass' },
  { label: 'kube liquid glass', id: 'archive-kube-liquid-glass' },
  { label: 'liquidgl demo archive', id: 'archive-liquidgl-demo' },
];

const RUNS_LOCALLY_CHECKS = [
  { label: 'glass-button-css-only', id: 'codepen-glass-button-css-only', expectRunsLocally: true },
  { label: 'liquidGL runner if active', id: 'url-liquidgl-duk-liquidgl', expectRunsLocally: true, allowRunnerOnly: true },
];

// Deterministic URL/button mapping checks. Each known title must resolve to the
// EXACT github-static file (disambiguated by the github-static catalog entry),
// guarding against the reported "one card opens another card's demo" bug.
const KNOWN_GITHUB_STATIC_MAPPINGS = {
  'liquid effect': '/raw-reference-lab/demos/github-static/tuannm93-liquid-effect/index.html',
  'glass refraction': '/raw-reference-lab/demos/github-static/tuannm93-glass-refraction/index.html',
  'liquid glass': '/raw-reference-lab/demos/github-static/tuannm93-liquid-glass/index.html',
  'liquid glass effect': '/raw-reference-lab/demos/github-static/tuannm93-liquid-glass-effect/index.html',
  'glass magnifier': '/raw-reference-lab/demos/github-static/tuannm93-glass-magnifier/index.html',
  'glass gel slider': '/raw-reference-lab/demos/github-static/tuannm93-glass-gel-slider/index.html',
  'honeycomb magnifier': '/raw-reference-lab/demos/github-static/tuannm93-honeycomb-magnifier/index.html',
  shader: '/raw-reference-lab/demos/github-static/tuannm93-shader/index.html',
  'shock wave shader pass': '/raw-reference-lab/demos/github-static/tuannm93-shock-wave-shader-pass/index.html',
  bubbles: '/raw-reference-lab/demos/github-static/tuannm93-bubbles/index.html',
};

// "liquid effect" must NEVER resolve to "glass refraction" (the reported bug).
const FORBIDDEN_MAPPINGS = {
  'liquid effect': '/raw-reference-lab/demos/github-static/tuannm93-glass-refraction/index.html',
};

const UNSAFE_TERMS = [
  'backend-api',
  'estuary',
  'sig=',
  'jwt=',
  'auth-success',
  'mail.google.com',
  'instagram.com',
  'x.com/i/chat',
  'private-user-images',
  'Ben_Shelton',
  'Bryan_Shelton',
  'Anna_Hall',
  'Trinity',
];

const SCAN_EXTENSIONS = new Set(['.html', '.js', '.css', '.json', '.txt', '.mjs', '.md']);
const HEALTH_KEYS = [
  'working',
  'warning',
  'broken',
  'needs-preprocessor',
  'needs-external-assets',
  'needs-runner',
  'runner-failed',
  'source-only',
  'external-only',
  'unknown',
];

const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`OK: ${message}`);
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function checkRequiredFiles() {
  for (const rel of REQUIRED_FILES) {
    const abs = join(ROOT, rel);
    if (await pathExists(abs)) pass(`required file exists: ${rel}`);
    else fail(`missing required file: ${rel}`);
  }
}

function countHasLocalFiles(items) {
  return items.filter((item) =>
    item.localDemoUrl || item.localSourcePath || item.runnerPath || item.localDevUrl,
  ).length;
}

async function checkIndex() {
  const raw = await readFile(join(LAB, 'raw-reference-index.json'), 'utf8');
  const items = JSON.parse(raw);
  const runners = JSON.parse(await readFile(join(LAB, 'reference-runners.json'), 'utf8'));

  const total = items.length;
  const localDemoPages = items.filter((i) => i.previewMode === 'local-page' && i.localDemoUrl).length;
  const hasLocalFiles = countHasLocalFiles(items);
  const runnerCandidates = runners.filter((r) => r.runnable).length;

  console.log(`Index: total=${total}, localDemoPages=${localDemoPages}, hasLocalFiles=${hasLocalFiles}, runnerCandidates=${runnerCandidates}`);

  if (total <= 0) fail('total references must be > 0');
  else pass(`total references (${total}) > 0`);

  if (localDemoPages <= 0) fail('local demo pages must be > 0');
  else pass(`local demo pages (${localDemoPages}) > 0`);

  if (hasLocalFiles <= 0) fail('has local files must be > 0');
  else pass(`has local files (${hasLocalFiles}) > 0`);

  if (runnerCandidates <= 0) fail('runner candidates must be > 0');
  else pass(`runner candidates (${runnerCandidates}) > 0`);

  return { items, runners };
}

async function checkHealth() {
  const raw = await readFile(join(LAB, 'demo-health.json'), 'utf8');
  const health = JSON.parse(raw);
  const counts = Object.fromEntries(HEALTH_KEYS.map((k) => [k, 0]));

  for (const key of HEALTH_KEYS) {
    counts[key] = health.summary?.[key] ?? 0;
  }

  for (const record of Object.values(health.items ?? {})) {
    const h = record.health || 'unknown';
    if (!(h in counts) || health.summary?.[h] === undefined) {
      counts.unknown = (counts.unknown || 0) + 1;
    }
  }

  console.log('Health counts:');
  for (const key of HEALTH_KEYS) {
    console.log(`  ${key}: ${counts[key] ?? 0}`);
  }

  if (health.classificationSummary) {
    console.log('Classification counts:');
    for (const [key, val] of Object.entries(health.classificationSummary)) {
      console.log(`  ${key}: ${val}`);
    }
  }

  if ((counts.broken ?? 0) > 0) fail(`broken demos (${counts.broken}) must be 0`);
  else pass('broken demos = 0');

  if ((counts['runner-failed'] ?? 0) > 0) fail(`runner-failed (${counts['runner-failed']}) must be 0`);
  else pass('runner-failed = 0');

  return { health, counts };
}

const IMPORTANT_DEMOS = [
  { label: 'glass-button-css-only', id: 'codepen-glass-button-css-only' },
  { label: 'svg-liquid-glass', id: 'codepen-svg-liquid-glass' },
  { label: 'apple-liquid-glass', id: 'codepen-apple-liquid-glass' },
  { label: 'liquid-glass-form-beautiful-backgrounds-js', id: 'codepen-liquid-glass-form-beautiful-backgrounds-js' },
  { label: 'liquid-glass-svg-filter-configurator-chrome-firefox-safari', id: 'codepen-liquid-glass-svg-filter-configurator-chrome-firefox-safari' },
  { label: 'glass-theme-page-and-menu', id: 'codepen-glass-theme-page-and-menu' },
  { label: 'liquid-glass-navbar-switcher', id: 'codepen-liquid-glass-navbar-switcher' },
  { label: 'liquidGL', id: 'url-liquidgl-duk-liquidgl' },
];

function checkClassification(health) {
  const items = health.items ?? {};
  const summary = health.classificationSummary ?? {};

  if (!summary.total) fail('classificationSummary missing from demo-health.json');
  else pass('classificationSummary present in demo-health.json');

  for (const entry of PARTIAL_ARCHIVE_CHECKS) {
    const record = items[entry.id];
    if (!record) {
      fail(`partial archive missing from health audit: ${entry.label} (${entry.id})`);
      continue;
    }
    if (record.runsLocally === true) {
      fail(`${entry.label} must not be marked runsLocally`);
    } else {
      pass(`${entry.label} is not marked runs locally`);
    }
    if (record.isLocalStaticDemo === true) {
      fail(`${entry.label} must not be marked isLocalStaticDemo`);
    }
    if (record.buttonLabel === 'Open local demo') {
      fail(`${entry.label} must not use buttonLabel "Open local demo"`);
    }
    if (!record.hasLocalFiles) {
      fail(`${entry.label} should have hasLocalFiles: true`);
    } else {
      pass(`${entry.label} has local files`);
    }
    if (!record.isPartialArchive) {
      fail(`${entry.label} should be isPartialArchive: true`);
    } else {
      pass(`${entry.label} is partial archive`);
    }
    if (!record.needsInternet) {
      fail(`${entry.label} should have needsInternet: true`);
    }
    if (record.runsLocally !== false && record.isLocalDevServer !== true) {
      // already checked runsLocally above
    }
  }

  for (const entry of RUNS_LOCALLY_CHECKS) {
    const record = items[entry.id];
    if (!record) {
      fail(`runs locally check missing: ${entry.label} (${entry.id})`);
      continue;
    }
    if (entry.allowRunnerOnly && record.health === 'needs-runner') {
      pass(`${entry.label} runner not active (skipped runsLocally check)`);
      continue;
    }
    if (entry.expectRunsLocally && !record.runsLocally) {
      fail(`${entry.label} should be marked runsLocally`);
    } else if (entry.expectRunsLocally) {
      pass(`${entry.label} is marked runs locally`);
    }
  }

  const runsLocallyNeedsInternet = Object.entries(items).filter(
    ([, r]) => r.runsLocally && r.needsInternet,
  );
  if (runsLocallyNeedsInternet.length > 0) {
    fail(`runs locally count must exclude needs-internet entries (${runsLocallyNeedsInternet.length} overlap)`);
  } else {
    pass('runs locally excludes needs-internet entries');
  }

  const partialMarkedLocalDemo = Object.entries(items).filter(
    ([, r]) => r.isPartialArchive && r.buttonLabel === 'Open local demo',
  );
  if (partialMarkedLocalDemo.length > 0) {
    fail(`partial archives must not use "Open local demo" (${partialMarkedLocalDemo.length} found)`);
  } else {
    pass('partial archives are not labeled Open local demo');
  }
}

function checkImportantDemos(health) {
  const results = {};
  for (const demo of IMPORTANT_DEMOS) {
    const record = health.items?.[demo.id];
    if (!record) {
      results[demo.label] = 'missing';
      fail(`important demo missing from health audit: ${demo.label} (${demo.id})`);
      continue;
    }
    const status = record.health;
    results[demo.label] = status;
    if (status === 'broken' || status === 'runner-failed') {
      fail(`important demo is ${status}: ${demo.label} (${demo.id})`);
    } else {
      pass(`important demo not broken: ${demo.label} → ${status}`);
    }
  }
  return results;
}

async function checkUrlMapping(items) {
  // 1. IDs unique.
  const idCounts = {};
  for (const i of items) idCounts[i.id] = (idCounts[i.id] || 0) + 1;
  const dupIds = Object.entries(idCounts).filter(([, c]) => c > 1);
  if (dupIds.length) fail(`duplicate ids found: ${dupIds.map(([id]) => id).join(', ')}`);
  else pass('all catalog ids are unique');

  // 2. Every localDemoUrl / generatedRunnableUrl points to an existing file.
  for (const i of items) {
    for (const field of ['localDemoUrl', 'generatedRunnableUrl']) {
      const url = i[field];
      if (!url) continue;
      const abs = join(ROOT, 'public', url.replace(/^\//, ''));
      if (!(await pathExists(abs))) fail(`${field} file missing: ${i.id} -> ${url}`);
    }
  }

  // 3. github-static folder must be derivable from the item's own id (no cross-wiring).
  let crossWired = 0;
  for (const i of items) {
    if (!i.localDemoUrl || !i.localDemoUrl.includes('/github-static/')) continue;
    const folder = i.localDemoUrl.split('/github-static/')[1].split('/')[0];
    const expected = i.id.replace(/^github-/, '');
    if (folder !== expected) {
      crossWired += 1;
      fail(`cross-wired github-static demo: ${i.id} -> ${folder} (expected ${expected})`);
    }
  }
  if (!crossWired) pass('no cross-wired github-static demos');

  // 4. Known title -> exact file mappings; and forbidden mappings absent.
  const byTitle = {};
  for (const i of items) (byTitle[i.title] ||= []).push(i);
  for (const [title, expectedUrl] of Object.entries(KNOWN_GITHUB_STATIC_MAPPINGS)) {
    const candidates = (byTitle[title] || []).filter(
      (i) => i.localDemoUrl && i.localDemoUrl.includes('/github-static/'),
    );
    if (candidates.some((i) => i.localDemoUrl === expectedUrl)) {
      pass(`URL mapping ok: "${title}" -> ${expectedUrl}`);
    } else {
      fail(`URL mapping broken: "${title}" did not resolve to ${expectedUrl}`);
    }
    const forbidden = FORBIDDEN_MAPPINGS[title];
    if (forbidden && candidates.some((i) => i.localDemoUrl === forbidden)) {
      fail(`forbidden URL mapping present: "${title}" -> ${forbidden}`);
    }
  }

  // 5. UI open-target resolution must use id/baked-href/data-demo-url, never array index.
  const jsSrc = await readFile(join(LAB, 'raw-reference-lab.js'), 'utf8');
  const indexSafe =
    jsSrc.includes('findItem(btn.dataset.id)') &&
    jsSrc.includes('esc(item.localDemoUrl)') &&
    jsSrc.includes('card.dataset.demoUrl') &&
    !/data-index=|dataset\.index/.test(jsSrc);
  if (indexSafe) pass('UI open targets resolved by id/href/data-demo-url (not array index)');
  else fail('UI open targets may depend on array index or title');
}

async function checkWrappersAndScss() {
  for (const rel of IMPORTANT_WRAPPERS) {
    if (await pathExists(join(ROOT, rel))) pass(`wrapper exists: ${rel}`);
    else fail(`missing wrapper: ${rel}`);
  }
  for (const rel of IMPORTANT_SCSS_OUTPUT) {
    if (await pathExists(join(ROOT, rel))) pass(`generated SCSS CSS exists: ${rel}`);
    else fail(`missing generated SCSS CSS: ${rel}`);
  }
}

async function walkScan(dir, hits, depth = 0) {
  if (depth > 12) return;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      await walkScan(full, hits, depth + 1);
      continue;
    }
    const ext = extname(entry.name).toLowerCase();
    if (!SCAN_EXTENSIONS.has(ext)) continue;
    let content;
    try {
      content = await readFile(full, 'utf8');
    } catch {
      continue;
    }
    for (const term of UNSAFE_TERMS) {
      if (content.includes(term)) {
        hits.push({ file: relative(ROOT, full), term });
      }
    }
  }
}

async function checkUnsafeStrings() {
  const hits = [];
  if (await pathExists(LAB)) await walkScan(LAB, hits);
  if (await pathExists(RUNNERS_DIR)) await walkScan(RUNNERS_DIR, hits);

  if (hits.length === 0) {
    pass('unsafe/private string scan clean');
    return true;
  }

  fail(`unsafe/private strings found (${hits.length} hit(s))`);
  const seen = new Set();
  for (const hit of hits) {
    const key = `${hit.file}:${hit.term}`;
    if (seen.has(key)) continue;
    seen.add(key);
    console.error(`  ${hit.file} — matched term: ${hit.term}`);
  }
  return false;
}

function printGitSuggestions() {
  console.log('\nSuggested git checks (run manually):');
  console.log('  git diff -- src');
  console.log('  git diff -- src/styles');
  console.log("  git diff -- 'public/raw-reference-lab/demos/**/src/**'");
}

async function main() {
  console.log('Raw Reference Lab stabilization check\n');

  await checkRequiredFiles();
  const { items } = await checkIndex();
  await checkUrlMapping(items);
  const { health } = await checkHealth();
  checkClassification(health);
  checkImportantDemos(health);
  await checkWrappersAndScss();
  const safe = await checkUnsafeStrings();
  printGitSuggestions();

  console.log('\n── Summary ──');
  if (failures.length === 0) {
    console.log('All checks passed.');
    process.exit(0);
  }

  console.log(`${failures.length} check(s) failed.`);
  process.exit(safe === false || failures.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
