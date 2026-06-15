#!/usr/bin/env node
import { join } from 'node:path';
import {
  INSTALL_REPORT,
  INSTALL_STATUS_FILE,
  PUBLIC_RUNNERS,
  RUNNERS_LOGS,
  RUNNERS_REPOS,
  VAULT_GITHUB,
  detectPackageManagerAsync,
  ensureRunnerCopies,
  ensureRunnerDirs,
  hasNodeModules,
  installCommandFor,
  readJson,
  readPackageJson,
  runPackageInstall,
  writeJson,
} from './lib/reference-runners-shared.mjs';

async function shouldInstall(repoPath, force) {
  if (force) return true;
  return !(await hasNodeModules(repoPath));
}

async function main() {
  const force = process.env.RRL_FORCE_INSTALL === '1';
  const skip = process.env.RRL_SKIP_INSTALL === '1';

  await ensureRunnerDirs();

  const runners = await readJson(PUBLIC_RUNNERS, []);
  const runnable = runners.filter((r) => r.runnable);
  await ensureRunnerCopies(runnable);

  const results = [];
  let attempted = 0;
  let passed = 0;
  let failed = 0;

  console.log('Reference runner install');
  console.log('────────────────────────');

  if (skip) {
    console.log('RRL_SKIP_INSTALL=1 — skipping installs');
    const existing = (await readJson(INSTALL_STATUS_FILE, {})) ?? {};
    await writeJson(INSTALL_STATUS_FILE, existing);
    await writeJson(INSTALL_REPORT, {
      generatedAt: new Date().toISOString(),
      skipped: true,
      summary: { attempted: 0, passed: 0, failed: 0 },
      runners: Object.values(existing),
    });
    return;
  }

  for (const runner of runnable) {
    const repoPath = join(RUNNERS_REPOS, runner.id);
    const pkg = await readPackageJson(repoPath);
    if (!pkg) continue;

    const pm = runner.packageManager && runner.packageManager !== 'npx' && runner.packageManager !== 'unknown'
      ? runner.packageManager
      : await detectPackageManagerAsync(repoPath, pkg);
    const installCommand = installCommandFor(pm);
    const logFile = join(RUNNERS_LOGS, `${runner.id}.install.log`);

    const needsInstall = await shouldInstall(repoPath, force);
    if (!needsInstall) {
      console.log(`  ✓ ${runner.id} — already installed`);
      results.push({
        id: runner.id,
        repoPath: `.raw-reference-runners/repos/${runner.id}`,
        packageManager: pm,
        installCommand,
        installed: true,
        exitCode: 0,
        durationMs: 0,
        logFile: `.raw-reference-runners/logs/${runner.id}.install.log`,
        skipped: true,
      });
      passed += 1;
      continue;
    }

    attempted += 1;
    console.log(`  ▶ ${runner.id} — ${installCommand}`);
    const result = await runPackageInstall(repoPath, pm, logFile);
    const ok = result.exitCode === 0;
    if (ok) {
      passed += 1;
      console.log(`    ✓ installed (${result.durationMs}ms)`);
    } else {
      failed += 1;
      console.log(`    ✗ install failed (exit ${result.exitCode})`);
    }

    results.push({
      id: runner.id,
      repoPath: `.raw-reference-runners/repos/${runner.id}`,
      packageManager: pm,
      installCommand,
      installed: ok,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
      logFile: `.raw-reference-runners/logs/${runner.id}.install.log`,
    });
  }

  const statusMap = Object.fromEntries(results.map((r) => [r.id, r]));
  await writeJson(INSTALL_STATUS_FILE, statusMap);
  await writeJson(INSTALL_REPORT, {
    generatedAt: new Date().toISOString(),
    summary: { attempted, passed, failed },
    runners: results,
  });

  console.log('\nInstall complete');
  console.log(`  attempted: ${attempted}`);
  console.log(`  passed:    ${passed}`);
  console.log(`  failed:    ${failed}`);
  console.log(`  report:    ${INSTALL_REPORT}`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
