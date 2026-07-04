import type { E1MaterialSettings } from '../experiment-one/materialSettings';
import type { E2MaterialSettings } from '../experiment-set-two/materialSettings';
import type { E3MaterialSettings } from '../experiment-set-three/materialSettings';
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { normalizeE4MaterialSettings } from '../experiment-set-four/materialSettings';
import {
  applyReferenceCornerLighting,
  REFERENCE_CORNER_PRESET_VERSION,
} from '../experiment-set-four/referenceCornerLighting';
import {
  E1_MASTER_DEFAULT,
  E2_MASTER_DEFAULT,
  E3_MASTER_DEFAULT,
  E4_MASTER_DEFAULT,
} from './masterDefaults';
import { applyExperimentEightPanelGeometry } from './experimentSevenPanelGeometry';
import { applyShowcasePanelGeometry, applyExperimentNinePanelGeometry } from './showcasePanelGeometry';
import { normalizeExperimentTenPanelGeometry } from './experimentTenPanelGeometry';

import {
  DEFAULT_EXPERIMENT_VISIBILITY,
  normalizeExperimentVisibility,
  type ExperimentId,
  type ExperimentVisibility,
} from './experimentVisibility';

import type { LayerEditMode } from '../shared/layerEditMode';
import type { RenderVariantSlug } from '../../render-variants/manifest';
import type { E6LayerCLayoutSettings } from '../experiment-set-six/layerCMaterialSettings';

const SESSION_KEY = 'experiment-set-1-session';
let memorySessionFallback: ExperimentSetOneSession | null = null;

export type ExperimentSetOneSession = {
  e1: E1MaterialSettings;
  e2: E2MaterialSettings;
  e3: E3MaterialSettings;
  e4: E4MaterialSettings;
  /** Live Experiment Five working copy — separate from e4 and from saved presets. */
  e5?: E4MaterialSettings;
  /** Live Experiment Six working copy — compact panel geometry. */
  e6?: E4MaterialSettings;
  /** Live Experiment Seven working copy — compact nested rects, no layer C. */
  e7?: E4MaterialSettings;
  /** Live Experiment Eight working copy — compact geometry only. */
  e8?: E4MaterialSettings;
  /** Live Experiment Nine working copy — duplicate of Experiment Four. */
  e9?: E4MaterialSettings;
  /** Live Experiment Ten working copy — duplicate of Experiment Nine. */
  e10?: E4MaterialSettings;
  /** Experiment Six layer C circle layout (diameter, inset position). */
  e6LayerC?: E6LayerCLayoutSettings;
  hidePanelText: boolean;
  /** Stage visibility for layer A draggable (E3/E4/E5). */
  layerAVisible?: boolean;
  /** Stage visibility for layer B draggable or nested inset (E3/E4/E5/E6). */
  layerBVisible?: boolean;
  /** Stage visibility for layer C circle on E6 (independent of layer B). */
  layerCVisible?: boolean;
  inspectMode: boolean;
  experimentVisible: ExperimentVisibility;
  referenceWallpaper: boolean;
  activeExperiment?: ExperimentId;
  selectedSaveIdByExperiment?: Partial<Record<ExperimentId, number | null>>;
  selectedExperimentIds?: ExperimentId[];
  selectedSaveKeysByExperiment?: Partial<Record<ExperimentId, string[]>>;
  /** Legacy numeric multi-select keys; kept so older sessions migrate cleanly. */
  selectedSaveIdsByExperiment?: Partial<Record<ExperimentId, number[]>>;
  saveVisualOrder?: number[];
  selectedSaveVisualOrder?: string[];
  selectedSavePositions?: Record<string, { x: number; y: number }>;
  cornerPresetVersion?: number;
  e5BorderRefinementsVersion?: number;
  layerEditMode?: LayerEditMode;
  /** Active branch render pipeline (experiment-five git branches). */
  activeRenderVariant?: RenderVariantSlug | null;
};

export function defaultSession(): ExperimentSetOneSession {
  return {
    e1: E1_MASTER_DEFAULT,
    e2: E2_MASTER_DEFAULT,
    e3: E3_MASTER_DEFAULT,
    e4: applyShowcasePanelGeometry(applyReferenceCornerLighting(E4_MASTER_DEFAULT)),
    hidePanelText: true,
    layerAVisible: true,
    layerBVisible: true,
    layerCVisible: true,
    inspectMode: true,
    experimentVisible: DEFAULT_EXPERIMENT_VISIBILITY,
    referenceWallpaper: false,
    activeExperiment: 'four',
    selectedSaveIdByExperiment: { one: null, two: null, three: null, four: null, five: null, six: null, seven: null, eight: null, nine: null, ten: null },
    selectedExperimentIds: ['four'],
    selectedSaveKeysByExperiment: {},
    saveVisualOrder: [],
    selectedSaveVisualOrder: [],
    selectedSavePositions: {},
    cornerPresetVersion: REFERENCE_CORNER_PRESET_VERSION,
    layerEditMode: 'both',
  };
}

