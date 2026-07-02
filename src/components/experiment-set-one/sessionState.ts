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
import { applyShowcasePanelGeometry } from './showcasePanelGeometry';

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
  /** Live Experiment Eight working copy — duplicate of Experiment Six. */
  e8?: E4MaterialSettings;
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
    selectedSaveIdByExperiment: { one: null, two: null, three: null, four: null, five: null, six: null, seven: null, eight: null },
    cornerPresetVersion: REFERENCE_CORNER_PRESET_VERSION,
    layerEditMode: 'both',
  };
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
    const session: ExperimentSetOneSession = {
      e1: parsed.e1,
      e2: parsed.e2,
      e3: parsed.e3,
      e4,
      e5: parsed.e5 ? normalizeE4MaterialSettings(parsed.e5) : undefined,
      e6: parsed.e6 ? normalizeE4MaterialSettings(parsed.e6) : undefined,
      e7: parsed.e7 ? normalizeE4MaterialSettings(parsed.e7) : undefined,
      e8: parsed.e8 ? normalizeE4MaterialSettings(parsed.e8) : undefined,
      e6LayerC: parsed.e6LayerC,
      hidePanelText: typeof parsed.hidePanelText === 'boolean' ? parsed.hidePanelText : true,
      layerAVisible: parsed.layerAVisible !== false,
      layerBVisible: parsed.layerBVisible !== false,
      layerCVisible: parsed.layerCVisible !== false,
      inspectMode: parsed.inspectMode !== false,
      experimentVisible: normalizeExperimentVisibility(parsed.experimentVisible),
      referenceWallpaper: Boolean(parsed.referenceWallpaper),
      activeExperiment:
        parsed.activeExperiment === 'one' ||
        parsed.activeExperiment === 'two' ||
        parsed.activeExperiment === 'three' ||
        parsed.activeExperiment === 'four' ||
        parsed.activeExperiment === 'five' ||
        parsed.activeExperiment === 'six' ||
        parsed.activeExperiment === 'seven' ||
        parsed.activeExperiment === 'eight'
          ? parsed.activeExperiment
          : 'four',
      selectedSaveIdByExperiment: parsed.selectedSaveIdByExperiment ?? undefined,
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
