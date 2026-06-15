#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { access, open, readFile } from 'node:fs/promises';
import http from 'node:http';
import { join } from 'node:path';
import {
  PUBLIC_RUNNERS,
  PIDS_FILE,
  STATUS_FILE,
  RUNNERS_REPOS,
  RUNNERS_LOGS,
  VAULT_GITHUB,
  copyRepo,
  ensureRunnerDirs,
  exportPublicStatus,
  readJson,
  writeJson,
} from './lib/reference-runners-shared.mjs';

function parseArgs(argv) {
  const opts = { all: false, top: 5, ids: [] };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--all') opts.all = true;
    else if (arg === '--id') opts.ids.push(argv[++i]);
    else if (arg === '--top') opts.top = Number(argv[++i] ?? 5);
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

  if (runner.runnerType === 'static') {
    const target = runner.serveDir === '.' ? '.' : runner.serveDir;
    return {
      cmd: 'npx',
      args: ['--yes', 'serve', target, '-l', port, '--no-clipboard'],
      env,
      cwd,
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
    };
  }

  if (pm === 'pnpm') {
    return {
      cmd: 'pnpm',
      args: ['run', script, '--', '--host', '127.0.0.1', '--port', port],
      env,
      cwd,
    };
  }
  if (pm === 'yarn') {
    return {
      cmd: 'yarn',
      args: [script, '--host', '127.0.0.1', '--port', port],
      env,
      cwd,
    };
  }

  return {
    cmd: 'npm',
    args: ['run', script, '--', '--host', '127.0.0.1', '--port', port],
    env,
    cwd,
  };
}

async function waitForPort(port, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        res.resume();
        resolve(true);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(1500, () => {
        req.destroy();
        resolve(false);
      });
    });
    if (ok) return true;
    await new Promise((r) => setTimeout(r, 800));
  }
  return false;
}

async function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function startRunner(runner, statusMap, pidsMap) {
  const src = join(VAULT_GITHUB, runner.id);
  const dest = join(RUNNERS_REPOS, runner.id);
  const logPath = join(RUNNERS_LOGS, `${runner.id}.log`);

  console.log(`\n▶ ${runner.id} (port ${runner.port})`);

  try {
    await access(src);
  } catch {
    statusMap[runner.id] = {
      id: runner.id,
      status: 'failed',
      port: runner.port,
      localDevUrl: runner.localDevUrl,
      pid: null,
      logFile: logPath,
      error: 'Source repo not found in vault',
    };
    return;
  }

  const existingPid = pidsMap[runner.id];
  if (existingPid && (await isRunning(existingPid))) {
    console.log(`  Already running (pid ${existingPid})`);
    statusMap[runner.id] = {
      id: runner.id,
      status: 'running',
      port: runner.port,
      localDevUrl: runner.localDevUrl,
      pid: existingPid,
      logFile: logPath,
    };
    return;
  }

  console.log('  Copying repo to runner workspace…');
  await copyRepo(src, dest);

  let pkgScripts = {};
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
        localDevUrl: runner.localDevUrl,
        pid: null,
        logFile: logPath,
        error: 'Install failed',
      };
      console.log('  ✗ Install failed');
      return;
    }
  }

  const { cmd, args, env, cwd } = buildStartCommand(runner, dest, pkgScripts);
  const logFd = await open(logPath, 'a');

  console.log(`  Starting: ${cmd} ${args.join(' ')}`);

  const child = spawn(cmd, args, {
    cwd,
    env,
    detached: true,
    stdio: ['ignore', logFd.fd, logFd.fd],
  });

  child.unref();
  pidsMap[runner.id] = child.pid;

  console.log(`  Waiting for http://127.0.0.1:${runner.port} …`);
  const up = await waitForPort(runner.port);

  statusMap[runner.id] = {
    id: runner.id,
    status: up ? 'running' : 'start-timeout',
    port: runner.port,
    localDevUrl: runner.localDevUrl,
    pid: child.pid,
    logFile: logPath,
    error: up ? null : 'Port did not respond in time (process may still be starting)',
  };

  if (up) {
    console.log(`  ✓ ${runner.localDevUrl}`);
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
  const statusMap = (await readJson(STATUS_FILE, {})) ?? {};

  console.log(`Starting ${selected.length} runner(s)…`);

  for (const runner of selected) {
    await startRunner(runner, statusMap, pidsMap);
  }

  await writeJson(PIDS_FILE, pidsMap);
  await writeJson(STATUS_FILE, statusMap);
  await exportPublicStatus(statusMap);

  console.log('\nDone. Check status: node scripts/status-reference-runners.mjs');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
