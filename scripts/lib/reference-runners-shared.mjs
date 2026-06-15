import { spawnSync } from 'node:child_process';
import http from 'node:http';
import https from 'node:https';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
export const VAULT_GITHUB = join(ROOT, '_reference_vault/reference-library/github');
export const RUNNERS_ROOT = join(ROOT, '.raw-reference-runners');
export const RUNNERS_REPOS = join(RUNNERS_ROOT, 'repos');
export const RUNNERS_LOGS = join(RUNNERS_ROOT, 'logs');
export const PIDS_FILE = join(RUNNERS_ROOT, 'pids.json');
export const STATUS_FILE = join(RUNNERS_ROOT, 'runner-status.json');
export const PUBLIC_RUNNERS = join(ROOT, 'public/raw-reference-lab/reference-runners.json');
export const PUBLIC_STATUS = join(ROOT, 'public/raw-reference-lab/runner-status.json');
export const DEV_ALL_REPORT = join(ROOT, 'public/raw-reference-lab/repair-reports/runner-dev-all-report.json');
export const MAIN_APP_PID_FILE = join(RUNNERS_ROOT, 'main-app.json');
export const MAIN_APP_LOG = join(RUNNERS_LOGS, 'main-vite.log');
export const MAIN_APP_URL = 'http://127.0.0.1:5173/raw-reference-lab/';
export const MAIN_APP_PORT = 5173;

export const BASE_PORT = 5310;
export const RUNNABLE_SCRIPT_NAMES = [
  'dev',
  'start',
  'demo',
  'docs',
  'playground',
  'storybook',
  'preview',
  'serve',
];

export const DEMO_DIRS = [
  'demo',
  'demos',
  'examples',
  'example',
  'playground',
  'docs',
  'site',
  'website',
];

export const PRIORITY_IDS = [
  'liquidGL',
  'archisvaze-liquid-glass',
  'liquid-glass-js',
  'glassmorphism-template',
  'liquid-dom',
  'glass-refraction',
  'glassmorphism',
  '7-Aero-Stylesheet',
];

const SKIP_COPY = new Set(['node_modules', '.git', '.turbo', 'dist', '.next']);

export async function ensureRunnerDirs() {
  await mkdir(RUNNERS_REPOS, { recursive: true });
  await mkdir(RUNNERS_LOGS, { recursive: true });
}

export async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

export async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function exportPublicStatus(status) {
  await writeJson(PUBLIC_STATUS, status);
}

export function shouldSkipCopy(name) {
  return SKIP_COPY.has(name);
}

export async function copyRepo(src, dest) {
  await mkdir(dest, { recursive: true });
  await cp(src, dest, {
    recursive: true,
    filter: (source) => {
      const parts = source.split(/[/\\]/);
      return !parts.some((p) => SKIP_COPY.has(p));
    },
  });
}

export async function detectPackageManagerAsync(repoPath, pkg) {
  if (pkg?.packageManager?.startsWith('pnpm')) return 'pnpm';
  if (pkg?.packageManager?.startsWith('yarn')) return 'yarn';
  if (pkg?.packageManager?.startsWith('bun')) return 'bun';
  const { access } = await import('node:fs/promises');
  for (const [file, pm] of [
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['bun.lockb', 'bun'],
    ['package-lock.json', 'npm'],
  ]) {
    try {
      await access(join(repoPath, file));
      return pm;
    } catch { /* next */ }
  }
  return 'npm';
}

export function isWatchOnlyDev(command) {
  const cmd = command.toLowerCase();
  if (cmd.includes('vite') || cmd.includes('live-server') || cmd.includes('next dev')) {
    return false;
  }
  if (cmd.includes('webpack serve') || cmd.includes('webpack-dev-server')) return false;
  if (cmd.includes('storybook')) return false;
  if (cmd.includes('watch') && !cmd.includes('dev server')) return true;
  if (cmd.includes('tsup') && cmd.includes('watch')) return true;
  if (cmd.includes('esbuild') && cmd.includes('watch')) return true;
  return false;
}

