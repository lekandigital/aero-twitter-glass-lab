#!/usr/bin/env node
/**
 * Builds Reference Lab demos and generates referenceIndex.ts from _reference_vault.
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
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VAULT = join(ROOT, '_reference_vault');
const PUBLIC_URLS_FILE = join(
  VAULT,
  'reports',
  'PUBLIC_WEBPAGES_TO_REVIEW.txt',
);
const CODEPEN_EXTRACTED = join(VAULT, 'zipsofglass2', 'extracted');
const TUANNM93_DIR = join(
  VAULT,
  'reference-library',
  'github',
  'tuannm93-lab',
  'front-end',
);
const WEB_ARCHIVES = join(VAULT, 'reference-library', 'web-archives');
const DEMO_CODEPEN = join(ROOT, 'public', 'reference-demos', 'codepen');
const DEMO_GITHUB = join(ROOT, 'public', 'reference-demos', 'github-static');
const DEMO_ARCHIVES = join(ROOT, 'public', 'reference-demos', 'web-archives');
const GENERATED_INDEX = join(
  ROOT,
  'src',
  'reference-lab',
  'generated',
  'referenceIndex.ts',
);

const UNSAFE_TERMS = [
  'backend-api',
  'estuary',
  'sig=',
  'jwt=',
  'auth-success',
  'mail.google.com',
  'instagram.com',
  'x.com/i/chat',
  'private-user-images.githubusercontent.com',
  'chatgpt.com/backend-api',
];

const SAFE_IFRAME_DOMAINS = [
  'liquidgl.naughtyduk.com',
  'liquid-glass-eta.vercel.app',
  'kvideo.pages.dev',
  'css.glass',
  'kube.io',
  'freefrontend.com',
];

const TUANNM93_KEYWORDS = [
  'glass',
  'liquid',
  'aero',
  'blur',
  'bokeh',
  'reflection',
  'refraction',
  'magnifier',
  'switcher',
  'gooey',
  'fluid',
  'bubbles',
  'oceanic',
  'gel',
  'chrome',
  'chromatic',
];

const SECTION_CATEGORY = {
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
  'OTHER PUBLIC': 'Reference/tutorial/package pages',
};

const KNOWN_SCORES = [
  { match: /glass-button-css-only/i, score: 95, candidateFor: ['post-button', 'svg-filter', 'final-hybrid-ui'] },
  { match: /liquid-glass-switcher-css/i, score: 94, candidateFor: ['active-nav-pill', 'search-pill', 'gear-button'] },
  { match: /naughtyduk\/liquidGL|liquidgl\.naughtyduk/i, score: 92, candidateFor: ['sidebar-glass', 'feed-panel', 'right-panel', 'webgl-refraction'] },
  { match: /rdev\/liquid-glass-react|liquid-glass-react/i, score: 90, candidateFor: ['sidebar-glass', 'feed-panel', 'final-hybrid-ui'] },
  { match: /7\.css|khang-nd\/7/i, score: 88, candidateFor: ['aero-windows-style'] },
  { match: /7-Aero-Stylesheet|Z2r-YT\/7-Aero/i, score: 86, candidateFor: ['aero-windows-style'] },
  { match: /glass-refraction|Z1Code\/glass-refraction/i, score: 84, candidateFor: ['svg-filter', 'webgl-refraction'] },
  { match: /liquid-glass-js|dashersw/i, score: 82, candidateFor: ['sidebar-glass', 'final-hybrid-ui'] },
  { match: /archisvaze\/liquid-glass|archisvaze-liquid-glass/i, score: 80, candidateFor: ['svg-filter', 'final-hybrid-ui'] },
  { match: /kube\.io\/blog\/liquid-glass|kube-liquid-glass/i, score: 80, candidateFor: ['svg-filter', 'final-hybrid-ui'] },
  { match: /liquid-glass-bokeh-background|bokeh-background/i, score: 78, candidateFor: ['background-bubbles'] },
];

const stats = {
  publicUrlsParsed: 0,
  codepenDemos: 0,
  githubStaticDemos: 0,
  webArchiveDemos: 0,
  iframeLocal: 0,
  linkOnly: 0,
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
  return UNSAFE_TERMS.some((term) => lower.includes(term));
}

function unsafeDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'invalid-url';
  }
}

function isSafeIframeExternal(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return SAFE_IFRAME_DOMAINS.some(
      (d) => host === d || host.endsWith(`.${d}`),
    );
  } catch {
    return false;
  }
}

function isLinkOnlyHost(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const linkOnly = [
      'github.com',
      'reddit.com',
      'youtube.com',
      'youtu.be',
      'google.com',
      'arxiv.org',
      'wikipedia.org',
      'indiatimes.com',
      'timesofindia.indiatimes.com',
      'businessinsider.com',
      'creativebloq.com',
      'marketwatch.com',
      'reuters.com',
      'techradar.com',
      'theverge.com',
      'tomsguide.com',
      'wired.com',
      'jsfiddle.net',
      'codepen.io',
    ];
    return linkOnly.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return true;
  }
}

function inferRuntimeFromText(text, category) {
  const t = text.toLowerCase();
  if (category === 'YouTube references') return 'video';
  if (category === 'Papers') return 'paper';
  if (
    category === 'Articles/news/design reactions' ||
    category === 'Wikipedia/design history' ||
    category === 'Reddit discussions'
  ) {
    return 'article';
  }
  if (t.includes('webgl') || t.includes('three')) return 'webgl';
  if (t.includes('shader')) return 'shader';
  if (t.includes('vue')) return 'vue';
  if (t.includes('react')) return 'react';
  if (t.includes('svelte')) return 'svelte';
  if (t.includes('svg') || t.includes('filter')) return 'svg-filter';
  if (t.includes('css-only') || t.includes('pure-css') || t.includes('css only')) {
    return 'css-only';
  }
  if (t.includes('.js') || t.includes('vanilla')) return 'vanilla-js';
  if (category === 'Google searches') return 'external';
  if (category === 'GitHub pages') return 'library';
  return 'unknown';
}

function scoreReference(text, category) {
  const t = text.toLowerCase();
  for (const known of KNOWN_SCORES) {
    if (known.match.test(t)) {
      return { score: known.score, candidateFor: [...known.candidateFor] };
    }
  }

  if (category === 'Local CodePen exports') {
    let score = 55;
    const candidates = [];
    if (/button/.test(t)) {
      score = 85;
      candidates.push('post-button', 'final-hybrid-ui');
    } else if (/switcher|navbar|nav/.test(t)) {
      score = 82;
      candidates.push('active-nav-pill', 'search-pill');
    } else if (/svg|filter|refraction/.test(t)) {
      score = 78;
      candidates.push('svg-filter', 'webgl-refraction');
    } else if (/bokeh|bubble|background/.test(t)) {
      score = 72;
      candidates.push('background-bubbles');
    } else if (/liquid|glass/.test(t)) {
      score = 70;
      candidates.push('final-hybrid-ui');
    }
    return { score, candidateFor: candidates };
  }

  if (category === 'Google searches') {
    return { score: 15, candidateFor: [] };
  }
  if (category === 'Papers') {
    return { score: 35, candidateFor: [] };
  }
  if (category === 'Wikipedia/design history') {
    return { score: 30, candidateFor: ['aero-windows-style'] };
  }
  if (category === 'Articles/news/design reactions') {
    return { score: 25, candidateFor: [] };
  }
  if (category === 'Reddit discussions') {
    return { score: 40, candidateFor: [] };
  }
  if (category === 'YouTube references') {
    return { score: 35, candidateFor: [] };
  }
  if (category === 'CodePen pages' || category === 'JSFiddle pages') {
    return { score: 45, candidateFor: [] };
  }
  if (category === 'GitHub pages') {
    if (/glass|liquid|aero/.test(t)) {
      return { score: 60, candidateFor: ['final-hybrid-ui'] };
    }
    return { score: 40, candidateFor: [] };
  }
  if (category === 'Live demos') {
    return { score: 75, candidateFor: ['final-hybrid-ui', 'sidebar-glass'] };
  }
  if (category === 'Reference/tutorial/package pages') {
    return { score: 55, candidateFor: ['svg-filter'] };
  }
  if (category === 'Web archives') {
    return { score: 65, candidateFor: ['final-hybrid-ui'] };
  }
  if (category === 'Local GitHub static demos') {
    return { score: 68, candidateFor: ['final-hybrid-ui'] };
  }
  return { score: 30, candidateFor: [] };
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
  return name
    .replace(/\.html$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferPreviewMode({ sourceUrl, localDemoPath, category }) {
  if (localDemoPath) return 'iframe-local';
  if (sourceUrl && isSafeIframeExternal(sourceUrl)) return 'iframe-external';
  if (
    sourceUrl &&
    (isLinkOnlyHost(sourceUrl) ||
      category === 'Papers' ||
      category === 'Articles/news/design reactions' ||
      category === 'Wikipedia/design history' ||
      category === 'Reddit discussions' ||
      category === 'YouTube references' ||
      category === 'Google searches' ||
      category === 'CodePen pages' ||
      category === 'JSFiddle pages' ||
      category === 'GitHub pages')
  ) {
    return 'link-only';
  }
  if (sourceUrl) return 'link-only';
  return 'source-only';
}

function buildTags(text, runtime, category) {
  const tags = new Set();
  const t = text.toLowerCase();
  if (runtime !== 'unknown') tags.add(runtime);
  if (category.includes('CodePen')) tags.add('codepen');
  if (category.includes('GitHub')) tags.add('github');
  if (category.includes('Web archive')) tags.add('archive');
  for (const kw of ['glass', 'liquid', 'aero', 'blur', 'svg', 'webgl', 'button', 'switcher', 'refraction']) {
    if (t.includes(kw)) tags.add(kw);
  }
  return [...tags];
}

function notesForItem(text, category, candidateFor) {
  if (candidateFor.includes('post-button')) {
    return 'Strong CSS/SVG glass button candidate for the compose/post control.';
  }
  if (candidateFor.includes('active-nav-pill')) {
    return 'Switcher/nav pill styling useful for active tab and search affordances.';
  }
  if (candidateFor.includes('sidebar-glass') || candidateFor.includes('feed-panel')) {
    return 'Panel-level glass treatment candidate for feed chrome and side columns.';
  }
  if (candidateFor.includes('background-bubbles')) {
    return 'Animated background layer for Aero wallpaper depth behind panels.';
  }
  if (candidateFor.includes('aero-windows-style')) {
    return 'Windows Vista / Frutiger Aero styling reference for hybrid UI direction.';
  }
  if (category === 'Google searches') {
    return 'Discovery search — follow links to find runnable demos, not a direct UI port.';
  }
  if (category === 'Papers') {
    return 'Academic background on refraction/glass simulation techniques.';
  }
  if (category === 'Local CodePen exports') {
    return 'Locally exported CodePen source — isolated iframe demo for safe comparison.';
  }
  return 'Reference material for glass/Aero UI exploration in the Reference Lab.';
}

function maybeFinalCategory(item) {
  if (item.usefulnessScore >= 85 || item.candidateFor.includes('final-hybrid-ui')) {
    return 'Final UI candidates';
  }
  return item.category;
}

async function parsePublicUrls(usedIds) {
  const raw = await readFile(PUBLIC_URLS_FILE, 'utf8');
  const lines = raw.split('\n');
  const items = [];
  let currentCategory = null;

  for (const line of lines) {
    const section = line.match(/^=+\s*$/);
    if (line.startsWith('====')) continue;

    const header = line.match(/^([A-Z0-9/ ]+)\s*$/);
    if (header && !line.startsWith('http')) {
      const key = header[1].trim();
      if (SECTION_CATEGORY[key]) currentCategory = SECTION_CATEGORY[key];
      continue;
    }

    const url = line.trim();
    if (!url.startsWith('http')) continue;
    if (isUnsafeUrl(url)) {
      console.log(`Skipped unsafe URL: ${unsafeDomain(url)}`);
      stats.skippedUnsafe += 1;
      continue;
    }

    const category = currentCategory ?? 'Reference/tutorial/package pages';
    const title = titleFromUrl(url);
    const text = `${title} ${url}`;
    const { score, candidateFor } = scoreReference(text, category);
    const runtime = inferRuntimeFromText(text, category);
    const previewMode = inferPreviewMode({ sourceUrl: url, category });
    const id = uniqueId(`url-${title}-${url.slice(-12)}`, usedIds);

    const item = {
      id,
      title,
      category: score >= 85 ? 'Final UI candidates' : category,
      runtime,
      previewMode,
      sourceUrl: url,
      notes: notesForItem(text, category, candidateFor),
      usefulnessScore: score,
      tags: buildTags(text, runtime, category),
      candidateFor,
      hasLocalDemo: false,
      hasExternalUrl: true,
    };

    if (previewMode === 'iframe-local') stats.iframeLocal += 1;
    if (previewMode === 'link-only') stats.linkOnly += 1;

    items.push(item);
    stats.publicUrlsParsed += 1;
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
          } catch {
            /* no index */
          }
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
    if (entry.isDirectory()) {
      await copyDir(from, to);
    } else {
      await cp(from, to);
    }
  }
}

