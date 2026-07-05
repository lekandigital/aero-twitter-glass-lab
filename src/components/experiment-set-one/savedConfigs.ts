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
import { renderVariantForSaveId, type RenderVariantSlug } from '../../render-variants/manifest';

// Earliest exported config in ~/Downloads that includes Experiment Four.
// Used only as a one-time migration heuristic for older saves.
const E4_BEGIN_CUTOFF_ISO = '2026-06-16T00:47:50.565Z';
const STORAGE_KEY = 'experiment-set-1-saved-configs';
const SAVES_API = '/api/experiment-set-one/saves';

export type SaveScope = ExperimentId | 'general';

export type ExperimentSetOneLayoutSnapshot = {
  activeExperiment?: ExperimentId;
  selectedExperimentIds?: ExperimentId[];
  selectedSaveKeysByExperiment?: Partial<Record<ExperimentId, string[]>>;
  selectedSaveVisualOrder?: string[];
  selectedSavePositions?: Record<string, { x: number; y: number }>;
};

export type ExperimentSetOneSnapshot = {
  id: number;
  label: string;
  savedAt: string;
  e1: E1MaterialSettings;
  e2: E2MaterialSettings;
  e3: E3MaterialSettings;
  e4?: Partial<E4MaterialSettings>;
  /** Which experiment this save is meant for (used to filter saves list + load behavior). */
  scope?: SaveScope;
  /** When true, loading only merges Experiment Four corner lighting fields. */
  cornersOnly?: boolean;
  /** When set, loading this save activates the branch render pipeline. */
  branchVariant?: RenderVariantSlug;
  /** Experiment Six clone — original branch save id for variant routing. */
  sourceSaveId?: number;
  /** General-scope preset id (e.g. accidental glitch captures). */
  generalPreset?: string;
  /** Stage drag position for general presets (experiment-four layer A slot). */
  panelPosition?: { x: number; y: number };
} & ExperimentSetOneLayoutSnapshot;

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

function selectedSaveInstanceKeys(keysByExperiment: Partial<Record<ExperimentId, string[]>>): string[] {
  const order: ExperimentId[] = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  return order.flatMap((experiment) =>
    (keysByExperiment[experiment] ?? []).map((key) => `${experiment}:${key}`),
  );
}

function sortedSelectedSaveKeysByExperiment(
  keysByExperiment?: Partial<Record<ExperimentId, string[]>>,
): Partial<Record<ExperimentId, string[]>> {
  const order: ExperimentId[] = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const out: Partial<Record<ExperimentId, string[]>> = {};
  for (const experiment of order) {
    const keys = keysByExperiment?.[experiment];
    if (!Array.isArray(keys) || keys.length === 0) continue;
    out[experiment] = Array.from(new Set(keys.filter((key): key is string => typeof key === 'string' && key.length > 0)));
  }
  return out;
}

function sortedSelectedSavePositions(
  positions?: Record<string, { x: number; y: number }>,
): Record<string, { x: number; y: number }> | undefined {
  if (!positions) return undefined;
  const entries = Object.entries(positions)
    .filter(([, value]) => Boolean(value) && typeof value.x === 'number' && typeof value.y === 'number')
    .sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) return undefined;
  return Object.fromEntries(entries.map(([key, value]) => [key, { x: value.x, y: value.y }]));
}

function normalizeSelectedExperimentIds(raw: unknown): ExperimentId[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const allowed = new Set<ExperimentId>(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);
  const next = Array.from(new Set(raw.filter((id): id is ExperimentId => allowed.has(id))));
  return next;
}

function normalizeSelectedSaveVisualOrder(
  raw: unknown,
  keysByExperiment?: Partial<Record<ExperimentId, string[]>>,
): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const available = selectedSaveInstanceKeys(keysByExperiment ?? {});
  const availableSet = new Set(available);
  const rawKeys = raw.filter((key): key is string => typeof key === 'string' && availableSet.has(key));
  const ordered = Array.from(new Set(rawKeys));
  for (const key of available) {
    if (!ordered.includes(key)) ordered.push(key);
  }
  return ordered;
}

function normalizeSelectedSaveKeysByExperiment(
  raw: unknown,
): Partial<Record<ExperimentId, string[]>> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const order: ExperimentId[] = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const record = raw as Partial<Record<ExperimentId, unknown>>;
  const next: Partial<Record<ExperimentId, string[]>> = {};
  for (const experiment of order) {
    const value = record[experiment];
    if (!Array.isArray(value)) continue;
    const keys = Array.from(new Set(value.filter((key): key is string => typeof key === 'string' && key.length > 0)));
    if (keys.length > 0) next[experiment] = keys;
  }
  return next;
}

function normalizeSelectedSavePositions(
  raw: unknown,
): Record<string, { x: number; y: number }> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const entries = Object.entries(raw as Record<string, unknown>)
    .filter(([, value]) => Boolean(value) && typeof (value as { x?: unknown }).x === 'number' && typeof (value as { y?: unknown }).y === 'number')
    .map(([key, value]) => [key, { x: (value as { x: number; y: number }).x, y: (value as { x: number; y: number }).y }] as const)
    .sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) return {};
  return Object.fromEntries(entries);
}

