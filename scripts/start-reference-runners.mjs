#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { openSync } from 'node:fs';
import { access, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INSTALL_STATUS_FILE,
  PUBLIC_RUNNERS,
  PIDS_FILE,
  RUNNERS_LOGS,
  RUNNERS_REPOS,
  VAULT_GITHUB,
  assessRunnerHealth,
  buildLiquidDomPackages,
  buildLiquidDomStartCommand,
  buildServeStartCommand,
  copyRepo,
  distLooksBuilt,
  ensureRunnerDirs,
  expectedRunnerUrl,
  findUnexpectedPortsInLog,
  generateNoDemoWrapper,
  getListeningPid,
  hasNodeModules,
  installCommandFor,
  isHttpResponding,
  isPidAlive,
  killPid,
  listDistFiles,
  readJson,
  readPackageJson,
  readRunnerStatus,
  resolveServeTarget,
  runPackageBuild,
  runPackageInstall,
  runWatchUntilDist,
  waitForHttp,
  writeJson,
  writeRunnerStatus,
} from './lib/reference-runners-shared.mjs';

function parseArgs(argv) {
  const opts = { all: false, top: 5, ids: [], force: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--all') opts.all = true;
    else if (arg === '--id') opts.ids.push(argv[++i]);
    else if (arg === '--top') opts.top = Number(argv[++i] ?? 5);
    else if (arg === '--force') opts.force = true;
  }
  return opts;
}

function selectRunners(runners, opts) {
  const runnable = runners.filter((r) => r.runnable);
  if (opts.ids.length) {
    return runnable.filter((r) => opts.ids.includes(r.id));
  }
  if (opts.all) return runnable;
  return runnable.slice(0, opts.top);
}

async function ensureInstalled(runner, dest, statusMap) {
  const skip = process.env.RRL_SKIP_INSTALL === '1';
  const force = process.env.RRL_FORCE_INSTALL === '1';
  const logPath = join(RUNNERS_LOGS, `${runner.id}.install.log`);
  const expectedUrl = expectedRunnerUrl(runner);

  if (skip) {
    if (!(await hasNodeModules(dest))) {
      statusMap[runner.id] = {
        id: runner.id,
        status: 'install-failed',
        port: runner.port,
        localDevUrl: expectedUrl,
        expectedUrl,
        pid: null,
        responding: false,
        logFile: join(RUNNERS_LOGS, `${runner.id}.log`),
        error: 'Dependencies not installed (RRL_SKIP_INSTALL=1)',
        notes: ['Run node scripts/install-reference-runners.mjs'],
      };
      return false;
    }
    return true;
  }

  const installStatus = (await readJson(INSTALL_STATUS_FILE, {})) ?? {};
  const prior = installStatus[runner.id];
  if (!force && prior?.installed && (await hasNodeModules(dest))) {
    return true;
  }
  if (!force && !runner.requiresInstall && runner.runnerType === 'static') {
    return true;
  }
  if (!force && (await hasNodeModules(dest)) && runner.runnerType !== 'package') {
    return true;
  }

  const pm = runner.packageManager === 'unknown' || runner.packageManager === 'npx'
    ? 'npm'
    : runner.packageManager;
  console.log(`  Installing (${installCommandFor(pm)})…`);
  statusMap[runner.id] = {
    ...statusMap[runner.id],
    id: runner.id,
    status: 'installing',
    port: runner.port,
    localDevUrl: expectedUrl,
    expectedUrl,
  };

  const result = await runPackageInstall(dest, pm, logPath);
  if (result.exitCode !== 0) {
    statusMap[runner.id] = {
      id: runner.id,
      status: 'install-failed',
      port: runner.port,
      localDevUrl: expectedUrl,
      expectedUrl,
      pid: null,
      responding: false,
      logFile: join(RUNNERS_LOGS, `${runner.id}.log`),
      installLogFile: logPath,
      error: 'Install failed',
      notes: ['Install failed — see install log'],
      installStatus: 'failed',
    };
    console.log('  ✗ Install failed');
    return false;
  }
  return true;
}