async function ensureWrapperIndex(destDir, srcDir) {
  const indexPath = join(destDir, 'index.html');
  try {
    const content = await readFile(indexPath, 'utf8');
    if (isCompleteHtml(content)) return;
  } catch {
    /* generate below */
  }

  const entries = await readdir(srcDir);
  const cssFiles = entries.filter((f) => /\.(css|scss)$/i.test(f));
  const jsFiles = entries.filter((f) => /\.js$/i.test(f));
  let bodyContent = '';
  try {
    bodyContent = await readFile(join(srcDir, 'index.html'), 'utf8');
  } catch {
    bodyContent = '<div id="app"></div>';
  }

  const cssLinks = cssFiles
    .map((f) => `  <link rel="stylesheet" href="./${f}">`)
    .join('\n');
  const jsScripts = jsFiles
    .map((f) => `  <script src="./${f}" defer></script>`)
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reference Demo</title>
${cssLinks}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; }
  </style>
</head>
<body>
${bodyContent}
${jsScripts}
</body>
</html>
`;
  await writeFile(indexPath, html, 'utf8');
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
    const folderName = entry.name;
    const srcDirs = await findSrcDirs(join(CODEPEN_EXTRACTED, folderName));
    if (srcDirs.length === 0) {
      stats.failed.push(`CodePen: no src/index.html in ${folderName}`);
      continue;
    }

    const srcDir = srcDirs[0];
    const dedupeKey = basename(dirname(srcDir));
    if (seenFolders.has(dedupeKey)) continue;
    seenFolders.add(dedupeKey);

    const safeId = uniqueId(dedupeKey, usedIds);
    const destDir = join(DEMO_CODEPEN, safeId);

    try {
      await mkdir(destDir, { recursive: true });
      await copyDir(srcDir, destDir);
      await ensureWrapperIndex(destDir, srcDir);

      const vaultPath = relative(ROOT, srcDir);
      const demoPath = `/reference-demos/codepen/${safeId}/index.html`;
      const text = dedupeKey;
      const { score, candidateFor } = scoreReference(text, 'Local CodePen exports');
      const runtime = inferRuntimeFromText(text, 'Local CodePen exports');
      const category = maybeFinalCategory({
        usefulnessScore: score,
        candidateFor,
        category: 'Local CodePen exports',
      });

      const item = {
        id: `codepen-${safeId}`,
        title: titleFromPath(dedupeKey),
        category,
        runtime,
        previewMode: 'iframe-local',
        localSourcePath: vaultPath,
        localDemoPath: demoPath,
        notes: notesForItem(text, 'Local CodePen exports', candidateFor),
        usefulnessScore: score,
        tags: buildTags(text, runtime, 'Local CodePen exports'),
        candidateFor,
        hasLocalDemo: true,
        hasExternalUrl: false,
      };

      items.push(item);
      stats.codepenDemos += 1;
      stats.iframeLocal += 1;
    } catch (err) {
      stats.failed.push(`CodePen ${folderName}: ${err.message}`);
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
      const demoPath = `/reference-demos/github-static/${safeId}/index.html`;
      const text = file;
      const { score, candidateFor } = scoreReference(text, 'Local GitHub static demos');
      const runtime = inferRuntimeFromText(text, 'Local GitHub static demos');

      const item = {
        id: `github-${safeId}`,
        title: titleFromPath(file),
        category: 'Local GitHub static demos',
        runtime,
        previewMode: 'iframe-local',
        localSourcePath: vaultPath,
        localDemoPath: demoPath,
        sourceUrl: `https://github.com/tuannm93/lab/blob/main/front-end/${file}`,
        notes: notesForItem(text, 'Local GitHub static demos', candidateFor),
        usefulnessScore: score,
        tags: buildTags(text, runtime, 'Local GitHub static demos'),
        candidateFor,
        hasLocalDemo: true,
        hasExternalUrl: true,
      };

      items.push(item);
      stats.githubStaticDemos += 1;
      stats.iframeLocal += 1;
    } catch (err) {
      stats.failed.push(`GitHub static ${file}: ${err.message}`);
    }
  }

  return items;
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
      await cp(indexSrc, join(destDir, 'index.html'));

      let sourceUrl;
      try {
        sourceUrl = (await readFile(join(archiveDir, 'source_url.txt'), 'utf8')).trim();
        if (sourceUrl && isUnsafeUrl(sourceUrl)) {
          console.log(`Skipped unsafe URL: ${unsafeDomain(sourceUrl)}`);
          sourceUrl = undefined;
        }
      } catch {
        sourceUrl = undefined;
      }

      const vaultPath = relative(ROOT, archiveDir);
      const demoPath = `/reference-demos/web-archives/${safeId}/index.html`;
      const text = `${entry.name} ${sourceUrl ?? ''}`;
      const { score, candidateFor } = scoreReference(text, 'Web archives');
      const runtime = inferRuntimeFromText(text, 'Web archives');
      const previewMode = sourceUrl && isSafeIframeExternal(sourceUrl)
        ? 'iframe-local'
        : 'iframe-local';

      const item = {
        id: `archive-${safeId}`,
        title: titleFromPath(entry.name),
        category: 'Web archives',
        runtime,
        previewMode,
        sourceUrl: sourceUrl || undefined,
        localSourcePath: vaultPath,
        localDemoPath: demoPath,
        notes: notesForItem(text, 'Web archives', candidateFor),
        usefulnessScore: score,
        tags: buildTags(text, runtime, 'Web archives'),
        candidateFor,
        hasLocalDemo: true,
        hasExternalUrl: Boolean(sourceUrl),
      };

      items.push(item);
      stats.webArchiveDemos += 1;
      stats.iframeLocal += 1;
    } catch (err) {
      stats.failed.push(`Web archive ${entry.name}: ${err.message}`);
    }
  }

  return items;
}

