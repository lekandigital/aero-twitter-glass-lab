#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  BASE_PORT,
  VAULT_GITHUB,
  PUBLIC_RUNNERS,
  auditPackageRunner,
  findStaticServeDir,
  githubSourceUrl,
  isWebDevServerScript,
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
    const audit = await auditPackageRunner(repoPath, dirName, pkg);

    if (audit.startMode === 'build-then-serve-example') {
      return {
        id: dirName,
        title: pkg.name ?? dirName,
        runnerType: 'package',
        runnable: true,
        sourcePath,
        sourceUrl,
        matchPatterns: matchPatternsFor(dirName),
        packageManager: audit.packageManager,
        scripts: Object.keys(scripts),
        runnableScripts: runnable,
        recommendedScript: recommended,
        port: null,
        status: 'not-started',
        localDevUrl: null,
        expectedUrl: null,
        startMode: audit.startMode,
        packageStyle: true,
        requiresInstall: audit.requiresInstall,
        requiresBuild: audit.requiresBuild,
        buildOnlyDevScript: audit.buildOnlyDevScript,
        installCommand: audit.installCommand,
        buildCommand: audit.buildCommand,
        serveCommand: null,
        serveTarget: audit.serveTarget,
        serveDir: audit.serveDir,
        urlPath: audit.urlPath,
        devScript: audit.devScript,
        devScriptKind: audit.devScriptKind,
        generatedWrapper: audit.generatedWrapper,
        instructions: audit.instructions,
        labels: [
          'Build then serve',
          'Package repo',
          ...(audit.requiresInstall ? ['Install needed'] : []),
          ...(audit.buildOnlyDevScript ? ['Build watcher'] : []),
        ],
        openButtonLabel: audit.generatedWrapper ? 'Open generated wrapper' : 'Open package example',
        notes: 'Package repo: install, build dist, then serve example or generated wrapper.',
      };
    }

    if (audit.startMode === 'web-dev-server' && recommended) {
      const scriptBody = scripts[recommended] ?? '';
      return {
        id: dirName,
        title: pkg.name ?? dirName,
        runnerType: 'package',
        runnable: true,
        sourcePath,
        sourceUrl,
        matchPatterns: matchPatternsFor(dirName),
        packageManager: audit.packageManager,
        scripts: Object.keys(scripts),
        runnableScripts: runnable,
        recommendedScript: recommended,
        port: null,
        status: 'not-started',
        localDevUrl: null,
        expectedUrl: null,
        startMode: 'web-dev-server',
        packageStyle: true,
        requiresInstall: true,
        requiresBuild: false,
        buildOnlyDevScript: false,
        installCommand: audit.installCommand,
        devScript: scripts.dev ?? null,
        devScriptKind: scripts.dev ? audit.devScriptKind : null,
        labels: ['Package repo', 'Install needed', 'Open local dev server'],
        openButtonLabel: 'Open local dev server',
        notes: 'Package repo. Can run as isolated local dev server. Not ported.',
      };
    }

    if (!recommended && staticServeDir) {
      return buildStaticRunner(dirName, sourcePath, staticServeDir, sourceUrl, pkg, audit, {
        notes: 'Package repo with static HTML demo; may still need install/build before serve.',
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
        packageManager: audit.packageManager,
        scripts: Object.keys(scripts),
        runnableScripts: runnable,
        recommendedScript: null,
        port: null,
        status: 'not-runnable',
        localDevUrl: null,
        startMode: audit.startMode,
        packageStyle: true,
        requiresInstall: audit.requiresInstall,
        requiresBuild: audit.requiresBuild,
        buildOnlyDevScript: audit.buildOnlyDevScript,
        devScript: audit.devScript,
        devScriptKind: audit.devScriptKind,
        labels: ['Package repo', 'Manual step needed'],
        openButtonLabel: 'Open source',
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
      packageManager: audit.packageManager,
      scripts: Object.keys(scripts),
      runnableScripts: runnable,
      recommendedScript: recommended,
      port: null,
      status: 'not-started',
      localDevUrl: null,
      expectedUrl: null,
      startMode: isWebDevServerScript(scripts[recommended]) ? 'web-dev-server' : 'unknown-package',
      packageStyle: true,
      requiresInstall: true,
      installCommand: audit.installCommand,
      labels: ['Package repo'],
      openButtonLabel: 'Open local dev server',
      notes: 'Package repo. Can run as isolated local dev server. Not ported.',
    };
  }

  if (staticServeDir) {
    return buildStaticRunner(dirName, sourcePath, staticServeDir, sourceUrl, null, null);
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

function buildStaticRunner(id, sourcePath, serveDir, sourceUrl, pkg, audit, extra = {}) {
  return {
    id,
    title: pkg?.name ?? id,
    runnerType: 'static',
    runnable: true,
    sourcePath,
    sourceUrl,
    matchPatterns: matchPatternsFor(id),
    packageManager: audit?.packageManager ?? 'npx',
    scripts: ['serve'],
    runnableScripts: ['serve'],
    recommendedScript: 'serve',
    serveDir,
    port: null,
    status: 'not-started',
    localDevUrl: null,
    expectedUrl: null,
    startMode: 'static-serve',
    packageStyle: !!pkg,
    requiresInstall: !!pkg,
    requiresBuild: false,
    installCommand: audit?.installCommand ?? null,
    labels: ['Open full demo'],
    openButtonLabel: 'Open full demo',
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
      const urlPath = runner.urlPath ?? '/';
      const base = `http://localhost:${port}`;
      runner.localDevUrl = urlPath === '/' ? base : `${base}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`;
      runner.expectedUrl = runner.localDevUrl;
      if (runner.serveCommand == null && runner.serveDir) {
        runner.serveCommand = `npx serve ${runner.serveDir} -l ${port}`;
      } else if (runner.serveCommand == null && runner.startMode === 'static-serve') {
        const target = runner.serveDir === '.' ? '.' : runner.serveDir;
        runner.serveCommand = `npx serve ${target} -l ${port}`;
      }
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
    console.log(`  ${r.id} → ${r.localDevUrl} (${r.startMode ?? r.runnerType}, ${r.recommendedScript ?? 'serve'})`);
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