function normalizeSelectedExperimentIds(raw: unknown, activeExperiment: ExperimentId): ExperimentId[] {
  if (!Array.isArray(raw)) return [activeExperiment];
  const allowed = new Set<ExperimentId>(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);
  const next = Array.from(new Set(raw.filter((id): id is ExperimentId => allowed.has(id))));
  return next.length > 0 ? next : [activeExperiment];
}

function normalizeSelectedSaveKeysByExperiment(
  rawKeys: unknown,
  rawIds: unknown,
  selectedSaveIdByExperiment: Partial<Record<ExperimentId, number | null>> | undefined,
  activeExperiment: ExperimentId,
  activeRenderVariant: RenderVariantSlug | null | undefined,
): Partial<Record<ExperimentId, string[]>> {
  const next: Partial<Record<ExperimentId, string[]>> = {};
  const allowed = new Set<ExperimentId>(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);
  const rawKeyRecord = rawKeys && typeof rawKeys === 'object' ? (rawKeys as Partial<Record<ExperimentId, unknown>>) : undefined;
  const rawIdRecord = rawIds && typeof rawIds === 'object' ? (rawIds as Partial<Record<ExperimentId, unknown>>) : undefined;
  const legacyKeyFor = (experiment: ExperimentId, id: number) =>
    `${experiment === activeExperiment && activeRenderVariant ? activeRenderVariant : 'base'}:${id}`;
  const keyMatchesSaveId = (key: string, id: number) => key.endsWith(`:${id}`);

  for (const experiment of allowed) {
    const keyValue = rawKeyRecord?.[experiment];
    const idValue = rawIdRecord?.[experiment];
    const keys = Array.isArray(keyValue)
      ? keyValue.filter((key): key is string => typeof key === 'string' && key.length > 0)
      : [];
    const legacyKeys = Array.isArray(idValue)
      ? idValue
          .filter((id): id is number => typeof id === 'number' && Number.isFinite(id))
          .map((id) => legacyKeyFor(experiment, id))
      : [];
    const normalized = Array.from(new Set([...keys, ...legacyKeys]));
    const selected = selectedSaveIdByExperiment?.[experiment];
    if (
      normalized.length === 1 &&
      typeof selected === 'number' &&
      Number.isFinite(selected) &&
      keyMatchesSaveId(normalized[0], selected)
    ) continue;
    if (normalized.length > 0) next[experiment] = normalized;
  }

  return next;
}

function normalizeSaveVisualOrder(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const ids = raw.filter((id): id is number => typeof id === 'number' && Number.isFinite(id));
  return Array.from(new Set(ids));
}

function selectedSaveInstanceKeys(keysByExperiment: Partial<Record<ExperimentId, string[]>>): string[] {
  const allowed: ExperimentId[] = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  return allowed.flatMap((experiment) =>
    (keysByExperiment[experiment] ?? []).map((key) => `${experiment}:${key}`),
  );
}

function normalizeSelectedSaveVisualOrder(
  raw: unknown,
  keysByExperiment: Partial<Record<ExperimentId, string[]>>,
): string[] {
  const available = selectedSaveInstanceKeys(keysByExperiment);
  const availableSet = new Set(available);
  const rawKeys = Array.isArray(raw)
    ? raw.filter((key): key is string => typeof key === 'string' && availableSet.has(key))
    : [];
  const ordered = Array.from(new Set(rawKeys));
  for (const key of available) {
    if (!ordered.includes(key)) ordered.push(key);
  }
  return ordered;
}

function normalizeSelectedSavePositions(raw: unknown): Record<string, { x: number; y: number }> {
  if (!raw || typeof raw !== 'object') return {};
  const next: Record<string, { x: number; y: number }> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const point = value as Partial<{ x: unknown; y: unknown }>;
    if (typeof point.x !== 'number' || typeof point.y !== 'number') continue;
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
    next[key] = { x: point.x, y: point.y };
  }
  return next;
}

export function readSessionReferenceWallpaper(): boolean | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ExperimentSetOneSession>;
    return typeof parsed.referenceWallpaper === 'boolean' ? parsed.referenceWallpaper : null;
  } catch {
    return null;
  }
}