async function ensureBuilt(runner, dest, pkg, statusMap) {
  const force = process.env.RRL_FORCE_BUILD === '1';
  const expectedUrl = expectedRunnerUrl(runner);
  const logPath = join(RUNNERS_LOGS, `${runner.id}.build.log`);
  const pm = runner.packageManager === 'unknown' || runner.packageManager === 'npx'
    ? 'npm'
    : runner.packageManager;

  if (!runner.requiresBuild && runner.startMode !== 'build-then-serve-example') {
    return { ok: true, built: false };
  }

  if (!force && (await distLooksBuilt(dest, pkg))) {
    return { ok: true, built: true, skipped: true };
  }

  const scripts = pkg?.scripts ?? {};
  if (scripts.build) {
    console.log(`  Building (${runner.buildCommand ?? 'npm run build'})…`);
    const result = await runPackageBuild(dest, pm, 'build', logPath);
    if (result.exitCode !== 0) {
      statusMap[runner.id] = {
        id: runner.id,
        status: 'build-failed',
        port: runner.port,
        localDevUrl: expectedUrl,
        expectedUrl,
        pid: null,
        responding: false,
        logFile: join(RUNNERS_LOGS, `${runner.id}.log`),
        buildLogFile: logPath,
        error: 'Build failed',
        notes: ['Build failed — see build log'],
        buildStatus: 'failed',
      };
      console.log('  ✗ Build failed');
      return { ok: false, built: false };
    }
    return { ok: true, built: true, buildStatus: 'passed' };
  }

  if (scripts.dev && runner.buildOnlyDevScript) {
    console.log('  Running dev watcher briefly until dist appears…');
    const result = await runWatchUntilDist(dest, pm, 'dev', logPath);
    if (!result.built) {
      statusMap[runner.id] = {
        id: runner.id,
        status: 'build-failed',
        port: runner.port,
        localDevUrl: expectedUrl,
        expectedUrl,
        pid: null,
        responding: false,
        logFile: join(RUNNERS_LOGS, `${runner.id}.log`),
        buildLogFile: logPath,
        error: 'Watch build did not produce dist in time',
        notes: ['Dev watcher did not produce dist files'],
        buildStatus: 'failed',
      };
      console.log('  ✗ Watch build timed out');
      return { ok: false, built: false };
    }
    return { ok: true, built: true, buildStatus: 'passed' };
  }

  return { ok: true, built: false };
}

function buildStartCommand(runner, cwd, pkgScripts, serveInfo) {
  const port = String(runner.port);
  const env = {
    ...process.env,
    PORT: port,
    VITE_PORT: port,
    HOST: '127.0.0.1',
  };

  if (runner.id === 'liquid-dom') {
    return buildLiquidDomStartCommand(cwd, runner.port);
  }

  if (runner.startMode === 'build-then-serve-example' || serveInfo) {
    const serveDir = serveInfo?.serveDir ?? runner.serveDir ?? '.';
    const serveCwd = serveInfo?.serveCwd ?? cwd;
    return buildServeStartCommand(serveDir, runner.port, serveCwd);
  }

  if (runner.runnerType === 'static' || runner.startMode === 'static-serve') {
    const target = runner.serveDir === '.' ? '.' : runner.serveDir;
    return {
      cmd: 'npx',
      args: ['--yes', 'serve', target, '-l', port, '--no-clipboard'],
      env,
      cwd,
      startMode: 'static-serve',
    };
  }

  const script = runner.recommendedScript;
  const scriptBody = pkgScripts?.[script] ?? '';
  const pm = runner.packageManager === 'unknown' ? 'npm' : runner.packageManager;

  if (scriptBody.includes('live-server')) {
    const dirMatch = scriptBody.match(/live-server\s+(\S+)/);
    const dir = dirMatch?.[1] ?? '.';
    return {
      cmd: 'npx',
      args: ['--yes', 'live-server', dir, `--port=${port}`, '--host=127.0.0.1', '--no-browser'],
      env,
      cwd,
      startMode: 'web-dev-server',
    };
  }

  if (pm === 'pnpm') {
    return {
      cmd: 'pnpm',
      args: ['run', script, '--', '--host', '127.0.0.1', '--port', port, '--strictPort'],
      env,
      cwd,
      startMode: 'web-dev-server',
    };
  }
  if (pm === 'yarn') {
    return {
      cmd: 'yarn',
      args: [script, '--host', '127.0.0.1', '--port', port, '--strictPort'],
      env,
      cwd,
      startMode: 'web-dev-server',
    };
  }

  return {
    cmd: 'npm',
    args: ['run', script, '--', '--host', '127.0.0.1', '--port', port, '--strictPort'],
    env,
    cwd,
    startMode: 'web-dev-server',
  };
}

async function readLogTail(logPath) {
  try {
    return await readFile(logPath, 'utf8');
  } catch {
    return '';
  }
}

