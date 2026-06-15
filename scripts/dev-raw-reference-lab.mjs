#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { openSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEV_ALL_REPORT,
  MAIN_APP_LOG,
  MAIN_APP_PID_FILE,
  MAIN_APP_PORT,
  MAIN_APP_URL,
  PUBLIC_RUNNERS,
  PIDS_FILE,
  RUNNERS_LOGS,
  assessRunnerHealth,
  ensureRunnerDirs,
  expectedRunnerUrl,
  getListeningPid,
  isHttpResponding,
  isPidAlive,
  killPid,
  readJson,
  readRunnerStatus,
  waitForHttp,
  writeJson,
  writeRunnerStatus,
} from './lib/reference-runners-shared.mjs';
import { startRunner } from './start-reference-runners.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function runNodeScript(script, label) {
  console.log(`\n▶ ${label}`);
  const result = spawnSync('node', [join(ROOT, 'scripts', script)], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`${label} failed (exit ${result.status ?? 'unknown'})`);
  }
}

function statusIcon(status, responding) {
  if (status === 'running' && responding) return '✅';
  if (status === 'skipped') return '⏭️';
  return '❌';
}

function formatRunnerLine(runner, result) {
  const icon = statusIcon(result.status, result.responding);
  const url = result.expectedUrl ?? expectedRunnerUrl(runner);
  if (result.status === 'running' && result.responding) {
    return `${icon} ${runner.id} — ${url}`;
  }
  if (result.status === 'process-alive-port-dead') {
    return `${icon} ${runner.id} — process alive but not responding on ${runner.port}`;
  }
  if (result.status === 'wrong-port') {
    return `${icon} ${runner.id} — wrong port (expected ${runner.port}${result.observedUrl ? `, saw ${result.observedUrl}` : ''})`;
  }
  if (result.status === 'start-timeout') {
    return `${icon} ${runner.id} — start timeout on ${runner.port}`;
  }
  if (result.status === 'install-failed') {
    return `${icon} ${runner.id} — install failed on ${runner.port}`;
  }
  if (result.status === 'build-failed') {
    return `${icon} ${runner.id} — build failed on ${runner.port}`;
  }
  if (result.status === 'port-in-use') {
    return `${icon} ${runner.id} — port ${runner.port} already in use`;
  }
  if (result.status === 'skipped') {
    return `${icon} ${runner.id} — skipped`;
  }
  if (result.status === 'failed') {
    return `${icon} ${runner.id} — failed on ${runner.port}`;
  }
  return `${icon} ${runner.id} — not responding on ${runner.port}`;
}

async function ensureMainApp() {
  await ensureRunnerDirs();
  await mkdirIfNeeded(RUNNERS_LOGS);

  const existing = await readJson(MAIN_APP_PID_FILE, null);
  const alreadyUp = await isHttpResponding(MAIN_APP_URL, 2000, { strict: true });
  if (alreadyUp) {
    const listenerPid = getListeningPid(MAIN_APP_PORT);
    return {
      url: MAIN_APP_URL,
      status: 'running',
      pid: listenerPid ?? existing?.pid ?? null,
      log: MAIN_APP_LOG,
      responding: true,
    };
  }

  if (existing?.pid && (await isPidAlive(existing.pid)) && !alreadyUp) {
    console.log(`  Stale main app PID ${existing.pid}; restarting…`);
    await killPid(existing.pid);
  }

  const listenerPid = getListeningPid(MAIN_APP_PORT);
  if (listenerPid && !(await isHttpResponding(MAIN_APP_URL, 2000, { strict: true }))) {
    console.log(`  Port ${MAIN_APP_PORT} in use by pid ${listenerPid} but ${MAIN_APP_URL} is not responding; restarting…`);
    await killPid(listenerPid);
  }

  if (await isHttpResponding(MAIN_APP_URL, 2000, { strict: true })) {
    return {
      url: MAIN_APP_URL,
      status: 'running',
      pid: getListeningPid(MAIN_APP_PORT) ?? existing?.pid ?? null,
      log: MAIN_APP_LOG,
      responding: true,
    };
  }

  if (listenerPid) {
    return {
      url: MAIN_APP_URL,
      status: 'failed',
      pid: listenerPid,
      log: MAIN_APP_LOG,
      responding: false,
      notes: [`Port ${MAIN_APP_PORT} occupied by pid ${listenerPid} but Raw Reference Lab path is not responding`],
    };
  }

  const logFd = openSync(MAIN_APP_LOG, 'a');
  console.log('  Starting main Vite app on port 5173…');
  const child = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(MAIN_APP_PORT), '--strictPort'], {
    cwd: ROOT,
    detached: true,
    stdio: ['ignore', logFd, logFd],
    env: process.env,
  });
  child.unref();

  const up = await waitForHttp(MAIN_APP_URL, 60000, 1000);
  await writeJson(MAIN_APP_PID_FILE, {
    pid: child.pid,
    url: MAIN_APP_URL,
    logFile: MAIN_APP_LOG,
    startedAt: new Date().toISOString(),
  });

  return {
    url: MAIN_APP_URL,
    status: up ? 'started' : 'failed',
    pid: child.pid,
    log: MAIN_APP_LOG,
    responding: up,
    notes: up ? [] : ['Main Vite app did not respond in time'],
  };
}

