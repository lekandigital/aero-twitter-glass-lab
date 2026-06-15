import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import https from 'node:https';
import { cp, mkdir, readFile, writeFile, access, stat, readdir } from 'node:fs/promises';
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
export const INSTALL_STATUS_FILE = join(RUNNERS_ROOT, 'install-status.json');
export const INSTALL_REPORT = join(ROOT, 'public/raw-reference-lab/repair-reports/runner-install-report.json');
export const PACKAGE_RUNNER_REPORT = join(ROOT, 'public/raw-reference-lab/repair-reports/package-runner-report.json');
export const RUNNERS_GENERATED = join(RUNNERS_ROOT, 'generated');
export const PUBLIC_GENERATED_RUNNABLE = join(ROOT, 'public/raw-reference-lab/generated-runnable');
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
  await mkdir(RUNNERS_GENERATED, { recursive: true });
}

export const WEB_DEV_SERVER_MARKERS = [
  'vite',
  'next dev',
  'astro dev',
  'webpack serve',
  'webpack-dev-server',
  'parcel serve',
  'storybook',
  'live-server',
  'nuxt dev',
  'remix dev',
];

export const BUILD_WATCH_ONLY_MARKERS = [
  'tsup --watch',
  'tsup watch',
  'rollup -w',
  'rollup --watch',
  'tsc -w',
  'tsc --watch',
  'esbuild --watch',
  'vite build --watch',
];

export function installCommandFor(pm) {
  const map = {
    pnpm: 'pnpm install',
    yarn: 'yarn install',
    bun: 'bun install',
    npm: 'npm install',
  };
  return map[pm] ?? map.npm;
}

export function buildCommandFor(pm, script = 'build') {
  const map = {
    pnpm: `pnpm run ${script}`,
    yarn: `yarn ${script}`,
    bun: `bun run ${script}`,
    npm: `npm run ${script}`,
  };
  return map[pm] ?? map.npm;
}

export function runCommandFor(pm, script) {
  const map = {
    pnpm: ['pnpm', 'run', script],
    yarn: ['yarn', script],
    bun: ['bun', 'run', script],
    npm: ['npm', 'run', script],
  };
  return map[pm] ?? map.npm;
}

export function isWebDevServerScript(command = '') {
  const cmd = command.toLowerCase();
  if (!cmd) return false;
  if (BUILD_WATCH_ONLY_MARKERS.some((m) => cmd.includes(m))) return false;
  if (cmd.includes('tsup') && cmd.includes('watch')) return false;
  if (cmd.includes('esbuild') && cmd.includes('watch')) return false;
  if (cmd.includes('rollup') && (cmd.includes(' -w') || cmd.includes('--watch'))) return false;
  if (cmd.includes('tsc') && (cmd.includes(' -w') || cmd.includes('--watch'))) return false;
  return WEB_DEV_SERVER_MARKERS.some((m) => cmd.includes(m));
}

export function classifyDevScript(command = '') {
  const cmd = command.toLowerCase();
  if (!cmd) return 'unknown-package';
  if (isWebDevServerScript(command)) return 'web-dev-server';
  if (BUILD_WATCH_ONLY_MARKERS.some((m) => cmd.includes(m))) return 'build-watch-only';
  if (cmd.includes('watch') && !cmd.includes('dev server')) return 'build-watch-only';
  if (cmd.includes('tsup') && !cmd.includes('serve') && !cmd.includes('live-server')) {
    return cmd.includes('watch') ? 'build-watch-only' : 'build-only';
  }
  if (scriptsLookBuildOnly(cmd)) return 'build-only';
  return 'unknown-package';
}

function scriptsLookBuildOnly(cmd) {
  return (
    (cmd.includes('rollup') && !cmd.includes('serve'))
    || (cmd.includes('tsc') && !cmd.includes('serve'))
    || (cmd.includes('esbuild') && !cmd.includes('serve'))
    || cmd === 'tsup'
    || cmd.startsWith('tsup ')
  );
}