function serializeItem(item) {
  const lines = ['  {'];
  lines.push(`    id: ${JSON.stringify(item.id)},`);
  lines.push(`    title: ${JSON.stringify(item.title)},`);
  lines.push(`    category: ${JSON.stringify(item.category)},`);
  lines.push(`    runtime: ${JSON.stringify(item.runtime)},`);
  lines.push(`    previewMode: ${JSON.stringify(item.previewMode)},`);
  if (item.sourceUrl) lines.push(`    sourceUrl: ${JSON.stringify(item.sourceUrl)},`);
  if (item.localSourcePath) {
    lines.push(`    localSourcePath: ${JSON.stringify(item.localSourcePath)},`);
  }
  if (item.localDemoPath) {
    lines.push(`    localDemoPath: ${JSON.stringify(item.localDemoPath)},`);
  }
  if (item.notes) lines.push(`    notes: ${JSON.stringify(item.notes)},`);
  lines.push(`    usefulnessScore: ${item.usefulnessScore},`);
  lines.push(`    tags: ${JSON.stringify(item.tags)},`);
  lines.push(`    candidateFor: ${JSON.stringify(item.candidateFor)},`);
  lines.push(`    hasLocalDemo: ${item.hasLocalDemo},`);
  lines.push(`    hasExternalUrl: ${item.hasExternalUrl},`);
  lines.push('  }');
  return lines.join('\n');
}