export async function startRunner(runner, statusMap, pidsMap, { force = false } = {}) {
  const src = join(VAULT_GITHUB, runner.id);
  const dest = join(RUNNERS_REPOS, runner.id);
  const logPath = join(RUNNERS_LOGS, `${runner.id}.log`);
  const expectedUrl = expectedRunnerUrl(runner);

  console.log(`\n▶ ${runner.id} (port ${runner.port})`);

  try {
    await access(src);
  } catch {
    statusMap[runner.id] = {
      id: runner.id,
      status: 'failed',
      port: runner.port,
      localDevUrl: expectedUrl,
      expectedUrl,
      pid: null,
      responding: false,
      logFile: logPath,
      error: 'Source repo not found in vault',
      notes: ['Source repo not found in vault'],
    };
    return;
  }

  const existingPid = pidsMap[runner.id] ?? statusMap[runner.id]?.pid ?? null;
  const health = await assessRunnerHealth(runner, { pid: existingPid, ...statusMap[runner.id] });

  if (!force && health.status === 'running' && health.responding) {
    console.log(`  Already healthy on ${expectedUrl} (pid ${health.pid ?? 'unknown'})`);
    statusMap[runner.id] = {
      ...statusMap[runner.id],
      id: runner.id,
      status: 'running',
      port: runner.port,
      localDevUrl: expectedUrl,
      expectedUrl,
      pid: health.pid,
      responding: true,
      logFile: logPath,
      startMode: statusMap[runner.id]?.startMode ?? runner.startMode ?? 'normal',
    };
    if (health.pid) pidsMap[runner.id] = health.pid;
    return;
  }

  if (existingPid && (await isPidAlive(existingPid)) && !health.responding) {
    console.log(`  Stale PID ${existingPid} — process alive but port dead; restarting…`);
    await killPid(existingPid);
    delete pidsMap[runner.id];
  }

  const listenerPid = getListeningPid(runner.port);
  if (listenerPid && listenerPid !== existingPid) {
    const responding = await isHttpResponding(expectedUrl);
    statusMap[runner.id] = {
      id: runner.id,
      status: responding ? 'running' : 'port-in-use',
      port: runner.port,
      localDevUrl: expectedUrl,
      expectedUrl,
      pid: listenerPid,
      responding,
      logFile: logPath,
      error: `Port ${runner.port} is already in use by pid ${listenerPid}`,
      notes: [`Port ${runner.port} occupied by pid ${listenerPid}`],
    };
    console.log(`  ${responding ? '✓' : '✗'} Port ${runner.port} already in use by pid ${listenerPid}`);
    return;
  }

  console.log('  Copying repo to runner workspace…');
  await copyRepo(src, dest);

  const pkg = await readPackageJson(dest);
  const pkgScripts = pkg?.scripts ?? {};
  let builtLiquidDomLayout = false;
  let buildStatus = null;
  let serveInfo = null;
  let generatedWrapper = false;

  if (runner.runnerType === 'package' || runner.packageStyle || runner.requiresInstall) {
    const installed = await ensureInstalled(runner, dest, statusMap);
    if (!installed) return;

    if (runner.id === 'liquid-dom') {
      console.log('  Building liquid-dom workspace packages…');
      const built = await buildLiquidDomPackages(dest);
      builtLiquidDomLayout = built;
      buildStatus = built ? 'passed' : 'failed';
      if (!built) {
        statusMap[runner.id] = {
          id: runner.id,
          status: 'build-failed',
          port: runner.port,
          localDevUrl: expectedUrl,
          expectedUrl,
          pid: null,
          responding: false,
          logFile: logPath,
          error: 'liquid-dom workspace build failed',
          notes: ['@liquid-dom/layout/core/react build failed'],
          builtLiquidDomLayout: false,
          buildStatus: 'failed',
        };
        console.log('  ✗ liquid-dom workspace build failed');
        return;
      }
    } else if (runner.startMode === 'build-then-serve-example' || runner.requiresBuild) {
      const buildResult = await ensureBuilt(runner, dest, pkg, statusMap);
      if (!buildResult.ok) return;
      buildStatus = buildResult.buildStatus ?? (buildResult.built ? 'passed' : 'n/a');
    }
  }

  if (runner.startMode === 'build-then-serve-example') {
    serveInfo = await resolveServeTarget(dest, runner.id);
    if (!serveInfo) {
      const builtFiles = await listDistFiles(dest);
      serveInfo = await generateNoDemoWrapper(runner.id, dest, builtFiles);
      generatedWrapper = true;
    }
    console.log(`  Serving ${serveInfo.serveTarget ?? serveInfo.serveDir}…`);
  }

  const { cmd, args, env, cwd, startMode = runner.startMode ?? 'normal' } = buildStartCommand(
    runner,
    dest,
    pkgScripts,
    serveInfo,
  );
  await writeFile(logPath, `--- start ${new Date().toISOString()} pid pending ---\n`);
  const logFd = openSync(logPath, 'a');

  console.log(`  Starting: ${cmd} ${args.join(' ')}`);

  const child = spawn(cmd, args, {
    cwd,
    env,
    detached: true,
    stdio: ['ignore', logFd, logFd],
  });

  child.unref();
  pidsMap[runner.id] = child.pid;

  const checkUrl = expectedUrl;
  console.log(`  Waiting for ${checkUrl} …`);
  const up = await waitForHttp(checkUrl, 45000, 800);
  const logContent = await readLogTail(logPath);
  const unexpectedUrls = findUnexpectedPortsInLog(logContent, runner.port);

  let status;
  let error = null;
  const notes = [];

  if (up && generatedWrapper) {
    status = 'built-no-demo';
  } else if (up) {
    status = 'running';
  } else if (generatedWrapper || serveInfo?.serveTarget === 'generated-wrapper') {
    status = 'built-no-demo';
    error = 'Package built but no runnable example; serving status wrapper';
    notes.push('No runnable local example detected — generated wrapper served');
  } else if (buildStatus === 'passed' && runner.startMode === 'build-then-serve-example') {
    status = 'built-no-demo';
    error = 'Build succeeded but expected demo URL is not responding';
    notes.push('Inspect examples/ and README to wire a local example');
  } else if (unexpectedUrls.length) {
    status = 'wrong-port';
    error = `Expected ${checkUrl}; observed in log: ${unexpectedUrls.join(', ')}`;
    notes.push(error);
  } else if (child.pid && !(await isHttpResponding(checkUrl))) {
    status = 'start-timeout';
    error = 'Port did not respond in time';
    notes.push('Port did not respond in time (process may still be starting)');
  } else {
    status = 'start-timeout';
    error = 'Port did not respond in time';
    notes.push('Port did not respond in time');
  }

  const responding = up;

  statusMap[runner.id] = {
    id: runner.id,
    status: up && generatedWrapper ? 'built-no-demo' : (up ? 'running' : status),
    port: runner.port,
    localDevUrl: expectedUrl,
    expectedUrl,
    pid: child.pid,
    responding,
    logFile: logPath,
    error,
    notes,
    startMode: serveInfo ? 'build-then-serve-example' : startMode,
    observedUrl: status === 'wrong-port' ? (unexpectedUrls[0] ?? null) : null,
    builtLiquidDomLayout: runner.id === 'liquid-dom' ? builtLiquidDomLayout : undefined,
    buildStatus,
    serveTarget: serveInfo?.serveTarget ?? runner.serveTarget ?? null,
    serveStatus: serveInfo ? (responding ? 'passed' : (generatedWrapper ? 'missing' : 'failed')) : null,
    generatedWrapper: generatedWrapper || serveInfo?.generatedWrapper || false,
    installStatus: 'passed',
  };

  if (responding) {
    console.log(`  ✓ ${checkUrl}`);
  } else if (status === 'built-no-demo') {
    console.log(`  ⚠ Built but demo not responding — ${error}`);
  } else if (status === 'wrong-port') {
    console.log(`  ✗ Started on unexpected port — check ${logPath}`);
    console.log(`    ${error}`);
  } else {
    console.log(`  ⚠ Started pid ${child.pid} but not responding yet — check ${logPath}`);
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  await ensureRunnerDirs();

  const runners = await readJson(PUBLIC_RUNNERS, []);
  if (!runners.length) {
    console.error('No runners found. Run: node scripts/discover-reference-runners.mjs');
    process.exit(1);
  }

  const selected = selectRunners(runners, opts);
  if (!selected.length) {
    console.error('No matching runnable candidates.');
    process.exit(1);
  }

  const pidsMap = (await readJson(PIDS_FILE, {})) ?? {};
  const statusMap = await readRunnerStatus();

  console.log(`Starting ${selected.length} runner(s)…`);

  for (const runner of selected) {
    await startRunner(runner, statusMap, pidsMap, { force: opts.force });
  }

  await writeJson(PIDS_FILE, pidsMap);
  await writeRunnerStatus(statusMap);

  console.log('\nDone. Check status: node scripts/status-reference-runners.mjs');
}

const isMain = resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