export function buildOnlyDevScript(command = '') {
  const kind = classifyDevScript(command);
  return kind === 'build-watch-only' || kind === 'build-only';
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
  return buildOnlyDevScript(command);
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
  if (runner?.expectedUrl) return runner.expectedUrl;
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
          finish(res.statusCode >= 200 && res.statusCode < 400);
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

  if (live?.status === 'built-no-demo') {
    return {
      status: 'built-no-demo',
      pid: pidAlive ? pid : null,
      responding,
      expectedUrl,
      note: live?.error ?? 'Package built but no runnable demo page',
    };
  }

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

export async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function ensureRunnerCopy(id) {
  const src = join(VAULT_GITHUB, id);
  const dest = join(RUNNERS_REPOS, id);
  try {
    await access(src);
  } catch {
    return { ok: false, error: 'Source repo not found in vault' };
  }
  await copyRepo(src, dest);
  return { ok: true, dest };
}

export async function ensureRunnerCopies(runners) {
  const results = [];
  for (const runner of runners) {
    if (!runner.runnable) continue;
    const result = await ensureRunnerCopy(runner.id);
    results.push({ id: runner.id, ...result });
  }
  return results;
}

export async function hasNodeModules(repoPath) {
  return pathExists(join(repoPath, 'node_modules'));
}

export async function readPackageJson(repoPath) {
  try {
    return JSON.parse(await readFile(join(repoPath, 'package.json'), 'utf8'));
  } catch {
    return null;
  }
}

export async function findExampleHtmlPages(repoPath) {
  const pages = [];
  for (const dir of DEMO_DIRS) {
    const base = join(repoPath, dir);
    try {
      const s = await stat(base);
      if (!s.isDirectory()) continue;
    } catch {
      continue;
    }
    try {
      await access(join(base, 'index.html'));
      pages.push({ dir, htmlPath: join(dir, 'index.html'), serveFromRoot: false });
    } catch { /* subdirs */ }
    try {
      const subs = await readdir(base, { withFileTypes: true });
      for (const sub of subs) {
        if (!sub.isDirectory()) continue;
        const rel = `${dir}/${sub.name}`;
        try {
          await access(join(repoPath, rel, 'index.html'));
          pages.push({ dir: rel, htmlPath: join(rel, 'index.html'), serveFromRoot: false });
        } catch { /* next */ }
      }
    } catch { /* next */ }
  }
  return pages;
}

export async function exampleNeedsRepoRootServe(repoPath, htmlRelPath) {
  try {
    const html = await readFile(join(repoPath, htmlRelPath), 'utf8');
    return /\.\.\/\.\.\/dist\b|\.\.\/dist\b|href=["']\.\.\/\.\.\/dist|src=["']\.\.\/\.\.\/dist/.test(html);
  } catch {
    return false;
  }
}

export async function resolveServeTarget(repoPath, id) {
  if (id === 'glass-refraction') {
    const vanilla = join(repoPath, 'examples/vanilla/index.html');
    if (await pathExists(vanilla)) {
      return {
        serveDir: '.',
        urlPath: '/examples/vanilla/',
        serveTarget: 'examples/vanilla',
        generatedWrapper: false,
      };
    }
  }

  const pages = await findExampleHtmlPages(repoPath);
  for (const page of pages) {
    const needsRoot = await exampleNeedsRepoRootServe(repoPath, page.htmlPath);
    if (needsRoot) {
      const urlPath = `/${page.dir.replace(/\\/g, '/')}/`;
      return {
        serveDir: '.',
        urlPath,
        serveTarget: page.dir,
        generatedWrapper: false,
      };
    }
    return {
      serveDir: page.dir,
      urlPath: '/',
      serveTarget: page.dir,
      generatedWrapper: false,
    };
  }

  const staticDir = await findStaticServeDir(repoPath);
  if (staticDir) {
    return {
      serveDir: staticDir === '.' ? '.' : staticDir,
      urlPath: '/',
      serveTarget: staticDir === '.' ? 'root' : staticDir,
      generatedWrapper: false,
    };
  }

  return null;
}

export async function listDistFiles(repoPath) {
  const distDir = join(repoPath, 'dist');
  const files = [];
  async function walk(dir, prefix = '') {
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          await walk(join(dir, entry.name), rel);
        } else {
          files.push(`dist/${rel}`);
        }
      }
    } catch { /* missing */ }
  }
  await walk(distDir);
  return files;
}

