#!/usr/bin/env node
/**
 * Static (+ optional Playwright) health audit for Raw Reference Lab demos.
 * Output: public/raw-reference-lab/demo-health.json
 * Debug pages: public/raw-reference-lab/debug/<demo-id>.html
 */
import {
  access,
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from 'node:fs/promises';
import { basename, dirname, extname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LAB = join(ROOT, 'public', 'raw-reference-lab');
const INDEX_FILE = join(LAB, 'raw-reference-index.json');
const RUNNERS_FILE = join(LAB, 'reference-runners.json');
const STATUS_FILE = join(LAB, 'runner-status.json');
const OUT_FILE = join(LAB, 'demo-health.json');
const DEBUG_DIR = join(LAB, 'debug');
const RUNNERS_LOGS = join(ROOT, '.raw-reference-runners', 'logs');

const PREPROCESSOR_EXTS = new Set(['.scss', '.sass', '.less', '.pug', '.ts', '.tsx', '.jsx']);
const PREPROCESSOR_CONFIG = ['tailwind.config.js', 'tailwind.config.cjs', 'tailwind.config.ts', 'postcss.config.js', 'postcss.config.cjs'];
const CODEPEN_MARKERS = [
  /codepen/i,
  /\bCP\./,
  /window\.__CP/,
  /data-codepen/,
  /<!--\s*CodePen/i,
];
const EXTERNAL_PROTOCOL = /^https?:|^\/\/|^data:/i;
const EXTERNAL_JS_HINT = /\.js(?:\?|$)|\/npm\/|esm\.sh|unpkg\.com|cdnjs\.cloudflare|jsdelivr|googleapis\.com\/ajax|gstatic\.com\/firebase|cdn\.|\/lib\/|module/i;
const EXTERNAL_FONT_HINT = /fonts\.googleapis|fonts\.gstatic|use\.typekit|fontawesome|font/i;
const EXTERNAL_IMAGE_HINT = /\.(png|jpe?g|gif|webp|svg|avif|ico)(\?|$)|images\.unsplash|picsum|pexels|placehold/i;

const FIXABLE_LOCAL_REASONS = new Set([
  'js-module-mismatch',
  'missing-local-asset',
  'scss-not-compiled',
]);
const WRAPPER_ISSUE_REASONS = new Set([
  'js-module-mismatch',
  'missing-local-asset',
]);

const JSFIDDLE_MARKERS = [
  /jsfiddle\.net\/css\/dist-editor/i,
  /jsfiddle\.net\/js\/_dist-editor/i,
  /monaco-editor/i,
  /dist-skeleton\.css/i,
];
const FREEFRONTEND_MARKERS = [
  /freefrontend\.com/i,
  /pagead2\.googlesyndication\.com/i,
  /googletagmanager\.com\/gtag/i,
  /github\.com\/[^"']+\.png\?size=/i,
];
const PARTIAL_ARCHIVE_CAUSES = new Set([
  'partial-archive-jsfiddle',
  'partial-archive-freefrontend',
  'partial-archive-nuxt',
  'partial-archive-spa',
  'partial-archive-web',
]);

function normalizeUrl(url) {
  return (url || '').replace(/\/$/, '').toLowerCase();
}

function githubRepoKey(url) {
  const match = (url || '').match(/github\.com\/[^/]+\/([^/?#]+)/i);
  return match ? match[1].toLowerCase().replace(/\.git$/, '') : null;
}

function localPathMatchesRunner(localPath, runner) {
  if (!localPath || !runner) return false;
  const rid = runner.id.toLowerCase();
  if (localPath === runner.sourcePath) return true;
  if (localPath.endsWith('/' + runner.id) || localPath.endsWith('/' + rid)) return true;
  const base = localPath.split('/').pop()?.toLowerCase() || '';
  return base === rid || base.replace(/[^a-z0-9]+/g, '') === rid.replace(/[^a-z0-9]+/g, '');
}

function findRunnerForItem(item, runners) {
  if (!runners?.length) return null;
  const sourceUrl = item.sourceUrl || '';
  const localPath = item.localSourcePath || '';
  const itemRepo = githubRepoKey(sourceUrl);
  const sorted = [...runners].sort((a, b) => b.id.length - a.id.length);
  return sorted.find((r) => {
    const rid = r.id.toLowerCase();
    const ridSlug = rid.replace(/[^a-z0-9]+/g, '');
    if (r.sourceUrl && item.sourceUrl && normalizeUrl(item.sourceUrl) === normalizeUrl(r.sourceUrl)) return true;
    if (localPathMatchesRunner(localPath, r)) return true;
    const runnerRepo = githubRepoKey(r.sourceUrl);
    if (itemRepo && runnerRepo && itemRepo === runnerRepo) return true;
    if (itemRepo && (itemRepo === rid || itemRepo.replace(/[^a-z0-9]+/g, '') === ridSlug)) return true;
    return false;
  }) ?? null;
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function localDemoUrlToFile(localDemoUrl) {
  if (!localDemoUrl) return null;
  const prefix = '/raw-reference-lab/';
  if (!localDemoUrl.startsWith(prefix)) return null;
  return join(LAB, localDemoUrl.slice(prefix.length));
}

function resolveRef(htmlDir, ref) {
  if (!ref || ref.startsWith('#') || ref.startsWith('mailto:') || ref.startsWith('javascript:')) return null;
  if (EXTERNAL_PROTOCOL.test(ref)) return { type: 'external', url: ref };
  const abs = normalize(resolve(htmlDir, ref));
  return { type: 'local', path: abs };
}

function stripScriptBlocks(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

function extractRefs(html) {
  const refs = [];
  const patterns = [
    /<link[^>]+href=["']([^"']+)["']/gi,
    /<script[^>]+src=["']([^"']+)["']/gi,
    /<img[^>]+src=["']([^"']+)["']/gi,
    /<source[^>]+src=["']([^"']+)["']/gi,
    /<video[^>]+src=["']([^"']+)["']/gi,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) !== null) refs.push(m[1].trim());
  }
  const htmlNoScripts = stripScriptBlocks(html);
  const urlRe = /(?<![a-zA-Z0-9])url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
  let m;
  while ((m = urlRe.exec(htmlNoScripts)) !== null) refs.push(m[1].trim());
  return refs;
}

function isPathInsideDemo(demoDir, absPath) {
  const rel = relative(demoDir, absPath);
  return rel && !rel.startsWith('..') && !resolve(demoDir, rel).includes('..');
}

function classifyMissingRef(ref, resolvedPath, demoDir) {
  const base = basename(ref).toLowerCase();
  if (ref.startsWith('#')) return 'ignore';
  if (/^(blob|none)$/i.test(ref)) return 'ignore';
  if (/[{}]/.test(ref)) return 'archive-template';
  if (/^data:|^javascript:/i.test(ref)) return 'ignore';
  if (/favicon\.(ico|png|svg|webp)$/i.test(base)) return 'decorative-missing';
  if (/\.(ico|png|svg|webp)$/i.test(base) && /favicon|apple-touch|mstile|manifest/i.test(ref)) {
    return 'decorative-missing';
  }
  if (ref.startsWith('/') && !ref.startsWith('//')) return 'archive-gap';
  if (/(?:^|\/)\.\.(?:\/|$)/.test(ref)) return 'archive-gap';
  if (!isPathInsideDemo(demoDir, resolvedPath)) return 'archive-gap';
  return 'blocking-missing';
}

function extractScriptTags(html) {
  const tags = [];
  const re = /<script([^>]*?)src=["']([^"']+)["']([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    tags.push({
      attrs: `${m[1] || ''} ${m[3] || ''}`,
      src: m[2],
      isModule: /type\s*=\s*["']module["']/i.test(`${m[1]}${m[3]}`),
    });
  }
  return tags;
}

async function scanDemoFolder(demoDir) {
  const found = {
    preprocessors: [],
    configs: [],
  };
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(p);
        continue;
      }
      const ext = extname(ent.name).toLowerCase();
      if (PREPROCESSOR_EXTS.has(ext)) found.preprocessors.push(relative(demoDir, p));
      if (PREPROCESSOR_CONFIG.includes(ent.name)) found.configs.push(relative(demoDir, p));
    }
  }
  await walk(demoDir);
  return found;
}

async function readTextSafe(path) {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

function classifyExternalUrl(url) {
  if (EXTERNAL_JS_HINT.test(url)) return 'js';
  if (EXTERNAL_FONT_HINT.test(url)) return 'font';
  if (EXTERNAL_IMAGE_HINT.test(url)) return 'image';
  if (/\.css(\?|$)/i.test(url)) return 'css';
  return 'other';
}

function pickHealth(finding) {
  const { causes, details } = finding;
  if (causes.has('runner-install-failed') || causes.has('runner-start-failed')) {
    return { health: 'runner-failed', reason: 'runner-start-failed', details };
  }
  if (causes.has('runner-not-started')) {
    return { health: 'needs-runner', reason: 'runner-not-started', details };
  }
  if (causes.has('external-only') && causes.size === 1) {
    return { health: 'external-only', reason: 'external-only', details };
  }
  if (causes.has('source-only-no-entrypoint') && !causes.has('runner-not-started')) {
    return { health: 'source-only', reason: 'source-only-no-entrypoint', details };
  }
  if (causes.has('missing-local-file')) {
    return { health: 'broken', reason: 'missing-local-file', details };
  }
  if (causes.has('scss-not-compiled') || causes.has('codepen-preprocessor-required') || causes.has('typescript-jsx-not-built') || causes.has('tailwind-not-built')) {
    const reason = [...causes].find((c) =>
      ['scss-not-compiled', 'codepen-preprocessor-required', 'typescript-jsx-not-built', 'tailwind-not-built'].includes(c),
    ) || 'codepen-preprocessor-required';
    return { health: 'needs-preprocessor', reason, details };
  }
  if (causes.has('js-module-mismatch')) {
    return { health: 'broken', reason: 'js-module-mismatch', details };
  }
  const hasLocalBlocker = causes.has('missing-local-asset') || causes.has('js-module-mismatch');
  const hasArchiveGap = causes.has('archive-asset-gap');
  const hasExternalJs = causes.has('external-js-required');
  const hasExternalDecorative = causes.has('external-decorative-asset');
  if (hasExternalJs && !hasLocalBlocker) {
    return { health: 'needs-external-assets', reason: 'external-js-required', details };
  }
  if (hasArchiveGap && !hasLocalBlocker) {
    return { health: 'needs-external-assets', reason: 'archive-asset-gap', details };
  }
  if (hasLocalBlocker) {
    return { health: 'broken', reason: causes.has('js-module-mismatch') ? 'js-module-mismatch' : 'missing-local-asset', details };
  }
  if (hasExternalDecorative || causes.has('external-cdn-required')) {
    return { health: 'warning', reason: hasExternalDecorative ? 'external-decorative-asset' : 'external-cdn-required', details };
  }
  if (causes.has('browser-console-error') || causes.has('browser-page-error')) {
    return { health: 'broken', reason: 'browser-console-error', details };
  }
  if (causes.has('browser-network-failure')) {
    return { health: 'warning', reason: 'external-decorative-asset', details };
  }
  if (finding.playwrightOk) {
    return { health: 'working', reason: 'static-and-browser-ok', details };
  }
  if (causes.size === 0 && details.some((d) => d.includes('Runner active'))) {
    return { health: 'working', reason: 'runner-active', details };
  }
  if (finding.staticOk && causes.size === 0) {
    return { health: 'working', reason: 'static-checks-passed', details };
  }
  return { health: 'unknown', reason: 'unknown', details };
}

async function readPathDiagnostics(demoDir) {
  try {
    const raw = await readFile(join(demoDir, 'entry.path-diagnostics.json'), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function auditLocalDemo(item) {
  const causes = new Set();
  const details = [];
  const missingFiles = [];
  const externalUrls = [];
  const pathDiagnostics = [];
  const refDiagnostics = [];
  let staticOk = true;

  const demoFile = localDemoUrlToFile(item.localDemoUrl);
  if (!demoFile) {
    causes.add('missing-local-file');
    details.push('localDemoUrl is missing or not under /raw-reference-lab/');
    staticOk = false;
    return { causes, details, missingFiles, externalUrls, staticOk, demoFile: null, demoDir: null };
  }

  if (!(await pathExists(demoFile))) {
    causes.add('missing-local-file');
    details.push(`Demo HTML file not found: ${relative(ROOT, demoFile)}`);
    staticOk = false;
    return { causes, details, missingFiles, externalUrls, staticOk, demoFile, demoDir: dirname(demoFile) };
  }

  const html = await readTextSafe(demoFile);
  if (!html) {
    causes.add('missing-local-file');
    details.push('Demo HTML file is unreadable');
    staticOk = false;
    return { causes, details, missingFiles, externalUrls, staticOk, demoFile, demoDir: dirname(demoFile) };
  }

  const demoDir = dirname(demoFile);
  const demoRoot = demoDir;
  const pathDiagFile = await readPathDiagnostics(demoDir);
  if (pathDiagFile?.paths?.length) {
    for (const row of pathDiagFile.paths) {
      pathDiagnostics.push(row);
      details.push(`Path: ${row.ref} → ${row.resolved ?? '—'} · exists: ${row.exists ? 'yes' : 'no'}`);
    }
  }
  if (pathDiagFile?.scssInfo?.error) {
    causes.add('scss-not-compiled');
    details.push(`SCSS compile failed: ${pathDiagFile.scssInfo.error}`);
    staticOk = false;
  } else if (pathDiagFile?.scssInfo?.compiled) {
    details.push('SCSS compiled to entry.generated.css');
  } else if (pathDiagFile?.scssInfo?.skipped && pathDiagFile?.scssInfo?.error) {
    details.push(`SCSS compile skipped: ${pathDiagFile.scssInfo.error}`);
  }

  const hasGeneratedCss = await pathExists(join(demoDir, 'entry.generated.css'));

  for (const marker of CODEPEN_MARKERS) {
    if (marker.test(html)) {
      causes.add('codepen-preprocessor-required');
      details.push('HTML contains CodePen-specific markers or comments');
      staticOk = false;
      break;
    }
  }

  const refs = extractRefs(html);
  for (const ref of refs) {
    const resolved = resolveRef(demoDir, ref);
    if (!resolved) continue;
    if (resolved.type === 'external') {
      externalUrls.push(resolved.url);
      const kind = classifyExternalUrl(resolved.url);
      refDiagnostics.push({ ref, resolved: resolved.url, exists: true, kind: `external-${kind}` });
      if (kind === 'js') {
        causes.add('external-js-required');
        details.push(`External JS required: ${resolved.url}`);
      } else {
        causes.add('external-decorative-asset');
        details.push(`External ${kind} asset (needs internet): ${resolved.url}`);
      }
      continue;
    }
    const ext = extname(resolved.path).toLowerCase();
    if (PREPROCESSOR_EXTS.has(ext)) {
      if ((ext === '.scss' || ext === '.sass') && hasGeneratedCss) {
        refDiagnostics.push({ ref, resolved: relative(ROOT, resolved.path), exists: true, kind: 'scss-generated' });
        details.push(`SCSS source present but entry.generated.css is used: ${relative(ROOT, resolved.path)}`);
        continue;
      }
      refDiagnostics.push({ ref, resolved: relative(ROOT, resolved.path), exists: true, kind: 'preprocessor' });
      if (ext === '.scss' || ext === '.sass') causes.add('scss-not-compiled');
      else if (ext === '.ts' || ext === '.tsx' || ext === '.jsx') causes.add('typescript-jsx-not-built');
      else causes.add('codepen-preprocessor-required');
      details.push(`Preprocessor file referenced directly: ${relative(ROOT, resolved.path)}`);
      staticOk = false;
      continue;
    }
    if (!(await pathExists(resolved.path))) {
      const missingKind = classifyMissingRef(ref, resolved.path, demoDir);
      refDiagnostics.push({
        ref,
        resolved: relative(ROOT, resolved.path),
        exists: false,
        kind: missingKind,
      });
      if (missingKind === 'ignore') continue;
      if (missingKind === 'decorative-missing') {
        details.push(`Decorative asset not bundled locally: ${ref}`);
        continue;
      }
      if (missingKind === 'archive-template') {
        causes.add('archive-asset-gap');
        details.push(`Archive template placeholder (not a local file): ${ref}`);
        continue;
      }
      if (missingKind === 'archive-gap') {
        causes.add('archive-asset-gap');
        details.push(`Archive bundle gap (not in local copy): ${ref}`);
        continue;
      }
      causes.add('missing-local-asset');
      missingFiles.push(relative(ROOT, resolved.path));
      details.push(`Missing local asset: ${relative(ROOT, resolved.path)}`);
      staticOk = false;
    } else {
      refDiagnostics.push({ ref, resolved: relative(ROOT, resolved.path), exists: true, kind: 'local' });
    }
  }

  const scriptTags = extractScriptTags(html);
  const scriptDiagnostics = [];
  for (const tag of scriptTags) {
    const resolved = resolveRef(demoDir, tag.src);
    if (!resolved || resolved.type !== 'local') continue;
    const js = await readTextSafe(resolved.path);
    const usesModules = js ? /\b(import|export)\s/m.test(js) : false;
    const expectedType = usesModules ? 'module' : 'classic';
    const generatedType = tag.isModule ? 'module' : 'classic';
    scriptDiagnostics.push({
      ref: tag.src,
      resolved: relative(ROOT, resolved.path),
      exists: Boolean(js),
      expectedType,
      generatedType,
    });
    if (!js) continue;
    if (usesModules && !tag.isModule) {
      causes.add('js-module-mismatch');
      details.push(`script.js uses import/export but is loaded without type="module": ${relative(ROOT, resolved.path)}`);
      staticOk = false;
    }
  }

  const folderScan = await scanDemoFolder(demoRoot);
  for (const p of folderScan.preprocessors) {
    const ext = extname(p).toLowerCase();
    const cssSibling = p.replace(/\.(scss|sass|less)$/i, '.css');
    const htmlRefsCss = refs.some((r) => r.includes(basename(cssSibling)) || r.includes(p));
    if ((ext === '.scss' || ext === '.sass') && !refs.some((r) => r.endsWith('.css')) && !hasGeneratedCss) {
      causes.add('scss-not-compiled');
      details.push(`SCSS/Sass source present (${p}) but HTML may not link compiled CSS`);
      staticOk = false;
    }
    if ((ext === '.ts' || ext === '.tsx' || ext === '.jsx') && htmlRefsCss) {
      causes.add('typescript-jsx-not-built');
      details.push(`TypeScript/JSX source present: ${p}`);
      staticOk = false;
    }
  }
  for (const cfg of folderScan.configs) {
    causes.add('tailwind-not-built');
    details.push(`Build config present: ${cfg}`);
    staticOk = false;
  }

  if (externalUrls.length && !causes.has('missing-local-asset') && !causes.has('scss-not-compiled')) {
    const jsCount = externalUrls.filter((u) => classifyExternalUrl(u) === 'js').length;
    const decorativeCount = externalUrls.length - jsCount;
    if (decorativeCount) details.push(`${decorativeCount} external image/font URL(s) — demo likely renders online`);
    if (jsCount) details.push(`${jsCount} external JS URL(s) — requires network for full behavior`);
  }

  detectPartialArchivePatterns(item, html, causes, details);

  return {
    causes,
    details,
    missingFiles,
    externalUrls,
    staticOk,
    demoFile,
    demoDir,
    pathDiagnostics,
    refDiagnostics,
    scriptDiagnostics,
  };
}

function auditRunnerItem(item, runner, liveStatus) {
  const causes = new Set();
  const details = [];
  const status = liveStatus?.status ?? runner?.status ?? 'not-started';
  const logPath = join('.raw-reference-runners', 'logs', `${runner.id}.log`);

  if (!runner?.runnable) {
    if (item.localSourcePath || runner?.sourcePath) {
      causes.add('source-only-no-entrypoint');
      details.push('Local source exists but no runnable local demo page');
    }
    return { causes, details, logPath: null };
  }

  if (status === 'install-failed') {
    causes.add('runner-install-failed');
    details.push('Runner install failed — inspect log');
  } else if (status === 'start-failed' || status === 'failed' || status === 'start-timeout') {
    causes.add('runner-start-failed');
    details.push(`Runner start failed (${status}) — inspect log`);
  } else if (status !== 'running') {
    causes.add('runner-not-started');
    details.push(`Runner not running (status: ${status})`);
  } else {
    details.push(`Runner active at ${liveStatus?.localDevUrl || runner.localDevUrl}`);
    return { causes, details, logPath: null };
  }

  return { causes, details, logPath: (causes.has('runner-install-failed') || causes.has('runner-start-failed')) ? logPath : null };
}

async function generateDebugPage(item, record, audit) {
  const debugFile = join(DEBUG_DIR, `${item.id}.html`);
  const debugUrl = `/raw-reference-lab/debug/${item.id}.html`;
  const demoUrl = item.localDemoUrl || '';
  const iframeSrc = demoUrl || 'about:blank';
  const isBroken = record.health === 'broken';

  const detailsHtml = (record.healthDetails || [])
    .map((d) => `<li>${escapeHtml(d)}</li>`)
    .join('');

  const refRows = (audit?.refDiagnostics?.length ? audit.refDiagnostics : audit?.pathDiagnostics ?? [])
    .slice(0, 24)
    .map((row) => `<tr>
      <td><code>${escapeHtml(row.ref)}</code></td>
      <td><code>${escapeHtml(row.resolved ?? '—')}</code></td>
      <td>${row.exists ? 'yes' : 'no'}</td>
    </tr>`)
    .join('');

  const scriptRows = (audit?.scriptDiagnostics ?? [])
    .map((row) => `<tr>
      <td><code>${escapeHtml(row.ref)}</code></td>
      <td><code>${escapeHtml(row.resolved ?? '—')}</code></td>
      <td>${row.exists ? 'yes' : 'no'}</td>
      <td>${escapeHtml(row.expectedType ?? '—')}</td>
      <td>${escapeHtml(row.generatedType ?? '—')}</td>
    </tr>`)
    .join('');

  const brokenPanel = isBroken ? `
      <h2>Broken reason</h2>
      <p class="reason">${escapeHtml(record.healthReason || 'unknown')}</p>
      <h2>Referenced path</h2>
      <table style="width:100%;font-size:0.72rem;border-collapse:collapse">
        <thead><tr><th align="left">Referenced</th><th align="left">Resolved local path</th><th>Exists</th></tr></thead>
        <tbody>${refRows || '<tr><td colspan="3">—</td></tr>'}</tbody>
      </table>
      <h2>Script type</h2>
      <table style="width:100%;font-size:0.72rem;border-collapse:collapse">
        <thead><tr><th align="left">Referenced</th><th align="left">Resolved</th><th>Exists</th><th>Expected</th><th>Generated</th></tr></thead>
        <tbody>${scriptRows || '<tr><td colspan="5">—</td></tr>'}</tbody>
      </table>
      <h2>Original source path</h2>
      <p class="meta"><code>${escapeHtml(item.localSourcePath || '—')}</code></p>
      <h2>Local demo URL</h2>
      <p class="meta"><a href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener">${escapeHtml(demoUrl || '—')}</a></p>
  ` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Debug: ${escapeHtml(item.title || item.id)}</title>
  <style>
    :root { color-scheme: dark; --bg:#0f1419; --panel:#1a2332; --text:#e8eef5; --muted:#8aa0b5; --accent:#5eb3ff; --warn:#ffb080; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: var(--bg); color: var(--text); }
    header { padding: 1rem 1.25rem; border-bottom: 1px solid #2a3544; background: var(--panel); }
    h1 { margin: 0 0 0.25rem; font-size: 1.1rem; }
    .meta { font-size: 0.8rem; color: var(--muted); word-break: break-all; }
    main { display: grid; grid-template-columns: minmax(280px, 380px) 1fr; min-height: calc(100vh - 72px); }
    .panel { padding: 1rem 1.25rem; border-right: 1px solid #2a3544; overflow: auto; }
    .panel h2 { font-size: 0.85rem; margin: 1rem 0 0.4rem; color: var(--accent); }
    .panel h2:first-child { margin-top: 0; }
    .badge { display: inline-block; font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 999px; border: 1px solid #445; margin-bottom: 0.5rem; }
    ul { margin: 0.25rem 0 0; padding-left: 1.1rem; font-size: 0.78rem; color: #c8d6e4; }
    code { font-size: 0.72rem; word-break: break-all; }
    .preview { background: #000; }
    iframe { width: 100%; height: 100%; min-height: calc(100vh - 72px); border: 0; background: #fff; }
    a { color: var(--accent); }
    .reason { color: var(--warn); font-size: 0.82rem; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(item.title || item.id)}</h1>
    <div class="meta">Health: <strong>${escapeHtml(record.health)}</strong> · ID: ${escapeHtml(item.id)}</div>
  </header>
  <main>
    <section class="panel">
      <span class="badge">${escapeHtml(record.health)}</span>
      <p class="reason">Likely issue: ${escapeHtml(record.healthReason || 'unknown')}</p>
      ${brokenPanel}
      <h2>Details</h2>
      <ul>${detailsHtml || '<li>No details recorded</li>'}</ul>
      <h2>Local demo URL</h2>
      <p class="meta"><a href="${escapeHtml(demoUrl)}" target="_blank" rel="noopener">${escapeHtml(demoUrl || '—')}</a></p>
      <h2>Local source path</h2>
      <p class="meta"><code>${escapeHtml(item.localSourcePath || '—')}</code></p>
      <h2>Source URL</h2>
      <p class="meta">${item.sourceUrl ? `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(item.sourceUrl)}</a>` : '—'}</p>
      ${record.logPath ? `<h2>Runner log</h2><p class="meta"><code>${escapeHtml(record.logPath)}</code></p>` : ''}
      ${audit?.missingFiles?.length ? `<h2>Missing files</h2><ul>${audit.missingFiles.map((f) => `<li><code>${escapeHtml(f)}</code></li>`).join('')}</ul>` : ''}
      ${audit?.externalUrls?.length ? `<h2>External URLs</h2><ul>${audit.externalUrls.slice(0, 12).map((u) => `<li><code>${escapeHtml(u)}</code></li>`).join('')}</ul>` : ''}
      ${!isBroken && audit?.pathDiagnostics?.length ? `<h2>Path diagnostics</h2><table style="width:100%;font-size:0.72rem;border-collapse:collapse"><thead><tr><th align="left">Referenced</th><th align="left">Resolved</th><th>Exists</th></tr></thead><tbody>${audit.pathDiagnostics.map((row) => `<tr><td><code>${escapeHtml(row.ref)}</code></td><td><code>${escapeHtml(row.resolved ?? '—')}</code></td><td>${row.exists ? 'yes' : 'no'}</td></tr>`).join('')}</tbody></table>` : ''}
      ${record.browserErrors?.length ? `<h2>Browser errors</h2><ul>${record.browserErrors.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>` : ''}
      ${WRAPPER_ISSUE_REASONS.has(record.healthReason) ? `<p class="reason">Likely generated-wrapper issue</p>` : ''}
    </section>
    <section class="preview">
      <iframe src="${escapeHtml(iframeSrc)}" title="Demo preview"></iframe>
    </section>
  </main>
</body>
</html>`;

  await writeFile(debugFile, html, 'utf8');
  return debugUrl;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;');
}

function detectPartialArchivePatterns(item, html, causes, details) {
  const id = (item.id || '').toLowerCase();
  const demoUrl = (item.localDemoUrl || '').toLowerCase();
  const group = (item.group || '').toLowerCase();

  if (/jsfiddle/i.test(id) || /jsfiddle/i.test(demoUrl) || JSFIDDLE_MARKERS.some((re) => re.test(html))) {
    causes.add('partial-archive-jsfiddle');
    if (!details.some((d) => d.includes('JSFiddle editor shell'))) {
      details.push('Partial archive: JSFiddle editor shell (not a clean runnable demo)');
    }
  }

  if (/freefrontend/i.test(id) || /freefrontend/i.test(demoUrl) || FREEFRONTEND_MARKERS.some((re) => re.test(html))) {
    causes.add('partial-archive-freefrontend');
    if (!details.some((d) => d.includes('FreeFrontend listing'))) {
      details.push('Partial archive: FreeFrontend listing/source page');
    }
  }

  const hasNuxtGap = details.some((d) => /\/_nuxt\//i.test(d) && d.includes('Archive bundle gap'));
  const hasSpaAssetGap = details.some((d) => /\/assets\/[^"'\s]+\.js/i.test(d) && d.includes('Archive bundle gap'));
  if (hasNuxtGap) {
    causes.add('partial-archive-nuxt');
    if (!details.some((d) => d.includes('missing Nuxt bundles'))) {
      details.push('Partial archive: missing Nuxt bundles (/_nuxt/)');
    }
  }
  if (hasSpaAssetGap && (/kube/i.test(id) || /kube/i.test(demoUrl))) {
    causes.add('partial-archive-spa');
    if (!details.some((d) => d.includes('missing SPA bundles'))) {
      details.push('Partial archive: missing SPA bundles (/assets/)');
    }
  }

  if (group === 'web archives' || /^archive-/i.test(id)) {
    if (causes.has('archive-asset-gap') || causes.has('external-js-required')) {
      causes.add('partial-archive-web');
    }
  }
}

function isPartialArchiveFromCauses(causes, item) {
  if ([...PARTIAL_ARCHIVE_CAUSES].some((c) => causes.has(c))) return true;
  if (/^archive-/i.test(item.id || '') && causes.has('archive-asset-gap')) return true;
  if ((item.group || '').toLowerCase() === 'web archives' && causes.has('archive-asset-gap')) return true;
  return false;
}

function describeClassification(item, flags) {
  if (flags.isPartialArchive && flags.partialArchiveKind === 'jsfiddle') {
    return 'This is a local archive of the JSFiddle page/editor shell, not a clean extracted runnable demo. It depends on JSFiddle assets and may require internet.';
  }
  if (flags.isPartialArchive && flags.partialArchiveKind === 'freefrontend') {
    return 'This is a local archive of the listing/source page. It may reference CodePen snippets, ads, analytics, GitHub avatars, or remote assets. It is not necessarily a standalone runnable demo.';
  }
  if (flags.isPartialArchive && (flags.partialArchiveKind === 'nuxt' || flags.partialArchiveKind === 'spa' || flags.partialArchiveKind === 'web')) {
    return 'This archive is missing bundled app assets such as /_nuxt or /assets files. Treat it as a partial archive, not a local runnable demo.';
  }
  if (flags.isRemoteDependent || (flags.needsInternet && item.localDemoUrl)) {
    return 'A local archive exists, but this page depends on remote assets or remote site runtime. It may not run fully offline.';
  }
  return null;
}

function computeClassification(item, runner, liveStatus, health, causes) {
  const runnerPath = runner?.runnerPath || null;
  const localDevUrl = liveStatus?.localDevUrl || runner?.localDevUrl || null;
  const hasLocalFiles = Boolean(
    item.localDemoUrl ||
    item.localSourcePath ||
    runnerPath ||
    localDevUrl ||
    runner?.sourcePath,
  );

  const needsInternet = causes.has('external-js-required')
    || causes.has('external-decorative-asset')
    || causes.has('external-cdn-required')
    || (causes.has('archive-asset-gap') && isPartialArchiveFromCauses(causes, item));

  const isPartialArchive = isPartialArchiveFromCauses(causes, item);

  let partialArchiveKind = null;
  if (causes.has('partial-archive-jsfiddle')) partialArchiveKind = 'jsfiddle';
  else if (causes.has('partial-archive-freefrontend')) partialArchiveKind = 'freefrontend';
  else if (causes.has('partial-archive-nuxt')) partialArchiveKind = 'nuxt';
  else if (causes.has('partial-archive-spa')) partialArchiveKind = 'spa';
  else if (isPartialArchive) partialArchiveKind = 'web';

  const isRemoteDependent = Boolean(
    item.localDemoUrl && (
      needsInternet ||
      isPartialArchive ||
      causes.has('external-js-required') ||
      causes.has('archive-asset-gap')
    ),
  );

  const isLocalDevServer = Boolean(
    runner?.runnable &&
    liveStatus?.status === 'running' &&
    String(localDevUrl || '').startsWith('http://localhost:'),
  );

  const isSourceOnly = health === 'source-only'
    || (Boolean(item.localSourcePath) && !item.localDemoUrl && !isLocalDevServer);

  const isExternalOnly = health === 'external-only'
    || (!hasLocalFiles && !item.localDemoUrl && !item.localSourcePath);

  const isLocalStaticDemo = Boolean(
    item.localDemoUrl &&
    health === 'working' &&
    !needsInternet &&
    !isPartialArchive &&
    !isRemoteDependent &&
    !isLocalDevServer,
  );

  const runsLocally = Boolean(
    isLocalDevServer ||
    (health === 'working' &&
      !needsInternet &&
      !isPartialArchive &&
      !isRemoteDependent &&
      Boolean(item.localDemoUrl)),
  );

  const flags = {
    hasLocalFiles,
    runsLocally,
    isLocalStaticDemo,
    isLocalDevServer,
    isPartialArchive,
    needsInternet,
    isRemoteDependent,
    isSourceOnly,
    isExternalOnly,
    partialArchiveKind,
  };

  const buttonLabel = (() => {
    if (flags.isLocalDevServer) return 'Open local dev server';
    if (flags.isLocalStaticDemo || (flags.runsLocally && item.localDemoUrl)) return 'Open local demo';
    if (flags.isPartialArchive && item.localDemoUrl) return 'Open partial archive';
    if ((flags.isRemoteDependent || flags.needsInternet) && item.localDemoUrl) return 'Open remote-dependent local page';
    if (flags.isSourceOnly) return 'Open source URL';
    if (flags.isExternalOnly) return 'Open source';
    return null;
  })();

  return {
    ...flags,
    buttonLabel,
    classificationDescription: describeClassification(item, flags),
  };
}

async function tryPlaywrightAudit(itemsById, records) {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    console.log('Playwright not installed; static audit only.');
    return false;
  }

  const { chromium } = playwright;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const base = process.env.RRL_AUDIT_BASE || 'http://localhost:5173';

  for (const item of Object.values(itemsById)) {
    if (!item.localDemoUrl) continue;
    const record = records[item.id];
    if (!record || record.health === 'external-only' || record.health === 'source-only') continue;

    const url = `${base}${item.localDemoUrl}`;
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
    page.removeAllListeners('requestfailed');

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(String(err.message || err)));
    page.on('requestfailed', (req) => {
      failedRequests.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText || 'failed'}`);
    });

    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(500);
      if (!resp || !resp.ok()) {
        record.healthDetails.push(`HTTP ${resp?.status() ?? 'no response'} for ${url}`);
        record._causes = record._causes || new Set();
        record._causes.add('missing-local-file');
      }
      if (consoleErrors.length) {
        record.browserErrors = consoleErrors.slice(0, 8);
        record.healthDetails.push(...consoleErrors.slice(0, 3).map((e) => `Console error: ${e}`));
        record._causes = record._causes || new Set(record.healthReason ? [record.healthReason] : []);
        record._causes.add('browser-console-error');
      }
      if (pageErrors.length) {
        record.browserErrors = [...(record.browserErrors || []), ...pageErrors.slice(0, 5)];
        record.healthDetails.push(...pageErrors.slice(0, 2).map((e) => `Page error: ${e}`));
        record._causes = record._causes || new Set();
        record._causes.add('browser-page-error');
      }
      if (failedRequests.length) {
        record.healthDetails.push(...failedRequests.slice(0, 3).map((e) => `Network failure: ${e}`));
        record._causes = record._causes || new Set();
        record._causes.add('browser-network-failure');
      }
      if (!record._causes?.size && resp?.ok()) {
        record._playwrightOk = true;
      }
    } catch (err) {
      record.healthDetails.push(`Browser audit failed: ${err.message}`);
      record._causes = record._causes || new Set();
      record._causes.add('browser-page-error');
    }
  }

  await browser.close();
  return true;
}

async function main() {
  const index = JSON.parse(await readFile(INDEX_FILE, 'utf8'));
  const runners = JSON.parse(await readFile(RUNNERS_FILE, 'utf8'));
  const runnerStatus = JSON.parse(await readFile(STATUS_FILE, 'utf8'));
  const now = new Date().toISOString();

  await mkdir(DEBUG_DIR, { recursive: true });

  const records = {};
  const itemsById = Object.fromEntries(index.map((i) => [i.id, i]));
  const debugTargets = new Set(['broken', 'warning', 'needs-preprocessor', 'needs-external-assets', 'runner-failed']);

  for (const item of index) {
    const runner = findRunnerForItem(item, runners);
    const liveStatus = runner ? runnerStatus[runner.id] : null;
    let audit = null;
    const causes = new Set();
    let details = [];
    let logPath = null;
    let debugUrl = null;

    if (item.previewMode === 'local-page' && item.localDemoUrl) {
      audit = await auditLocalDemo(item);
      for (const c of audit.causes) causes.add(c);
      details = [...audit.details];
    } else if (item.previewMode === 'source-only' || (item.localSourcePath && !item.localDemoUrl)) {
      if (runner?.runnable) {
        const rAudit = auditRunnerItem(item, runner, liveStatus);
        for (const c of rAudit.causes) causes.add(c);
        details = rAudit.details;
        logPath = rAudit.logPath;
      } else {
        causes.add('source-only-no-entrypoint');
        details.push('Local source exists but no runnable local demo page');
      }
    } else if (runner?.runnable) {
      const rAudit = auditRunnerItem(item, runner, liveStatus);
      for (const c of rAudit.causes) causes.add(c);
      details = rAudit.details;
      logPath = rAudit.logPath;
    } else if (item.previewMode === 'link-only' || item.previewMode === 'external-link') {
      if (!item.localDemoUrl && !item.localSourcePath) {
        causes.add('external-only');
        details.push('External URL only — no local copy');
      }
    } else if (!item.localSourcePath && !item.localDemoUrl && !runner?.runnable) {
      causes.add('external-only');
      details.push('External URL only — no local copy');
    }

    const picked = pickHealth({
      causes,
      details,
      staticOk: audit?.staticOk ?? false,
      playwrightOk: false,
    });

    const classification = computeClassification(item, runner, liveStatus, picked.health, causes);

    records[item.id] = {
      health: picked.health,
      healthReason: picked.reason,
      healthDetails: [...new Set(details)].slice(0, 20),
      fixableLocally: [...causes].some((c) => FIXABLE_LOCAL_REASONS.has(c)),
      needsInternet: classification.needsInternet,
      isRemoteDependent: classification.isRemoteDependent,
      hasLocalFiles: classification.hasLocalFiles,
      runsLocally: classification.runsLocally,
      isLocalStaticDemo: classification.isLocalStaticDemo,
      isLocalDevServer: classification.isLocalDevServer,
      isPartialArchive: classification.isPartialArchive,
      isSourceOnly: classification.isSourceOnly,
      isExternalOnly: classification.isExternalOnly,
      partialArchiveKind: classification.partialArchiveKind,
      buttonLabel: classification.buttonLabel,
      classificationDescription: classification.classificationDescription,
      likelyWrapperIssue: WRAPPER_ISSUE_REASONS.has(picked.reason),
      lastCheckedAt: now,
      debugUrl: null,
      logPath,
      _audit: audit,
      _causes: [...causes],
    };
  }

  // Orphan runners not matched in index
  const matchedRunnerIds = new Set(
    index.filter((i) => findRunnerForItem(i, runners)).map((i) => findRunnerForItem(i, runners).id),
  );
  for (const runner of runners) {
    if (matchedRunnerIds.has(runner.id)) continue;
    const id = `runner-${runner.id}`;
    const liveStatus = runnerStatus[runner.id];
    const rAudit = auditRunnerItem({ localSourcePath: runner.sourcePath }, runner, liveStatus);
    const causes = new Set(rAudit.causes);
    if (!runner.runnable && runner.sourcePath) causes.add('source-only-no-entrypoint');
    const picked = pickHealth({ causes, details: rAudit.details, staticOk: false, playwrightOk: false });
    const classification = computeClassification(
      { localSourcePath: runner.sourcePath },
      runner,
      liveStatus,
      picked.health,
      causes,
    );
    records[id] = {
      health: picked.health,
      healthReason: picked.reason,
      healthDetails: rAudit.details,
      hasLocalFiles: classification.hasLocalFiles,
      runsLocally: classification.runsLocally,
      isLocalStaticDemo: classification.isLocalStaticDemo,
      isLocalDevServer: classification.isLocalDevServer,
      isPartialArchive: classification.isPartialArchive,
      needsInternet: classification.needsInternet,
      isRemoteDependent: classification.isRemoteDependent,
      isSourceOnly: classification.isSourceOnly,
      isExternalOnly: classification.isExternalOnly,
      partialArchiveKind: classification.partialArchiveKind,
      buttonLabel: classification.buttonLabel,
      classificationDescription: classification.classificationDescription,
      lastCheckedAt: now,
      debugUrl: null,
      logPath: rAudit.logPath,
      likelyCauses: [...causes],
    };
    itemsById[id] = {
      id,
      title: runner.title || runner.id,
      localDemoUrl: null,
      localSourcePath: runner.sourcePath,
      sourceUrl: runner.sourceUrl,
    };
  }

  const playwrightUsed = await tryPlaywrightAudit(itemsById, records);

  // Re-pick health after browser audit
  for (const [id, record] of Object.entries(records)) {
    const item = itemsById[id];
    const runner = item ? findRunnerForItem(item, runners) : null;
    const liveStatus = runner ? runnerStatus[runner.id] : null;
    const causes = record._causes
      ? new Set(record._causes)
      : new Set(record.likelyCauses || []);

    if (record._causes) {
      const picked = pickHealth({
        causes,
        details: record.healthDetails,
        staticOk: !causes.size,
        playwrightOk: record._playwrightOk,
      });
      record.health = picked.health;
      record.healthReason = picked.reason;
    }

    const classification = computeClassification(
      item || {},
      runner,
      liveStatus,
      record.health,
      causes,
    );
    record.needsInternet = classification.needsInternet;
    record.isRemoteDependent = classification.isRemoteDependent;
    record.hasLocalFiles = classification.hasLocalFiles;
    record.runsLocally = classification.runsLocally;
    record.isLocalStaticDemo = classification.isLocalStaticDemo;
    record.isLocalDevServer = classification.isLocalDevServer;
    record.isPartialArchive = classification.isPartialArchive;
    record.isSourceOnly = classification.isSourceOnly;
    record.isExternalOnly = classification.isExternalOnly;
    record.partialArchiveKind = classification.partialArchiveKind;
    record.buttonLabel = classification.buttonLabel;
    record.classificationDescription = classification.classificationDescription;

    if (debugTargets.has(record.health) && itemsById[id]?.localDemoUrl) {
      record.debugUrl = await generateDebugPage(itemsById[id], record, record._audit);
    } else if (debugTargets.has(record.health) && record.health === 'runner-failed') {
      record.debugUrl = null;
    }
    delete record._causes;
    delete record._playwrightOk;
    delete record._audit;
  }

  const summary = {};
  for (const r of Object.values(records)) {
    summary[r.health] = (summary[r.health] || 0) + 1;
  }

  const classificationSummary = {
    total: Object.keys(records).length,
    runsLocally: 0,
    hasLocalFiles: 0,
    localStaticDemos: 0,
    localDevServers: 0,
    partialArchives: 0,
    needsInternet: 0,
    needsPreprocessor: 0,
    needsRunner: 0,
    sourceOnly: 0,
    externalOnly: 0,
    broken: 0,
  };
  for (const r of Object.values(records)) {
    if (r.runsLocally) classificationSummary.runsLocally += 1;
    if (r.hasLocalFiles) classificationSummary.hasLocalFiles += 1;
    if (r.isLocalStaticDemo) classificationSummary.localStaticDemos += 1;
    if (r.isLocalDevServer) classificationSummary.localDevServers += 1;
    if (r.isPartialArchive) classificationSummary.partialArchives += 1;
    if (r.needsInternet) classificationSummary.needsInternet += 1;
    if (r.health === 'needs-preprocessor') classificationSummary.needsPreprocessor += 1;
    if (r.health === 'needs-runner') classificationSummary.needsRunner += 1;
    if (r.isSourceOnly) classificationSummary.sourceOnly += 1;
    if (r.isExternalOnly) classificationSummary.externalOnly += 1;
    if (r.health === 'broken') classificationSummary.broken += 1;
  }

  const out = {
    generatedAt: now,
    playwrightUsed,
    summary,
    classificationSummary,
    items: records,
  };

  await writeFile(OUT_FILE, `${JSON.stringify(out, null, 2)}\n`, 'utf8');

  console.log('Raw Reference Lab demo health audit complete');
  console.log('────────────────────────────────────────────');
  console.log(`Items audited:     ${Object.keys(records).length}`);
  console.log(`Playwright used:   ${playwrightUsed ? 'yes' : 'no'}`);
  for (const [k, v] of Object.entries(summary).sort()) {
    console.log(`  ${k}: ${v}`);
  }
  console.log('Classification:');
  for (const [k, v] of Object.entries(classificationSummary)) {
    if (k === 'total') continue;
    console.log(`  ${k}: ${v}`);
  }
  console.log(`Output:            ${OUT_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
