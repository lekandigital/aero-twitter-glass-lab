#!/usr/bin/env node
/**
 * Builds Raw Reference Lab — standalone catalog that opens demos as separate local pages.
 * Output: public/raw-reference-lab/
 */
import {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = join(ROOT, '_reference_vault');
const OUT = join(ROOT, 'public', 'raw-reference-lab');
const PUBLIC_URLS_FILE = join(VAULT, 'reports', 'PUBLIC_WEBPAGES_TO_REVIEW.txt');
const CODEPEN_EXTRACTED = join(VAULT, 'zipsofglass2', 'extracted');
const TUANNM93_DIR = join(VAULT, 'reference-library', 'github', 'tuannm93-lab', 'front-end');
const WEB_ARCHIVES = join(VAULT, 'reference-library', 'web-archives');
const VAULT_GITHUB = join(VAULT, 'reference-library', 'github');

const DEMO_CODEPEN = join(OUT, 'demos', 'codepen');
const DEMO_GITHUB = join(OUT, 'demos', 'github-static');
const DEMO_ARCHIVES = join(OUT, 'demos', 'web-archives');

const UNSAFE_TERMS = [
  'backend-api',
  'estuary',
  'sig=',
  'jwt=',
  'auth-success',
  'mail.google.com',
  'instagram.com',
  'x.com/i/chat',
  'private-user-images',
  'chatgpt.com/backend-api',
];

const BLOCKED_PEOPLE = [
  'Ben_Shelton',
  'Bryan_Shelton',
  'Anna_Hall',
  'Trinity+Rodman',
  'ojalkakrecha',
  'Ritisharajkumar',
];

const SAFE_EXTERNAL_DOMAINS = [
  'liquidgl.naughtyduk.com',
  'liquid-glass-eta.vercel.app',
  'kvideo.pages.dev',
  'css.glass',
  'kube.io',
  'freefrontend.com',
];

const TUANNM93_KEYWORDS = [
  'glass', 'liquid', 'aero', 'blur', 'bokeh', 'reflection', 'refraction',
  'magnifier', 'switcher', 'gooey', 'fluid', 'bubbles', 'oceanic', 'gel',
  'chrome', 'chromatic', 'shader', 'lens', 'ripple', 'transparent', 'frost',
];

const SECTION_GROUP = {
  'CODEPEN PAGES': 'CodePen pages',
  'JSFIDDLE PAGES': 'JSFiddle pages',
  'GITHUB PAGES': 'GitHub pages',
  'LIVE DEMOS': 'Live demos',
  'REFERENCE/TUTORIAL/PACKAGE PAGES': 'Reference/tutorial/package pages',
  'REDDIT DISCUSSIONS': 'Reddit discussions',
  'YOUTUBE REFERENCES': 'YouTube references',
  'WIKIPEDIA/DESIGN HISTORY': 'Wikipedia/design history',
  PAPERS: 'Papers',
  'ARTICLES/NEWS/DESIGN REACTIONS': 'Articles/news/design reactions',
  'GOOGLE SEARCHES': 'Google searches',
  'OTHER PUBLIC': 'Other public',
};

const stats = {
  total: 0,
  localPage: 0,
  externalLink: 0,
  linkOnly: 0,
  sourceOnly: 0,
  codepen: 0,
  githubStatic: 0,
  webArchives: 0,
  reactSource: 0,
  vueSource: 0,
  skippedUnsafe: 0,
  failed: [],
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'item';
}

function uniqueId(base, used) {
  let id = slugify(base);
  let n = 2;
  while (used.has(id)) {
    id = `${slugify(base)}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

function isUnsafeUrl(url) {
  const lower = url.toLowerCase();
  if (UNSAFE_TERMS.some((term) => lower.includes(term))) return true;
  if (BLOCKED_PEOPLE.some((term) => url.includes(term))) return true;
  if (/\bTrinity\b/i.test(url) && /Rodman/i.test(url)) return true;
  return false;
}

function unsafeReason(url) {
  try {
    return `${new URL(url).hostname} (blocked)`;
  } catch {
    return 'invalid-url (blocked)';
  }
}

function isSafeExternalDemo(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return SAFE_EXTERNAL_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

function inferRuntime(text, group) {
  const t = text.toLowerCase();
  if (group === 'YouTube references') return 'video';
  if (group === 'Papers') return 'paper';
  if (['Articles/news/design reactions', 'Wikipedia/design history', 'Reddit discussions'].includes(group)) {
    return 'article';
  }
  if (t.includes('vue')) return 'vue-source';
  if (t.includes('react') || t.includes('tsx') || t.includes('jsx')) return 'react-source';
  if (t.includes('webgl') || t.includes('three')) return 'webgl';
  if (t.includes('shader') || t.includes('glsl')) return 'shader';
  if (t.includes('fedisplacementmap') || t.includes('feturbulence') || (t.includes('svg') && t.includes('filter'))) {
    return 'svg-filter';
  }
  if (t.includes('css-only') || t.includes('pure-css') || (t.includes('.css') && !t.includes('.js'))) {
    return 'css-only';
  }
  if (t.includes('.js') || t.includes('vanilla')) return 'vanilla-js';
  if (group === 'Google searches') return 'link';
  return 'unknown';
}

function scoreReference(text, group) {
  const t = text.toLowerCase();
  if (/glass-button-css-only|liquid-glass-switcher/.test(t)) return 90;
  if (/liquidgl|naughtyduk/.test(t)) return 88;
  if (/liquid-glass-react|rdev/.test(t)) return 85;
  if (/archisvaze|kube\.io|dashersw/.test(t)) return 80;
  if (group === 'Local CodePen exports') {
    if (/button|switcher|svg|refraction|bokeh/.test(t)) return 75;
    if (/liquid|glass/.test(t)) return 65;
    return 55;
  }
  if (group === 'Local GitHub static demos') return 70;
  if (group === 'Web archives') return 68;
  if (group === 'Live demos') return 72;
  if (group === 'Google searches') return 10;
  if (group === 'Papers') return 30;
  if (group === 'GitHub pages' && /glass|liquid|aero/.test(t)) return 55;
  return 35;
}

function titleFromUrl(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, '');
    const last = path.split('/').filter(Boolean).pop();
    if (last) return decodeURIComponent(last).replace(/[-_]/g, ' ');
    return u.hostname;
  } catch {
    return url.slice(0, 60);
  }
}

function titleFromPath(name) {
  return name.replace(/\.html$/i, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
}

function isGithubSourceOnly(url) {
  const lower = url.toLowerCase();
  if (!lower.includes('github.com')) return false;
  if (lower.includes('/search') || lower.includes('/topics')) return false;
  if (/\.(tsx|jsx|vue|svelte|ts|js)$/i.test(url) && lower.includes('/blob/')) return true;
  if (lower.includes('/discussions/')) return true;
  if (lower.includes('/tree/')) return true;
  if (/github\.com\/[^/]+\/[^/]+\/?$/.test(url.replace(/\/$/, ''))) return true;
  if (lower.includes('liquid-glass-react') || lower.includes('liquid-glass-vue')) return true;
  if (lower.includes('liquid-glass-js') || lower.includes('liquid-dom')) return true;
  if (lower.includes('glass-refraction') && lower.includes('.tsx')) return true;
  return false;
}

function catalogLabel(previewMode, group) {
  if (previewMode === 'local-page') {
    return group === 'Web archives' ? 'local archive' : 'local runnable demo';
  }
  if (previewMode === 'source-only') return 'source-only';
  return 'external-only';
}

function buildTags(text, runtime, group) {
  const tags = new Set();
  if (runtime !== 'unknown') tags.add(runtime);
  if (group.includes('CodePen') || group === 'Local CodePen exports') tags.add('codepen');
  if (group.includes('GitHub') || group === 'Local GitHub static demos') tags.add('github');
  if (group === 'Web archives') tags.add('archive');
  if (group === 'Live demos') tags.add('live-demo');
  for (const kw of ['glass', 'liquid', 'aero', 'blur', 'svg', 'webgl', 'button', 'switcher', 'refraction']) {
    if (text.toLowerCase().includes(kw)) tags.add(kw);
  }
  return [...tags];
}

function notesForItem(text, group, previewMode) {
  if (group === 'Local CodePen exports') {
    return 'Locally exported CodePen — open as a separate local page. Original src/ files unchanged.';
  }
  if (group === 'Local GitHub static demos') {
    return 'Standalone HTML from tuannm93/lab — opens as a separate local page, not ported to React.';
  }
  if (group === 'Web archives') {
    return 'Archived snapshot — opens as a separate local page.';
  }
  if (group === 'JSFiddle pages' && previewMode === 'link-only') {
    return 'No local runnable copy found. External source only.';
  }
  if (group === 'CodePen pages') {
    return 'CodePen URL — use a Local CodePen export entry when available for localhost demo.';
  }
  if (group === 'GitHub pages') {
    return 'Framework or library repo — inspect source externally; not built or ported here.';
  }
  if (group === 'Google searches') {
    return 'Discovery search URL — not a runnable demo.';
  }
  if (group === 'Papers') {
    return 'Academic paper — external link only.';
  }
  if (group === 'Live demos') {
    return isSafeExternalDemo(text)
      ? 'Safe public live demo — external link only (no iframe in catalog).'
      : 'Live demo URL — external link only.';
  }
  return 'Reference material for glass/Aero UI exploration.';
}

function normalizeRecord(item) {
  return {
    id: item.id,
    title: item.title,
    group: item.group,
    runtime: item.runtime,
    previewMode: item.previewMode,
    catalogLabel: item.catalogLabel ?? catalogLabel(item.previewMode, item.group),
    sourceUrl: item.sourceUrl ?? null,
    localSourcePath: item.localSourcePath ?? null,
    localDemoUrl: item.localDemoUrl ?? null,
    notes: item.notes ?? '',
    tags: item.tags ?? [],
    usefulnessScore: item.usefulnessScore ?? 0,
  };
}

function countPreviewMode(item) {
  stats.total += 1;
  if (item.previewMode === 'local-page') stats.localPage += 1;
  else if (item.previewMode === 'external-link') stats.externalLink += 1;
  else if (item.previewMode === 'source-only') stats.sourceOnly += 1;
  else stats.linkOnly += 1;
}

function jsfiddleArchiveCandidates(url) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    const candidates = [];
    if (parts[0]) candidates.push(`jsfiddle-${parts[0]}`);
    return candidates;
  } catch {
    return [];
  }
}

function inferPreviewModeForUrl(url, group, jsfiddleArchiveMap) {
  const lower = url.toLowerCase();

  if (lower.includes('jsfiddle.net')) {
    const candidates = jsfiddleArchiveCandidates(url);
    for (const c of candidates) {
      if (jsfiddleArchiveMap.has(c)) return 'local-page';
    }
    return 'link-only';
  }

  if (isSafeExternalDemo(url) && group === 'Live demos') {
    return 'external-link';
  }

  if (lower.includes('github.com')) {
    if (lower.includes('/search') || lower.includes('/topics')) return 'link-only';
    if (isGithubSourceOnly(url)) return 'source-only';
    return 'source-only';
  }

  if (
    group === 'Papers' ||
    group === 'Articles/news/design reactions' ||
    group === 'Wikipedia/design history' ||
    group === 'Reddit discussions' ||
    group === 'YouTube references' ||
    group === 'Google searches' ||
    group === 'CodePen pages'
  ) {
    return 'link-only';
  }

  if (group === 'JSFiddle pages') return 'link-only';
  if (group === 'Live demos') return 'external-link';
  return 'link-only';
}

let vaultGithubDirsCache = null;

async function getVaultGithubDirs() {
  if (vaultGithubDirsCache) return vaultGithubDirsCache;
  try {
    vaultGithubDirsCache = await readdir(VAULT_GITHUB);
  } catch {
    vaultGithubDirsCache = [];
  }
  return vaultGithubDirsCache;
}

async function resolveVaultGithubPath(url) {
  if (!url.includes('github.com')) return null;
  const match = url.match(/github\.com\/[^/]+\/([^/?#]+)/i);
  if (!match) return null;
  const repo = match[1].replace(/\.git$/, '');
  const dirs = await getVaultGithubDirs();

  if (dirs.includes(repo)) {
    return `_reference_vault/reference-library/github/${repo}`;
  }

  const aliases = {
    'liquid-glass': 'archisvaze-liquid-glass',
    'liquid-glass-react': 'liquid-glass-react',
    'liquid-glass-js': 'liquid-glass-js',
    'glass-refraction': 'glass-refraction',
    'liquid-dom': 'liquid-dom',
    '7.css': '7.css',
    liquidGL: 'liquidGL',
    '7-Aero-Stylesheet': '7-Aero-Stylesheet',
    'glassmorphism-template': 'glassmorphism-template',
  };

  const folder = aliases[repo] ?? dirs.find((d) => d.toLowerCase() === repo.toLowerCase());
  if (folder && dirs.includes(folder)) {
    return `_reference_vault/reference-library/github/${folder}`;
  }

  return null;
}

async function parsePublicUrls(usedIds, jsfiddleArchiveMap) {
  const raw = await readFile(PUBLIC_URLS_FILE, 'utf8');
  const lines = raw.split('\n');
  const items = [];
  let currentGroup = null;

  for (const line of lines) {
    if (line.startsWith('====')) continue;

    const header = line.match(/^([A-Z0-9/ ]+)\s*$/);
    if (header && !line.startsWith('http')) {
      const key = header[1].trim();
      if (SECTION_GROUP[key]) currentGroup = SECTION_GROUP[key];
      continue;
    }

    const url = line.trim();
    if (!url.startsWith('http')) continue;
    if (isUnsafeUrl(url)) {
      console.log(`Skipped unsafe URL: ${unsafeReason(url)}`);
      stats.skippedUnsafe += 1;
      continue;
    }

    const group = currentGroup ?? 'Other public';
    const title = titleFromUrl(url);
    const text = `${title} ${url}`;
    const runtime = inferRuntime(text, group);
    let previewMode = inferPreviewModeForUrl(url, group, jsfiddleArchiveMap);

    let localDemoUrl = null;
    let localSourcePath = null;
    let itemGroup = group;

    if (previewMode === 'local-page' && group === 'JSFiddle pages') {
      const candidates = jsfiddleArchiveCandidates(url);
      let archiveId = null;
      for (const c of candidates) {
        if (jsfiddleArchiveMap.has(c)) {
          archiveId = jsfiddleArchiveMap.get(c);
          break;
        }
      }
      if (archiveId) {
        localDemoUrl = `/raw-reference-lab/demos/web-archives/${archiveId}/index.html`;
        localSourcePath = `_reference_vault/reference-library/web-archives/${archiveId}`;
        itemGroup = 'Web archives';
      } else {
        previewMode = 'link-only';
      }
    }

    if ((previewMode === 'source-only' || previewMode === 'link-only') && url.includes('github.com')) {
      localSourcePath = localSourcePath ?? (await resolveVaultGithubPath(url));
    }

    const id = uniqueId(`url-${title}-${url.slice(-12)}`, usedIds);
    const item = normalizeRecord({
      id,
      title,
      group: itemGroup,
      runtime,
      previewMode,
      sourceUrl: url,
      localSourcePath,
      localDemoUrl,
      notes: notesForItem(text, itemGroup, previewMode),
      tags: buildTags(text, runtime, itemGroup),
      usefulnessScore: scoreReference(text, itemGroup),
    });

    countPreviewMode(item);
    items.push(item);
  }

  return items;
}

async function findSrcDirs(root) {
  const found = [];
  async function walk(dir, depth = 0) {
    if (depth > 4) return;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'src') {
          try {
            await stat(join(full, 'index.html'));
            found.push(full);
          } catch { /* no index */ }
        } else {
          await walk(full, depth + 1);
        }
      }
    }
  }
  await walk(root);
  return found;
}

function isCompleteHtml(content) {
  const trimmed = content.trim().toLowerCase();
  return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
}

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const from = join(src, entry.name);
    const to = join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(from, to);
    else await cp(from, to);
  }
}

async function buildCodepenEntryUrl(destDir, safeId) {
  const srcDir = join(destDir, 'src');
  const srcIndexPath = join(srcDir, 'index.html');

  let content = '';
  let isFull = false;
  try {
    content = await readFile(srcIndexPath, 'utf8');
    isFull = isCompleteHtml(content);
  } catch {
    return null;
  }

  const base = `/raw-reference-lab/demos/codepen/${safeId}`;

  if (isFull) {
    return `${base}/src/index.html`;
  }

  const entries = await readdir(srcDir);
  const cssFiles = entries.filter((f) => /\.(css|scss)$/i.test(f));
  const jsFiles = entries.filter((f) => /\.js$/i.test(f));

  const cssLinks = cssFiles
    .map((f) => `    <link rel="stylesheet" href="./src/${f}" />`)
    .join('\n');
  const jsScripts = jsFiles
    .map((f) => `    <script src="./src/${f}"></script>`)
    .join('\n');

  await writeFile(
    join(destDir, 'entry.html'),
    `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
${cssLinks}
  </head>
  <body>
${content}
${jsScripts}
  </body>
</html>
`,
    'utf8',
  );

  return `${base}/entry.html`;
}

async function buildCodepenDemos(usedIds) {
  const items = [];
  let topEntries;
  try {
    topEntries = await readdir(CODEPEN_EXTRACTED, { withFileTypes: true });
  } catch (err) {
    stats.failed.push(`CodePen scan: ${err.message}`);
    return items;
  }

  const seenFolders = new Set();

  for (const entry of topEntries) {
    if (!entry.isDirectory()) continue;
    const srcDirs = await findSrcDirs(join(CODEPEN_EXTRACTED, entry.name));
    if (srcDirs.length === 0) {
      stats.failed.push(`CodePen: no src/index.html in ${entry.name}`);
      continue;
    }

    const srcDir = srcDirs[0];
    const dedupeKey = basename(dirname(srcDir));
    if (seenFolders.has(dedupeKey)) continue;
    seenFolders.add(dedupeKey);

    const safeId = uniqueId(dedupeKey, usedIds);
    const destDir = join(DEMO_CODEPEN, safeId);
    const destSrc = join(destDir, 'src');

    try {
      await mkdir(destDir, { recursive: true });
      await copyDir(srcDir, destSrc);

      const demoUrl = await buildCodepenEntryUrl(destDir, safeId);
      if (!demoUrl) {
        stats.failed.push(`CodePen ${dedupeKey}: could not build entry URL`);
        continue;
      }

      const vaultPath = relative(ROOT, srcDir);
      const text = dedupeKey;
      const runtime = inferRuntime(text, 'Local CodePen exports');

      const item = normalizeRecord({
        id: `codepen-${safeId}`,
        title: titleFromPath(dedupeKey),
        group: 'Local CodePen exports',
        runtime,
        previewMode: 'local-page',
        sourceUrl: null,
        localSourcePath: vaultPath,
        localDemoUrl: demoUrl,
        notes: notesForItem(text, 'Local CodePen exports', 'local-page'),
        tags: buildTags(text, runtime, 'Local CodePen exports'),
        usefulnessScore: scoreReference(text, 'Local CodePen exports'),
      });

      items.push(item);
      stats.codepen += 1;
      stats.localPage += 1;
      stats.total += 1;
    } catch (err) {
      stats.failed.push(`CodePen ${entry.name}: ${err.message}`);
    }
  }

  return items;
}

function matchesTuannm93Keyword(filename) {
  const lower = filename.toLowerCase();
  return TUANNM93_KEYWORDS.some((kw) => lower.includes(kw));
}

async function buildGithubStaticDemos(usedIds) {
  const items = [];
  let files;
  try {
    files = await readdir(TUANNM93_DIR);
  } catch (err) {
    stats.failed.push(`tuannm93 scan: ${err.message}`);
    return items;
  }

  for (const file of files) {
    if (!file.endsWith('.html')) continue;
    if (!matchesTuannm93Keyword(file)) continue;

    const safeId = uniqueId(`tuannm93-${file.replace(/\.html$/i, '')}`, usedIds);
    const destDir = join(DEMO_GITHUB, safeId);
    const srcFile = join(TUANNM93_DIR, file);

    try {
      await mkdir(destDir, { recursive: true });
      await cp(srcFile, join(destDir, 'index.html'));

      const vaultPath = relative(ROOT, srcFile);
      const demoUrl = `/raw-reference-lab/demos/github-static/${safeId}/index.html`;
      const text = file;
      const runtime = inferRuntime(text, 'Local GitHub static demos');

      const item = normalizeRecord({
        id: `github-${safeId}`,
        title: titleFromPath(file),
        group: 'Local GitHub static demos',
        runtime,
        previewMode: 'local-page',
        sourceUrl: `https://github.com/tuannm93/lab/blob/main/front-end/${file}`,
        localSourcePath: vaultPath,
        localDemoUrl: demoUrl,
        notes: notesForItem(text, 'Local GitHub static demos', 'local-page'),
        tags: buildTags(text, runtime, 'Local GitHub static demos'),
        usefulnessScore: scoreReference(text, 'Local GitHub static demos'),
      });

      items.push(item);
      stats.githubStatic += 1;
      stats.localPage += 1;
      stats.total += 1;
    } catch (err) {
      stats.failed.push(`GitHub static ${file}: ${err.message}`);
    }
  }

  return items;
}