export async function distLooksBuilt(repoPath, pkg) {
  const main = pkg?.main ?? pkg?.module;
  if (main) {
    const mainPath = join(repoPath, main);
    if (await pathExists(mainPath)) return true;
  }
  const files = await listDistFiles(repoPath);
  return files.length > 0;
}

export async function generateNoDemoWrapper(id, repoPath, builtFiles = []) {
  const wrapperDir = join(RUNNERS_GENERATED, id);
  await mkdir(wrapperDir, { recursive: true });
  const fileList = builtFiles.length
    ? builtFiles.map((f) => `<li>${f}</li>`).join('\n')
    : '<li>(no dist files detected)</li>';
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${id} — package built</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    h1 { font-size: 1.25rem; }
    code { background: #f1f5f9; padding: 0.1rem 0.35rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>${id} package built successfully, but no runnable local example was detected.</h1>
  <p><strong>Built files:</strong></p>
  <ul>
${fileList}
  </ul>
  <p><strong>Manual next step:</strong></p>
  <ul>
    <li>Inspect <code>examples/</code> and README to wire a local example</li>
    <li>Or create a generated wrapper that imports built dist files</li>
  </ul>
</body>
</html>`;
  const out = join(wrapperDir, 'index.html');
  await writeFile(out, html, 'utf8');
  return {
    serveDir: '.',
    serveCwd: wrapperDir,
    urlPath: '/',
    serveTarget: 'generated-wrapper',
    generatedWrapper: true,
    wrapperPath: out,
  };
}

export function expectedUrlForServe(port, urlPath = '/') {
  const path = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  return `http://localhost:${port}${path}`;
}

export async function runLoggedCommand(cmd, args, { cwd, logFile, label }) {
  await mkdir(dirname(logFile), { recursive: true });
  const started = Date.now();
  await writeFile(logFile, `--- ${label} ${new Date().toISOString()} ---\n${cmd} ${args.join(' ')}\n`, 'utf8');
  const result = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  await writeFile(logFile, output, { flag: 'a' });
  return {
    exitCode: result.status ?? 1,
    durationMs: Date.now() - started,
    output,
  };
}

export async function runPackageInstall(repoPath, pm, logFile) {
  const map = {
    pnpm: ['pnpm', 'install'],
    yarn: ['yarn', 'install'],
    bun: ['bun', 'install'],
    npm: ['npm', 'install'],
  };
  const [cmd, ...args] = map[pm] ?? map.npm;
  return runLoggedCommand(cmd, args, { cwd: repoPath, logFile, label: 'install' });
}

export async function runPackageBuild(repoPath, pm, buildScript, logFile) {
  const [cmd, ...args] = runCommandFor(pm, buildScript);
  return runLoggedCommand(cmd, args, { cwd: repoPath, logFile, label: 'build' });
}

export async function runWatchUntilDist(repoPath, pm, devScript, logFile, { timeoutMs = 60000 } = {}) {
  const [cmd, ...args] = runCommandFor(pm, devScript);
  await mkdir(dirname(logFile), { recursive: true });
  await writeFile(logFile, `--- watch-until-dist ${new Date().toISOString()} ---\n`, 'utf8');
  const child = spawn(cmd, args, {
    cwd: repoPath,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const started = Date.now();
  let output = '';
  const append = (chunk) => {
    output += chunk.toString();
  };
  child.stdout?.on('data', append);
  child.stderr?.on('data', append);

  const deadline = Date.now() + timeoutMs;
  let built = false;
  while (Date.now() < deadline) {
    const pkg = await readPackageJson(repoPath);
    if (await distLooksBuilt(repoPath, pkg)) {
      built = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  try {
    child.kill('SIGTERM');
  } catch { /* ignore */ }
  await new Promise((r) => setTimeout(r, 300));
  await writeFile(logFile, output, { flag: 'a' });
  return {
    exitCode: built ? 0 : 1,
    durationMs: Date.now() - started,
    output,
    built,
  };
}

export async function auditPackageRunner(repoPath, id, pkg, { port = null } = {}) {
  const scripts = pkg?.scripts ?? {};
  const devScript = scripts.dev ?? null;
  const devScriptKind = devScript ? classifyDevScript(devScript) : null;
  const pm = await detectPackageManagerAsync(repoPath, pkg);
  const installCommand = installCommandFor(pm);
  const buildCommand = scripts.build ? buildCommandFor(pm, 'build') : null;
  const hasWebDev = Object.entries(scripts).some(([, body]) => isWebDevServerScript(body));
  const serveTargetInfo = await resolveServeTarget(repoPath, id);
  const installed = await hasNodeModules(repoPath);
  const built = await distLooksBuilt(repoPath, pkg);

  let startMode = 'unknown-package';
  let packageStyle = true;
  let requiresInstall = true;
  let requiresBuild = false;
  let buildOnlyDevScriptFlag = devScript ? buildOnlyDevScript(devScript) : false;
  const instructions = [];

  if (id === 'liquid-dom') {
    startMode = 'web-dev-server';
    requiresBuild = true;
    buildOnlyDevScriptFlag = false;
    instructions.push('Build workspace packages, then run demo/minimal via Vite.');
  } else if (id === 'glass-refraction') {
    startMode = 'build-then-serve-example';
    requiresBuild = true;
    buildOnlyDevScriptFlag = true;
    instructions.push(
      "This repo's dev script is a build watcher, not a web server.",
      'Install dependencies, build dist, then serve examples or generated wrapper.',
    );
  } else {
    const recommended = pickRecommendedScript(scripts, id);
    const recommendedBody = recommended ? scripts[recommended] : null;
    const recommendedIsWebDev = recommendedBody && isWebDevServerScript(recommendedBody);

    if (recommendedIsWebDev) {
      startMode = 'web-dev-server';
      requiresBuild = false;
    } else if ((buildOnlyDevScriptFlag || scripts.build) && serveTargetInfo) {
      startMode = 'build-then-serve-example';
      requiresBuild = true;
      if (buildOnlyDevScriptFlag) {
        instructions.push(
          "This repo's dev script is a build watcher, not a web server.",
          'Install dependencies, build dist, then serve examples or generated wrapper.',
        );
      }
    } else if (scripts.build && !serveTargetInfo) {
      startMode = 'build-only';
      requiresBuild = true;
      instructions.push('Package builds but no example/demo page was detected.');
    } else if (serveTargetInfo && !scripts.build) {
      startMode = 'static-serve';
      packageStyle = false;
      requiresInstall = false;
      requiresBuild = false;
    }
  }

  if (!pkg) {
    startMode = 'static-serve';
    packageStyle = false;
    requiresInstall = false;
  }

  const serveCommand = serveTargetInfo
    ? `npx serve ${serveTargetInfo.serveDir} -l ${port ?? 'PORT'}`
    : null;
  const expectedUrl = port && serveTargetInfo
    ? expectedUrlForServe(port, serveTargetInfo.urlPath)
    : (port ? `http://localhost:${port}` : null);

  return {
    id,
    repoPath: `.raw-reference-runners/repos/${id}`,
    packageManager: pm,
    installCommand,
    startMode,
    packageStyle,
    requiresInstall,
    requiresBuild,
    buildOnlyDevScript: buildOnlyDevScriptFlag,
    devScript,
    devScriptKind,
    buildCommand: scripts.build ? buildCommandFor(pm, 'build') : null,
    serveCommand,
    serveTarget: serveTargetInfo?.serveTarget ?? null,
    serveDir: serveTargetInfo?.serveDir ?? null,
    urlPath: serveTargetInfo?.urlPath ?? '/',
    expectedUrl,
    generatedWrapper: serveTargetInfo?.generatedWrapper ?? false,
    installed,
    built,
    instructions,
    runnable: startMode !== 'build-only' && startMode !== 'unknown-package' && startMode !== 'failed-package',
  };
}

export function buildServeStartCommand(serveDir, port, cwd) {
  const target = serveDir === '.' ? '.' : serveDir;
  return {
    cmd: 'npx',
    args: ['--yes', 'serve', target, '-l', String(port), '--no-clipboard'],
    cwd,
    env: { ...process.env },
    startMode: 'build-then-serve-example',
  };
}
