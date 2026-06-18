#!/usr/bin/env node
/**
 * Import Experiment Set 1 saves into src/data/experiment-set-one/saves.json.
 *
 * Sources (merged by save id; existing saves.json wins, then branch built-ins, then Downloads):
 *  1. Existing saves.json
 *  2. builtInSave*.ts from experiment-five git branches (materialized temporarily)
 *  3. ~/Downloads experiment-set-1-*.txt exports
 *
 * Usage: npx tsx scripts/import-experiment-set-one-saves.mjs [downloadsDir]
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, unlinkSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const OUT = join(REPO, 'src/data/experiment-set-one/saves.json');
const E1_DIR = join(REPO, 'src/components/experiment-set-one');
const E4_BEGIN_CUTOFF_ISO = '2026-06-16T00:47:50.565Z';
const SAVE_ID_RE = /save-(\d+)/i;

const BRANCHES = [
  'main',
  'composer-2-max-experiment-five-attempt-two',
  'mix-claude-opus-4.8-max-composer-2.5-experiment-five-attempt',
  'claude-opus-4.8-max-experiment-five-attempt-two',
  'chatgpt-5.5-veryhigh-experiment-five-attempt',
  'claude-opus-4.8-max-experiment-five-attempt',
  'claude-opus-4.8-max-experiment-five-attempt-mistake',
];

function sh(cmd, args) {
  return execFileSync(cmd, args, { cwd: REPO, encoding: 'utf8' }).trim();
}

function parseValue(raw) {
  const trimmed = raw.trim();
  if (trimmed === 'undefined') return undefined;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed.startsWith('#')) return trimmed;
  const num = Number.parseFloat(trimmed.replace(/\s*(%|px)$/i, ''));
  return Number.isFinite(num) ? num : trimmed;
}

function parseConfigText(text, source) {
  const exportedMatch = text.match(/^Exported:\s*(.+)$/m);
  const savedAt = exportedMatch?.[1]?.trim() ?? new Date().toISOString();
  const idMatch = source.match(SAVE_ID_RE);
  const hintedId = idMatch ? Number.parseInt(idMatch[1], 10) : null;

  const e1 = {};
  const e2 = {};
  const e3 = {};
  const e4 = {};
  let section = null;

  for (const line of text.split('\n')) {
    if (line.startsWith('[Experiment One]')) section = 'e1';
    else if (line.startsWith('[Experiment Two]')) section = 'e2';
    else if (line.startsWith('[Experiment Three]')) section = 'e3';
    else if (line.startsWith('[Experiment Four]')) section = 'e4';
    else if (line.startsWith('[')) section = null;

    const fieldMatch = line.match(/^\s+.+\(([^)]+)\):\s*(.+)$/);
    if (!fieldMatch || !section) continue;
    const [, fieldId, rawValue] = fieldMatch;
    const value = parseValue(rawValue);
    if (value === undefined) continue;
    if (section === 'e1') e1[fieldId] = value;
    else if (section === 'e2') e2[fieldId] = value;
    else if (section === 'e3') e3[fieldId] = value;
    else if (section === 'e4') e4[fieldId] = value;
  }

  if (!Object.keys(e1).length || !Object.keys(e2).length || !Object.keys(e3).length) return null;

  return {
    hintedId,
    savedAt,
    source,
    snapshot: {
      label: hintedId != null ? `Save ${hintedId}` : null,
      savedAt,
      e1,
      e2,
      e3,
      ...(Object.keys(e4).length ? { e4 } : {}),
    },
  };
}

function migrateScope(save) {
  if (save.cornersOnly || save.scope) return save;
  const savedAtMs = Date.parse(save.savedAt);
  const cutoffMs = Date.parse(E4_BEGIN_CUTOFF_ISO);
  if (!Number.isFinite(savedAtMs) || !Number.isFinite(cutoffMs)) return { ...save, scope: 'four' };
  return { ...save, scope: savedAtMs < cutoffMs ? 'three' : 'four' };
}

function collectDownloadFiles(downloadsDir) {
  try {
    return readdirSync(downloadsDir)
      .filter((name) => name.startsWith('experiment-set-1-') && name.endsWith('.txt'))
      .map((name) => join(downloadsDir, name));
  } catch {
    return [];
  }
}

function listBuiltInFiles(branch) {
  try {
    return sh('git', ['ls-tree', '-r', '--name-only', branch, 'src/components/experiment-set-one/'])
      .split('\n')
      .filter((f) => /builtInSave\d+\.ts$/.test(f));
  } catch {
    return [];
  }
}

function stageMissingFromBranch(branch, gitPath, staged, backups, { force = false } = {}) {
  const dest = join(REPO, gitPath);
  if (!force && existsSync(dest)) return;
  if (existsSync(dest)) {
    backups.set(dest, readFileSync(dest, 'utf8'));
  }
  const source = sh('git', ['show', `${branch}:${gitPath}`]);
  writeFileSync(dest, source);
  if (!staged.includes(dest)) staged.push(dest);
}

function listTree(branch, treePath) {
  try {
    return sh('git', ['ls-tree', '-r', '--name-only', branch, treePath]).split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

const SUPPORT_FILES = [
  ['composer-2-max-experiment-five-attempt-two', 'src/components/experiment-set-four/referenceCornerLighting.ts'],
  ['composer-2-max-experiment-five-attempt-two', 'src/components/experiment-set-four/referenceLeftPanelBezel.ts'],
  ['composer-2-max-experiment-five-attempt-two', 'src/components/experiment-set-four/referenceLeftPanelSurface.ts'],
];

function materializeBuiltInFiles() {
  const staged = [];
  const backups = new Map();
  const filesToStage = new Map();

  for (const branch of BRANCHES) {
    for (const gitPath of listBuiltInFiles(branch)) {
      if (!filesToStage.has(gitPath)) filesToStage.set(gitPath, branch);
    }
  }
  for (const [branch, gitPath] of SUPPORT_FILES) {
    filesToStage.set(gitPath, branch);
  }

  const ordered = [...filesToStage.entries()].sort(([a], [b]) => {
    const aId = Number(a.match(/builtInSave(\d+)/)?.[1] ?? 0);
    const bId = Number(b.match(/builtInSave(\d+)/)?.[1] ?? 0);
    if (aId && bId) return aId - bId;
    if (aId) return 1;
    if (bId) return -1;
    return a.localeCompare(b);
  });

  for (const [gitPath, branch] of ordered) {
    const force = SUPPORT_FILES.some(([, path]) => path === gitPath);
    stageMissingFromBranch(branch, gitPath, staged, backups, { force });
  }

  return { staged, backups };
}

async function loadBranchBuiltIns() {
  const { staged, backups } = materializeBuiltInFiles();
  const byId = new Map();

  try {
    const builtInPaths = staged
      .filter((filePath) => /builtInSave\d+\.ts$/.test(filePath))
      .sort((a, b) => {
        const aId = Number(a.match(/builtInSave(\d+)/)[1]);
        const bId = Number(b.match(/builtInSave(\d+)/)[1]);
        return aId - bId;
      });

    for (const filePath of builtInPaths) {
      const id = Number(filePath.match(/builtInSave(\d+)/)[1]);
      const mod = await import(`${pathToFileURL(filePath).href}?t=${Date.now()}`);
      const fn = mod[`builtInSave${id}`];
      if (typeof fn !== 'function') continue;
      const snapshot = fn();
      byId.set(id, {
        hintedId: id,
        savedAt: snapshot.savedAt,
        source: filePath,
        snapshot,
      });
    }
  } finally {
    for (const filePath of staged) {
      try {
        if (backups.has(filePath)) {
          writeFileSync(filePath, backups.get(filePath));
        } else {
          unlinkSync(filePath);
        }
      } catch {
        // ignore
      }
    }
  }

  return byId;
}

function upsert(byId, entry) {
  const id = entry.hintedId;
  if (id == null) return;
  const existing = byId.get(id);
  if (!existing || Date.parse(entry.savedAt) >= Date.parse(existing.savedAt)) {
    byId.set(id, entry);
  }
}

async function main() {
  const downloadsDir = process.argv[2] ?? join(process.env.HOME ?? '', 'Downloads');
  const byId = new Map();

  if (existsSync(OUT)) {
    for (const save of JSON.parse(readFileSync(OUT, 'utf8'))) {
      byId.set(save.id, { hintedId: save.id, savedAt: save.savedAt, source: OUT, snapshot: save });
    }
  }

  for (const [id, entry] of await loadBranchBuiltIns()) {
    if (!byId.has(id)) upsert(byId, entry);
  }

  const parsed = [];
  for (const file of collectDownloadFiles(downloadsDir)) {
    try {
      const result = parseConfigText(readFileSync(file, 'utf8'), file);
      if (result) parsed.push(result);
    } catch {
      // skip
    }
  }

  for (const entry of parsed) {
    if (entry.hintedId != null) upsert(byId, entry);
  }

  const unassigned = parsed.filter((e) => e.hintedId == null);
  unassigned.sort((a, b) => Date.parse(a.savedAt) - Date.parse(b.savedAt));
  let nextId = 1;
  for (const entry of unassigned) {
    while (byId.has(nextId)) nextId += 1;
    entry.hintedId = nextId;
    byId.set(nextId, entry);
    nextId += 1;
  }

  const saves = [...byId.entries()]
    .sort(([a], [b]) => a - b)
    .map(([id, entry]) =>
      migrateScope({
        id,
        label: entry.snapshot.label ?? `Save ${id}`,
        savedAt: entry.snapshot.savedAt ?? entry.savedAt,
        e1: entry.snapshot.e1,
        e2: entry.snapshot.e2,
        e3: entry.snapshot.e3,
        ...(entry.snapshot.e4 ? { e4: entry.snapshot.e4 } : {}),
        ...(entry.snapshot.scope ? { scope: entry.snapshot.scope } : {}),
      }),
    );

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(saves, null, 2)}\n`);
  console.log(`Wrote ${saves.length} saves to ${OUT}`);
  console.log(`IDs: ${saves.map((s) => s.id).join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
