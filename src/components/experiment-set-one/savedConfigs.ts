import type { E1MaterialSettings } from '../experiment-one/materialSettings';
import type { E2MaterialSettings } from '../experiment-set-two/materialSettings';
import type { E3MaterialSettings } from '../experiment-set-three/materialSettings';
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';

export type ExperimentSetOneSnapshot = {
  id: number;
  label: string;
  savedAt: string;
  e1: E1MaterialSettings;
  e2: E2MaterialSettings;
  e3: E3MaterialSettings;
  e4?: E4MaterialSettings;
};

const STORAGE_KEY = 'experiment-set-1-saved-configs';

function readStorage(): ExperimentSetOneSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ExperimentSetOneSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(saves: ExperimentSetOneSnapshot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

export function loadExperimentSetOneSaves(): ExperimentSetOneSnapshot[] {
  return readStorage();
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
  if (experiment === 'four') {
    if (!snapshot.e4) return undefined;
    return snapshot.e4[fieldId as keyof E4MaterialSettings] as string | number | boolean;
  }
  const settings = experiment === 'one' ? snapshot.e1 : experiment === 'two' ? snapshot.e2 : snapshot.e3;
  return settings[fieldId as keyof typeof settings] as string | number | boolean;
}
