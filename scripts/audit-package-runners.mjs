#!/usr/bin/env node
import { join } from 'node:path';
import {
  INSTALL_STATUS_FILE,
  PACKAGE_RUNNER_REPORT,
  PUBLIC_RUNNERS,
  RUNNERS_REPOS,
  assessRunnerHealth,
  auditPackageRunner,
  ensureRunnerCopies,
  ensureRunnerDirs,
  readJson,
  readPackageJson,
  readRunnerStatus,
  writeJson,
} from './lib/reference-runners-shared.mjs';

function manualInstructionsFor(entry) {
  const lines = [];
  if (entry.installStatus === 'passed' || entry.installStatus === 'skipped') {
    lines.push(`${entry.installCommand ?? 'install'} passed`);
  } else if (entry.installStatus === 'failed') {
    lines.push(`${entry.installCommand ?? 'install'} failed — see install log`);
  }
  if (entry.buildStatus === 'passed') lines.push('dist built successfully');
  if (entry.buildStatus === 'failed') lines.push('build failed — see build log');
  if (entry.serveStatus === 'missing') {
    lines.push('no runnable local example was detected');
    lines.push('inspect examples/ and README');
    lines.push('likely next step: create a generated wrapper that imports dist files');
  }
  if (entry.status === 'built-no-demo') {
    lines.push('package built but demo page not responding');
  }
  return lines;
}

async function main() {
  await ensureRunnerDirs();

  const runners = await readJson(PUBLIC_RUNNERS, []);
  const runnable = runners.filter((r) => r.runnable);
  await ensureRunnerCopies(runnable);

  const installStatus = (await readJson(INSTALL_STATUS_FILE, {})) ?? {};
  const liveStatus = await readRunnerStatus();

  const audited = [];
  let packageRunners = 0;
  let installed = 0;
  let buildSucceeded = 0;
  let running = 0;
  let manualStepNeeded = 0;

  for (const runner of runnable) {
    const repoPath = join(RUNNERS_REPOS, runner.id);
    const pkg = await readPackageJson(repoPath);

    if (!pkg && runner.runnerType !== 'package' && !runner.packageStyle) {
      continue;
    }

    const audit = pkg
      ? await auditPackageRunner(repoPath, runner.id, pkg, { port: runner.port })
      : null;

    if (!audit?.packageStyle && runner.runnerType !== 'package') continue;

    packageRunners += 1;
    const installEntry = installStatus[runner.id];
    const installStatusLabel = installEntry?.installed
      ? (installEntry.skipped ? 'skipped' : 'passed')
      : (installEntry ? 'failed' : (audit?.installed ? 'passed' : 'not-run'));

    if (installStatusLabel === 'passed' || installStatusLabel === 'skipped') installed += 1;

    const live = liveStatus[runner.id] ?? {};
    const health = await assessRunnerHealth(
      { ...runner, localDevUrl: runner.expectedUrl ?? runner.localDevUrl },
      live,
    );

    const buildStatus = live.buildStatus
      ?? (audit?.built ? 'passed' : (audit?.requiresBuild ? 'not-run' : 'n/a'));
    if (buildStatus === 'passed') buildSucceeded += 1;

    const serveStatus = live.serveStatus
      ?? (audit?.serveTarget ? 'not-run' : 'missing');

    let status = health.status;
    if (live.status) status = live.status;
    if (status === 'running' && !health.responding) {
      status = live.buildStatus === 'passed' && serveStatus === 'missing'
        ? 'built-no-demo'
        : 'process-alive-port-dead';
    }
    if (status === 'built-no-demo') manualStepNeeded += 1;
    if (status === 'manual-step-needed') manualStepNeeded += 1;
    if (status === 'running' && health.responding) running += 1;

    const entry = {
      id: runner.id,
      repoPath: `.raw-reference-runners/repos/${runner.id}`,
      packageManager: audit?.packageManager ?? runner.packageManager,
      installCommand: audit?.installCommand ?? runner.installCommand,
      installStatus: installStatusLabel,
      devScript: audit?.devScript ?? null,
      devScriptKind: audit?.devScriptKind ?? null,
      buildCommand: audit?.buildCommand ?? runner.buildCommand ?? null,
      buildStatus,
      serveTarget: audit?.serveTarget ?? runner.serveTarget ?? null,
      serveStatus,
      expectedUrl: runner.expectedUrl ?? audit?.expectedUrl ?? runner.localDevUrl,
      responding: health.responding,
      status,
      generatedWrapper: audit?.generatedWrapper ?? runner.generatedWrapper ?? false,
      manualInstructions: manualInstructionsFor({
        installStatus: installStatusLabel,
        installCommand: audit?.installCommand,
        buildStatus,
        serveStatus,
        status,
      }),
    };

    audited.push(entry);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      packageRunners,
      installed,
      buildSucceeded,
      running,
      manualStepNeeded,
    },
    runners: audited,
  };

  await writeJson(PACKAGE_RUNNER_REPORT, report);

  console.log('Package runner audit complete');
  console.log('───────────────────────────');
  console.log(`Package runners:   ${packageRunners}`);
  console.log(`Installed:         ${installed}`);
  console.log(`Build succeeded:   ${buildSucceeded}`);
  console.log(`Running:           ${running}`);
  console.log(`Manual step needed:${manualStepNeeded}`);
  console.log(`Report:            ${PACKAGE_RUNNER_REPORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