function normalizeLayoutSnapshot(raw: unknown): ExperimentSetOneLayoutSnapshot {
  const layout = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const selectedSaveKeysByExperiment = sortedSelectedSaveKeysByExperiment(
    normalizeSelectedSaveKeysByExperiment(layout.selectedSaveKeysByExperiment),
  );
  const selectedSaveVisualOrder = normalizeSelectedSaveVisualOrder(layout.selectedSaveVisualOrder, selectedSaveKeysByExperiment);
  const selectedExperimentIds = normalizeSelectedExperimentIds(layout.selectedExperimentIds);
  const selectedSavePositions = sortedSelectedSavePositions(normalizeSelectedSavePositions(layout.selectedSavePositions));
  const hasActiveExperiment = Object.prototype.hasOwnProperty.call(layout, 'activeExperiment');
  return {
    ...(hasActiveExperiment &&
    (
      layout.activeExperiment === 'one' ||
      layout.activeExperiment === 'two' ||
      layout.activeExperiment === 'three' ||
      layout.activeExperiment === 'four' ||
      layout.activeExperiment === 'five' ||
      layout.activeExperiment === 'six' ||
      layout.activeExperiment === 'seven' ||
      layout.activeExperiment === 'eight' ||
      layout.activeExperiment === 'nine' ||
      layout.activeExperiment === 'ten'
    )
      ? { activeExperiment: layout.activeExperiment }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(layout, 'selectedExperimentIds') ? { selectedExperimentIds } : {}),
    ...(Object.prototype.hasOwnProperty.call(layout, 'selectedSaveKeysByExperiment') ? { selectedSaveKeysByExperiment } : {}),
    ...(Object.prototype.hasOwnProperty.call(layout, 'selectedSaveVisualOrder') ? { selectedSaveVisualOrder } : {}),
    ...(Object.prototype.hasOwnProperty.call(layout, 'selectedSavePositions') ? { selectedSavePositions } : {}),
  };
}

function snapshotFingerprint(snapshot: ExperimentSetOneSnapshot): string {
  return JSON.stringify({
    scope: snapshot.scope ?? null,
    sourceSaveId: snapshot.sourceSaveId ?? null,
    activeExperiment: snapshot.activeExperiment ?? null,
    selectedExperimentIds: snapshot.selectedExperimentIds ?? null,
    selectedSaveKeysByExperiment: snapshot.selectedSaveKeysByExperiment ?? null,
    selectedSaveVisualOrder: snapshot.selectedSaveVisualOrder ?? null,
    selectedSavePositions: snapshot.selectedSavePositions ?? null,
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

function withBranchVariant(save: ExperimentSetOneSnapshot): ExperimentSetOneSnapshot {
  const variant = renderVariantForSaveId(save.id);
  return variant ? { ...save, branchVariant: variant.slug } : save;
}

function withNormalizedE4(save: ExperimentSetOneSnapshot): ExperimentSetOneSnapshot {
  if (!save.e4) return withBranchVariant(save);
  return withBranchVariant({
    ...save,
    e4: normalizeE4MaterialSettings(save.e4),
    ...normalizeLayoutSnapshot(save),
  });
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
  runtimeSaves = dedupeSnapshots(saves.map((save) => ({ ...migrateSnapshotScope(save), ...normalizeLayoutSnapshot(save) })));
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
  scope: SaveScope,
  layout?: ExperimentSetOneLayoutSnapshot,
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
    ...layout,
  });
  setExperimentSetOneRuntimeSaves([...existing, snapshot]);
  void persistSaveToRepo(snapshot).then((ok) => {
    if (!ok) downloadSaveJson(snapshot);
  });
  return snapshot;
}

export function getFieldFromSnapshot(
  snapshot: ExperimentSetOneSnapshot,
  experiment: 'one' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten',
  fieldId: string,
): string | number | boolean | undefined {
  if (experiment === 'four' && snapshot.id === REFERENCE_CORNER_SAVE_ID) {
    const override =
      REFERENCE_CORNER_LIGHTING_OVERRIDES[fieldId as keyof typeof REFERENCE_CORNER_LIGHTING_OVERRIDES];
    if (override !== undefined) return override;
    return undefined;
  }
  if (experiment === 'four' || experiment === 'five' || experiment === 'six' || experiment === 'seven' || experiment === 'eight' || experiment === 'nine' || experiment === 'ten') {
    if (!snapshot.e4) return undefined;
    return snapshot.e4[fieldId as keyof E4MaterialSettings] as string | number | boolean;
  }
  const settings = experiment === 'one' ? snapshot.e1 : experiment === 'two' ? snapshot.e2 : snapshot.e3;
  return settings[fieldId as keyof typeof settings] as string | number | boolean;
}