async function generateIndex(allItems) {
  allItems.sort((a, b) => b.usefulnessScore - a.usefulnessScore || a.title.localeCompare(b.title));

  const body = `// AUTO-GENERATED by scripts/build-reference-lab.mjs — do not edit manually
import type { ReferenceItem } from '../types';

export const referenceLabBuildStats = ${JSON.stringify(stats, null, 2)} as const;

export const referenceIndex: ReferenceItem[] = [
${allItems.map(serializeItem).join(',\n')}
];
`;

  await mkdir(dirname(GENERATED_INDEX), { recursive: true });
  await writeFile(GENERATED_INDEX, body, 'utf8');
}

async function recreateDir(dir) {
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
}

async function main() {
  console.log('Building Reference Lab…\n');

  await recreateDir(DEMO_CODEPEN);
  await recreateDir(DEMO_GITHUB);
  await recreateDir(DEMO_ARCHIVES);

  const usedIds = new Set();
  const publicItems = await parsePublicUrls(usedIds);
  const codepenItems = await buildCodepenDemos(usedIds);
  const githubItems = await buildGithubStaticDemos(usedIds);
  const archiveItems = await buildWebArchiveDemos(usedIds);

  const allItems = [...publicItems, ...codepenItems, ...githubItems, ...archiveItems];
  await generateIndex(allItems);

  console.log('Reference Lab build summary');
  console.log('───────────────────────────');
  console.log(`Public URLs parsed:        ${stats.publicUrlsParsed}`);
  console.log(`CodePen local demos:       ${stats.codepenDemos}`);
  console.log(`GitHub static demos:       ${stats.githubStaticDemos}`);
  console.log(`Web archive demos:         ${stats.webArchiveDemos}`);
  console.log(`iframe-local references:   ${stats.iframeLocal}`);
  console.log(`link-only references:      ${stats.linkOnly}`);
  console.log(`Skipped unsafe URLs:       ${stats.skippedUnsafe}`);
  console.log(`Total references indexed:  ${allItems.length}`);
  if (stats.failed.length > 0) {
    console.log(`\nFailures (${stats.failed.length}):`);
    for (const f of stats.failed.slice(0, 20)) console.log(`  - ${f}`);
    if (stats.failed.length > 20) {
      console.log(`  … and ${stats.failed.length - 20} more`);
    }
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
