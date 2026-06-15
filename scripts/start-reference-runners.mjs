#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { openSync } from 'node:fs';
import { access, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PUBLIC_RUNNERS,
  PIDS_FILE,
  RUNNERS_REPOS,
  RUNNERS_LOGS,
  VAULT_GITHUB,
  assessRunnerHealth,
  buildLiquidDomPackages,
  buildLiquidDomStartCommand,
  copyRepo,
  ensureRunnerDirs,
  expectedRunnerUrl,
  findUnexpectedPortsInLog,
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

function pmInstall(runner) {
  const cwd = join(RUNNERS_REPOS, runner.id);
  const map = {
    pnpm: ['pnpm', 'install'],
    yarn: ['yarn', 'install'],
    bun: ['bun', 'install'],
    npm: ['npm', 'install'],
  };
  const cmd = map[runner.packageManager] ?? map.npm;
  console.log(`  Installing (${cmd[0]})…`);
  const result = spawnSync(cmd[0], cmd.slice(1), { cwd, stdio: 'inherit', env: process.env });
  return result.status === 0;
}

function buildStartCommand(runner, cwd, pkgScripts) {
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

  if (runner.runnerType === 'static') {
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
      startMode: 'normal',
    };
  }

  if (pm === 'pnpm') {
    return {
      cmd: 'pnpm',
      args: ['run', script, '--', '--host', '127.0.0.1', '--port', port, '--strictPort'],
      env,
      cwd,
      startMode: 'normal',
    };
  }
  if (pm === 'yarn') {
    return {
      cmd: 'yarn',
      args: [script, '--host', '127.0.0.1', '--port', port, '--strictPort'],
      env,
      cwd,
      startMode: 'normal',
    };
  }

  return {
    cmd: 'npm',
    args: ['run', script, '--', '--host', '127.0.0.1', '--port', port, '--strictPort'],
    env,
    cwd,
    startMode: 'normal',
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
      pid: health.pid,
      responding: true,
      logFile: logPath,
      startMode: statusMap[runner.id]?.startMode ?? 'normal',
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
    statusMap[runner.id] = {
      id: runner.id,
      status: 'port-in-use',
      port: runner.port,
      localDevUrl: expectedUrl,
      pid: listenerPid,
      responding: await isHttpResponding(expectedUrl),
      logFile: logPath,
      error: `Port ${runner.port} is already in use by pid ${listenerPid}`,
      notes: [`Port ${runner.port} occupied by pid ${listenerPid}`],
    };
    console.log(`  ✗ Port ${runner.port} already in use by pid ${listenerPid}`);
    return;
  }

  console.log('  Copying repo to runner workspace…');
  await copyRepo(src, dest);

  let pkgScripts = {};
  let builtLiquidDomLayout = false;
  if (runner.runnerType === 'package') {
    try {
      const pkg = JSON.parse(await readFile(join(dest, 'package.json'), 'utf8'));
      pkgScripts = pkg.scripts ?? {};
    } catch { /* no package.json */ }

    const ok = pmInstall(runner);
    if (!ok) {
      statusMap[runner.id] = {
        id: runner.id,
        status: 'install-failed',
        port: runner.port,
        localDevUrl: expectedUrl,
        pid: null,
        responding: false,
        logFile: logPath,
        error: 'Install failed',
        notes: ['Install failed'],
      };
      console.log('  ✗ Install failed');
      return;
    }

    if (runner.id === 'liquid-dom') {
      console.log('  Building liquid-dom workspace packages…');
      const built = await buildLiquidDomPackages(dest);
      builtLiquidDomLayout = built;
      if (!built) {
        statusMap[runner.id] = {
          id: runner.id,
          status: 'build-failed',
          port: runner.port,
          localDevUrl: expectedUrl,
          pid: null,
          responding: false,
          logFile: logPath,
          error: 'liquid-dom workspace build failed',
          notes: ['@liquid-dom/layout/core/react build failed'],
          builtLiquidDomLayout: false,
        };
        console.log('  ✗ liquid-dom workspace build failed');
        return;
      }
    }
  }

  const { cmd, args, env, cwd, startMode = 'normal' } = buildStartCommand(runner, dest, pkgScripts);
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

  console.log(`  Waiting for ${expectedUrl} …`);
  const up = await waitForHttp(expectedUrl, 45000, 800);
  const logContent = await readLogTail(logPath);
  const unexpectedUrls = findUnexpectedPortsInLog(logContent, runner.port);

  let status = up ? 'running' : 'start-timeout';
  let error = up ? null : 'Port did not respond in time';
  const notes = [];

  if (!up && unexpectedUrls.length) {
    status = 'wrong-port';
    error = `Expected ${expectedUrl}; observed in log: ${unexpectedUrls.join(', ')}`;
    notes.push(error);
  } else if (!up) {
    notes.push('Port did not respond in time (process may still be starting)');
  }

  statusMap[runner.id] = {
    id: runner.id,
    status,
    port: runner.port,
    localDevUrl: expectedUrl,
    pid: child.pid,
    responding: up,
    logFile: logPath,
    error,
    notes,
    startMode,
    observedUrl: status === 'wrong-port' ? (unexpectedUrls[0] ?? null) : null,
    builtLiquidDomLayout: runner.id === 'liquid-dom' ? builtLiquidDomLayout : undefined,
  };

  if (up) {
    console.log(`  ✓ ${expectedUrl}`);
  } else if (status === 'wrong-port') {
    console.log(`  ✗ Started on unexpected port — check ${logPath}`);
    console.log(`    ${error}`);
  } else {
    console.log(`  ⚠ Started pid ${child.pid} but port not responding yet — check ${logPath}`);
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