export function patchSessionReferenceWallpaper(enabled: boolean) {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<ExperimentSetOneSession>;
    if (parsed.referenceWallpaper === enabled) return;
    parsed.referenceWallpaper = enabled;
    localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}

export function loadExperimentSetOneSession(): ExperimentSetOneSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ExperimentSetOneSession>;
    if (!parsed?.e1 || !parsed?.e2 || !parsed?.e3) return null;
    let e4 = normalizeE4MaterialSettings(parsed.e4);
    const cornerPresetVersion = parsed.cornerPresetVersion ?? 0;
    if (cornerPresetVersion < REFERENCE_CORNER_PRESET_VERSION) {
      e4 = applyReferenceCornerLighting(e4);
    }
    const activeExperiment =
      parsed.activeExperiment === 'one' ||
      parsed.activeExperiment === 'two' ||
      parsed.activeExperiment === 'three' ||
      parsed.activeExperiment === 'four' ||
      parsed.activeExperiment === 'five' ||
      parsed.activeExperiment === 'six' ||
      parsed.activeExperiment === 'seven' ||
      parsed.activeExperiment === 'eight' ||
      parsed.activeExperiment === 'nine' ||
      parsed.activeExperiment === 'ten'
        ? parsed.activeExperiment
        : 'four';
    const selectedSaveKeysByExperiment = normalizeSelectedSaveKeysByExperiment(
      parsed.selectedSaveKeysByExperiment,
      parsed.selectedSaveIdsByExperiment,
      parsed.selectedSaveIdByExperiment,
      activeExperiment,
      parsed.activeRenderVariant,
    );
    const session: ExperimentSetOneSession = {
      e1: parsed.e1,
      e2: parsed.e2,
      e3: parsed.e3,
      e4,
      e5: parsed.e5 ? normalizeE4MaterialSettings(parsed.e5) : undefined,
      e6: parsed.e6 ? normalizeE4MaterialSettings(parsed.e6) : undefined,
      e7: parsed.e7 ? normalizeE4MaterialSettings(parsed.e7) : undefined,
      e8: parsed.e8 ? applyExperimentEightPanelGeometry(normalizeE4MaterialSettings(parsed.e8)) : undefined,
      e9: parsed.e9 ? applyExperimentNinePanelGeometry(normalizeE4MaterialSettings(parsed.e9)) : undefined,
      e10: parsed.e10 ? normalizeExperimentTenPanelGeometry(parsed.e10) : undefined,
      e6LayerC: parsed.e6LayerC,
      hidePanelText: typeof parsed.hidePanelText === 'boolean' ? parsed.hidePanelText : true,
      layerAVisible: parsed.layerAVisible !== false,
      layerBVisible: parsed.layerBVisible !== false,
      layerCVisible: parsed.layerCVisible !== false,
      inspectMode: parsed.inspectMode !== false,
      experimentVisible: normalizeExperimentVisibility(parsed.experimentVisible),
      referenceWallpaper: Boolean(parsed.referenceWallpaper),
      activeExperiment,
      selectedSaveIdByExperiment: parsed.selectedSaveIdByExperiment ?? undefined,
      selectedExperimentIds: normalizeSelectedExperimentIds(parsed.selectedExperimentIds, activeExperiment),
      selectedSaveKeysByExperiment,
      saveVisualOrder: normalizeSaveVisualOrder(parsed.saveVisualOrder),
      selectedSaveVisualOrder: normalizeSelectedSaveVisualOrder(
        parsed.selectedSaveVisualOrder,
        selectedSaveKeysByExperiment,
      ),
      selectedSavePositions: normalizeSelectedSavePositions(parsed.selectedSavePositions),
      cornerPresetVersion: REFERENCE_CORNER_PRESET_VERSION,
      e5BorderRefinementsVersion: parsed.e5BorderRefinementsVersion,
      layerEditMode:
        parsed.layerEditMode === 'layerA' ||
        parsed.layerEditMode === 'layerB' ||
        parsed.layerEditMode === 'layerC' ||
        parsed.layerEditMode === 'both'
          ? parsed.layerEditMode
          : 'both',
      activeRenderVariant: parsed.activeRenderVariant ?? undefined,
    };
    if (cornerPresetVersion < REFERENCE_CORNER_PRESET_VERSION) {
      saveExperimentSetOneSession(session);
    }
    return session;
  } catch {
    return memorySessionFallback;
  }
}

export function saveExperimentSetOneSession(session: ExperimentSetOneSession) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    memorySessionFallback = null;
  } catch {
    memorySessionFallback = session;
  }
}
