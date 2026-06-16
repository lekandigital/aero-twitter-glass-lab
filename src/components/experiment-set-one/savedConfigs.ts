import type { E1MaterialSettings } from '../experiment-one/materialSettings';
import { E1_DEFAULT_SETTINGS } from '../experiment-one/materialSettings';
import type { E2MaterialSettings } from '../experiment-set-two/materialSettings';
import { E2_DEFAULT_SETTINGS } from '../experiment-set-two/materialSettings';
import type { E3MaterialSettings } from '../experiment-set-three/materialSettings';
import { buildInitialE3Settings } from '../experiment-set-three/materialSettings';
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import {
  REFERENCE_CORNER_LIGHTING_OVERRIDES,
  REFERENCE_CORNER_SAVE_AT,
  REFERENCE_CORNER_SAVE_ID,
  REFERENCE_CORNER_SAVE_LABEL,
} from '../experiment-set-four/referenceCornerLighting';

export type ExperimentSetOneSnapshot = {
  id: number;
  label: string;
  savedAt: string;
  e1: E1MaterialSettings;
  e2: E2MaterialSettings;
  e3: E3MaterialSettings;
  e4?: E4MaterialSettings;
  /** When true, loading only merges Experiment Four corner lighting fields. */
  cornersOnly?: boolean;
};

const STORAGE_KEY = 'experiment-set-1-saved-configs';

function builtInReferenceCornerSave(): ExperimentSetOneSnapshot {
  return {
    id: REFERENCE_CORNER_SAVE_ID,
    label: REFERENCE_CORNER_SAVE_LABEL,
    savedAt: REFERENCE_CORNER_SAVE_AT,
    e1: E1_DEFAULT_SETTINGS,
    e2: E2_DEFAULT_SETTINGS,
    e3: buildInitialE3Settings(),
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

function readStorage(): ExperimentSetOneSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExperimentSetOneSnapshot[];
    if (!Array.isArray(parsed)) return [];
    const deduped = dedupeSnapshots(parsed);
    if (deduped.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
    }
    return deduped;
  } catch {
    return [];
  }
}

function writeStorage(saves: ExperimentSetOneSnapshot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

export function loadExperimentSetOneSaves(): ExperimentSetOneSnapshot[] {
  return [builtInReferenceCornerSave(), ...readStorage()];
}

export function getBuiltInReferenceCornerSave(): ExperimentSetOneSnapshot {
  return builtInReferenceCornerSave();
}

export function addExperimentSetOneSave(
  e1: E1MaterialSettings,
  e2: E2MaterialSettings,
  e3: E3MaterialSettings,
  e4: E4MaterialSettings,
): ExperimentSetOneSnapshot {
  const existing = readStorage();
  const id = existing.length === 0 ? 1 : Math.max(...existing.map((s) => s.id)) + 1;
  const snapshot: ExperimentSetOneSnapshot = {
    id,
    label: `Save ${id}`,
    savedAt: new Date().toISOString(),
    e1,
    e2,
    e3,
    e4,
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
