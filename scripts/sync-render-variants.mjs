#!/usr/bin/env node
/**
 * Copy exact per-branch CSS + rendering JS from experiment-five git worktrees into
 * src/render-variants/<slug>/ for unified branch-scoped saves in Experiment Set 1.
 *
 * Run after updating branch worktrees under /private/tmp/aero-branch-compare:
 *   node scripts/sync-render-variants.mjs
 */

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const OUT_ROOT = join(REPO, 'src/render-variants');
const WORKTREES = '/private/tmp/aero-branch-compare';

export const VARIANTS = [
  { slug: 'opus-4.8-high', label: 'Opus 4.8 High', branch: 'claude-opus-4.8-high-experiment-five-attempt', save: 22 },
  { slug: 'opus-4.8-max-mistake', label: 'Opus 4.8 Max (mistake)', branch: 'claude-opus-4.8-max-experiment-five-attempt-mistake', save: 29 },
  { slug: 'opus-4.8-max', label: 'Opus 4.8 Max', branch: 'claude-opus-4.8-max-experiment-five-attempt', save: 32 },
  { slug: 'chatgpt-5.5', label: 'ChatGPT 5.5 veryhigh', branch: 'chatgpt-5.5-veryhigh-experiment-five-attempt', save: 45 },
  { slug: 'mix-opus-composer', label: 'Mix · Opus 4.8 + Composer 2.5', branch: 'mix-claude-opus-4.8-max-composer-2.5-experiment-five-attempt', save: 55 },
  { slug: 'opus-4.8-max-two', label: 'Opus 4.8 Max (two)', branch: 'claude-opus-4.8-max-experiment-five-attempt-two', save: 66 },
  { slug: 'composer-2-max', label: 'Composer 2 Max', branch: 'composer-2-max-experiment-five-attempt-two', save: 76 },
];

const STYLE_FILES = [
  'src/styles/experiment-set-four.css',
  'src/styles/glass-frost-surface.css',
  'src/styles/experiment-set-two.css',
];

const MODULE_FILES = [
  'src/components/experiment-set-four/materialSettings.tsx',
  'src/components/experiment-set-four/primitives.tsx',
  'src/components/experiment-set-five/primitives.tsx',
  'src/components/experiment-set-five/borderCornerRefinements.ts',
  'src/components/experiment-set-two/primitives.tsx',
  'src/components/shared/GlassFrostSurface.tsx',
  'src/components/shared/PwzzovOGlassCorners.tsx',
  'src/components/shared/edgeReflexBackdrop.ts',
];

const OPTIONAL_MODULE_FILES = [
  'src/components/experiment-set-four/referenceLeftPanelBezel.ts',
  'src/components/experiment-set-four/referenceLeftPanelSurface.ts',
  'src/components/experiment-set-five/e5PanelLayout.ts',
  'src/components/shared/BezelCornerCaps.tsx',
];

function sh(cmd, args, cwd = REPO) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8' });
}

