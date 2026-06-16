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
import { SAVE_20_ID, builtInSave20 } from './builtInSave20';
import { SAVE_21_ID, builtInSave21 } from './builtInSave21';
import { SAVE_22_ID, builtInSave22 } from './builtInSave22';
import { SAVE_29_ID, builtInSave29 } from './builtInSave29';
import { SAVE_31_ID, builtInSave31 } from './builtInSave31';

// Earliest exported config in ~/Downloads that includes Experiment Four.
// Used only as a one-time migration heuristic for older saves.
const E4_BEGIN_CUTOFF_ISO = '2026-06-16T00:47:50.565Z';

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

const STORAGE_KEY = 'experiment-set-1-saved-configs';
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
    // Only dedupe full material snapshots (the built-in "cornersOnly" entry isn't in storage).
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

function readStorage(): ExperimentSetOneSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExperimentSetOneSnapshot[];
    if (!Array.isArray(parsed)) return [];
    // If older sessions created user saves with ids that are now reserved for built-ins (20/21),
    // remap them instead of dropping data.
    const used = new Set<number>();
    const migrated = parsed.map(migrateSnapshotScope).map((save) => {
      let next = save;
      if (isReservedSaveId(next.id)) {
        const newId = nextAvailableSaveId(new Set([...used, ...parsed.map((s) => s.id)]));
        next = { ...next, id: newId, label: `Save ${newId}` };
      }
      used.add(next.id);
      return next;
    });
    const deduped = dedupeSnapshots(migrated);
    if (deduped.length !== parsed.length || migrated.some((s, i) => s.scope !== parsed[i]?.scope)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
      } catch {
        memoryStorageFallback = deduped;
      }
    }
    return deduped;
  } catch {
    return memoryStorageFallback ?? [];
  }
}

function writeStorage(saves: ExperimentSetOneSnapshot[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
    memoryStorageFallback = null;
  } catch {
    // If persistent storage is blocked (privacy mode, quota, etc.),
    // keep saves working for the current tab session.
    memoryStorageFallback = saves;
  }
}

function withNormalizedE4(save: ExperimentSetOneSnapshot): ExperimentSetOneSnapshot {
  if (!save.e4) return save;
  return { ...save, e4: normalizeE4MaterialSettings(save.e4) };
}

function isReservedSaveId(id: number): boolean {
  return (
    id === REFERENCE_CORNER_SAVE_ID ||
    id === SAVE_20_ID ||
    id === SAVE_21_ID ||
    id === SAVE_22_ID ||
    id === SAVE_29_ID ||
    id === SAVE_31_ID
  );
}

function nextAvailableSaveId(existingIds: Set<number>): number {
  let id = existingIds.size === 0 ? 1 : Math.max(...existingIds) + 1;
  while (isReservedSaveId(id) || existingIds.has(id)) id += 1;
  return id;
}

export function loadExperimentSetOneSaves(): ExperimentSetOneSnapshot[] {
  // Order (for UI): reference corners, then user saves up to and including Save 19,
  // then built-in Save 20, Save 21, and Save 22, then remaining user saves.
  //
  // This guarantees Save 20/21/22 appear after Save 19 even when Save 19 lives in localStorage.
  const storage = readStorage();
  const idx19 = storage.findIndex((s) => s.id === 19 || s.label === 'Save 19');
  if (idx19 === -1) {
    return [
      builtInReferenceCornerSave(),
      ...storage,
      withNormalizedE4(builtInSave20()),
      withNormalizedE4(builtInSave21()),
      withNormalizedE4(builtInSave22()),
      withNormalizedE4(builtInSave29()),
      withNormalizedE4(builtInSave31()),
    ];
  }
  const before = storage.slice(0, idx19 + 1);
  const after = storage.slice(idx19 + 1);
  return [
    builtInReferenceCornerSave(),
    ...before,
    withNormalizedE4(builtInSave20()),
    withNormalizedE4(builtInSave21()),
    withNormalizedE4(builtInSave22()),
    withNormalizedE4(builtInSave29()),
    withNormalizedE4(builtInSave31()),
    ...after,
  ];
}

export function getBuiltInReferenceCornerSave(): ExperimentSetOneSnapshot {
  return builtInReferenceCornerSave();
}

export function addExperimentSetOneSave(
  e1: E1MaterialSettings,
  e2: E2MaterialSettings,
  e3: E3MaterialSettings,
  e4: E4MaterialSettings,
  scope: ExperimentId,
): ExperimentSetOneSnapshot {
  const existing = readStorage();
  const ids = new Set(existing.map((s) => s.id));
  const id = nextAvailableSaveId(ids);
  const snapshot: ExperimentSetOneSnapshot = {
    id,
    label: `Save ${id}`,
    savedAt: new Date().toISOString(),
    e1,
    e2,
    e3,
    e4,
    scope,
  };
  writeStorage([...existing, snapshot]);
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