export function pickRunnableScripts(scripts = {}) {
  return RUNNABLE_SCRIPT_NAMES.filter((name) => {
    const cmd = scripts[name];
    if (!cmd) return false;
    if (name === 'dev' && isWatchOnlyDev(cmd)) return false;
    return true;
  });
}

export function pickRecommendedScript(scripts = {}, id) {
  if (id === 'liquid-dom' && scripts['dev:minimal']) return 'dev:minimal';
  const available = pickRunnableScripts(scripts);
  for (const name of ['dev', 'demo', 'start', 'preview', 'serve', 'docs', 'playground', 'storybook']) {
    if (available.includes(name)) return name;
  }
  for (const name of Object.keys(scripts)) {
    if (name.startsWith('dev:') && !isWatchOnlyDev(scripts[name])) return name;
  }
  return available[0] ?? null;
}

export async function findStaticServeDir(repoPath) {
  const { access, stat } = await import('node:fs/promises');
  try {
    await access(join(repoPath, 'index.html'));
    return '.';
  } catch { /* continue */ }

  for (const dir of DEMO_DIRS) {
    const full = join(repoPath, dir);
    try {
      const s = await stat(full);
      if (!s.isDirectory()) continue;
      try {
        await access(join(full, 'index.html'));
        return dir;
      } catch { /* subdir search */ }
      const { readdir } = await import('node:fs/promises');
      const subs = await readdir(full, { withFileTypes: true });
      for (const sub of subs) {
        if (!sub.isDirectory()) continue;
        try {
          await access(join(full, sub.name, 'index.html'));
          return `${dir}/${sub.name}`;
        } catch { /* next */ }
      }
    } catch { /* next */ }
  }
  return null;
}

export function githubSourceUrl(id) {
  const map = {
    liquidGL: 'https://github.com/naughtyduk/liquidGL',
    'liquid-glass-react': 'https://github.com/rdev/liquid-glass-react',
    'glass-refraction': 'https://github.com/Z1Code/glass-refraction',
    'liquid-dom': 'https://github.com/AndrewPrifer/liquid-dom',
    'liquid-glass-js': 'https://github.com/dashersw/liquid-glass-js',
    'archisvaze-liquid-glass': 'https://github.com/archisvaze/liquid-glass',
    '7.css': 'https://github.com/khang-nd/7.css',
    'glassmorphism-template': 'https://github.com/AADI-1331/glassmorphism-template',
  };
  return map[id] ?? null;
}

export function matchPatternsFor(id) {
  const lower = id.toLowerCase();
  const patterns = [id, lower, lower.replace(/-/g, '')];
  return [...new Set(patterns)];
}

export function expectedRunnerUrl(runner) {
  if (runner?.localDevUrl) return runner.localDevUrl;
  if (runner?.port) return `http://localhost:${runner.port}`;
  return null;
}

export function normalizeLocalUrl(url) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost') parsed.hostname = '127.0.0.1';
    return parsed.href;
  } catch {
    return url;
  }
}

export function urlVariants(url) {
  const normalized = normalizeLocalUrl(url);
  const variants = new Set([normalized]);
  try {
    const parsed = new URL(normalized);
    if (parsed.hostname === '127.0.0.1') {
      const alt = new URL(normalized);
      alt.hostname = 'localhost';
      variants.add(alt.href);
    }
  } catch { /* ignore */ }
  return [...variants];
}

export async function isPidAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export async function isHttpResponding(url, timeoutMs = 2000, { strict = false } = {}) {
  if (!url) return false;
  const candidates = strict ? [normalizeLocalUrl(url)] : urlVariants(url);
  for (const candidate of candidates) {
    const ok = await new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };
      let req;
      try {
        const parsed = new URL(candidate);
        const lib = parsed.protocol === 'https:' ? https : http;
        req = lib.get(candidate, (res) => {
          res.resume();
          finish(res.statusCode >= 200 && res.statusCode < 500);
        });
      } catch {
        finish(false);
        return;
      }
      req.on('error', () => finish(false));
      req.setTimeout(timeoutMs, () => {
        req.destroy();
        finish(false);
      });
    });
    if (ok) return true;
  }
  return false;
}

