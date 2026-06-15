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