async function buildJsfiddleArchiveMap() {
  const map = new Map();
  let entries;
  try {
    entries = await readdir(WEB_ARCHIVES, { withFileTypes: true });
  } catch {
    return map;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('jsfiddle-')) {
      map.set(entry.name, entry.name);
    }
  }
  return map;
}

async function buildWebArchiveDemos(usedIds) {
  const items = [];
  let entries;
  try {
    entries = await readdir(WEB_ARCHIVES, { withFileTypes: true });
  } catch (err) {
    stats.failed.push(`Web archives scan: ${err.message}`);
    return items;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const archiveDir = join(WEB_ARCHIVES, entry.name);
    const indexSrc = join(archiveDir, 'index.html');
    try {
      await stat(indexSrc);
    } catch {
      continue;
    }

    const safeId = uniqueId(entry.name, usedIds);
    const destDir = join(DEMO_ARCHIVES, safeId);

    try {
      await mkdir(destDir, { recursive: true });
      const archiveFiles = await readdir(archiveDir);
      for (const f of archiveFiles) {
        if (f === 'source_url.txt') continue;
        const from = join(archiveDir, f);
        const to = join(destDir, f);
        const info = await stat(from);
        if (info.isDirectory()) await copyDir(from, to);
        else await cp(from, to);
      }

      let sourceUrl = null;
      try {
        const raw = (await readFile(join(archiveDir, 'source_url.txt'), 'utf8')).trim();
        if (raw && !isUnsafeUrl(raw)) sourceUrl = raw;
        else if (raw) console.log(`Skipped unsafe URL: ${unsafeReason(raw)}`);
      } catch { /* no source url */ }

      const vaultPath = relative(ROOT, archiveDir);
      const demoUrl = `/raw-reference-lab/demos/web-archives/${safeId}/index.html`;
      const text = `${entry.name} ${sourceUrl ?? ''}`;
      const runtime = inferRuntime(text, 'Web archives');

      const item = normalizeRecord({
        id: `archive-${safeId}`,
        title: titleFromPath(entry.name),
        group: 'Web archives',
        runtime,
        previewMode: 'local-page',
        sourceUrl,
        localSourcePath: vaultPath,
        localDemoUrl: demoUrl,
        notes: notesForItem(text, 'Web archives', 'local-page'),
        tags: buildTags(text, runtime, 'Web archives'),
        usefulnessScore: scoreReference(text, 'Web archives'),
      });

      items.push(item);
      stats.webArchives += 1;
      stats.localPage += 1;
      stats.total += 1;
    } catch (err) {
      stats.failed.push(`Web archive ${entry.name}: ${err.message}`);
    }
  }

  return items;
}

function generateViewerHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Raw Reference Lab</title>
  <link rel="stylesheet" href="./raw-reference-lab.css">
</head>
<body>
  <div class="rrl-app">
    <header class="rrl-header">
      <h1>Raw Reference Lab</h1>
      <p class="rrl-subtitle">Original local HTML/CSS/JS demos opened as separate pages. No React ports. No CSS rewrites.</p>
    </header>

    <section class="rrl-stats" id="rrl-stats"></section>

    <section class="rrl-controls">
      <input type="search" id="rrl-search" class="rrl-search" placeholder="Search title, group, tags, URLs…" autocomplete="off">
      <div class="rrl-filters" id="rrl-filters"></div>
      <div class="rrl-sort-row">
        <label for="rrl-sort">Sort</label>
        <select id="rrl-sort" class="rrl-sort">
          <option value="usefulnessScore">usefulness score</option>
          <option value="title">title</option>
          <option value="group">group</option>
          <option value="previewMode">preview mode</option>
        </select>
      </div>
    </section>

    <p class="rrl-count" id="rrl-count" aria-live="polite"></p>
    <div class="rrl-grid" id="rrl-grid"></div>
  </div>
  <script src="./raw-reference-lab.js"></script>
</body>
</html>`;
}
async function readViewerAsset(name) {
  return readFile(join(OUT, name), 'utf8');
}

async function generateViewerCss() {
  try {
    return await readViewerAsset('raw-reference-lab.css');
  } catch {
    return '/* raw-reference-lab.css missing — run from repo with viewer assets present */';
  }
}

async function generateViewerJs() {
  try {
    return await readViewerAsset('raw-reference-lab.js');
  } catch {
    return '/* raw-reference-lab.js missing */';
  }
}
async function runSafetyCheck() {
  try {
    return execSync(
      'grep -RInE "backend-api|estuary|sig=|jwt=|auth-success|mail.google.com|instagram.com|x.com/i/chat|private-user-images|Ben_Shelton|Bryan_Shelton|Anna_Hall|Trinity" public/raw-reference-lab || true',
      { cwd: ROOT, encoding: 'utf8' },
    ).trim();
  } catch {
    return '';
  }
}

async function main() {
  console.log('Building Raw Reference Lab…\n');

  await mkdir(OUT, { recursive: true });
  await rm(join(OUT, 'demos'), { recursive: true, force: true });
  await mkdir(DEMO_CODEPEN, { recursive: true });
  await mkdir(DEMO_GITHUB, { recursive: true });
  await mkdir(DEMO_ARCHIVES, { recursive: true });

  const usedIds = new Set();
  const jsfiddleArchiveMap = await buildJsfiddleArchiveMap();

  const archiveItems = await buildWebArchiveDemos(usedIds);
  const codepenItems = await buildCodepenDemos(usedIds);
  const githubItems = await buildGithubStaticDemos(usedIds);
  const publicItems = await parsePublicUrls(usedIds, jsfiddleArchiveMap);

  const allItems = [...publicItems, ...codepenItems, ...githubItems, ...archiveItems];

  stats.reactSource = allItems.filter((i) => i.runtime === 'react-source' && i.previewMode === 'source-only').length;
  stats.vueSource = allItems.filter((i) => i.runtime === 'vue-source' && i.previewMode === 'source-only').length;

  await writeFile(join(OUT, 'raw-reference-index.json'), JSON.stringify(allItems, null, 2), 'utf8');
  await writeFile(join(OUT, 'index.html'), generateViewerHtml(), 'utf8');
  await writeFile(join(OUT, 'raw-reference-lab.css'), await generateViewerCss(), 'utf8');
  await writeFile(join(OUT, 'raw-reference-lab.js'), await generateViewerJs(), 'utf8');

  const safetyResult = await runSafetyCheck();
  if (safetyResult) {
    console.error('\nSAFETY CHECK FAILED — unsafe strings found:');
    console.error(safetyResult);
    process.exit(1);
  }

  console.log('Raw Reference Lab build summary');
  console.log('───────────────────────────────');
  console.log(`Total references:          ${allItems.length}`);
  console.log(`Local page demos:          ${stats.localPage}`);
  console.log(`External links:            ${stats.externalLink}`);
  console.log(`Link-only:                 ${stats.linkOnly}`);
  console.log(`Source-only:               ${stats.sourceOnly}`);
  console.log(`CodePen demos:             ${stats.codepen}`);
  console.log(`GitHub static demos:       ${stats.githubStatic}`);
  console.log(`Web archives:              ${stats.webArchives}`);
  console.log(`React source-only:         ${stats.reactSource}`);
  console.log(`Vue source-only:           ${stats.vueSource}`);
  console.log(`Skipped unsafe URLs:       ${stats.skippedUnsafe}`);
  console.log(`Safety grep:               clean`);
  if (stats.failed.length > 0) {
    console.log(`\nFailures (${stats.failed.length}):`);
    for (const f of stats.failed.slice(0, 15)) console.log(`  - ${f}`);
  }
  console.log('\nDone. Open http://localhost:5173/raw-reference-lab/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
