import type { E1MaterialSettings } from '../experiment-one/materialSettings';
import { E1_DEFAULT_SETTINGS } from '../experiment-one/materialSettings';
import type { E2MaterialSettings } from '../experiment-set-two/materialSettings';
import { E2_DEFAULT_SETTINGS } from '../experiment-set-two/materialSettings';
import type { E3MaterialSettings } from '../experiment-set-three/materialSettings';
import { buildInitialE3Settings } from '../experiment-set-three/materialSettings';
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { normalizeE4MaterialSettings } from '../experiment-set-four/materialSettings';
import type { ExperimentId } from './experimentVisibility';
import {
  REFERENCE_CORNER_LIGHTING_OVERRIDES,
  REFERENCE_CORNER_SAVE_AT,
  REFERENCE_CORNER_SAVE_ID,
  REFERENCE_CORNER_SAVE_LABEL,
} from '../experiment-set-four/referenceCornerLighting';
import committedSavesJson from '../../data/experiment-set-one/saves.json';
import { downloadTextFile } from '../../utils/downloadTextFile';

// Earliest exported config in ~/Downloads that includes Experiment Four.
// Used only as a one-time migration heuristic for older saves.
const E4_BEGIN_CUTOFF_ISO = '2026-06-16T00:47:50.565Z';
const STORAGE_KEY = 'experiment-set-1-saved-configs';
const SAVES_API = '/api/experiment-set-one/saves';

export type ExperimentSetOneSnapshot = {
  id: number;
  label: string;
  savedAt: string;
  e1: E1MaterialSettings;
  e2: E2MaterialSettings;
  e3: E3MaterialSettings;
  e4?: Partial<E4MaterialSettings>;
  /** Which experiment this save is meant for (used to filter saves list + load behavior). */
  scope?: ExperimentId;
  /** When true, loading only merges Experiment Four corner lighting fields. */
  cornersOnly?: boolean;
};

const committedSaves = (committedSavesJson as ExperimentSetOneSnapshot[]).map(migrateSnapshotScope);
let runtimeSaves: ExperimentSetOneSnapshot[] | null = null;
let memoryStorageFallback: ExperimentSetOneSnapshot[] | null = null;

function builtInReferenceCornerSave(): ExperimentSetOneSnapshot {
  return {
    id: REFERENCE_CORNER_SAVE_ID,
    label: REFERENCE_CORNER_SAVE_LABEL,
    savedAt: REFERENCE_CORNER_SAVE_AT,
    e1: E1_DEFAULT_SETTINGS,
    e2: E2_DEFAULT_SETTINGS,
    e3: buildInitialE3Settings(),
    scope: 'four',
    cornersOnly: true,
  };
}

function sortedRecord<T extends Record<string, unknown>>(value: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value).sort()) out[key] = value[key];
  return out;
}

function snapshotFingerprint(snapshot: ExperimentSetOneSnapshot): string {
  return JSON.stringify({
    e1: sortedRecord(snapshot.e1 as Record<string, unknown>),
    e2: sortedRecord(snapshot.e2 as Record<string, unknown>),
    e3: sortedRecord(snapshot.e3 as Record<string, unknown>),
    e4: snapshot.e4 ? sortedRecord(snapshot.e4 as Record<string, unknown>) : null,
  });
}

function dedupeSnapshots(saves: ExperimentSetOneSnapshot[]) {
  const seen = new Set<string>();
  const next: ExperimentSetOneSnapshot[] = [];
  for (const save of saves) {
    if (save.cornersOnly) {
      next.push(save);
      continue;
    }
    const fp = snapshotFingerprint(save);
    if (seen.has(fp)) continue;
    seen.add(fp);
    next.push(save);
  }
  return next;
}

function migrateSnapshotScope(save: ExperimentSetOneSnapshot): ExperimentSetOneSnapshot {
  if (save.cornersOnly) return save;
  if (save.scope) return save;

  const savedAtMs = Date.parse(save.savedAt);
  const cutoffMs = Date.parse(E4_BEGIN_CUTOFF_ISO);
  if (!Number.isFinite(savedAtMs) || !Number.isFinite(cutoffMs)) {
    return { ...save, scope: 'four' };
  }
  return { ...save, scope: savedAtMs < cutoffMs ? 'three' : 'four' };
}

function repoSaves(): ExperimentSetOneSnapshot[] {
  return runtimeSaves ?? committedSaves;
}

function committedSaveIds(): Set<number> {
  return new Set(repoSaves().map((save) => save.id));
}

function readLegacyStorage(): ExperimentSetOneSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExperimentSetOneSnapshot[];
    if (!Array.isArray(parsed)) return [];
    return dedupeSnapshots(parsed.map(migrateSnapshotScope));
  } catch {
    return memoryStorageFallback ?? [];
  }
}

function clearLegacyStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    memoryStorageFallback = null;
  } catch {
    memoryStorageFallback = null;
  }
}

function withNormalizedE4(save: ExperimentSetOneSnapshot): ExperimentSetOneSnapshot {
  if (!save.e4) return save;
  return { ...save, e4: normalizeE4MaterialSettings(save.e4) };
}

function isReservedSaveId(id: number): boolean {
  return id === REFERENCE_CORNER_SAVE_ID || committedSaveIds().has(id);
}

function nextAvailableSaveId(existingIds: Set<number>): number {
  let id = existingIds.size === 0 ? 1 : Math.max(...existingIds) + 1;
  while (isReservedSaveId(id) || existingIds.has(id)) id += 1;
  return id;
}

function assembleSaveList(storage: ExperimentSetOneSnapshot[]): ExperimentSetOneSnapshot[] {
  const materialSaves = dedupeSnapshots(storage.filter((save) => !save.cornersOnly && save.id !== REFERENCE_CORNER_SAVE_ID))
    .sort((a, b) => a.id - b.id)
    .map(withNormalizedE4);
  return [builtInReferenceCornerSave(), ...materialSaves];
}

export function loadExperimentSetOneSaves(): ExperimentSetOneSnapshot[] {
  return assembleSaveList(repoSaves());
}

export function getBuiltInReferenceCornerSave(): ExperimentSetOneSnapshot {
  return builtInReferenceCornerSave();
}

export function setExperimentSetOneRuntimeSaves(saves: ExperimentSetOneSnapshot[]) {
  runtimeSaves = dedupeSnapshots(saves.map(migrateSnapshotScope));
}

export async function hydrateExperimentSetOneSaves(): Promise<boolean> {
  const legacy = readLegacyStorage();
  if (legacy.length === 0) return false;

  try {
    const res = await fetch(`${SAVES_API}/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(legacy),
    });
    if (!res.ok) throw new Error(`merge failed: ${res.status}`);
    const saves = (await res.json()) as ExperimentSetOneSnapshot[];
    setExperimentSetOneRuntimeSaves(saves);
    clearLegacyStorage();
    return true;
  } catch {
    const merged = dedupeSnapshots([...repoSaves(), ...legacy]);
    setExperimentSetOneRuntimeSaves(merged);
    return true;
  }
}

async function persistSaveToRepo(snapshot: ExperimentSetOneSnapshot): Promise<boolean> {
  try {
    const res = await fetch(SAVES_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
    });
    if (!res.ok) return false;
    const saves = (await res.json()) as ExperimentSetOneSnapshot[];
    setExperimentSetOneRuntimeSaves(saves);
    return true;
  } catch {
    return false;
  }
}

function downloadSaveJson(snapshot: ExperimentSetOneSnapshot) {
  downloadTextFile(`save-${snapshot.id}.json`, `${JSON.stringify(snapshot, null, 2)}\n`);
}

export function addExperimentSetOneSave(
  e1: E1MaterialSettings,
  e2: E2MaterialSettings,
  e3: E3MaterialSettings,
  e4: E4MaterialSettings,
  scope: ExperimentId,
): ExperimentSetOneSnapshot {
  const existing = repoSaves();
  const ids = new Set(existing.map((s) => s.id));
  const id = nextAvailableSaveId(ids);
  const snapshot: ExperimentSetOneSnapshot = migrateSnapshotScope({
    id,
    label: `Save ${id}`,
    savedAt: new Date().toISOString(),
    e1,
    e2,
    e3,
    e4,
    scope,
  });
  setExperimentSetOneRuntimeSaves([...existing, snapshot]);
  void persistSaveToRepo(snapshot).then((ok) => {
    if (!ok) downloadSaveJson(snapshot);
  });
  return snapshot;
}

export function getFieldFromSnapshot(
  snapshot: ExperimentSetOneSnapshot,
  experiment: 'one' | 'two' | 'three' | 'four',
  fieldId: string,
): string | number | boolean | undefined {
  if (experiment === 'four' && snapshot.id === REFERENCE_CORNER_SAVE_ID) {
    const override =
      REFERENCE_CORNER_LIGHTING_OVERRIDES[fieldId as keyof typeof REFERENCE_CORNER_LIGHTING_OVERRIDES];
    if (override !== undefined) return override;
    return undefined;
  }
  if (experiment === 'four') {
    if (!snapshot.e4) return undefined;
    return snapshot.e4[fieldId as keyof E4MaterialSettings] as string | number | boolean;
  }
  const settings = experiment === 'one' ? snapshot.e1 : experiment === 'two' ? snapshot.e2 : snapshot.e3;
  return settings[fieldId as keyof typeof settings] as string | number | boolean;
}
