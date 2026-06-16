#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import {
  BASE_PORT,
  VAULT_GITHUB,
  PUBLIC_RUNNERS,
  auditPackageRunner,
  buildVariantRunner,
  discoverAllHtmlDemoPages,
  discoverNestedPackageDemos,
  discoverStaticHtmlPageVariants,
  discoverWorkspaceViteDemos,
  findStaticServeDir,
  githubSourceUrl,
  isPrimaryHtmlPage,
  isWebDevServerScript,
  matchPatternsFor,
  pickRecommendedScript,
  pickRunnableScripts,
  runnerRepoId,
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
        repoId: dirName,
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
        htmlRelPath: audit.serveTarget ? `${audit.serveTarget}/index.html`.replace(/^\.\//, '') : null,
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
        repoId: dirName,
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
      const nestedDemos = await discoverNestedPackageDemos(repoPath, dirName);
      if (nestedDemos.length) {
        const first = nestedDemos[0];
        return {
          id: dirName,
          repoId: dirName,
          title: pkg.name ?? dirName,
          runnerType: 'package',
          runnable: true,
          sourcePath,
          sourceUrl,
          matchPatterns: matchPatternsFor(dirName),
          packageManager: audit.packageManager,
          scripts: Object.keys(scripts),
          runnableScripts: runnable,
          recommendedScript: 'dev',
          port: null,
          status: 'not-started',
          localDevUrl: null,
          expectedUrl: null,
          startMode: 'nested-package-dev',
          demoCwd: first.demoCwd,
          packageStyle: true,
          requiresInstall: true,
          requiresBuild: false,
          installCommand: audit.installCommand,
          labels: ['Package repo', 'Nested demo', 'Install needed', 'Open local dev server'],
          openButtonLabel: 'Open local dev server',
          notes: `Runnable nested demo at ${first.demoCwd}.`,
        };
      }

      const htmlPages = await discoverAllHtmlDemoPages(repoPath);
      if (htmlPages.length) {
        const primaryPage = htmlPages[0];
        return buildStaticRunner(dirName, sourcePath, primaryPage.serveDir, sourceUrl, pkg, audit, {
          urlPath: primaryPage.urlPath,
          htmlRelPath: primaryPage.htmlRelPath,
          startMode: primaryPage.urlPath === '/' ? 'static-serve' : 'static-serve-page',
          notes: 'Package repo with static HTML demos; served via npx serve.',
        });
      }

      return {
        id: dirName,
        repoId: dirName,
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
      repoId: dirName,
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

  const htmlPages = await discoverAllHtmlDemoPages(repoPath);
  if (htmlPages.length) {
    const primaryPage = htmlPages[0];
    return buildStaticRunner(dirName, sourcePath, primaryPage.serveDir, sourceUrl, null, null, {
      urlPath: primaryPage.urlPath,
      htmlRelPath: primaryPage.htmlRelPath,
      startMode: primaryPage.urlPath === '/' ? 'static-serve' : 'static-serve-page',
      notes: 'Static HTML demo collection. Each page can be run independently via npx serve.',
    });
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
  const htmlRelPath = extra.htmlRelPath ?? (serveDir === '.' ? 'index.html' : `${serveDir}/index.html`);
  const urlPath = extra.urlPath ?? '/';
  const startMode = extra.startMode ?? 'static-serve';
  return {
    id,
    repoId: id,
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
    htmlRelPath,
    urlPath,
    port: null,
    status: 'not-started',
    localDevUrl: null,
    expectedUrl: null,
    startMode,
    packageStyle: !!pkg,
    requiresInstall: !!pkg,
    requiresBuild: false,
    installCommand: audit?.installCommand ?? null,
    labels: ['Open full demo'],
    openButtonLabel: urlPath === '/' ? 'Open full demo' : 'Open demo page',
    notes: 'Static HTML demo. Served via npx serve in isolated runner copy. Not ported.',
    ...extra,
  };
}

async function discoverVariantRunners(primary, repoPath) {
  const variants = [];
  const viteDemoCwds = new Set();

  if (primary.runnerType === 'package' && primary.runnable) {
    const primaryDemoCwd = primary.demoCwd ?? (primary.id === 'liquid-dom' ? 'demo/minimal' : null);
    const viteDemos = await discoverWorkspaceViteDemos(repoPath, primary.id, primaryDemoCwd);
    variants.push(...viteDemos);
    for (const demo of viteDemos) viteDemoCwds.add(demo.demoCwd);
    if (primaryDemoCwd) viteDemoCwds.add(primaryDemoCwd);

    const nestedDemos = await discoverNestedPackageDemos(repoPath, primary.id, primaryDemoCwd);
    for (const demo of nestedDemos) {
      if (demo.demoCwd === primary.demoCwd) continue;
      variants.push(demo);
      viteDemoCwds.add(demo.demoCwd);
    }
  }

  if (primary.startMode === 'build-then-serve-example') {
    return variants.map((spec) => buildVariantRunner(primary, spec));
  }

  if (primary.runnerType === 'static' || primary.startMode === 'static-serve' || primary.startMode === 'static-serve-page') {
    variants.push(...await discoverStaticHtmlPageVariants(repoPath, primary));
  } else if (primary.runnerType === 'package' && primary.runnable) {
    const allPages = await discoverAllHtmlDemoPages(repoPath);
    for (const page of allPages) {
      if (isPrimaryHtmlPage(primary, page)) continue;
      const pageDir = dirname(page.htmlRelPath);
      const inPackageDemo = [...viteDemoCwds].some((cwd) => pageDir === cwd || pageDir.startsWith(`${cwd}/`));
      if (inPackageDemo) continue;
      variants.push(page);
    }
  }

  return variants.map((spec) => buildVariantRunner(primary, spec));
}

async function main() {
  const entries = await readdir(VAULT_GITHUB, { withFileTypes: true });
  const primaries = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const runner = await discoverRepo(entry.name);
    primaries.push(runner);
  }

  const runners = [];
  for (const primary of primaries) {
    runners.push(primary);
    if (!primary.runnable) continue;
    const repoPath = join(VAULT_GITHUB, primary.id);
    const variants = await discoverVariantRunners(primary, repoPath);
    runners.push(...variants);
  }

  runners.sort((a, b) => {
    const score = (r) => {
      if (!r.runnable) return 1000;
      const baseId = r.variantOf ?? r.id;
      const idx = ['liquidGL', 'archisvaze-liquid-glass', 'liquid-glass-js', 'glassmorphism-template', 'liquid-dom', 'glass-refraction', 'glassmorphism', '7-Aero-Stylesheet', 'tuannm93-lab', 'polidario-frontend-projects'].indexOf(baseId);
      const base = idx === -1 ? 500 : idx;
      return base + (r.variantOf ? 0.1 : 0);
    };
    return score(a) - score(b) || (a.variantOf ?? a.id).localeCompare(b.variantOf ?? b.id) || (a.variantOf ? 1 : -1) || a.id.localeCompare(b.id);
  });

  let port = BASE_PORT;
  for (const runner of runners) {
    if (runner.runnable) {
      runner.port = port;
      const urlPath = runner.urlPath ?? '/';
      const base = `http://localhost:${port}`;
      runner.localDevUrl = urlPath === '/' ? base : `${base}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`;
      runner.expectedUrl = runner.localDevUrl;
      const serveTarget = runner.serveDir === '.' ? '.' : runner.serveDir;
      if (runner.serveCommand == null && (runner.startMode === 'static-serve' || runner.startMode === 'static-serve-page')) {
        runner.serveCommand = `npx serve ${serveTarget} -l ${port}`;
      } else if (runner.serveCommand == null && runner.serveDir) {
        runner.serveCommand = `npx serve ${serveTarget} -l ${port}`;
      }
      runner.runnerPath = `.raw-reference-runners/repos/${runnerRepoId(runner)}`;
      port += 1;
    } else {
      runner.runnerPath = `.raw-reference-runners/repos/${runnerRepoId(runner)}`;
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
  for (const r of runnable.slice(0, 40)) {
    console.log(`  ${r.id} → ${r.localDevUrl} (${r.startMode ?? r.runnerType}, ${r.recommendedScript ?? 'serve'})`);
  }
  if (runnable.length > 40) {
    console.log(`  … and ${runnable.length - 40} more`);
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