export async function waitForHttp(url, timeoutMs = 15000, intervalMs = 500) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isHttpResponding(url, Math.min(2000, intervalMs * 2))) return true;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return false;
}

export async function killPid(pid, { graceMs = 1000 } = {}) {
  if (!pid) return false;
  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    return !(await isPidAlive(pid));
  }
  await new Promise((resolve) => setTimeout(resolve, graceMs));
  if (await isPidAlive(pid)) {
    try {
      process.kill(pid, 'SIGKILL');
    } catch { /* ignore */ }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return !(await isPidAlive(pid));
}

export async function readRunnerStatus() {
  return (await readJson(STATUS_FILE, {})) ?? {};
}

export async function writeRunnerStatus(status) {
  await writeJson(STATUS_FILE, status);
  await exportPublicStatus(status);
}

export function getListeningPid(port) {
  const result = spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], {
    encoding: 'utf8',
  });
  const pids = result.stdout
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  return pids[0] ?? null;
}

export function detectUrlsInLog(logContent = '') {
  const urls = new Set();
  const patterns = [
    /https?:\/\/(127\.0\.0\.1|localhost):(\d+)\/?/gi,
    /Local:\s*(https?:\/\/[^\s]+)/gi,
  ];
  for (const pattern of patterns) {
    let match = pattern.exec(logContent);
    while (match) {
      const raw = match[1]?.startsWith('http') ? match[1] : `http://${match[1]}:${match[2]}/`;
      try {
        urls.add(normalizeLocalUrl(raw));
      } catch { /* ignore */ }
      match = pattern.exec(logContent);
    }
  }
  return [...urls];
}

export function findUnexpectedPortsInLog(logContent, expectedPort) {
  return detectUrlsInLog(logContent).filter((url) => {
    try {
      return Number(new URL(url).port) !== Number(expectedPort);
    } catch {
      return false;
    }
  });
}

export async function assessRunnerHealth(runner, live = {}) {
  const expectedUrl = expectedRunnerUrl(runner);
  const pid = live?.pid ?? null;
  const pidAlive = await isPidAlive(pid);
  const responding = await isHttpResponding(expectedUrl);

  if (responding) {
    return {
      status: 'running',
      pid: pidAlive ? pid : null,
      responding: true,
      expectedUrl,
      note: pidAlive ? null : 'port responding but tracked PID is not alive',
    };
  }

  if (pidAlive) {
    return {
      status: 'process-alive-port-dead',
      pid,
      responding: false,
      expectedUrl,
      note: 'process exists but expected port is not responding',
    };
  }

  const fallback = live?.status ?? runner?.status ?? 'not-started';
  return {
    status: fallback,
    pid: null,
    responding: false,
    expectedUrl,
    note: live?.error ?? null,
  };
}

export async function buildLiquidDomPackages(repoPath) {
  const steps = [
    ['pnpm', ['--filter', '@liquid-dom/layout', 'build']],
    ['pnpm', ['--filter', '@liquid-dom/core', 'build']],
    ['pnpm', ['--filter', '@liquid-dom/react', 'build']],
  ];
  for (const [cmd, args] of steps) {
    const result = spawnSync(cmd, args, {
      cwd: repoPath,
      stdio: 'inherit',
      env: process.env,
    });
    if (result.status !== 0) return false;
  }
  return true;
}

export function buildLiquidDomStartCommand(repoPath, port) {
  return {
    cmd: 'pnpm',
    args: ['exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    cwd: join(repoPath, 'demo/minimal'),
    env: { ...process.env },
    startMode: 'manual-liquid-dom-vite',
  };
}