function listSaveIdsForBranch(branch) {
  try {
    return sh('git', ['ls-tree', '-r', '--name-only', branch, 'src/components/experiment-set-one/'], REPO)
      .split('\n')
      .filter((f) => /builtInSave(\d+)\.ts$/.test(f))
      .map((f) => Number(f.match(/builtInSave(\d+)/)[1]))
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

function readBranchFile(branch, relPath) {
  const wt = join(WORKTREES, branch);
  const wtPath = join(wt, relPath);
  if (existsSync(wtPath)) return readFileSync(wtPath, 'utf8');
  try {
    return sh('git', ['show', `${branch}:${relPath}`], REPO);
  } catch {
    return null;
  }
}

function isCopiedRepoPath(repoRel, copiedRepoRelPaths) {
  const norm = repoRel.replace(/\.tsx?$/, '');
  return copiedRepoRelPaths.some((p) => p.replace(/\.tsx?$/, '') === norm);
}

function toVariantPath(slug, repoRelPath) {
  if (repoRelPath.startsWith('src/styles/')) {
    return join(OUT_ROOT, slug, 'styles', repoRelPath.slice('src/styles/'.length));
  }
  if (repoRelPath.startsWith('src/components/')) {
    return join(OUT_ROOT, slug, 'components', repoRelPath.slice('src/components/'.length));
  }
  throw new Error(`unsupported path ${repoRelPath}`);
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  const fromDir = dirname(fromFile);
  const abs = resolve(fromDir, spec);
  const exts = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
  for (const ext of exts) {
    const candidate = abs + ext;
    if (existsSync(candidate)) return candidate;
  }
  return abs;
}

function repoRelForImport(sourceAbs, spec) {
  if (!spec.startsWith('.')) return null;
  const resolved = resolveImport(sourceAbs, spec);
  if (!resolved) return null;
  let rel = relative(REPO, resolved).replace(/\\/g, '/');
  if (!rel.startsWith('src/')) {
    const withTs = `${rel}.tsx`;
    const withTs2 = `${rel}.ts`;
    if (existsSync(join(REPO, withTs))) rel = withTs;
    else if (existsSync(join(REPO, withTs2))) rel = withTs2;
  }
  return rel.replace(/\.tsx?$/, '');
}

function rewriteImports(content, fromVariantFile, repoSourceRelPath, copiedRepoRelPaths, slug) {
  const sourceAbs = join(REPO, repoSourceRelPath);

  return content.replace(/from\s+(['"])(\.[^'"]+)\1/g, (_match, quote, spec) => {
    const repoRel = repoRelForImport(sourceAbs, spec);
    if (!repoRel) return `from ${quote}${spec}${quote}`;

    if (isCopiedRepoPath(repoRel, copiedRepoRelPaths)) {
      const fullRepoRel = repoRel.startsWith('src/') ? repoRel : `src/${repoRel}`;
      const variantTarget = toVariantPath(slug, `${fullRepoRel}.tsx`.replace('.tsx.tsx', '.tsx').replace(/\.ts\.tsx$/, '.ts'));
      const variantTargetTs = toVariantPath(slug, fullRepoRel.endsWith('.ts') || fullRepoRel.endsWith('.tsx') ? fullRepoRel : `${fullRepoRel}.ts`);
      const target = existsSync(variantTarget) ? variantTarget : variantTargetTs;
      let rel = relative(dirname(fromVariantFile), target).replace(/\\/g, '/');
      if (!rel.startsWith('.')) rel = `./${rel}`;
      rel = rel.replace(/\.tsx?$/, '');
      return `from ${quote}${rel}${quote}`;
    }

    const full = repoRel.startsWith('src/') ? repoRel : `src/${repoRel}`;
    if (full.startsWith('src/')) {
      return `from ${quote}@/${full.slice('src/'.length)}${quote}`;
    }
    return `from ${quote}${spec}${quote}`;
  });
}

function writeVariantIndex(slug, hasE5Layout) {
  const lines = [
    `/** Auto-generated by scripts/sync-render-variants.mjs — do not edit. */`,
    ``,
    `export {`,
    `  ExperimentFiveDraggableLayerA,`,
    `} from './components/experiment-set-five/primitives';`,
    `export {`,
    `  ExperimentFourDraggableLayerA,`,
    `  ExperimentFourDraggableLayerB,`,
    `} from './components/experiment-set-four/primitives';`,
    `export {`,
    `  refineExperimentFivePanels,`,
    `  E5_BORDER_REFINEMENTS_VERSION,`,
    `} from './components/experiment-set-five/borderCornerRefinements';`,
    `export {`,
    `  e4SettingsToCssVars,`,
    `  normalizeE4MaterialSettings,`,
    `  patchE4LayoutField,`,
    `  syncE4LayerBLayoutFromBezel,`,
    `  e4FieldsVisibleForSettings,`,
    `} from './components/experiment-set-four/materialSettings';`,
  ];
  if (hasE5Layout) {
    lines.push(`export { e5LayoutPresetFromSaves } from './components/experiment-set-five/e5PanelLayout';`);
  }
  writeFileSync(join(OUT_ROOT, slug, 'index.ts'), `${lines.join('\n')}\n`);
}

/** Main uses saves.json — rewrite branch-only builtInSave imports after sync. */
function patchVariantPostSync(slug) {
  const e5Layout = join(OUT_ROOT, slug, 'components/experiment-set-five/e5PanelLayout.ts');
  if (!existsSync(e5Layout)) return;
  let content = readFileSync(e5Layout, 'utf8');
  if (!content.includes('builtInSave22')) return;
  content = content.replace(
    /import \{ builtInSave22 \} from '@\/components\/experiment-set-one\/builtInSave22';\n\n/,
    '',
  );
  content = content.replace(
    'const e4 = builtInSave22().e4!;',
    `const save22 = loadExperimentSetOneSaves().find((s) => s.id === 22);
  const e4 = save22?.e4;
  if (!e4) return {};`,
  );
  writeFileSync(e5Layout, content);
}

function syncVariant({ slug, label, branch, save }) {
  const copiedRepoRelPaths = [];

  for (const rel of [...STYLE_FILES, ...MODULE_FILES]) {
    const content = readBranchFile(branch, rel);
    if (content == null) {
      console.warn(`  skip missing ${rel}`);
      continue;
    }
    copiedRepoRelPaths.push(rel);
  }

  for (const rel of OPTIONAL_MODULE_FILES) {
    if (readBranchFile(branch, rel) != null) copiedRepoRelPaths.push(rel);
  }

  for (const rel of copiedRepoRelPaths) {
    const content = readBranchFile(branch, rel);
    const dest = toVariantPath(slug, rel);
    mkdirSync(dirname(dest), { recursive: true });
    if (rel.endsWith('.css')) {
      writeFileSync(dest, content);
    } else {
      const rewritten = rewriteImports(content, dest, rel, copiedRepoRelPaths, slug);
      writeFileSync(dest, `// @ts-nocheck — synced branch snapshot\n${rewritten}`);
    }
  }

  const hasE5Layout = copiedRepoRelPaths.includes('src/components/experiment-set-five/e5PanelLayout.ts');
  writeVariantIndex(slug, hasE5Layout);
  patchVariantPostSync(slug);
  console.log(`  ${slug} (${label}) save ${save} — ${copiedRepoRelPaths.length} files`);
}

function writeManifest() {
  const variantsWithSaveIds = VARIANTS.map((v) => {
    const saveIds = listSaveIdsForBranch(v.branch);
    return { ...v, saveIds: saveIds.length ? saveIds : [v.save] };
  });

  const body = `/** Auto-generated by scripts/sync-render-variants.mjs — do not edit. */

export const RENDER_VARIANT_SLUGS = [
${variantsWithSaveIds.map((v) => `  '${v.slug}',`).join('\n')}
] as const;

export type RenderVariantSlug = (typeof RENDER_VARIANT_SLUGS)[number];

export type RenderVariantDef = {
  slug: RenderVariantSlug;
  label: string;
  gitBranch: string;
  /** Canonical showcase save for this branch pipeline. */
  saveId: number;
  /** All built-in save ids shipped on this branch. */
  saveIds: number[];
};

export const RENDER_VARIANTS: RenderVariantDef[] = [
${variantsWithSaveIds.map((v) => `  { slug: '${v.slug}', label: ${JSON.stringify(v.label)}, gitBranch: '${v.branch}', saveId: ${v.save}, saveIds: [${v.saveIds.join(', ')}] },`).join('\n')}
];

const showcaseSaveIds = new Set<number>(RENDER_VARIANTS.map((v) => v.saveId));

export function renderVariantForSaveId(
  saveId: number,
  branchSlug?: RenderVariantSlug,
): RenderVariantDef | undefined {
  if (branchSlug) {
    return RENDER_VARIANTS.find((v) => v.slug === branchSlug && v.saveIds.includes(saveId));
  }
  const matches = RENDER_VARIANTS.filter((v) => v.saveIds.includes(saveId));
  return matches.length === 1 ? matches[0] : undefined;
}

export function isBranchShowcaseSaveId(saveId: number): boolean {
  return showcaseSaveIds.has(saveId);
}
`;
  writeFileSync(join(OUT_ROOT, 'manifest.ts'), body);
}

function main() {
  console.log('Syncing render variants…');
  for (const slug of readdirSync(OUT_ROOT)) {
    if (slug === 'manifest.ts' || slug === 'RenderVariantContext.tsx' || slug === 'types.ts') continue;
    const p = join(OUT_ROOT, slug);
    if (existsSync(p)) rmSync(p, { recursive: true, force: true });
  }
  for (const v of VARIANTS) syncVariant(v);
  writeManifest();
  console.log('Done.');
}

main();