async function mkdirIfNeeded(path) {
  const { mkdir } = await import('node:fs/promises');
  await mkdir(path, { recursive: true });
}

async function buildReport(runners, statusMap, mainApp) {
  const runnerResults = [];
  for (const runner of runners.filter((r) => r.runnable)) {
    const live = statusMap[runner.id] ?? {};
    const health = await assessRunnerHealth(runner, live);
    runnerResults.push({
      id: runner.id,
      port: runner.port,
      expectedUrl: health.expectedUrl,
      status: health.status,
      pid: health.pid,
      responding: health.responding,
      startMode: live.startMode ?? (runner.runnerType === 'static' ? 'static-serve' : 'normal'),
      logFile: live.logFile ?? join(RUNNERS_LOGS, `${runner.id}.log`),
      notes: [
        ...(live.notes ?? []),
        ...(health.note ? [health.note] : []),
        ...(live.observedUrl ? [`observed: ${live.observedUrl}`] : []),
      ].filter(Boolean),
      observedUrl: live.observedUrl ?? null,
      builtLiquidDomLayout: live.builtLiquidDomLayout ?? null,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    mainApp,
    runners: runnerResults,
  };
}

async function maybeOpenUrl(url) {
  if (process.env.RRL_NO_OPEN === '1') return;
  const platform = process.platform;
  const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
  const args = platform === 'win32' ? ['', url] : [url];
  try {
    spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
  } catch {
    console.log(`Open: ${url}`);
  }
}

async function main() {
  console.log('Raw Reference Lab dev-all startup');
  console.log('=================================');

  runNodeScript('build-raw-reference-lab.mjs', 'Build Raw Reference Lab');
  runNodeScript('audit-raw-reference-demos.mjs', 'Audit demo health');
  runNodeScript('audit-raw-reference-links.mjs', 'Audit link targets');
  runNodeScript('discover-reference-runners.mjs', 'Discover reference runners');

  console.log('\n▶ Main Vite app');
  const mainApp = await ensureMainApp();
  if (mainApp.responding) {
    console.log(`  ✓ ${mainApp.url}`);
  } else {
    console.log(`  ✗ Main app not responding (${mainApp.status})`);
  }

  const runners = await readJson(PUBLIC_RUNNERS, []);
  const pidsMap = (await readJson(PIDS_FILE, {})) ?? {};
  const statusMap = await readRunnerStatus();

  console.log(`\n▶ Reference runners (${runners.filter((r) => r.runnable).length})`);
  for (const runner of runners.filter((r) => r.runnable)) {
    await startRunner(runner, statusMap, pidsMap);
  }

  await writeJson(PIDS_FILE, pidsMap);
  await writeRunnerStatus(statusMap);

  const report = await buildReport(runners, statusMap, mainApp);
  await writeJson(DEV_ALL_REPORT, report);

  console.log('\nRaw Reference Lab dev startup complete\n');
  console.log('Main:');
  console.log(`${mainApp.responding ? '✅' : '❌'} Raw Reference Lab — ${MAIN_APP_URL}\n`);
  console.log('Runners:');
  for (const result of report.runners) {
    const runner = runners.find((r) => r.id === result.id);
    console.log(formatRunnerLine(runner, result));
  }
  console.log(`\nOpen:\n${MAIN_APP_URL}`);

  await maybeOpenUrl(MAIN_APP_URL);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
