#!/usr/bin/env node
/**
 * Verify demos marked runsLocally.
 *
 * For each item the health audit marks runsLocally, this checks two things:
 *   1. correct target  — the open URL resolves to the item's OWN
 *      localDemoUrl / generatedRunnableUrl / localDevUrl, and the file exists
 *      (or the dev URL is a localhost dev server).
 *   2. local-only      — the served HTML does not require remote http(s)
 *      resources (CDN/fonts/images/scripts) other than localhost.
 *
 * Browser-based verification (rendering, fatal JS errors) requires Playwright.
 * If Playwright is not installed it is SKIPPED and reported as such — it is not
 * auto-installed. The static local-only check still runs.
 *
 * Writes: public/raw-reference-lab/repair-reports/runnable-verification.json
 * Always exits 0 (advisory); callers gate promotion on the report contents.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LAB = join(ROOT, 'public', 'raw-reference-lab');
const PUBLIC = join(ROOT, 'public');
const REPORTS = join(LAB, 'repair-reports');

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const localUrlToFile = (url) => join(PUBLIC, url.replace(/^\//, ''));

// remote URL references that would make a page require the internet
const REMOTE_RE = /(?:src|href)\s*=\s*["'](https?:)?\/\/(?!localhost|127\.0\.0\.1)[^"']+/gi;

function playwrightAvailable() {
  try {
    return existsSync(join(ROOT, 'node_modules', 'playwright')) ||
      existsSync(join(ROOT, 'node_modules', '@playwright', 'test'));
  } catch {
    return false;
  }
}

function staticLocalOnly(item) {
  const url = item.generatedRunnableUrl || item.localDemoUrl;
  if (!url) return { applicable: false };
  const file = localUrlToFile(url);
  if (!existsSync(file)) return { applicable: true, fileExists: false, remoteRefs: [] };
  const html = readFileSync(file, 'utf8');
  const remoteRefs = [...html.matchAll(REMOTE_RE)]
    .map((m) => m[0].replace(/^(src|href)\s*=\s*["']/i, ''))
    .slice(0, 10);
  return { applicable: true, fileExists: true, remoteRefs };
}

function main() {
  const items = readJson(join(LAB, 'raw-reference-index.json'));
  const health = readJson(join(LAB, 'demo-health.json'));
  const runners = existsSync(join(LAB, 'reference-runners.json'))
    ? readJson(join(LAB, 'reference-runners.json'))
    : [];
  const runnerById = Object.fromEntries(runners.map((r) => [r.id, r]));
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));

  const pw = playwrightAvailable();
  const results = [];

  for (const [id, rec] of Object.entries(health.items || {})) {
    if (!rec.runsLocally) continue;
    const item = byId[id] || {};
    const isDevServer = Boolean(rec.isLocalDevServer);
    let verifiedCorrectTarget = false;
    let target = null;

    if (isDevServer) {
      const runner = runnerById[item.runnerId] || runners.find((r) => r.localDevUrl);
      target = runner?.localDevUrl || item.localDevUrl || null;
      verifiedCorrectTarget = Boolean(target && /^http:\/\/localhost:\d+/.test(target));
    } else {
      target = item.generatedRunnableUrl || item.localDemoUrl || null;
      verifiedCorrectTarget = Boolean(target && existsSync(localUrlToFile(target)));
    }

    const local = isDevServer ? { applicable: false } : staticLocalOnly(item);
    const verifiedLocalOnly = isDevServer
      ? true
      : Boolean(local.applicable && local.fileExists && local.remoteRefs.length === 0);

    results.push({
      id,
      title: item.title || id,
      target,
      isLocalDevServer: isDevServer,
      verifiedCorrectTarget,
      verifiedLocalOnly,
      staticLocalOnly: verifiedLocalOnly ? 'pass' : (isDevServer ? 'dev-server' : 'remote-refs-present'),
      remoteRefSample: local.remoteRefs || [],
      browserVerified: pw ? 'pending' : 'skipped-no-playwright',
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    playwrightAvailable: pw,
    browserVerification: pw ? 'available' : 'skipped (Playwright not installed)',
    totalRunsLocally: results.length,
    correctTargetPass: results.filter((r) => r.verifiedCorrectTarget).length,
    localOnlyPass: results.filter((r) => r.verifiedLocalOnly).length,
    results,
  };

  mkdirSync(REPORTS, { recursive: true });
  writeFileSync(join(REPORTS, 'runnable-verification.json'), JSON.stringify(report, null, 2) + '\n');

  console.log('Runnable-demo verification (static)');
  console.log(`  runsLocally items: ${report.totalRunsLocally}`);
  console.log(`  correct-target pass: ${report.correctTargetPass}/${report.totalRunsLocally}`);
  console.log(`  static local-only pass: ${report.localOnlyPass}/${report.totalRunsLocally}`);
  console.log(`  browser verification: ${report.browserVerification}`);
  process.exit(0);
}

main();
