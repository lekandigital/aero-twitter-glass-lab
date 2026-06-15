#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import {
  BASE_PORT,
  VAULT_GITHUB,
  PUBLIC_RUNNERS,
  detectPackageManagerAsync,
  findStaticServeDir,
  githubSourceUrl,
  matchPatternsFor,
  pickRecommendedScript,
  pickRunnableScripts,
  writeJson,
} from './lib/reference-runners-shared.mjs';

async function discoverRepo(dirName) {
  const repoPath = join(VAULT_GITHUB, dirName);
  const sourcePath = `_reference_vault/reference-library/github/${dirName}`;
  let pkg = null;

  try {
    pkg = JSON.parse(await readFile(join(repoPath, 'package.json'), 'utf8'));
  } catch {
    pkg = null;
  }

  const staticServeDir = await findStaticServeDir(repoPath);
  const sourceUrl = githubSourceUrl(dirName);

  if (pkg) {
    const scripts = pkg.scripts ?? {};
    const runnable = pickRunnableScripts(scripts);
    const recommended = pickRecommendedScript(scripts, dirName);

    if (!recommended && staticServeDir) {
      return buildStaticRunner(dirName, sourcePath, staticServeDir, sourceUrl, {
        notes: 'Package repo with no dev server script; static HTML demo available via serve.',
      });
    }

    if (!recommended) {
      return {
        id: dirName,
        title: pkg.name ?? dirName,
        runnerType: 'package',
        runnable: false,
        sourcePath,
        sourceUrl,
        matchPatterns: matchPatternsFor(dirName),
        packageManager: await detectPackageManagerAsync(repoPath, pkg),
        scripts: Object.keys(scripts),
        runnableScripts: runnable,
        recommendedScript: null,
        port: null,
        status: 'not-runnable',
        localDevUrl: null,
        notes: 'No runnable npm scripts found (dev may be watch-only build).',
        skipReason: 'No runnable npm scripts found',
      };
    }

    return {
      id: dirName,
      title: pkg.name ?? dirName,
      runnerType: 'package',
      runnable: true,
      sourcePath,
      sourceUrl,
      matchPatterns: matchPatternsFor(dirName),
      packageManager: await detectPackageManagerAsync(repoPath, pkg),
      scripts: Object.keys(scripts),
      runnableScripts: runnable,
      recommendedScript: recommended,
      port: null,
      status: 'not-started',
      localDevUrl: null,
      notes: 'Package repo. Can run as isolated local dev server. Not ported.',
    };
  }

  if (staticServeDir) {
    return buildStaticRunner(dirName, sourcePath, staticServeDir, sourceUrl);
  }

  return {
    id: dirName,
    title: dirName,
    runnerType: 'unknown',
    runnable: false,
    sourcePath,
    sourceUrl,
    matchPatterns: matchPatternsFor(dirName),
    packageManager: 'unknown',
    scripts: [],
    runnableScripts: [],
    recommendedScript: null,
    port: null,
    status: 'not-runnable',
    localDevUrl: null,
    notes: 'No package.json and no index.html demo found.',
    skipReason: 'No package.json found',
  };
}

function buildStaticRunner(id, sourcePath, serveDir, sourceUrl, extra = {}) {
  return {
    id,
    title: id,
    runnerType: 'static',
    runnable: true,
    sourcePath,
    sourceUrl,
    matchPatterns: matchPatternsFor(id),
    packageManager: 'npx',
    scripts: ['serve'],
    runnableScripts: ['serve'],
    recommendedScript: 'serve',
    serveDir,
    port: null,
    status: 'not-started',
    localDevUrl: null,
    notes: 'Static HTML demo. Served via npx serve in isolated runner copy. Not ported.',
    ...extra,
  };
}

async function main() {
  const entries = await readdir(VAULT_GITHUB, { withFileTypes: true });
  const runners = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const runner = await discoverRepo(entry.name);
    runners.push(runner);
  }

  runners.sort((a, b) => {
    const score = (r) => {
      if (!r.runnable) return 1000;
      const idx = ['liquidGL', 'archisvaze-liquid-glass', 'liquid-glass-js', 'glassmorphism-template', 'liquid-dom', 'glass-refraction', 'glassmorphism', '7-Aero-Stylesheet'].indexOf(r.id);
      return idx === -1 ? 500 : idx;
    };
    return score(a) - score(b) || a.id.localeCompare(b.id);
  });

  let port = BASE_PORT;
  for (const runner of runners) {
    if (runner.runnable) {
      runner.port = port;
      runner.localDevUrl = `http://localhost:${port}`;
      runner.runnerPath = `.raw-reference-runners/repos/${runner.id}`;
      port += 1;
    } else {
      runner.runnerPath = `.raw-reference-runners/repos/${runner.id}`;
    }
  }

  await writeJson(PUBLIC_RUNNERS, runners);

  const runnable = runners.filter((r) => r.runnable);
  const notRunnable = runners.filter((r) => !r.runnable);

  console.log('Reference runner discovery complete');
  console.log('────────────────────────────────');
  console.log(`Package repos scanned:     ${runners.length}`);
  console.log(`Runner candidates:         ${runnable.length}`);
  console.log(`Not runnable:              ${notRunnable.length}`);
  console.log(`Output:                    ${PUBLIC_RUNNERS}`);
  console.log('\nRunnable:');
  for (const r of runnable) {
    console.log(`  ${r.id} → ${r.localDevUrl} (${r.runnerType}, ${r.recommendedScript})`);
  }
  if (notRunnable.length) {
    console.log('\nNot runnable:');
    for (const r of notRunnable) {
      console.log(`  ${r.id}: ${r.skipReason ?? r.notes}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
