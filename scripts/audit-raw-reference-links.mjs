#!/usr/bin/env node
/**
 * Link-target audit for the Raw Reference Lab.
 *
 * Verifies that every card/action in the lab can be reconstructed from each
 * item's OWN metadata, and that every local URL points to a file that exists.
 *
 * This is a correctness guard against the class of bug where one card opens
 * another card's local demo. It does NOT mutate any catalog data; it only
 * reads and reports.
 *
 * Reads:
 *   public/raw-reference-lab/raw-reference-index.json
 *   public/raw-reference-lab/demo-health.json
 *   public/raw-reference-lab/reference-runners.json
 *
 * Writes:
 *   public/raw-reference-lab/repair-reports/link-target-audit.json
 *
 * Exit code is non-zero on a real mismatch (missing file, duplicate id,
 * cross-wired github-static folder, or a known tuannm93 mapping breaking).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LAB = join(ROOT, 'public', 'raw-reference-lab');
const PUBLIC = join(ROOT, 'public');
const REPORTS = join(LAB, 'repair-reports');

// Known tuannm93 GitHub-static demos: title -> exact expected local file.
// Title alone is NOT used for behavior anywhere; this map only asserts that the
// catalog entry for that title resolves to the correct file (and not another).
const KNOWN_GITHUB_STATIC = {
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

// liquid effect must never resolve to glass refraction (the reported bug).
const FORBIDDEN_MAPPING = {
  'liquid effect': '/raw-reference-lab/demos/github-static/tuannm93-glass-refraction/index.html',
};

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const localUrlToFile = (url) => join(PUBLIC, url.replace(/^\//, ''));

function main() {
  const items = readJson(join(LAB, 'raw-reference-index.json'));
  const health = existsSync(join(LAB, 'demo-health.json'))
    ? readJson(join(LAB, 'demo-health.json'))
    : { items: {} };
  const runners = existsSync(join(LAB, 'reference-runners.json'))
    ? readJson(join(LAB, 'reference-runners.json'))
    : [];

  const errors = [];
  const warnings = [];

  // 8. IDs must be unique.
  const idCounts = {};
  for (const i of items) idCounts[i.id] = (idCounts[i.id] || 0) + 1;
  const duplicateIds = Object.entries(idCounts)
    .filter(([, c]) => c > 1)
    .map(([id, count]) => ({ id, count }));
  for (const d of duplicateIds) errors.push(`Duplicate id: ${d.id} (x${d.count})`);

  // 1. Every localDemoUrl points to an existing file under public/.
  const missingLocalDemo = [];
  for (const i of items) {
    if (!i.localDemoUrl) continue;
    if (!existsSync(localUrlToFile(i.localDemoUrl))) {
      missingLocalDemo.push({ id: i.id, title: i.title, url: i.localDemoUrl });
      errors.push(`Missing localDemoUrl file: ${i.id} -> ${i.localDemoUrl}`);
    }
  }

  // 2. Every generatedRunnableUrl points to an existing file under public/.
  const missingGenerated = [];
  for (const i of items) {
    if (!i.generatedRunnableUrl) continue;
    if (!existsSync(localUrlToFile(i.generatedRunnableUrl))) {
      missingGenerated.push({ id: i.id, title: i.title, url: i.generatedRunnableUrl });
      errors.push(`Missing generatedRunnableUrl file: ${i.id} -> ${i.generatedRunnableUrl}`);
    }
  }

  // 3. Every debugUrl (from health audit) points to an existing file under public/.
  const missingDebug = [];
  for (const [id, rec] of Object.entries(health.items || {})) {
    if (!rec.debugUrl) continue;
    if (!existsSync(localUrlToFile(rec.debugUrl))) {
      missingDebug.push({ id, url: rec.debugUrl });
      warnings.push(`Missing debugUrl file: ${id} -> ${rec.debugUrl}`);
    }
  }

  // 4. Every active localDevUrl uses http://localhost:<port>.
  const badDevUrls = [];
  for (const r of runners) {
    if (!r.localDevUrl) continue;
    if (!/^http:\/\/localhost:\d+/.test(r.localDevUrl)) {
      badDevUrls.push({ id: r.id, localDevUrl: r.localDevUrl });
      errors.push(`Runner localDevUrl is not http://localhost:<port>: ${r.id} -> ${r.localDevUrl}`);
    }
  }

  // 5/10. No local button points to another item's local demo by mistake.
  //       Every action can be reconstructed from the item's own metadata: the
  //       github-static folder must be derivable from the item's own id.
  const crossWired = [];
  for (const i of items) {
    if (!i.localDemoUrl || !i.localDemoUrl.includes('/github-static/')) continue;
    const folder = i.localDemoUrl.split('/github-static/')[1].split('/')[0];
    const expected = i.id.replace(/^github-/, '');
    if (folder !== expected) {
      crossWired.push({ id: i.id, title: i.title, url: i.localDemoUrl, expectedFolder: expected, actualFolder: folder });
      errors.push(`Cross-wired github-static demo: ${i.id} -> folder "${folder}" (expected "${expected}")`);
    }
  }

  // 6. Known tuannm93 static demo names map to matching paths (disambiguated by
  //    the github-static catalog entry, not by title alone).
  const byTitle = {};
  for (const i of items) (byTitle[i.title] ||= []).push(i);
  const knownMappingResults = [];
  for (const [title, expectedUrl] of Object.entries(KNOWN_GITHUB_STATIC)) {
    const candidates = (byTitle[title] || []).filter(
      (i) => i.localDemoUrl && i.localDemoUrl.includes('/github-static/'),
    );
    const match = candidates.find((i) => i.localDemoUrl === expectedUrl);
    const ok = Boolean(match);
    knownMappingResults.push({
      title,
      expectedUrl,
      resolvedId: match ? match.id : null,
      candidateIds: candidates.map((c) => c.id),
      status: ok ? 'ok' : 'FAIL',
    });
    if (!ok) errors.push(`Known mapping failed: "${title}" did not resolve to ${expectedUrl}`);
    // forbidden mapping guard
    const forbidden = FORBIDDEN_MAPPING[title];
    if (forbidden && candidates.some((i) => i.localDemoUrl === forbidden)) {
      errors.push(`Forbidden mapping: "${title}" resolves to ${forbidden}`);
    }
  }

  // 9. Duplicate local URLs allowed only when intentional (reported).
  const urlMap = {};
  for (const i of items) if (i.localDemoUrl) (urlMap[i.localDemoUrl] ||= []).push(i.id);
  const duplicateLocalDemoUrls = Object.entries(urlMap)
    .filter(([, ids]) => ids.length > 1)
    .map(([url, ids]) => {
      const intentional = url.includes('/web-archives/jsfiddle-');
      const entry = { url, ids, intentional };
      if (!intentional) errors.push(`Unexpected duplicate localDemoUrl: ${url} (${ids.join(', ')})`);
      else warnings.push(`Intentional duplicate localDemoUrl (web archive): ${url} (${ids.join(', ')})`);
      return entry;
    });

  // 7. Sorting/filtering cannot depend on array index for opening links.
  //    Static assertion on the UI source: open targets must come from data-id /
  //    baked hrefs / data-demo-url, never from an array index.
  const jsSrc = readFileSync(join(LAB, 'raw-reference-lab.js'), 'utf8');
  const usesDataId = jsSrc.includes('findItem(btn.dataset.id)');
  const usesBakedHref = jsSrc.includes("esc(item.localDemoUrl)");
  const usesDataDemoUrl = jsSrc.includes('card.dataset.demoUrl');
  const indexBasedOpen = /data-index=|dataset\.index/.test(jsSrc);
  const indexSafe = usesDataId && usesBakedHref && usesDataDemoUrl && !indexBasedOpen;
  if (!indexSafe) {
    errors.push('UI open-target resolution may depend on array index or title (expected id/href/data-demo-url only)');
  }

  const ok = errors.length === 0;
  const report = {
    generatedAt: new Date().toISOString(),
    ok,
    totalItems: items.length,
    summary: {
      duplicateIds: duplicateIds.length,
      missingLocalDemoFiles: missingLocalDemo.length,
      missingGeneratedRunnableFiles: missingGenerated.length,
      missingDebugFiles: missingDebug.length,
      badLocalDevUrls: badDevUrls.length,
      crossWiredGithubStatic: crossWired.length,
      duplicateLocalDemoUrls: duplicateLocalDemoUrls.length,
      knownMappingFailures: knownMappingResults.filter((r) => r.status !== 'ok').length,
      errors: errors.length,
      warnings: warnings.length,
    },
    indexSafetyAssertion: { usesDataId, usesBakedHref, usesDataDemoUrl, indexBasedOpen, indexSafe },
    duplicateIds,
    missingLocalDemoFiles: missingLocalDemo,
    missingGeneratedRunnableFiles: missingGenerated,
    missingDebugFiles: missingDebug,
    badLocalDevUrls: badDevUrls,
    crossWiredGithubStatic: crossWired,
    duplicateLocalDemoUrls,
    knownMappingResults,
    errors,
    warnings,
  };

  mkdirSync(REPORTS, { recursive: true });
  writeFileSync(join(REPORTS, 'link-target-audit.json'), JSON.stringify(report, null, 2) + '\n');

  console.log('Raw Reference Lab link-target audit');
  console.log(`  total items: ${items.length}`);
  console.log(`  errors: ${errors.length}, warnings: ${warnings.length}`);
  for (const e of errors) console.error(`  FAIL: ${e}`);
  for (const w of warnings) console.log(`  note: ${w}`);
  console.log(ok ? 'Link-target audit passed.' : 'Link-target audit FAILED.');
  process.exit(ok ? 0 : 1);
}

main();
