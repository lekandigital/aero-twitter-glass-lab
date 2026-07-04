import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  E1_INSPECT_CATALOG,
  E1_SETTING_FIELDS,
  e1SettingsToCssVars,
  isE1InspectTarget,
  type E1InspectTarget,
  type E1MaterialSettings,
} from '../experiment-one/materialSettings';
import {
  E2_INSPECT_CATALOG,
  E2_SECTION_ORDER,
  E2_SETTING_FIELDS,
  e2SettingsToCssVars,
  isE2InspectTarget,
  type E2InspectTarget,
  type E2MaterialSettings,
} from '../experiment-set-two/materialSettings';
import {
  E3_INSPECT_CATALOG,
  E3_SECTION_ORDER,
  E3_SETTING_FIELDS,
  e3SettingsToCssVars,
  isE3InspectTarget,
  type E3InspectTarget,
  type E3MaterialSettings,
} from '../experiment-set-three/materialSettings';
import {
  E4_INSPECT_CATALOG,
  E4_SECTION_ORDER,
  E4_SETTING_FIELDS,
  e4FieldsVisibleForSettings,
  e4RadialLayoutAttr,
  e4SettingsToCssVars,
  isE4InspectTarget,
  normalizeE4MaterialSettings,
  patchE4LayoutField,
  type E4InspectTarget,
  type E4MaterialSettings,
} from '../experiment-set-four/materialSettings';
import {
  E1_MASTER_DEFAULT,
  E2_MASTER_DEFAULT,
  E3_MASTER_DEFAULT,
  E4_MASTER_DEFAULT,
} from './masterDefaults';
import { ExperimentOneDraggableShell } from '../experiment-one/primitives';
import { MaterialSettingCollapsibleSection } from '../shared/MaterialSettingCollapsibleSection';
import { MaterialSettingFieldRow } from '../shared/MaterialSettingControl';
import { ExperimentMultiLayerSettings } from '../shared/ExperimentMultiLayerSettings';
import { LayerEditModeToggle } from '../shared/LayerEditModeToggle';
import { LayerVisibilityToggles } from '../shared/LayerVisibilityToggles';
import { sectionsForLayerMode, foldableSectionId, augmentFieldsWithLayerLayout, type LayerEditMode } from '../shared/layerEditMode';
import {
  captureSettingsScrollAnchor,
  restoreSettingsScrollAnchor,
  type SettingsScrollAnchor,
} from '../shared/settingsScrollAnchor';
import { consumeClickAfterHoldDrag } from '../shared/useHoldDrag';
import { orderedSections, filterFieldsWhen } from '../shared/materialSettingGroups';
import { useFoldableSections } from '../shared/useFoldableSections';
import { downloadExperimentSetOneConfig } from './exportConfig';
import {
  addExperimentSetOneSave,
  getFieldFromSnapshot,
  hydrateExperimentSetOneSaves,
  loadExperimentSetOneSaves,
  type ExperimentSetOneSnapshot,
} from './savedConfigs';
import { applyReferenceCornerLighting, REFERENCE_CORNER_PRESET_VERSION } from '../experiment-set-four/referenceCornerLighting';
import {
  E5_BORDER_REFINEMENTS_VERSION,
  refineExperimentFivePanels,
} from '../experiment-set-five/borderCornerRefinements';
import { clearAllExperimentSetOnePositions, EXPERIMENT_SET_ONE_POSITION_KEYS, loadDragPosition, saveDragPosition } from './dragPositions';
import {
  defaultSession,
  loadExperimentSetOneSession,
  saveExperimentSetOneSession,
  type ExperimentSetOneSession,
} from './sessionState';
import {
  DEFAULT_EXPERIMENT_VISIBILITY,
  type ExperimentId,
  type ExperimentVisibility,
} from './experimentVisibility';
import { clearInspectFlash, flashInspectElement } from '../shared/inspectFlash';
import { useReferenceWallpaper } from '../shared/useReferenceWallpaper';
import { applyShowcasePanelGeometry, applyExperimentNinePanelGeometry, SHOWCASE_PANEL_LAYOUT, SHOWCASE_PANEL_SNAP } from './showcasePanelGeometry';
import {
  applyExperimentTenPanelGeometry,
  normalizeExperimentTenPanelGeometry,
} from './experimentTenPanelGeometry';
import { applyExperimentSixPanelGeometry } from './experimentSixPanelGeometry';
import {
  applyExperimentEightPanelGeometry,
  applyExperimentSevenPanelGeometry,
  mergeExperimentSevenSharedPanelFields,
} from './experimentSevenPanelGeometry';
import {
  buildE6LayerCLayoutDefaults,
  clampE6LayerCLayout,
  E6_LAYER_C_INSPECT_CATALOG,
  E6_LAYER_C_LAYOUT_FIELDS,
  e6SectionOrderForLayerC,
  experimentSixLayerCLayoutCentered,
  experimentSixLayerCMaxDiameter,
  isE6LayerCInspectTarget,
  transformE6FieldsForLayerC,
  type E6LayerCInspectTarget,
  type E6LayerCLayoutSettings,
} from '../experiment-set-six/layerCMaterialSettings';
import { RenderVariantProvider, useRenderVariant } from '../../render-variants/RenderVariantContext';
import { RENDER_VARIANTS, renderVariantForSaveId, type RenderVariantSlug } from '../../render-variants/manifest';
import type { RenderVariantModule } from '../../render-variants/types';

const E1_SECTION_ORDER = [
  'Palette',
  'Background',
  'Shape',
  'Surface',
  'Bezel',
  'Reflection',
  'Depth',
  'Refraction',
] as const;

type ExperimentSelection =
  | { experiment: 'one'; target: E1InspectTarget; label: string }
  | { experiment: 'two'; target: E2InspectTarget; label: string }
  | { experiment: 'three'; target: E3InspectTarget; label: string }
  | { experiment: 'four'; target: E4InspectTarget; label: string }
  | { experiment: 'five'; target: E4InspectTarget; label: string }
  | { experiment: 'six'; target: E4InspectTarget | E6LayerCInspectTarget; label: string }
  | { experiment: 'seven'; target: E4InspectTarget; label: string }
  | { experiment: 'eight'; target: E4InspectTarget | E6LayerCInspectTarget; label: string }
  | { experiment: 'nine'; target: E4InspectTarget; label: string }
  | { experiment: 'ten'; target: E4InspectTarget; label: string };

const EXPERIMENT_ORDER: ExperimentId[] = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

function catalogSaveId(save: { id: number; sourceSaveId?: number }) {
  return save.sourceSaveId ?? save.id;
}

function e4DockExperiment(activeExperiment: ExperimentId): 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten' {
  if (activeExperiment === 'five' || activeExperiment === 'six' || activeExperiment === 'seven' || activeExperiment === 'eight' || activeExperiment === 'nine' || activeExperiment === 'ten') {
    return activeExperiment;
  }
  return 'four';
}

function normalizeExperimentSelectionIds(raw: ExperimentId[] | undefined, fallback: ExperimentId): ExperimentId[] {
  if (!raw || raw.length === 0) return [fallback];
  return Array.from(new Set(raw.filter((id) => EXPERIMENT_ORDER.includes(id))));
}

function saveSelectionKey(id: number, branchSlug?: RenderVariantSlug | null): string {
  return `${branchSlug ?? 'base'}:${id}`;
}

function normalizeSaveSelectionKeys(
  rawKeys: Partial<Record<ExperimentId, string[]>> | undefined,
  rawIds: Partial<Record<ExperimentId, number[]>> | undefined,
  activeExperiment: ExperimentId,
  activeRenderVariant: RenderVariantSlug | null | undefined,
) {
  const next: Partial<Record<ExperimentId, string[]>> = {};
  for (const experiment of EXPERIMENT_ORDER) {
    const keys = rawKeys?.[experiment] ?? [];
    const legacyKeys = rawIds?.[experiment]?.map((id) =>
      saveSelectionKey(id, experiment === activeExperiment ? activeRenderVariant : null),
    ) ?? [];
    const normalized = Array.from(new Set([...keys, ...legacyKeys].filter((key) => key.length > 0)));
    if (normalized.length > 0) next[experiment] = normalized;
  }
  return next;
}

function isCurrentSaveActive(
  selectedId: number | null,
  activeRenderVariant: RenderVariantSlug | null,
  id: number,
  branchSlug?: RenderVariantSlug | null,
): boolean {
  if (selectedId !== id) return false;
  return (branchSlug ?? null) === activeRenderVariant;
}

function toggleId<T extends string | number>(items: readonly T[], value: T): T[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

function normalizeSaveVisualOrder(raw: number[] | undefined, saves: ExperimentSetOneSnapshot[]): number[] {
  const availableIds = saves.map((save) => save.id);
  const rawIds = Array.isArray(raw) ? raw.filter((id): id is number => Number.isFinite(id)) : [];
  return Array.from(new Set([...rawIds, ...availableIds]));
}

function selectedSaveInstanceKey(experiment: ExperimentId, key: string): string {
  return `${experiment}:${key}`;
}

function selectedSaveInstanceKeys(keysByExperiment: Partial<Record<ExperimentId, string[]>>): string[] {
  return EXPERIMENT_ORDER.flatMap((experiment) =>
    (keysByExperiment[experiment] ?? []).map((key) => selectedSaveInstanceKey(experiment, key)),
  );
}

function normalizeSelectedSaveVisualOrder(
  raw: string[] | undefined,
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

function moveSelectedSaveToOrderEdge(order: string[], key: string, edge: 'front' | 'back'): string[] {
  const index = order.indexOf(key);
  if (index === -1) return order;
  const next = order.filter((item) => item !== key);
  if (edge === 'front') return [key, ...next];
  return [...next, key];
}

function saveOrderIndex(order: number[], id: number): number {
  const index = order.indexOf(id);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function sortSavesByVisualOrder<T extends { id: number }>(saves: T[], order: number[]): T[] {
  return [...saves].sort((a, b) => saveOrderIndex(order, a.id) - saveOrderIndex(order, b.id) || a.id - b.id);
}

type ExperimentSetOneContextValue = {
  e1: E1MaterialSettings;
  e2: E2MaterialSettings;
  e3: E3MaterialSettings;
  e4: E4MaterialSettings;
  e5: E4MaterialSettings;
  e6: E4MaterialSettings;
  e7: E4MaterialSettings;
  e8: E4MaterialSettings;
  e9: E4MaterialSettings;
  e10: E4MaterialSettings;
  e6LayerC: E6LayerCLayoutSettings;
  setE1: <K extends keyof E1MaterialSettings>(id: K, value: E1MaterialSettings[K]) => void;
  setE2: <K extends keyof E2MaterialSettings>(id: K, value: E2MaterialSettings[K]) => void;
  setE3: <K extends keyof E3MaterialSettings>(id: K, value: E3MaterialSettings[K]) => void;
  setE4: <K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => void;
  setE5: <K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => void;
  setE6: <K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => void;
  setE7: <K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => void;
  setE8: <K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => void;
  setE9: <K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => void;
  setE10: <K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => void;
  setE6LayerC: <K extends keyof E6LayerCLayoutSettings>(id: K, value: E6LayerCLayoutSettings[K]) => void;
  resetAll: () => void;
  saves: ExperimentSetOneSnapshot[];
  saveCurrent: () => void;
  loadSave: (id: number, branchSlug?: RenderVariantSlug) => void;
  layoutResetVersion: number;
  resetLayoutPositions: () => void;
  inspectMode: boolean;
  setInspectMode: (on: boolean) => void;
  hidePanelText: boolean;
  setHidePanelText: (on: boolean) => void;
  layerAVisible: boolean;
  layerBVisible: boolean;
  layerCVisible: boolean;
  toggleLayerAVisible: () => void;
  toggleLayerBVisible: () => void;
  toggleLayerCVisible: () => void;
  experimentVisible: ExperimentVisibility;
  toggleExperimentVisible: (id: ExperimentId) => void;
  activeExperiment: ExperimentId;
  setActiveExperiment: (id: ExperimentId) => void;
  selectedSaveIdByExperiment: Record<ExperimentId, number | null>;
  selectedExperimentIds: ExperimentId[];
  selectedSaveKeysByExperiment: Partial<Record<ExperimentId, string[]>>;
  saveVisualOrder: number[];
  selectedSaveVisualOrder: string[];
  selectedSavePositions: Record<string, { x: number; y: number }>;
  selection: ExperimentSelection | null;
  clearSelection: () => void;
  clearMultiSelection: () => void;
  queueSaveLoad: (key: string, run: () => void) => void;
  cancelQueuedSaveLoad: (key: string) => void;
  bringSaveForward: (experiment: ExperimentId, key: string) => void;
  sendSaveBackward: (experiment: ExperimentId, key: string) => void;
  setSelectedSavePosition: (instanceKey: string, position: { x: number; y: number }) => void;
  toggleExperimentMultiSelection: (id: ExperimentId, additive: boolean) => void;
  toggleSaveMultiSelection: (experiment: ExperimentId, key: string, additive: boolean) => void;
  referenceWallpaper: boolean;
  toggleReferenceWallpaper: () => void;
};

const ExperimentSetOneContext = createContext<ExperimentSetOneContextValue | null>(null);

export function useExperimentSetOne() {
  const ctx = useContext(ExperimentSetOneContext);
  if (!ctx) throw new Error('useExperimentSetOne must be used within ExperimentSetOneProvider');
  return ctx;
}

function applyE5OverridesStatic(
  raw: E4MaterialSettings,
  _variantModule: RenderVariantModule | null = null,
): E4MaterialSettings {
  return applyShowcasePanelGeometry({
    ...raw,
    ...SHOWCASE_PANEL_LAYOUT,
    layerBNestedInA: true,
  });
}

function applyE6OverridesStatic(
  raw: E4MaterialSettings,
  _variantModule: RenderVariantModule | null = null,
): E4MaterialSettings {
  const refine = _variantModule?.refineExperimentFivePanels ?? refineExperimentFivePanels;
  return applyExperimentSixPanelGeometry(refine(normalizeE4MaterialSettings(raw)));
}

function applyE7OverridesStatic(
  raw: E4MaterialSettings,
  _variantModule: RenderVariantModule | null = null,
): E4MaterialSettings {
  return applyExperimentSevenPanelGeometry(normalizeE4MaterialSettings(raw));
}

function finalizeE7Material(
  raw: E4MaterialSettings,
  shared: E4MaterialSettings,
  loadedModule: RenderVariantModule | null,
): E4MaterialSettings {
  const branch = applyE7OverridesStatic(raw, loadedModule);
  const merged = mergeExperimentSevenSharedPanelFields(branch, shared);
  return applyExperimentSevenPanelGeometry(merged);
}

function resolveInitialE6LayerC(boot: ExperimentSetOneSession, e6: E4MaterialSettings): E6LayerCLayoutSettings {
  if (boot.e6LayerC) return clampE6LayerCLayout(boot.e6LayerC, e6);
  return buildE6LayerCLayoutDefaults(e6);
}

function resolveInitialE6(boot: ExperimentSetOneSession): E4MaterialSettings {
  if (boot.e6) return applyE6OverridesStatic(normalizeE4MaterialSettings(boot.e6));
  const selectedSaveId = boot.selectedSaveIdByExperiment?.six;
  if (selectedSaveId != null) {
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === selectedSaveId);
    if (snapshot?.e4) {
      return applyE6OverridesStatic(normalizeE4MaterialSettings(snapshot.e4));
    }
  }
  return applyE6OverridesStatic(normalizeE4MaterialSettings(boot.e4));
}

function resolveInitialE7(boot: ExperimentSetOneSession): E4MaterialSettings {
  const selectedSaveId = boot.selectedSaveIdByExperiment?.seven;
  if (selectedSaveId != null) {
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === selectedSaveId);
    if (snapshot?.e4) {
      return applyE7OverridesStatic(normalizeE4MaterialSettings(snapshot.e4));
    }
  }
  if (boot.e7) return applyE7OverridesStatic(normalizeE4MaterialSettings(boot.e7));
  return applyE7OverridesStatic(normalizeE4MaterialSettings(boot.e4));
}

function resolveInitialE8(boot: ExperimentSetOneSession): E4MaterialSettings {
  const selectedSaveId = boot.selectedSaveIdByExperiment?.eight;
  if (selectedSaveId != null) {
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === selectedSaveId);
    if (snapshot?.e4) {
      return applyE7OverridesStatic(normalizeE4MaterialSettings(snapshot.e4));
    }
  }
  if (boot.e8) return applyExperimentEightPanelGeometry(normalizeE4MaterialSettings(boot.e8));
  const resolvedE7 = resolveInitialE7(boot);
  return applyExperimentEightPanelGeometry(resolvedE7);
}

function resolveInitialE9(boot: ExperimentSetOneSession): E4MaterialSettings {
  const selectedSaveId = boot.selectedSaveIdByExperiment?.nine;
  if (selectedSaveId != null) {
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === selectedSaveId);
    if (snapshot?.e4) {
      return applyExperimentNinePanelGeometry(normalizeE4MaterialSettings(snapshot.e4));
    }
  }
  if (boot.e9) return applyExperimentNinePanelGeometry(normalizeE4MaterialSettings(boot.e9));
  return applyExperimentNinePanelGeometry(normalizeE4MaterialSettings(boot.e4));
}

function resolveInitialE10(boot: ExperimentSetOneSession): E4MaterialSettings {
  const selectedSaveId = boot.selectedSaveIdByExperiment?.ten;
  if (selectedSaveId != null) {
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === selectedSaveId);
    if (snapshot?.e4) {
      return normalizeExperimentTenPanelGeometry(snapshot.e4 as E4MaterialSettings);
    }
  }
  if (boot.e10) return normalizeExperimentTenPanelGeometry(boot.e10);
  return applyExperimentTenPanelGeometry(boot.e9 ?? boot.e4);
}

function resolveInitialE5(boot: ExperimentSetOneSession): E4MaterialSettings {
  const active = boot.activeExperiment ?? 'four';
  if (active === 'six') return resolveInitialE6(boot);
  if (active === 'seven') return resolveInitialE7(boot);
  if (boot.e5) return applyE5OverridesStatic(normalizeE4MaterialSettings(boot.e5));
  const selectedSaveId = boot.selectedSaveIdByExperiment?.five;
  if (selectedSaveId != null) {
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === selectedSaveId);
    if (snapshot?.e4) {
      return applyE5OverridesStatic(normalizeE4MaterialSettings(snapshot.e4));
    }
  }
  return applyE5OverridesStatic(normalizeE4MaterialSettings(boot.e4));
}

function bootRenderVariant(boot: ExperimentSetOneSession): RenderVariantSlug | null {
  if (boot.activeRenderVariant) return boot.activeRenderVariant;
  const saveId =
    boot.selectedSaveIdByExperiment?.seven ??
    boot.selectedSaveIdByExperiment?.six ??
    boot.selectedSaveIdByExperiment?.five ??
    boot.selectedSaveIdByExperiment?.four;
  if (saveId != null) {
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === saveId);
    const lookupId = snapshot ? catalogSaveId(snapshot) : saveId;
    return renderVariantForSaveId(lookupId)?.slug ?? null;
  }
  return null;
}

export function ExperimentSetOneProvider({ children }: { children: ReactNode }) {
  const boot = loadExperimentSetOneSession() ?? defaultSession();
  return (
    <RenderVariantProvider initialSlug={bootRenderVariant(boot)}>
      <ExperimentSetOneProviderInner>{children}</ExperimentSetOneProviderInner>
    </RenderVariantProvider>
  );
}

function ExperimentSetOneProviderInner({ children }: { children: ReactNode }) {
  const { slug: activeRenderVariant, module: variantModule, setVariant } = useRenderVariant();
  const boot = loadExperimentSetOneSession() ?? defaultSession();
  const [e1, setE1State] = useState<E1MaterialSettings>(boot.e1);
  const [e2, setE2State] = useState<E2MaterialSettings>(boot.e2);
  const [e3, setE3State] = useState<E3MaterialSettings>(boot.e3);
  const [e4, setE4State] = useState<E4MaterialSettings>(() =>
    applyShowcasePanelGeometry(normalizeE4MaterialSettings(boot.e4)),
  );
  const [e5, setE5State] = useState<E4MaterialSettings>(() => resolveInitialE5(boot));
  const [e6, setE6State] = useState<E4MaterialSettings>(() => resolveInitialE6(boot));
  const [e7, setE7State] = useState<E4MaterialSettings>(() => resolveInitialE7(boot));
  const [e8, setE8State] = useState<E4MaterialSettings>(() => resolveInitialE8(boot));
  const [e9, setE9State] = useState<E4MaterialSettings>(() => resolveInitialE9(boot));
  const [e10, setE10State] = useState<E4MaterialSettings>(() => resolveInitialE10(boot));
  const [e6LayerC, setE6LayerCState] = useState<E6LayerCLayoutSettings>(() =>
    resolveInitialE6LayerC(boot, resolveInitialE6(boot)),
  );
  const [e5BorderRefinementsVersion, setE5BorderRefinementsVersion] = useState(
    boot.e5BorderRefinementsVersion ?? 0,
  );
  const [saves, setSaves] = useState<ExperimentSetOneSnapshot[]>(() => loadExperimentSetOneSaves());
  const [inspectMode, setInspectMode] = useState(boot.inspectMode);
  const [hidePanelText, setHidePanelText] = useState(boot.hidePanelText);
  const [layerAVisible, setLayerAVisible] = useState(boot.layerAVisible !== false);
  const [layerBVisible, setLayerBVisible] = useState(boot.layerBVisible !== false);
  const [layerCVisible, setLayerCVisible] = useState(boot.layerCVisible !== false);
  const [experimentVisible, setExperimentVisible] = useState<ExperimentVisibility>(
    boot.experimentVisible ?? DEFAULT_EXPERIMENT_VISIBILITY,
  );
  const { referenceWallpaper, toggleReferenceWallpaper } = useReferenceWallpaper();
  const [layoutResetVersion, setLayoutResetVersion] = useState(0);
  const [activeExperiment, setActiveExperiment] = useState<ExperimentId>(boot.activeExperiment ?? 'four');
  const [selectedSaveIdByExperiment, setSelectedSaveIdByExperiment] = useState<Record<ExperimentId, number | null>>({
    one: boot.selectedSaveIdByExperiment?.one ?? null,
    two: boot.selectedSaveIdByExperiment?.two ?? null,
    three: boot.selectedSaveIdByExperiment?.three ?? null,
    four: boot.selectedSaveIdByExperiment?.four ?? null,
    five: boot.selectedSaveIdByExperiment?.five ?? null,
    six: boot.selectedSaveIdByExperiment?.six ?? null,
    seven: boot.selectedSaveIdByExperiment?.seven ?? null,
    eight: boot.selectedSaveIdByExperiment?.eight ?? null,
    nine: boot.selectedSaveIdByExperiment?.nine ?? null,
    ten: boot.selectedSaveIdByExperiment?.ten ?? null,
  });
  const [selectedExperimentIds, setSelectedExperimentIds] = useState<ExperimentId[]>(() =>
    normalizeExperimentSelectionIds(boot.selectedExperimentIds, boot.activeExperiment ?? 'four'),
  );
  const [selectedSaveKeysByExperiment, setSelectedSaveKeysByExperiment] = useState<
    Partial<Record<ExperimentId, string[]>>
  >(() =>
    normalizeSaveSelectionKeys(
      boot.selectedSaveKeysByExperiment,
      boot.selectedSaveIdsByExperiment,
      boot.activeExperiment ?? 'four',
      boot.activeRenderVariant,
    ),
  );
  const [saveVisualOrder, setSaveVisualOrder] = useState<number[]>(() =>
    normalizeSaveVisualOrder(boot.saveVisualOrder, loadExperimentSetOneSaves()),
  );
  const [selectedSaveVisualOrder, setSelectedSaveVisualOrder] = useState<string[]>(() =>
    normalizeSelectedSaveVisualOrder(boot.selectedSaveVisualOrder, boot.selectedSaveKeysByExperiment ?? {}),
  );
  const [selectedSavePositions, setSelectedSavePositions] = useState<Record<string, { x: number; y: number }>>(
    () => boot.selectedSavePositions ?? {},
  );
  const [selection, setSelection] = useState<ExperimentSelection | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const selectedElRef = useRef<HTMLElement | null>(null);
  const pendingSaveClickRef = useRef<{ key: string; timer: ReturnType<typeof setTimeout> } | null>(null);
  const prevActiveExperimentRef = useRef<ExperimentId>(boot.activeExperiment ?? 'four');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    void hydrateExperimentSetOneSaves().then((changed) => {
      if (changed) setSaves(loadExperimentSetOneSaves());
    });
  }, []);

  useEffect(() => {
    setSaveVisualOrder((prev) => normalizeSaveVisualOrder(prev, saves));
  }, [saves]);

  useEffect(() => {
    setSelectedSaveVisualOrder((prev) => normalizeSelectedSaveVisualOrder(prev, selectedSaveKeysByExperiment));
  }, [selectedSaveKeysByExperiment]);

  useEffect(() => {
    try {
      saveDragPosition(EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4, SHOWCASE_PANEL_SNAP);
    } catch {
      // ignore blocked storage
    }
  }, []);

  useEffect(() => {
    if (activeExperiment !== 'four' && activeExperiment !== 'five' && activeExperiment !== 'six' && activeExperiment !== 'seven' && activeExperiment !== 'eight' && activeExperiment !== 'nine' && activeExperiment !== 'ten') return;
    if (prevActiveExperimentRef.current === activeExperiment) return;
    prevActiveExperimentRef.current = activeExperiment;
    setE4State((prev) => applyShowcasePanelGeometry(prev));
    if (activeExperiment === 'five') {
      setE5State((prev) => applyE5OverridesStatic(prev, variantModule));
    }
    if (activeExperiment === 'six') {
      setE6State((prev) => {
        const next = applyE6OverridesStatic(prev, variantModule);
        setE5State(next);
        return next;
      });
    }
    if (activeExperiment === 'seven') {
      const selectedId = selectedSaveIdByExperiment.seven;
      const selected =
        selectedId != null ? saves.find((save) => save.id === selectedId) : undefined;
      if (selected?.scope === 'general' && selected.generalPreset === 'e7-glitch-shell') {
        setLayerAVisible(true);
        setLayerBVisible(true);
        setLayerCVisible(false);
        setE7State((prev) => {
          setE5State(prev);
          return prev;
        });
        return;
      }
      if (selected?.scope === 'general') {
        setLayerCVisible(false);
        setE7State((prev) => {
          setE5State(prev);
          return prev;
        });
        return;
      }
      setLayerCVisible(false);
      setE7State((prev) => {
        const next = applyE7OverridesStatic(prev, variantModule);
        setE5State(next);
        return next;
      });
    }
    if (activeExperiment === 'eight') {
      setE8State((prev) => {
        const next = applyE7OverridesStatic(prev);
        setE5State(next);
        return next;
      });
    }
    if (activeExperiment === 'nine') {
      setE9State((prev) => {
        const next = applyExperimentNinePanelGeometry(prev);
        setE5State(next);
        return next;
      });
    }
    if (activeExperiment === 'ten') {
      setE10State((prev) => {
        const next = applyExperimentTenPanelGeometry(prev);
        setE5State(next);
        return next;
      });
    }
  }, [activeExperiment, saves, selectedSaveIdByExperiment]);

  useEffect(() => {
    if (activeExperiment === 'seven') setLayerCVisible(false);
  }, [activeExperiment]);

  useEffect(() => {
    if (activeExperiment === 'six') setE5State(e6);
  }, [activeExperiment, e6]);

  useEffect(() => {
    if (activeExperiment === 'seven') setE5State(e7);
  }, [activeExperiment, e7]);

  useEffect(() => {
    if (activeExperiment === 'eight') setE5State(e8);
  }, [activeExperiment, e8]);

  useEffect(() => {
    if (activeExperiment === 'nine') setE5State(e9);
  }, [activeExperiment, e9]);

  useEffect(() => {
    if (activeExperiment === 'ten') setE5State(e10);
  }, [activeExperiment, e10]);

  useEffect(() => {
    setE6LayerCState((prev) => clampE6LayerCLayout(prev, e6));
  }, [e6.layerBWidth, e6.layerBHeight]);

  const e4CssVars = variantModule?.e4SettingsToCssVars ?? e4SettingsToCssVars;
  const style = useMemo(
    () =>
      ({
        ...e1SettingsToCssVars(e1),
        ...e2SettingsToCssVars(e2),
        ...e3SettingsToCssVars(e3),
        ...(activeExperiment === 'five'
          ? e4CssVars(e5)
            : activeExperiment === 'six'
              ? e4CssVars(e6)
              : activeExperiment === 'seven'
                ? e4CssVars(e7)
                : activeExperiment === 'eight'
                  ? e4CssVars(e8)
                  : activeExperiment === 'nine'
                    ? e4CssVars(e9)
                    : activeExperiment === 'ten'
                      ? e4CssVars(e10)
                      : e4CssVars(e4)),
      }) as CSSProperties,
    [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, activeExperiment, e4CssVars],
  );

  const activeE4Materials = useMemo(() => {
    if (activeExperiment === 'five') return e5;
    if (activeExperiment === 'six') return e6;
    if (activeExperiment === 'seven') return e7;
    if (activeExperiment === 'eight') return e8;
    if (activeExperiment === 'nine') return e9;
    if (activeExperiment === 'ten') return e10;
    return e4;
  }, [activeExperiment, e4, e5, e6, e7, e8, e9, e10]);

  const setE1 = useCallback(<K extends keyof E1MaterialSettings>(id: K, value: E1MaterialSettings[K]) => {
    setE1State((prev) => ({ ...prev, [id]: value }));
  }, []);

  const setE2 = useCallback(<K extends keyof E2MaterialSettings>(id: K, value: E2MaterialSettings[K]) => {
    setE2State((prev) => ({ ...prev, [id]: value }));
  }, []);

  const setE3 = useCallback(<K extends keyof E3MaterialSettings>(id: K, value: E3MaterialSettings[K]) => {
    setE3State((prev) => ({ ...prev, [id]: value }));
  }, []);

  const setE4 = useCallback(<K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => {
    setE4State((prev) => patchE4LayoutField(prev, id, value));
  }, []);

  const setE5 = useCallback(<K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => {
    setE5State((prev) => patchE4LayoutField(prev, id, value));
  }, []);

  const setE6 = useCallback(<K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => {
    setE6State((prev) => {
      const next = patchE4LayoutField(prev, id, value);
      if (activeExperiment === 'six') setE5State(next);
      return next;
    });
  }, [activeExperiment]);

  const setE7 = useCallback(<K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => {
    setE7State((prev) => {
      const next = patchE4LayoutField(prev, id, value);
      if (activeExperiment === 'seven') setE5State(next);
      return next;
    });
  }, [activeExperiment]);

  const setE8 = useCallback(<K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => {
    setE8State((prev) => {
      const next = applyExperimentEightPanelGeometry(patchE4LayoutField(prev, id, value));
      if (activeExperiment === 'eight') setE5State(next);
      return next;
    });
  }, [activeExperiment]);

  const setE9 = useCallback(<K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => {
    setE9State((prev) => {
      const next = applyExperimentNinePanelGeometry(patchE4LayoutField(prev, id, value));
      if (activeExperiment === 'nine') setE5State(next);
      return next;
    });
  }, [activeExperiment]);

  const setE10 = useCallback(<K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => {
    setE10State((prev) => {
      const next = applyExperimentTenPanelGeometry(patchE4LayoutField(prev, id, value));
      if (activeExperiment === 'ten') setE5State(next);
      return next;
    });
  }, [activeExperiment]);

  const setE6LayerC = useCallback(
    <K extends keyof E6LayerCLayoutSettings>(id: K, value: E6LayerCLayoutSettings[K]) => {
      setE6LayerCState((prev) => clampE6LayerCLayout({ ...prev, [id]: value }, e6));
    },
    [e6],
  );

  const resetAll = useCallback(() => {
    setE1State(E1_MASTER_DEFAULT);
    setE2State(E2_MASTER_DEFAULT);
    setE3State(E3_MASTER_DEFAULT);
    setE4State(applyShowcasePanelGeometry(E4_MASTER_DEFAULT));
    setE5State(applyE5OverridesStatic(E4_MASTER_DEFAULT));
    const nextE6 = applyE6OverridesStatic(E4_MASTER_DEFAULT);
    setE6State(nextE6);
    setE6LayerCState(buildE6LayerCLayoutDefaults(nextE6));
    setE7State(applyE7OverridesStatic(E4_MASTER_DEFAULT));
    setE8State(applyExperimentEightPanelGeometry(applyE7OverridesStatic(E4_MASTER_DEFAULT)));
    setE9State(applyExperimentNinePanelGeometry(E4_MASTER_DEFAULT));
    setE10State(applyExperimentTenPanelGeometry(E4_MASTER_DEFAULT));
    setLayerAVisible(true);
    setLayerBVisible(true);
    setLayerCVisible(true);
  }, []);

  const toggleLayerAVisible = useCallback(() => {
    setLayerAVisible((visible) => !visible);
  }, []);

  const toggleLayerBVisible = useCallback(() => {
    setLayerBVisible((visible) => !visible);
  }, []);

  const toggleLayerCVisible = useCallback(() => {
    setLayerCVisible((visible) => !visible);
  }, []);

  const saveCurrent = useCallback(() => {
    const scope = selection ? selection.experiment : activeExperiment;
    const currentE8 = e8;
    const currentE9 = e9;
    const currentE10 = e10;
    const snapshot = addExperimentSetOneSave(
      e1,
      e2,
      e3,
      activeExperiment === 'five'
        ? e5
        : activeExperiment === 'six'
          ? e6
          : activeExperiment === 'seven'
            ? e7
            : activeExperiment === 'eight'
              ? currentE8
              : activeExperiment === 'nine'
                ? currentE9
                : activeExperiment === 'ten'
                  ? currentE10
                : e4,
      scope,
    );
    setSaveVisualOrder((prev) => (prev.includes(snapshot.id) ? prev : [...prev, snapshot.id]));
    setSaves(loadExperimentSetOneSaves());
    downloadExperimentSetOneConfig(
      e1,
      e2,
      e3,
      activeExperiment === 'five'
        ? e5
        : activeExperiment === 'six'
          ? e6
          : activeExperiment === 'seven'
            ? e7
            : activeExperiment === 'eight'
              ? currentE8
              : activeExperiment === 'nine'
                ? currentE9
                : activeExperiment === 'ten'
                  ? currentE10
                : e4,
    );
  }, [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, selection, activeExperiment]);

  const borderRefineVersion = variantModule?.E5_BORDER_REFINEMENTS_VERSION ?? E5_BORDER_REFINEMENTS_VERSION;
  const borderRefine = variantModule?.refineExperimentFivePanels ?? refineExperimentFivePanels;

  const finalizeE5Material = useCallback(
    (raw: E4MaterialSettings, loadedModule: RenderVariantModule | null) => {
      const refine = loadedModule?.refineExperimentFivePanels ?? refineExperimentFivePanels;
      const version = loadedModule?.E5_BORDER_REFINEMENTS_VERSION ?? E5_BORDER_REFINEMENTS_VERSION;
      setE5BorderRefinementsVersion(version);
      return applyE5OverridesStatic(refine(raw), loadedModule);
    },
    [],
  );

  useEffect(() => {
    if (activeExperiment !== 'five') return;
    if (e5BorderRefinementsVersion >= borderRefineVersion) return;
    setE5State((prev) => applyE5OverridesStatic(borderRefine(prev), variantModule));
    setE5BorderRefinementsVersion(borderRefineVersion);
  }, [activeExperiment, e5BorderRefinementsVersion, borderRefineVersion, borderRefine, variantModule]);

  const loadSave = useCallback(
    (id: number, branchSlug?: RenderVariantSlug) => {
      const snapshotForLookup = loadExperimentSetOneSaves().find((save) => save.id === id);
      const lookupId = snapshotForLookup ? catalogSaveId(snapshotForLookup) : id;
      const branchDef = branchSlug
        ? RENDER_VARIANTS.find((variant) => variant.slug === branchSlug)
        : snapshotForLookup?.branchVariant
          ? RENDER_VARIANTS.find((variant) => variant.slug === snapshotForLookup.branchVariant)
          : renderVariantForSaveId(lookupId);
      const loadedModule = setVariant(branchDef?.slug ?? null);

      setSelectedSaveIdByExperiment((prev) => ({ ...prev, [activeExperiment]: id }));
      const snapshot = snapshotForLookup;
      if (!snapshot) return;
      const normalize = loadedModule?.normalizeE4MaterialSettings ?? normalizeE4MaterialSettings;
      if (snapshot.cornersOnly) {
        if (activeExperiment === 'five') setE5State((prev) => applyReferenceCornerLighting(prev));
        else if (activeExperiment === 'six') setE6State((prev) => applyReferenceCornerLighting(prev));
        else if (activeExperiment === 'seven') setE7State((prev) => applyReferenceCornerLighting(prev));
        else if (activeExperiment === 'eight') setE8State((prev) => applyReferenceCornerLighting(prev));
        else if (activeExperiment === 'nine') {
          setE9State((prev) => applyExperimentNinePanelGeometry(applyReferenceCornerLighting(prev)));
        }
        else if (activeExperiment === 'ten') {
          setE10State((prev) => applyExperimentTenPanelGeometry(applyReferenceCornerLighting(prev)));
        }
        else setE4State((prev) => applyReferenceCornerLighting(prev));
        return;
      }
      if (snapshot.scope === 'general') {
        if (snapshot.e4) {
          const material = normalize(snapshot.e4);
          setLayerCVisible(false);
          if (activeExperiment === 'seven') {
            const e7Material =
              snapshot.generalPreset === 'e7-glitch-shell'
                ? applyExperimentSevenPanelGeometry(material)
                : material;
            setE7State(e7Material);
            setE5State(e7Material);
            if (snapshot.generalPreset === 'e7-glitch-shell') {
              setLayerAVisible(true);
              setLayerBVisible(true);
              if (snapshot.panelPosition) {
                try {
                  saveDragPosition(EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4, snapshot.panelPosition);
                } catch {
                  // ignore blocked storage
                }
                setLayoutResetVersion((v) => v + 1);
              }
            }
          } else if (activeExperiment === 'six') {
            setE6State(applyE6OverridesStatic(material, loadedModule));
            setE5State(applyE6OverridesStatic(material, loadedModule));
          } else if (activeExperiment === 'five') {
            setE5State(finalizeE5Material(applyShowcasePanelGeometry(material), loadedModule));
          } else if (activeExperiment === 'eight') {
            const e8Material = applyExperimentEightPanelGeometry(material);
            setE8State(e8Material);
            setE5State(e8Material);
          } else if (activeExperiment === 'nine') {
            setE9State(applyExperimentNinePanelGeometry(material));
          } else if (activeExperiment === 'ten') {
            setE10State(applyExperimentTenPanelGeometry(material));
          } else {
            setE4State(applyShowcasePanelGeometry(material));
          }
        }
        return;
      }
      if (snapshot.scope === 'one') {
        setE1State(snapshot.e1);
        return;
      }
      if (snapshot.scope === 'two') {
        setE2State(snapshot.e2);
        return;
      }
      if (snapshot.scope === 'three') {
        setE3State(snapshot.e3);
        return;
      }
      if (snapshot.scope === 'four') {
        if (snapshot.e4) {
          const normalized = applyShowcasePanelGeometry(normalize(snapshot.e4));
          if (activeExperiment === 'five') {
            setE5State(finalizeE5Material(normalized, loadedModule));
          } else if (activeExperiment === 'six') {
            setE6State(applyE6OverridesStatic(normalized, loadedModule));
          } else if (activeExperiment === 'seven') {
            setE7State((currentE7) => finalizeE7Material(normalized, currentE7, loadedModule));
          } else if (activeExperiment === 'eight') {
            setE8State(applyExperimentEightPanelGeometry(normalized));
          } else if (activeExperiment === 'nine') {
            setE9State(applyExperimentNinePanelGeometry(normalized));
          } else {
            setE4State(normalized);
          }
        }
        return;
      }
      if (snapshot.scope === 'five') {
        if (snapshot.e4) {
          setE5State(finalizeE5Material(applyShowcasePanelGeometry(normalize(snapshot.e4)), loadedModule));
        }
        return;
      }
      if (snapshot.scope === 'six') {
        if (snapshot.e4) {
          const material = applyE6OverridesStatic(normalize(snapshot.e4), loadedModule);
          setE6State(material);
          setE5State(material);
        }
        return;
      }
      if (snapshot.scope === 'eight') {
        if (snapshot.e4) {
          const material = applyExperimentEightPanelGeometry(normalize(snapshot.e4));
          setE8State(material);
          setE5State(material);
        }
        return;
      }
      if (snapshot.scope === 'nine') {
        if (snapshot.e4) {
          setE9State(applyExperimentNinePanelGeometry(normalize(snapshot.e4)));
        }
        return;
      }
      if (snapshot.scope === 'ten') {
        if (snapshot.e4) {
          setE10State(normalizeExperimentTenPanelGeometry(normalize(snapshot.e4)));
        }
        return;
      }
      if (snapshot.scope === 'seven') {
        if (snapshot.e4) {
          setLayerCVisible(false);
          setE7State((currentE7) => {
            const material = finalizeE7Material(normalize(snapshot.e4!), currentE7, loadedModule);
            setE5State(material);
            return material;
          });
        }
        return;
      }
      setE1State(snapshot.e1);
      setE2State(snapshot.e2);
      setE3State(snapshot.e3);
      if (snapshot.e4) {
        const normalized = applyShowcasePanelGeometry(normalize(snapshot.e4));
        setE4State(normalized);
        if (activeExperiment === 'five') {
          setE5State(finalizeE5Material(normalized, loadedModule));
        } else if (activeExperiment === 'six') {
          setE6State(applyE6OverridesStatic(normalized, loadedModule));
        } else if (activeExperiment === 'seven') {
          setE7State((currentE7) => finalizeE7Material(normalized, currentE7, loadedModule));
        } else if (activeExperiment === 'eight') {
            const material = applyExperimentEightPanelGeometry(normalized);
          setE8State(material);
        } else if (activeExperiment === 'nine') {
          setE9State(applyExperimentNinePanelGeometry(normalized));
        } else if (activeExperiment === 'ten') {
          setE10State(applyExperimentTenPanelGeometry(normalized));
        }
      }
    },
    [activeExperiment, setVariant, finalizeE5Material, setLayerAVisible, setLayerBVisible, setLayerCVisible, setLayoutResetVersion],
  );

  const resetLayoutPositions = useCallback(() => {
    clearAllExperimentSetOnePositions();
    setSelectedSavePositions({});
    try {
      saveDragPosition(EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4, SHOWCASE_PANEL_SNAP);
    } catch {
      // ignore blocked storage
    }
    setLayoutResetVersion((v) => v + 1);
  }, []);

  const clearSelection = useCallback(() => {
    clearInspectFlash();
    selectedElRef.current = null;
    setSelection(null);
  }, []);

  const clearMultiSelection = useCallback(() => {
    setSelectedExperimentIds([activeExperiment]);
    setSelectedSaveKeysByExperiment({});
    setSelectedSaveVisualOrder([]);
  }, [activeExperiment]);

  const queueSaveLoad = useCallback(
    (key: string, run: () => void) => {
      if (pendingSaveClickRef.current?.key === key) {
        clearTimeout(pendingSaveClickRef.current.timer);
      } else if (pendingSaveClickRef.current) {
        clearTimeout(pendingSaveClickRef.current.timer);
      }
      const timer = setTimeout(() => {
        pendingSaveClickRef.current = null;
        run();
      }, 220);
      pendingSaveClickRef.current = { key, timer };
    },
    [],
  );

  const cancelQueuedSaveLoad = useCallback((key: string) => {
    if (pendingSaveClickRef.current?.key !== key) return;
    clearTimeout(pendingSaveClickRef.current.timer);
    pendingSaveClickRef.current = null;
  }, []);

  const bringSaveForward = useCallback((experiment: ExperimentId, key: string) => {
    const instanceKey = selectedSaveInstanceKey(experiment, key);
    setSelectedSaveVisualOrder((prev) =>
      moveSelectedSaveToOrderEdge(
        normalizeSelectedSaveVisualOrder(prev, selectedSaveKeysByExperiment),
        instanceKey,
        'front',
      ),
    );
  }, [selectedSaveKeysByExperiment]);

  const sendSaveBackward = useCallback((experiment: ExperimentId, key: string) => {
    const instanceKey = selectedSaveInstanceKey(experiment, key);
    setSelectedSaveVisualOrder((prev) =>
      moveSelectedSaveToOrderEdge(
        normalizeSelectedSaveVisualOrder(prev, selectedSaveKeysByExperiment),
        instanceKey,
        'back',
      ),
    );
  }, [selectedSaveKeysByExperiment]);

  const setSelectedSavePosition = useCallback((instanceKey: string, position: { x: number; y: number }) => {
    setSelectedSavePositions((prev) => ({
      ...prev,
      [instanceKey]: position,
    }));
  }, []);

  const toggleExperimentMultiSelection = useCallback((id: ExperimentId, additive: boolean) => {
    setSelectedExperimentIds((prev) => {
      if (!additive) return [id];
      const next = toggleId(prev, id);
      return next.length > 0 ? next : [activeExperiment];
    });
    if (!additive) {
      setActiveExperiment(id);
      clearSelection();
      return;
    }
    if (id !== activeExperiment) return;
  }, [activeExperiment, clearSelection]);

  const toggleSaveMultiSelection = useCallback(
    (experiment: ExperimentId, key: string, additive: boolean) => {
      if (!additive) {
        setSelectedSaveKeysByExperiment((prev) => ({ ...prev, [experiment]: [key] }));
        return;
      }
      setSelectedSaveKeysByExperiment((prev) => {
        const next = prev[experiment] ?? [];
        const toggled = toggleId(next, key);
        const updated = { ...prev };
        if (toggled.length > 0) updated[experiment] = toggled;
        else delete updated[experiment];
        return updated;
      });
    },
    [],
  );

  const toggleExperimentVisible = useCallback((id: ExperimentId) => {
    setExperimentVisible((prev) => ({ ...prev, [id]: !prev[id] }));
    setSelection((prev) => (prev?.experiment === id ? null : prev));
    setActiveExperiment(id);
    clearInspectFlash();
    selectedElRef.current = null;
  }, []);

  useLayoutEffect(() => {
    saveExperimentSetOneSession({
      e1,
      e2,
      e3,
      e4,
      e5,
      e6,
      e7,
      e8,
      e9,
      e10,
      e6LayerC,
      hidePanelText,
      layerAVisible,
      layerBVisible,
      layerCVisible,
      inspectMode,
      experimentVisible,
      referenceWallpaper,
      activeExperiment,
      selectedSaveIdByExperiment,
      selectedExperimentIds,
      selectedSaveKeysByExperiment,
      saveVisualOrder,
      selectedSaveVisualOrder,
      selectedSavePositions,
      cornerPresetVersion: REFERENCE_CORNER_PRESET_VERSION,
      e5BorderRefinementsVersion,
      activeRenderVariant,
    });
  }, [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e6LayerC, hidePanelText, layerAVisible, layerBVisible, layerCVisible, inspectMode, experimentVisible, referenceWallpaper, activeExperiment, selectedSaveIdByExperiment, selectedExperimentIds, selectedSaveKeysByExperiment, saveVisualOrder, selectedSaveVisualOrder, selectedSavePositions, e5BorderRefinementsVersion, activeRenderVariant]);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !inspectMode) return;

    const onClick = (event: MouseEvent) => {
      if (consumeClickAfterHoldDrag()) return;
      if ((event.target as HTMLElement).closest('.experiment-one-settings-dock')) return;

      const e6El = (event.target as HTMLElement).closest('[data-e6-inspect]') as HTMLElement | null;
      const e4El = (event.target as HTMLElement).closest('[data-e4-inspect]') as HTMLElement | null;
      const e3El = (event.target as HTMLElement).closest('[data-e3-inspect]') as HTMLElement | null;
      const e2El = (event.target as HTMLElement).closest('[data-e2-inspect]') as HTMLElement | null;
      const e1El = (event.target as HTMLElement).closest('[data-e1-inspect]') as HTMLElement | null;
      const el = e6El ?? e4El ?? e3El ?? e2El ?? e1El;

      if (!el) {
        clearSelection();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      selectedElRef.current = el;

      const e6Target = el.dataset.e6Inspect;
      if (e6Target && isE6LayerCInspectTarget(e6Target)) {
        flashInspectElement(el, 'four');
        setActiveExperiment('six');
        setSelection({
          experiment: 'six',
          target: e6Target,
          label: el.dataset.e6InspectLabel ?? E6_LAYER_C_INSPECT_CATALOG[e6Target].label,
        });
        return;
      }

      const e4Target = el.dataset.e4Inspect;
      if (e4Target && isE4InspectTarget(e4Target)) {
        flashInspectElement(el, 'four');
        const dockExperiment = e4DockExperiment(activeExperiment);
        setActiveExperiment(dockExperiment);
        setSelection({
          experiment: dockExperiment,
          target: e4Target,
          label: el.dataset.e4InspectLabel ?? E4_INSPECT_CATALOG[e4Target].label,
        } as ExperimentSelection);
        return;
      }

      const e3Target = el.dataset.e3Inspect;
      if (e3Target && isE3InspectTarget(e3Target)) {
        flashInspectElement(el, 'three');
        setActiveExperiment('three');
        setSelection({
          experiment: 'three',
          target: e3Target,
          label: el.dataset.e3InspectLabel ?? E3_INSPECT_CATALOG[e3Target].label,
        });
        return;
      }

      const e2Target = el.dataset.e2Inspect;
      if (e2Target && isE2InspectTarget(e2Target)) {
        flashInspectElement(el, 'two');
        setActiveExperiment('two');
        setSelection({
          experiment: 'two',
          target: e2Target,
          label: el.dataset.e2InspectLabel ?? E2_INSPECT_CATALOG[e2Target].label,
        });
        return;
      }

      const e1Target = el.dataset.e1Inspect;
      if (e1Target && isE1InspectTarget(e1Target)) {
        flashInspectElement(el, 'one');
        setActiveExperiment('one');
        setSelection({
          experiment: 'one',
          target: e1Target,
          label: el.dataset.e1InspectLabel ?? E1_INSPECT_CATALOG[e1Target].label,
        });
      }
    };

    page.addEventListener('click', onClick, true);
    return () => page.removeEventListener('click', onClick, true);
  }, [inspectMode, clearSelection, activeExperiment]);

  const value = useMemo(
    () => ({
      e1,
      e2,
      e3,
      e4,
      e5,
      e6,
      e7,
      e8,
      e9,
      e10,
      e6LayerC,
      setE1,
      setE2,
      setE3,
      setE4,
      setE5,
      setE6,
      setE7,
      setE8,
      setE9,
      setE10,
      setE6LayerC,
      resetAll,
      saves,
      saveCurrent,
      loadSave,
      layoutResetVersion,
      resetLayoutPositions,
      inspectMode,
      setInspectMode,
      hidePanelText,
      setHidePanelText,
      layerAVisible,
      layerBVisible,
      layerCVisible,
      toggleLayerAVisible,
      toggleLayerBVisible,
      toggleLayerCVisible,
      experimentVisible,
      toggleExperimentVisible,
      activeExperiment,
      setActiveExperiment,
      selectedSaveIdByExperiment,
      selectedExperimentIds,
      selectedSaveKeysByExperiment,
      saveVisualOrder,
      selectedSaveVisualOrder,
      selectedSavePositions,
      selection,
      clearSelection,
      clearMultiSelection,
      queueSaveLoad,
      cancelQueuedSaveLoad,
      bringSaveForward,
      sendSaveBackward,
      setSelectedSavePosition,
      toggleExperimentMultiSelection,
      toggleSaveMultiSelection,
      referenceWallpaper,
      toggleReferenceWallpaper,
    }),
    [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e6LayerC, setE1, setE2, setE3, setE4, setE5, setE6, setE7, setE8, setE9, setE10, setE6LayerC, resetAll, saves, saveCurrent, loadSave, layoutResetVersion, resetLayoutPositions, inspectMode, hidePanelText, layerAVisible, layerBVisible, layerCVisible, experimentVisible, toggleExperimentVisible, activeExperiment, selectedSaveIdByExperiment, selectedExperimentIds, selectedSaveKeysByExperiment, saveVisualOrder, selectedSaveVisualOrder, selectedSavePositions, selection, clearSelection, clearMultiSelection, queueSaveLoad, cancelQueuedSaveLoad, bringSaveForward, sendSaveBackward, setSelectedSavePosition, toggleExperimentMultiSelection, toggleSaveMultiSelection, referenceWallpaper, toggleReferenceWallpaper],
  );

  return (
    <ExperimentSetOneContext.Provider value={value}>
      <div
        ref={pageRef}
        className="experiment-set-one-page experiment-one-page"
        style={style}
        data-e1-show-sparkles={e1.showSparkles}
        data-e3-layerB-show-sparkles={e3.layerBShowSparkles}
        data-e4-layerB-show-sparkles={activeE4Materials.layerBShowSparkles}
        data-e4-layerB-nested={activeE4Materials.layerBNestedInA}
        data-e4-layerA-radial-layout={e4RadialLayoutAttr(activeE4Materials.layerARadialCornerMode)}
        data-e4-layerB-radial-layout={e4RadialLayoutAttr(activeE4Materials.layerBRadialCornerMode)}
        data-e1-visible={experimentVisible.one}
        data-e2-visible={experimentVisible.two}
        data-e3-visible={experimentVisible.three}
        data-e4-visible={experimentVisible.four}
        data-e5-visible={experimentVisible.five}
        data-e6-visible={experimentVisible.six}
        data-e7-visible={experimentVisible.seven}
        data-e8-visible={experimentVisible.eight}
        data-e9-visible={experimentVisible.nine}
        data-e10-visible={experimentVisible.ten}
        data-e1-inspect-mode={inspectMode}
        data-e2-inspect-mode={inspectMode}
        data-e3-inspect-mode={inspectMode}
        data-e4-inspect-mode={inspectMode}
        data-e5-inspect-mode={inspectMode}
        data-e6-inspect-mode={inspectMode}
        data-e8-inspect-mode={inspectMode}
        data-e9-inspect-mode={inspectMode}
        data-e10-inspect-mode={inspectMode}
        data-showcase-align={
          activeExperiment === 'four' ||
          activeExperiment === 'five' ||
          activeExperiment === 'six' ||
          activeExperiment === 'seven' ||
          activeExperiment === 'eight' ||
          activeExperiment === 'nine' ||
          activeExperiment === 'ten'
        }
        data-hide-panel-text={hidePanelText ? 'true' : 'false'}
        data-layer-a-visible={layerAVisible ? 'true' : 'false'}
        data-layer-b-visible={layerBVisible ? 'true' : 'false'}
        data-layer-c-visible={layerCVisible ? 'true' : 'false'}
        data-render-variant={activeRenderVariant ?? ''}
        data-selected-save-four={selectedSaveIdByExperiment.four ?? ''}
        data-selected-save-five={selectedSaveIdByExperiment.five ?? ''}
        data-selected-save-eight={selectedSaveIdByExperiment.eight ?? ''}
        data-selected-save-nine={selectedSaveIdByExperiment.nine ?? ''}
        data-selected-save-ten={selectedSaveIdByExperiment.ten ?? ''}
      >
        {children}
      </div>
    </ExperimentSetOneContext.Provider>
  );
}

function e1Highlighted(selection: ExperimentSelection | null) {
  if (!selection || selection.experiment !== 'one') return null;
  return new Set(E1_INSPECT_CATALOG[selection.target].fields);
}

function e2Highlighted(selection: ExperimentSelection | null) {
  if (!selection || selection.experiment !== 'two') return null;
  return new Set(E2_INSPECT_CATALOG[selection.target].fields);
}

function e3Highlighted(selection: ExperimentSelection | null) {
  if (!selection || selection.experiment !== 'three') return null;
  return new Set(E3_INSPECT_CATALOG[selection.target].fields);
}

function e4Highlighted(selection: ExperimentSelection | null) {
  if (
    !selection ||
    (selection.experiment !== 'four' &&
      selection.experiment !== 'five' &&
      selection.experiment !== 'six' &&
      selection.experiment !== 'seven' &&
      selection.experiment !== 'nine' &&
      selection.experiment !== 'ten')
  ) {
    return null;
  }
  if (selection.experiment === 'six' && isE6LayerCInspectTarget(selection.target)) return null;
  return new Set(E4_INSPECT_CATALOG[selection.target as E4InspectTarget].fields);
}

function e6Highlighted(selection: ExperimentSelection | null) {
  if (!selection || selection.experiment !== 'six') return e4Highlighted(selection);
  if (isE6LayerCInspectTarget(selection.target)) {
    const fields = new Set(E4_INSPECT_CATALOG['layer-b'].fields);
    fields.delete('layerBWidth');
    fields.delete('layerBHeight');
    fields.delete('layerBCornerRadius');
    for (const field of E6_LAYER_C_LAYOUT_FIELDS) fields.add(field.id);
    return fields;
  }
  return e4Highlighted(selection);
}

function selectionNote(selection: ExperimentSelection | null) {
  if (!selection) return undefined;
  if (selection.experiment === 'one') return E1_INSPECT_CATALOG[selection.target].note;
  if (selection.experiment === 'two') return E2_INSPECT_CATALOG[selection.target].note;
  if (selection.experiment === 'three') return E3_INSPECT_CATALOG[selection.target].note;
  if (selection.experiment === 'six' && isE6LayerCInspectTarget(selection.target)) return undefined;
  return E4_INSPECT_CATALOG[selection.target as E4InspectTarget].note;
}

function experimentTitle(experiment: ExperimentSelection['experiment'] | ExperimentId) {
  if (experiment === 'one') return 'Experiment One';
  if (experiment === 'two') return 'Experiment Two';
  if (experiment === 'three') return 'Experiment Three';
  if (experiment === 'four') return 'Experiment Four';
  if (experiment === 'five') return 'Experiment Five';
  if (experiment === 'six') return 'Experiment Six';
  if (experiment === 'seven') return 'Experiment Seven';
  if (experiment === 'eight') return 'Experiment Eight';
  if (experiment === 'ten') return 'Experiment Ten';
  return 'Experiment Nine';
}

function selectionPersistKey(selection: ExperimentSelection) {
  if (selection.experiment === 'one') return EXPERIMENT_SET_ONE_POSITION_KEYS.panelOne;
  if (selection.experiment === 'two') {
    return selection.target === 'trans-sheet'
      ? EXPERIMENT_SET_ONE_POSITION_KEYS.transSheet
      : EXPERIMENT_SET_ONE_POSITION_KEYS.frostSheet;
  }
  if (selection.experiment === 'three') {
    return selection.target === 'layer-a' || selection.target === 'layer-a-rim'
      ? EXPERIMENT_SET_ONE_POSITION_KEYS.layerA
      : EXPERIMENT_SET_ONE_POSITION_KEYS.layerB;
  }
  if (selection.experiment === 'four' || selection.experiment === 'five' || selection.experiment === 'six' || selection.experiment === 'seven' || selection.experiment === 'eight' || selection.experiment === 'nine' || selection.experiment === 'ten') {
    if (selection.experiment === 'six' && isE6LayerCInspectTarget(selection.target)) {
      return EXPERIMENT_SET_ONE_POSITION_KEYS.layerC6;
    }
    if (selection.experiment === 'eight' && isE6LayerCInspectTarget(selection.target)) {
      return EXPERIMENT_SET_ONE_POSITION_KEYS.layerC6;
    }
    if (selection.experiment === 'eight') {
      return EXPERIMENT_SET_ONE_POSITION_KEYS.layerA8;
    }
    if (selection.experiment === 'ten') {
      return selection.target.startsWith('layer-a')
        ? EXPERIMENT_SET_ONE_POSITION_KEYS.layerA10
        : EXPERIMENT_SET_ONE_POSITION_KEYS.layerB10;
    }
    return selection.target.startsWith('layer-a')
      ? EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4
      : EXPERIMENT_SET_ONE_POSITION_KEYS.layerB4;
  }
  return EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4;
}

function fieldsForSelection<T extends { id: string; section: string }>(
  allFields: T[],
  highlight: Set<string> | null,
  selection: ExperimentSelection | null,
  layerMode: LayerEditMode = 'both',
): T[] {
  const filtered = !selection || !highlight
    ? allFields
    : allFields.filter((field) => highlight.has(field.id as string));
  return augmentFieldsWithLayerLayout(filtered, allFields, layerMode);
}

function sectionsForFields<T extends { section: string }>(
  order: readonly string[],
  fields: T[],
): string[] {
  return orderedSections(fields, order);
}

function fieldResetTargets<T extends string | number | boolean>(
  masterValue: T,
  experiment: 'one' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten',
  fieldId: string,
  saves: ExperimentSetOneSnapshot[],
) {
  const saveTargets = saves.flatMap((save) => {
    const value = getFieldFromSnapshot(save, experiment, fieldId);
    if (value === undefined) return [];
    return [{ label: save.label, value: value as T }];
  });

  return [{ label: 'Master default', value: masterValue }, ...saveTargets];
}

export function ExperimentSetOneSettingsDock() {
  const {
    e1,
    e2,
    e3,
    e4,
    e5,
    e6,
    e7,
    e8,
    e9,
    e10,
    e6LayerC,
    setE1,
    setE2,
    setE3,
    setE4,
    setE5,
    setE6,
    setE7,
    setE8,
    setE9,
    setE10,
    setE6LayerC,
    resetAll,
    saves,
    saveCurrent,
    loadSave,
    layoutResetVersion,
    resetLayoutPositions,
    inspectMode,
    setInspectMode,
    hidePanelText,
    setHidePanelText,
    layerAVisible,
    layerBVisible,
    layerCVisible,
    toggleLayerAVisible,
    toggleLayerBVisible,
    toggleLayerCVisible,
    activeExperiment,
    selectedSaveIdByExperiment,
    selectedExperimentIds,
    selectedSaveKeysByExperiment,
    saveVisualOrder,
    selectedSaveVisualOrder,
    selection,
    clearSelection,
    clearMultiSelection,
    queueSaveLoad,
    cancelQueuedSaveLoad,
    bringSaveForward,
    sendSaveBackward,
    toggleExperimentMultiSelection,
    toggleSaveMultiSelection,
    referenceWallpaper,
    toggleReferenceWallpaper,
  } = useExperimentSetOne();
  const { slug: activeRenderVariant } = useRenderVariant();
  const [open, setOpen] = useState(true);
  const [saveSelectionMode, setSaveSelectionMode] = useState(false);
  const [layerEditMode, setLayerEditMode] = useState<LayerEditMode>(
    () => loadExperimentSetOneSession()?.layerEditMode ?? 'both',
  );
  const saveScope = selection ? selection.experiment : activeExperiment;
  const scopedSaves = useMemo(() => {
    if (saveScope === 'five') {
      return sortSavesByVisualOrder(
        saves.filter((s) => s.scope === 'four' || s.scope === 'five' || s.scope === 'general' || s.cornersOnly),
        saveVisualOrder,
      );
    }
    if (saveScope === 'six' || saveScope === 'eight') {
      return sortSavesByVisualOrder(
        saves.filter((s) => s.scope === 'six' || s.scope === 'general' || s.cornersOnly),
        saveVisualOrder,
      );
    }
    if (saveScope === 'seven') {
      return sortSavesByVisualOrder(
        saves.filter((s) => s.scope === 'seven' || s.scope === 'general' || s.cornersOnly),
        saveVisualOrder,
      );
    }
    if (saveScope === 'four') {
      return sortSavesByVisualOrder(
        saves.filter((s) => s.scope === 'four' || s.scope === 'general' || s.cornersOnly),
        saveVisualOrder,
      );
    }
    if (saveScope === 'nine') {
      return sortSavesByVisualOrder(
        saves.filter((s) => s.scope === 'four' || s.scope === 'nine' || s.scope === 'general' || s.cornersOnly),
        saveVisualOrder,
      );
    }
    if (saveScope === 'ten') {
      return sortSavesByVisualOrder(
        saves.filter((s) => s.scope === 'four' || s.scope === 'nine' || s.scope === 'ten' || s.scope === 'general' || s.cornersOnly),
        saveVisualOrder,
      );
    }
    return sortSavesByVisualOrder(saves.filter((s) => s.scope === saveScope || s.cornersOnly), saveVisualOrder);
  }, [saves, saveScope, saveVisualOrder]);
  const branchSaveIds = useMemo(
    () => new Set(RENDER_VARIANTS.flatMap((variant) => variant.saveIds)),
    [],
  );
  const branchSaveGroups = useMemo(
    () =>
      saveScope === 'four' || saveScope === 'five' || saveScope === 'six' || saveScope === 'seven' || saveScope === 'eight' || saveScope === 'nine' || saveScope === 'ten'
          ? RENDER_VARIANTS.map((variant) => ({
            variant,
            saves: scopedSaves
              .filter(
                (save) => save.scope !== 'general' && variant.saveIds.includes(catalogSaveId(save)),
              )
              .slice(),
          })).filter((group) => group.saves.length > 0)
        : [],
    [scopedSaves, saveScope],
  );
  const generalScopedSaves = useMemo(
    () => scopedSaves.filter((save) => save.scope === 'general'),
    [scopedSaves],
  );
  const otherScopedSaves = useMemo(
    () =>
      branchSaveGroups.length > 0
        ? scopedSaves.filter(
            (save) => save.scope !== 'general' && !branchSaveIds.has(catalogSaveId(save)),
          )
        : scopedSaves.filter((save) => save.scope !== 'general'),
    [scopedSaves, branchSaveGroups.length, branchSaveIds],
  );
  const dockExperiment = selection ? selection.experiment : activeExperiment;
  const selectedExperimentSet = useMemo(
    () => new Set(selectedExperimentIds),
    [selectedExperimentIds],
  );
  const selectedExperimentLabels = useMemo(
    () =>
      EXPERIMENT_ORDER.filter((id) => selectedExperimentSet.has(id)).map((id) => experimentTitle(id)),
    [selectedExperimentSet],
  );
  const selectedSaveExperimentIds = useMemo(
    () =>
      EXPERIMENT_ORDER.filter(
        (id) => (selectedSaveKeysByExperiment[id]?.length ?? 0) > 0,
      ),
    [selectedSaveKeysByExperiment],
  );
  const multiSummaryExperimentLabels = useMemo(() => {
    const ids = new Set<ExperimentId>(selectedExperimentIds);
    for (const id of selectedSaveExperimentIds) ids.add(id);
    return EXPERIMENT_ORDER.filter((id) => ids.has(id)).map((id) => experimentTitle(id));
  }, [selectedExperimentIds, selectedSaveExperimentIds]);
  const selectedSaveCount = useMemo(
    () =>
      Object.values(selectedSaveKeysByExperiment).reduce(
        (count, keys) => count + (keys?.length ?? 0),
        0,
      ),
    [selectedSaveKeysByExperiment],
  );
  const selectedExperimentCount = selectedExperimentLabels.length;
  const multiSummaryExperimentCount = multiSummaryExperimentLabels.length;
  const saveMultiSelectionActive = selectedSaveCount > 0;
  const anyMultiSelectionActive = selectedExperimentCount > 1 || saveMultiSelectionActive;
  const showMultiSelectionSummary = selectedExperimentCount > 1 || saveMultiSelectionActive;
  const selectedSaveKeysForDockExperiment = selectedSaveKeysByExperiment[dockExperiment] ?? [];
  const selectedSaveInstanceOrder = useMemo(
    () => normalizeSelectedSaveVisualOrder(selectedSaveVisualOrder, selectedSaveKeysByExperiment),
    [selectedSaveVisualOrder, selectedSaveKeysByExperiment],
  );

  const e1Highlight = useMemo(() => e1Highlighted(selection), [selection]);
  const e2Highlight = useMemo(() => e2Highlighted(selection), [selection]);
  const e3Highlight = useMemo(() => e3Highlighted(selection), [selection]);
  const e4Highlight = useMemo(() => e4Highlighted(selection), [selection]);
  const e6Highlight = useMemo(() => e6Highlighted(selection), [selection]);
  const inspectingLayerC =
    selection?.experiment === 'six' && isE6LayerCInspectTarget(selection.target);
  const e6LayerCMode = layerEditMode === 'layerC' || (inspectingLayerC && layerEditMode === 'both');
  const e6LayerEditMode: LayerEditMode = e6LayerCMode ? 'layerC' : layerEditMode;
  const dockLayerEditMode: LayerEditMode =
    layerEditMode === 'layerC' && dockExperiment !== 'six' ? 'both' : layerEditMode;
  const note = selectionNote(selection);
  const filtering = selection !== null;
  const visibleE1Fields = useMemo(
    () => fieldsForSelection(filterFieldsWhen(E1_SETTING_FIELDS, e1), e1Highlight, selection),
    [selection, e1Highlight, e1],
  );
  const visibleE2Fields = useMemo(
    () => fieldsForSelection(filterFieldsWhen(E2_SETTING_FIELDS, e2), e2Highlight, selection),
    [selection, e2Highlight, e2],
  );
  const visibleE3Fields = useMemo(
    () => fieldsForSelection(filterFieldsWhen(E3_SETTING_FIELDS, e3), e3Highlight, selection, dockLayerEditMode),
    [selection, e3Highlight, e3, dockLayerEditMode],
  );
  const contextualE4Fields = useMemo(() => e4FieldsVisibleForSettings(e4), [e4]);
  const visibleE4Fields = useMemo(
    () => fieldsForSelection(contextualE4Fields, e4Highlight, selection, dockLayerEditMode),
    [selection, e4Highlight, contextualE4Fields, dockLayerEditMode],
  );
  const contextualE5Fields = useMemo(() => e4FieldsVisibleForSettings(e5), [e5]);
  const visibleE5Fields = useMemo(
    () => fieldsForSelection(contextualE5Fields, e4Highlight, selection, dockLayerEditMode),
    [selection, e4Highlight, contextualE5Fields, dockLayerEditMode],
  );
  const e6LayerCLayoutFields = useMemo(
    () =>
      E6_LAYER_C_LAYOUT_FIELDS.map((field) => {
        if (field.id === 'diameter') {
          return { ...field, max: experimentSixLayerCMaxDiameter(e6) };
        }
        if (field.id === 'offsetX') {
          return { ...field, max: Math.max(0, (e6.layerBWidth as number) - e6LayerC.diameter) };
        }
        if (field.id === 'offsetY') {
          return { ...field, max: Math.max(0, (e6.layerBHeight as number) - e6LayerC.diameter) };
        }
        return field;
      }),
    [e6, e6LayerC.diameter],
  );
  const contextualE6Fields = useMemo(() => {
    const base = e4FieldsVisibleForSettings(e6);
    if (!e6LayerCMode) return base;
    return transformE6FieldsForLayerC(base, e6LayerCLayoutFields);
  }, [e6, e6LayerCMode, e6LayerCLayoutFields]);
  const visibleE6Fields = useMemo(() => {
    if (e6LayerCMode && !inspectingLayerC) return contextualE6Fields;
    return fieldsForSelection(contextualE6Fields, e6Highlight, selection, e6LayerEditMode);
  }, [selection, e6Highlight, contextualE6Fields, e6LayerCMode, inspectingLayerC, e6LayerEditMode]);
  const e6DockFiltering = inspectingLayerC ? filtering : e6LayerCMode ? false : filtering;
  const e6SectionOrder = useMemo(
    () => (e6LayerCMode ? e6SectionOrderForLayerC(E4_SECTION_ORDER) : E4_SECTION_ORDER),
    [e6LayerCMode],
  );
  const e6AlternateFields = useMemo(() => {
    if (!e6LayerCMode) return undefined;
    const layoutDefaults = buildE6LayerCLayoutDefaults(e6);
    return {
      values: e6LayerC as Record<string, unknown>,
      defaults: layoutDefaults as Record<string, unknown>,
      fieldIds: new Set(E6_LAYER_C_LAYOUT_FIELDS.map((field) => field.id)),
      onChange: (id: string, value: unknown) =>
        setE6LayerC(id as keyof E6LayerCLayoutSettings, value as E6LayerCLayoutSettings[keyof E6LayerCLayoutSettings]),
      resetTargets: (fieldId: string) => {
        const key = fieldId as keyof E6LayerCLayoutSettings;
        const targets = [{ label: 'Default', value: layoutDefaults[key] }];
        if (key === 'offsetX' || key === 'offsetY') {
          targets.push({
            label: 'Center in B',
            value: experimentSixLayerCLayoutCentered(e6, e6LayerC.diameter)[key],
          });
        }
        return targets;
      },
    };
  }, [e6LayerCMode, e6, e6LayerC, setE6LayerC]);
  const visibleE1Sections = useMemo(
    () => sectionsForFields(E1_SECTION_ORDER, visibleE1Fields),
    [visibleE1Fields],
  );
  const visibleE2Sections = useMemo(
    () => sectionsForFields(E2_SECTION_ORDER, visibleE2Fields),
    [visibleE2Fields],
  );
  const visibleE3SectionsForMode = useMemo(
    () => sectionsForLayerMode(visibleE3Fields, E3_SECTION_ORDER, dockLayerEditMode),
    [visibleE3Fields, dockLayerEditMode],
  );
  const visibleE4SectionsForMode = useMemo(
    () => sectionsForLayerMode(visibleE4Fields, E4_SECTION_ORDER, dockLayerEditMode),
    [visibleE4Fields, dockLayerEditMode],
  );
  const visibleE5SectionsForMode = useMemo(
    () => sectionsForLayerMode(visibleE5Fields, E4_SECTION_ORDER, dockLayerEditMode),
    [visibleE5Fields, dockLayerEditMode],
  );
  const contextualE7Fields = useMemo(() => e4FieldsVisibleForSettings(e7), [e7]);
  const visibleE7Fields = useMemo(
    () => fieldsForSelection(contextualE7Fields, e4Highlight, selection, dockLayerEditMode),
    [selection, e4Highlight, contextualE7Fields, dockLayerEditMode],
  );
  const visibleE7SectionsForMode = useMemo(
    () => sectionsForLayerMode(visibleE7Fields, E4_SECTION_ORDER, dockLayerEditMode),
    [visibleE7Fields, dockLayerEditMode],
  );
  const visibleE6SectionsForMode = useMemo(
    () => sectionsForLayerMode(visibleE6Fields, e6SectionOrder, e6LayerEditMode),
    [visibleE6Fields, e6SectionOrder, e6LayerEditMode],
  );
  const totalCount =
    E1_SETTING_FIELDS.length + E2_SETTING_FIELDS.length + E3_SETTING_FIELDS.length + E4_SETTING_FIELDS.length;
  const relatedCount =
    selection?.experiment === 'one'
      ? visibleE1Fields.length
      : selection?.experiment === 'two'
        ? visibleE2Fields.length
        : selection?.experiment === 'three'
          ? visibleE3Fields.length
          : selection?.experiment === 'four'
            ? visibleE4Fields.length
            : selection?.experiment === 'five'
              ? visibleE5Fields.length
              : selection?.experiment === 'six'
                ? visibleE6Fields.length
                  : selection?.experiment === 'seven'
                    ? visibleE7Fields.length
                    : selection?.experiment === 'nine' || selection?.experiment === 'ten'
                    ? visibleE4Fields.length
                    : 0;
  const dockTitle = selection ? experimentTitle(selection.experiment) : 'Experiment Set 1';
  const dockCountLabel = selection ? `${relatedCount} settings` : `${totalCount} total`;

  const foldableSectionIds = useMemo(
    () => [
      ...visibleE1Sections.map((s) => `e1-${s}`),
      ...visibleE2Sections.map((s) => `e2-${s}`),
      ...visibleE3SectionsForMode.map((s) => foldableSectionId('e3', s)),
      ...visibleE4SectionsForMode.map((s) => foldableSectionId('e4', s)),
      ...visibleE5SectionsForMode.map((s) => foldableSectionId('e5', s)),
      ...visibleE6SectionsForMode.map((s) => foldableSectionId('e6', s)),
      ...visibleE7SectionsForMode.map((s) => foldableSectionId('e7', s)),
    ],
    [visibleE1Sections, visibleE2Sections, visibleE3SectionsForMode, visibleE4SectionsForMode, visibleE5SectionsForMode, visibleE6SectionsForMode, visibleE7SectionsForMode],
  );
  const { isOpen, toggle, openAll, collapseAll } = useFoldableSections(foldableSectionIds, false);
  const settingsScrollRef = useRef<HTMLDivElement>(null);
  const pendingScrollAnchorRef = useRef<SettingsScrollAnchor | null>(null);

  const handleLayerEditModeChange = useCallback((mode: LayerEditMode) => {
    const container = settingsScrollRef.current;
    if (container) {
      pendingScrollAnchorRef.current = captureSettingsScrollAnchor(container);
    }
    if (mode === 'layerC') clearSelection();
    setLayerEditMode(mode);
  }, [clearSelection]);

  useLayoutEffect(() => {
    const container = settingsScrollRef.current;
    const anchor = pendingScrollAnchorRef.current;
    if (!container || !anchor) return;
    pendingScrollAnchorRef.current = null;
    restoreSettingsScrollAnchor(container, anchor);
  }, [layerEditMode, visibleE3SectionsForMode, visibleE4SectionsForMode, visibleE5SectionsForMode, visibleE6SectionsForMode, visibleE7SectionsForMode]);

  useEffect(() => {
    const session = loadExperimentSetOneSession();
    if (!session) return;
    saveExperimentSetOneSession({ ...session, layerEditMode });
  }, [layerEditMode]);

  const showLayerEditToggle =
    dockExperiment === 'three' ||
    dockExperiment === 'four' ||
    dockExperiment === 'five' ||
    dockExperiment === 'six' ||
    dockExperiment === 'seven' ||
    dockExperiment === 'eight' ||
    dockExperiment === 'nine' ||
    dockExperiment === 'ten';

  return (
    <ExperimentOneDraggableShell
      className="experiment-one-settings-dock"
      dragHandleSelector=".experiment-one-settings-dock__header"
      dragExcludeSelector="button, input, textarea, select, .experiment-one-settings-dock__body, .experiment-one-settings-dock__settings-scroll, .experiment-one-settings-dock__saves-list, .experiment-one-settings-dock__layer-rail, .mat-setting-control, .experiment-one-settings-dock__experiment-tabs, .experiment-one-settings-dock__toolbar"
      initialPosition={{ x: 20, y: 96 }}
      bounds="viewport"
      persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.settingsDock}
      layoutResetVersion={layoutResetVersion}
      ariaLabel="Material settings"
    >
      <div className={`experiment-one-settings-dock__shell${open ? '' : ' experiment-one-settings-dock__shell--collapsed'}`}>
        {/* ── Zone 1: Drag handle + collapse ── */}
        <header className="experiment-one-settings-dock__header">
          <div className="experiment-one-settings-dock__drag-handle" title="Drag settings panel">
            <span className="experiment-one-settings-dock__grip" aria-hidden="true" />
            <span className="experiment-one-settings-dock__title">
              {dockTitle}
              <span className="experiment-one-settings-dock__title-meta">{dockCountLabel}</span>
            </span>
          </div>
          <div className="experiment-one-settings-dock__header-actions">
            <button type="button" className="experiment-one-settings-dock__toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
              {open ? 'Hide' : 'Show'}
            </button>
          </div>
        </header>

        {open && (
          <>
            {/* ── Zone 2: Experiment tabs ── */}
            <nav className="experiment-one-settings-dock__experiment-tabs" aria-label="Experiment selector">
              {(
                [
                  ['one', 'E1'],
                  ['two', 'E2'],
                  ['three', 'E3'],
                  ['four', 'E4'],
                  ['five', 'E5'],
                  ['six', 'E6'],
                  ['seven', 'E7'],
                  ['eight', 'E8'],
                  ['nine', 'E9'],
                  ['ten', 'E10'],
                ] as const
              ).map(([id, label]) => {
                const hasSelectedSaves = (selectedSaveKeysByExperiment[id]?.length ?? 0) > 0;
                const multiSelected = (selectedExperimentSet.has(id) && selectedExperimentCount > 1) || hasSelectedSaves;
                const activeInMultiView = multiSelected;
                const showActive = dockExperiment === id && (!anyMultiSelectionActive || activeInMultiView);
                return (
                  <button
                    key={id}
                    type="button"
                    className={`experiment-one-settings-dock__experiment-tab${showActive ? ' experiment-one-settings-dock__experiment-tab--active' : ''}${multiSelected ? ' experiment-one-settings-dock__experiment-tab--multi-selected' : ''}`}
                    onClick={(event) => {
                      const additive = event.metaKey || event.ctrlKey || event.shiftKey;
                      toggleExperimentMultiSelection(id, additive);
                    }}
                    aria-pressed={multiSelected}
                    title={`${label} settings · ⌘/Ctrl+click to multi-select`}
                  >
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* ── Zone 3: Toolbar ── */}
            <div className="experiment-one-settings-dock__toolbar" role="toolbar" aria-label="View controls">
              <div className="experiment-one-settings-dock__toolbar-group">
                <button
                  type="button"
                  className={`experiment-one-settings-dock__toolbar-btn${inspectMode ? ' experiment-one-settings-dock__toolbar-btn--active' : ''}`}
                  onClick={() => setInspectMode(!inspectMode)}
                  aria-pressed={inspectMode}
                  title="Click panels to inspect their settings"
                >
                  Inspect
                </button>
                {selection && (
                  <button type="button" className="experiment-one-settings-dock__toolbar-btn" onClick={clearSelection}>
                    Clear
                  </button>
                )}
              </div>
              <div className="experiment-one-settings-dock__toolbar-group">
                <button
                  type="button"
                  className={`experiment-one-settings-dock__toolbar-btn${hidePanelText ? ' experiment-one-settings-dock__toolbar-btn--active' : ''}`}
                  onClick={() => setHidePanelText(!hidePanelText)}
                  aria-pressed={hidePanelText}
                  title="Hide text content on panels"
                >
                  Text
                </button>
                <button
                  type="button"
                  className={`experiment-one-settings-dock__toolbar-btn${referenceWallpaper ? ' experiment-one-settings-dock__toolbar-btn--active' : ''}`}
                  onClick={toggleReferenceWallpaper}
                  aria-pressed={referenceWallpaper}
                  title="Overlay reference.png on aero-bg at matched scale"
                >
                  Ref bg
                </button>
              </div>
              <div className="experiment-one-settings-dock__toolbar-group">
                <button type="button" className="experiment-one-settings-dock__toolbar-btn" onClick={collapseAll} title="Collapse all sections">
                  ▸ All
                </button>
                <button type="button" className="experiment-one-settings-dock__toolbar-btn" onClick={openAll} title="Expand all sections">
                  ▾ All
                </button>
              </div>
              <div className="experiment-one-settings-dock__toolbar-group">
                <button type="button" className="experiment-one-settings-dock__toolbar-btn" onClick={resetLayoutPositions} title="Reset panel and settings dock positions to defaults">
                  ↻ Layout
                </button>
                <button type="button" className="experiment-one-settings-dock__toolbar-btn" onClick={resetAll} title="Reset all experiments to master default">
                  ↻ Reset
                </button>
              </div>
            </div>

            <div className="experiment-one-settings-dock__body">
              {/* ── Zone 4: Saves ── */}
              <div className="experiment-one-settings-dock__saves">
                <div className="experiment-one-settings-dock__saves-head">
                  <span className="experiment-one-settings-dock__saves-title">Saves</span>
                  <div className="experiment-one-settings-dock__saves-actions">
                    <button
                      type="button"
                      className={`experiment-one-settings-dock__save-selection-toggle${saveSelectionMode ? ' experiment-one-settings-dock__save-selection-toggle--active' : ''}`}
                      onClick={() => setSaveSelectionMode((value) => !value)}
                      aria-pressed={saveSelectionMode}
                      title="When enabled, clicking saves adds/removes them from multi-select"
                    >
                      <span className="experiment-one-settings-dock__save-selection-check" aria-hidden="true" />
                      {saveSelectionMode ? 'Selecting' : 'Select'}
                    </button>
                    <button type="button" className="experiment-one-settings-dock__toggle" onClick={saveCurrent}>
                      Save +
                    </button>
                  </div>
                </div>

                {/* Multi-select inline badge */}
                {(showMultiSelectionSummary || saveSelectionMode) && (
                  <div className="experiment-one-settings-dock__saves-inline-badge">
                    <span className="experiment-one-settings-dock__saves-inline-badge-text">
                      {selectedSaveCount > 0
                        ? `${multiSummaryExperimentCount} exp · ${selectedSaveCount} saves`
                        : saveSelectionMode
                          ? 'Click saves to select'
                          : `${multiSummaryExperimentCount} experiments`}
                    </span>
                    <button
                      type="button"
                      className="experiment-one-settings-dock__toolbar-btn"
                      onClick={clearMultiSelection}
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Save chip list */}
                <div className="experiment-one-settings-dock__saves-list" role="group" aria-label="Experiment saves">
                  {branchSaveGroups.map(({ variant, saves: branchSaves }) => (
                    <div key={variant.slug} className="experiment-one-settings-dock__branch-group">
                      <span className="experiment-one-settings-dock__branch-label">{variant.label}</span>
                      <div className="experiment-one-settings-dock__branch-saves">
                        {branchSaves.map((save) => {
                          const selectionKey = saveSelectionKey(save.id, variant.slug);
                          const multiSelected = selectedSaveKeysForDockExperiment.includes(selectionKey);
                          const current = isCurrentSaveActive(
                            selectedSaveIdByExperiment[dockExperiment],
                            activeRenderVariant,
                            save.id,
                            variant.slug,
                          );
                          const showCurrent = current && (!saveMultiSelectionActive || multiSelected);
                          const saveKey = selectionKey;
                          const saveInstanceKey = selectedSaveInstanceKey(dockExperiment, selectionKey);
                          const selectedOrderIndex = selectedSaveInstanceOrder.indexOf(saveInstanceKey);
                          const canReorderSave = multiSelected && selectedSaveInstanceOrder.length > 1 && selectedOrderIndex !== -1;
                          const isFrontMost = selectedOrderIndex === 0;
                          const isBackMost = selectedOrderIndex === selectedSaveInstanceOrder.length - 1;
                          return (
                            <button
                              key={`${variant.slug}-${save.id}`}
                              type="button"
                              className={`experiment-one-settings-dock__save-chip${showCurrent ? ' experiment-one-settings-dock__save-chip--current' : ''}${multiSelected ? ' experiment-one-settings-dock__save-chip--selected' : ''}`}
                              aria-pressed={multiSelected}
                              aria-current={showCurrent ? 'true' : undefined}
                              onClick={(event) => {
                                if (saveSelectionMode || event.metaKey || event.ctrlKey || event.shiftKey) {
                                  event.preventDefault();
                                  cancelQueuedSaveLoad(saveKey);
                                  toggleSaveMultiSelection(dockExperiment, selectionKey, true);
                                  return;
                                }
                                if (event.detail !== 1) return;
                                queueSaveLoad(saveKey, () => loadSave(save.id, variant.slug));
                              }}
                              onDoubleClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                cancelQueuedSaveLoad(saveKey);
                                if (!saveSelectionMode) {
                                  toggleSaveMultiSelection(dockExperiment, selectionKey, true);
                                }
                              }}
                              title={`${save.label} (${variant.label}) · click to load · ⌘+click to multi-select`}
                            >
                              {save.label}
                              {canReorderSave && (
                                <span className="experiment-one-settings-dock__save-context-actions" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    className="experiment-one-settings-dock__save-context-btn"
                                    onClick={(e) => { e.stopPropagation(); bringSaveForward(dockExperiment, selectionKey); }}
                                    disabled={isFrontMost}
                                    title="Bring forward"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    className="experiment-one-settings-dock__save-context-btn"
                                    onClick={(e) => { e.stopPropagation(); sendSaveBackward(dockExperiment, selectionKey); }}
                                    disabled={isBackMost}
                                    title="Send backward"
                                  >
                                    ▼
                                  </button>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {generalScopedSaves.length > 0 && (
                    <div className="experiment-one-settings-dock__branch-group">
                      <span className="experiment-one-settings-dock__branch-label">General</span>
                      <div className="experiment-one-settings-dock__branch-saves">
                        {generalScopedSaves.map((save) => {
                          const branchVariant = save.branchVariant ?? null;
                          const selectionKey = saveSelectionKey(save.id, branchVariant);
                          const multiSelected = selectedSaveKeysForDockExperiment.includes(selectionKey);
                          const current = isCurrentSaveActive(
                            selectedSaveIdByExperiment[dockExperiment],
                            activeRenderVariant,
                            save.id,
                            branchVariant,
                          );
                          const showCurrent = current && (!saveMultiSelectionActive || multiSelected);
                          const saveKey = selectionKey;
                          const saveInstanceKey = selectedSaveInstanceKey(dockExperiment, selectionKey);
                          const selectedOrderIndex = selectedSaveInstanceOrder.indexOf(saveInstanceKey);
                          const canReorderSave = multiSelected && selectedSaveInstanceOrder.length > 1 && selectedOrderIndex !== -1;
                          const isFrontMost = selectedOrderIndex === 0;
                          const isBackMost = selectedOrderIndex === selectedSaveInstanceOrder.length - 1;
                          return (
                            <button
                              key={save.id}
                              type="button"
                              className={`experiment-one-settings-dock__save-chip${showCurrent ? ' experiment-one-settings-dock__save-chip--current' : ''}${multiSelected ? ' experiment-one-settings-dock__save-chip--selected' : ''}`}
                              aria-pressed={multiSelected}
                              aria-current={showCurrent ? 'true' : undefined}
                              onClick={(event) => {
                                if (saveSelectionMode || event.metaKey || event.ctrlKey || event.shiftKey) {
                                  event.preventDefault();
                                  cancelQueuedSaveLoad(saveKey);
                                  toggleSaveMultiSelection(dockExperiment, selectionKey, true);
                                  return;
                                }
                                if (event.detail !== 1) return;
                                queueSaveLoad(saveKey, () => loadSave(save.id, save.branchVariant));
                              }}
                              onDoubleClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                cancelQueuedSaveLoad(saveKey);
                                if (!saveSelectionMode) {
                                  toggleSaveMultiSelection(dockExperiment, selectionKey, true);
                                }
                              }}
                              title={`${save.label}${save.branchVariant ? ` (${save.branchVariant})` : ''} · click to load · ⌘+click to multi-select`}
                            >
                              {save.label}
                              {canReorderSave && (
                                <span className="experiment-one-settings-dock__save-context-actions" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    className="experiment-one-settings-dock__save-context-btn"
                                    onClick={(e) => { e.stopPropagation(); bringSaveForward(dockExperiment, selectionKey); }}
                                    disabled={isFrontMost}
                                    title="Bring forward"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    type="button"
                                    className="experiment-one-settings-dock__save-context-btn"
                                    onClick={(e) => { e.stopPropagation(); sendSaveBackward(dockExperiment, selectionKey); }}
                                    disabled={isBackMost}
                                    title="Send backward"
                                  >
                                    ▼
                                  </button>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {otherScopedSaves.length > 0 && (branchSaveGroups.length > 0 || generalScopedSaves.length > 0) && (
                    <span className="experiment-one-settings-dock__branch-label">Other saves</span>
                  )}
                  {otherScopedSaves.map((save) => {
                    const branchVariant = save.branchVariant ?? null;
                    const selectionKey = saveSelectionKey(save.id, branchVariant);
                    const multiSelected = selectedSaveKeysForDockExperiment.includes(selectionKey);
                    const current = isCurrentSaveActive(
                      selectedSaveIdByExperiment[dockExperiment],
                      activeRenderVariant,
                      save.id,
                      branchVariant,
                    );
                    const showCurrent = current && (!saveMultiSelectionActive || multiSelected);
                    const saveKey = selectionKey;
                    const saveInstanceKey = selectedSaveInstanceKey(dockExperiment, selectionKey);
                    const selectedOrderIndex = selectedSaveInstanceOrder.indexOf(saveInstanceKey);
                    const canReorderSave = multiSelected && selectedSaveInstanceOrder.length > 1 && selectedOrderIndex !== -1;
                    const isFrontMost = selectedOrderIndex === 0;
                    const isBackMost = selectedOrderIndex === selectedSaveInstanceOrder.length - 1;
                    return (
                      <button
                        key={save.id}
                        type="button"
                        className={`experiment-one-settings-dock__save-chip${showCurrent ? ' experiment-one-settings-dock__save-chip--current' : ''}${multiSelected ? ' experiment-one-settings-dock__save-chip--selected' : ''}`}
                        aria-pressed={multiSelected}
                        aria-current={showCurrent ? 'true' : undefined}
                        onClick={(event) => {
                          if (saveSelectionMode || event.metaKey || event.ctrlKey || event.shiftKey) {
                            event.preventDefault();
                            cancelQueuedSaveLoad(saveKey);
                            toggleSaveMultiSelection(dockExperiment, selectionKey, true);
                            return;
                          }
                          if (event.detail !== 1) return;
                          queueSaveLoad(saveKey, () => loadSave(save.id, save.branchVariant));
                        }}
                        onDoubleClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          cancelQueuedSaveLoad(saveKey);
                          if (!saveSelectionMode) {
                            toggleSaveMultiSelection(dockExperiment, selectionKey, true);
                          }
                        }}
                        title={`${save.label} · click to load · ⌘+click to multi-select`}
                      >
                        {save.label}
                        {canReorderSave && (
                          <span className="experiment-one-settings-dock__save-context-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="experiment-one-settings-dock__save-context-btn"
                              onClick={(e) => { e.stopPropagation(); bringSaveForward(dockExperiment, selectionKey); }}
                              disabled={isFrontMost}
                              title="Bring forward"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="experiment-one-settings-dock__save-context-btn"
                              onClick={(e) => { e.stopPropagation(); sendSaveBackward(dockExperiment, selectionKey); }}
                              disabled={isBackMost}
                              title="Send backward"
                            >
                              ▼
                            </button>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Zone 5: Properties ── */}
              <div
                className={`experiment-one-settings-dock__workspace${showLayerEditToggle ? ' experiment-one-settings-dock__workspace--layered' : ''}`}
              >
                {showLayerEditToggle && (
                  <aside className="experiment-one-settings-dock__layer-rail" aria-label="Layer controls">
                    <span className="experiment-one-settings-dock__layer-rail-label">Edit</span>
                    <LayerEditModeToggle
                      value={layerEditMode}
                      onChange={handleLayerEditModeChange}
                      layout="side"
                    showLayerC={dockExperiment === 'six' || dockExperiment === 'eight'}
                    />
                    <span className="experiment-one-settings-dock__layer-rail-label">Show</span>
                    <LayerVisibilityToggles
                      layerAVisible={layerAVisible}
                      layerBVisible={layerBVisible}
                      layerCVisible={layerCVisible}
                      onToggleLayerA={toggleLayerAVisible}
                      onToggleLayerB={toggleLayerBVisible}
                      onToggleLayerC={toggleLayerCVisible}
                      showLayerC={dockExperiment === 'six' || dockExperiment === 'eight'}
                    />
                  </aside>
                )}

              <div ref={settingsScrollRef} className="experiment-one-settings-dock__settings-scroll">
                {/* Inspect banner — compact, replaces old selection card */}
                {selection ? (
                  <div className="experiment-one-settings-dock__inspect-banner">
                    <span className="experiment-one-settings-dock__inspect-banner-label">Inspecting</span>
                    <strong className="experiment-one-settings-dock__inspect-banner-name">{selection.label}</strong>
                    <span className="experiment-one-settings-dock__inspect-banner-meta">
                      {relatedCount} settings
                    </span>
                  </div>
                ) : (
                  <p className="experiment-one-settings-dock__hint">
                    {inspectMode
                      ? 'Click a panel or layer to show only its settings here.'
                      : 'Enable Inspect, then click a panel or layer.'}
                  </p>
                )}
                {note && <p className="experiment-one-settings-dock__note">{note}</p>}

            {dockExperiment === 'one' && visibleE1Fields.length > 0 && (
            <section className="experiment-set-one-dock__experiment">
              {!filtering && (
                <>
                  <h2 className="experiment-set-one-dock__experiment-title">Experiment One</h2>
                  <p className="experiment-set-one-dock__experiment-desc">Single panel with rim, bevel, shine, and depth.</p>
                </>
              )}
              {visibleE1Sections.map((section) => {
                const sectionFields = visibleE1Fields.filter((field) => field.section === section);
                if (sectionFields.length === 0) return null;
                return (
                <MaterialSettingCollapsibleSection
                  key={`e1-${section}`}
                  id={`e1-${section}`}
                  title={section}
                  count={sectionFields.length}
                  open={isOpen(`e1-${section}`)}
                  onToggle={toggle}
                  titleClassName="experiment-one-settings-dock__section-title"
                  fieldsClassName="experiment-one-settings-dock__fields"
                >
                  {sectionFields.map((field, index) => (
                    <MaterialSettingFieldRow
                      key={`e1-${field.id}`}
                      field={field}
                      fieldIndex={index + 1}
                      value={e1[field.id]}
                      onChange={(v) => setE1(field.id, v as E1MaterialSettings[typeof field.id])}
                      defaultValue={E1_MASTER_DEFAULT[field.id]}
                      resetTargets={fieldResetTargets(
                        E1_MASTER_DEFAULT[field.id],
                        'one',
                        field.id,
                        scopedSaves,
                      )}
                      onResetTo={(v) => setE1(field.id, v as E1MaterialSettings[typeof field.id])}
                      classPrefix="e1"
                      highlighted={false}
                    />
                  ))}
                </MaterialSettingCollapsibleSection>
                );
              })}
            </section>
            )}

            {dockExperiment === 'two' && visibleE2Fields.length > 0 && (
            <section className="experiment-set-one-dock__experiment">
              {!filtering && (
                <>
                  <h2 className="experiment-set-one-dock__experiment-title">Experiment Two</h2>
                  <p className="experiment-set-one-dock__experiment-desc">
                    Two independent draggable sheets — transparent base and frosted overlay.
                  </p>
                </>
              )}
              {visibleE2Sections.map((section) => {
                const sectionFields = visibleE2Fields.filter((field) => field.section === section);
                if (sectionFields.length === 0) return null;
                return (
                <MaterialSettingCollapsibleSection
                  key={`e2-${section}`}
                  id={`e2-${section}`}
                  title={section}
                  count={sectionFields.length}
                  open={isOpen(`e2-${section}`)}
                  onToggle={toggle}
                  titleClassName="experiment-one-settings-dock__section-title"
                  fieldsClassName="experiment-one-settings-dock__fields"
                >
                  {sectionFields.map((field, index) => (
                    <MaterialSettingFieldRow
                      key={`e2-${field.id}`}
                      field={field}
                      fieldIndex={index + 1}
                      value={e2[field.id]}
                      onChange={(v) => setE2(field.id, v as E2MaterialSettings[typeof field.id])}
                      defaultValue={E2_MASTER_DEFAULT[field.id]}
                      resetTargets={fieldResetTargets(
                        E2_MASTER_DEFAULT[field.id],
                        'two',
                        field.id,
                        scopedSaves,
                      )}
                      onResetTo={(v) => setE2(field.id, v as E2MaterialSettings[typeof field.id])}
                      classPrefix="e2"
                      highlighted={false}
                    />
                  ))}
                </MaterialSettingCollapsibleSection>
                );
              })}
            </section>
            )}

            {dockExperiment === 'three' && (
              <ExperimentMultiLayerSettings
                experimentKey="e3"
                title="Experiment Three"
                description="Layer A ultra-clear bezel frame, Layer B frosted body inset inside."
                filtering={filtering}
                fields={visibleE3Fields}
                sectionOrder={E3_SECTION_ORDER}
                settings={e3}
                masterDefault={E3_MASTER_DEFAULT}
                layerEditMode={dockLayerEditMode}
                onChange={(id, value) => setE3(id as keyof E3MaterialSettings, value as E3MaterialSettings[keyof E3MaterialSettings])}
                onPairedChange={(suffix, value) => {
                  setE3(`layerA${suffix}` as keyof E3MaterialSettings, value as E3MaterialSettings[keyof E3MaterialSettings]);
                  setE3(`layerB${suffix}` as keyof E3MaterialSettings, value as E3MaterialSettings[keyof E3MaterialSettings]);
                }}
                resetTargets={fieldResetTargets}
                scopedSaves={scopedSaves}
                saveExperiment="three"
                isOpen={isOpen}
                onToggle={toggle}
              />
            )}

            {dockExperiment === 'four' && (
              <ExperimentMultiLayerSettings
                experimentKey="e4"
                title="Experiment Four"
                description="Save 2 materials + reference left-panel sizing with diagonal opposite-corner highlights."
                filtering={filtering}
                fields={visibleE4Fields}
                sectionOrder={E4_SECTION_ORDER}
                settings={e4}
                masterDefault={E4_MASTER_DEFAULT}
                layerEditMode={dockLayerEditMode}
                onChange={(id, value) => setE4(id as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings])}
                onPairedChange={(suffix, value) => {
                  setE4(`layerA${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                  setE4(`layerB${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                }}
                resetTargets={fieldResetTargets}
                scopedSaves={scopedSaves}
                saveExperiment="four"
                isOpen={isOpen}
                onToggle={toggle}
              />
            )}

            {dockExperiment === 'five' && (
              <ExperimentMultiLayerSettings
                experimentKey="e5"
                title="Experiment Five"
                description="Copy of Experiment Four saves with showcase panel geometry (316×760 @ 24.61, 327.55) and forced nested bezel."
                filtering={filtering}
                fields={visibleE5Fields}
                sectionOrder={E4_SECTION_ORDER}
                settings={e5}
                masterDefault={E4_MASTER_DEFAULT}
                layerEditMode={dockLayerEditMode}
                onChange={(id, value) => setE5(id as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings])}
                onPairedChange={(suffix, value) => {
                  setE5(`layerA${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                  setE5(`layerB${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                }}
                resetTargets={fieldResetTargets}
                scopedSaves={scopedSaves}
                saveExperiment="four"
                isOpen={isOpen}
                onToggle={toggle}
              />
            )}

            {dockExperiment === 'six' && (
              <ExperimentMultiLayerSettings
                experimentKey="e6"
                title="Experiment Six"
                description={
                  e6LayerCMode
                    ? 'Layer C circle — branch save materials with circle layout (diameter & inset).'
                    : 'Branch save materials for layers A/B.'
                }
                filtering={e6DockFiltering}
                fields={visibleE6Fields}
                sectionOrder={e6SectionOrder}
                settings={e6}
                masterDefault={E4_MASTER_DEFAULT}
                layerEditMode={e6LayerEditMode}
                onChange={(id, value) => setE6(id as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings])}
                onPairedChange={(suffix, value) => {
                  setE6(`layerA${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                  setE6(`layerB${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                }}
                resetTargets={fieldResetTargets}
                scopedSaves={scopedSaves}
                saveExperiment="six"
                isOpen={isOpen}
                onToggle={toggle}
                alternateFields={e6AlternateFields}
              />
            )}

            {dockExperiment === 'seven' && (
              <ExperimentMultiLayerSettings
                experimentKey="e7"
                title="Experiment Seven"
                description="Branch save materials for nested layers A and B — 326×38 outer, 321×35.3 inner (centered), no circle."
                filtering={filtering}
                fields={visibleE7Fields}
                sectionOrder={E4_SECTION_ORDER}
                settings={e7}
                masterDefault={E4_MASTER_DEFAULT}
                layerEditMode={dockLayerEditMode}
                onChange={(id, value) => setE7(id as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings])}
                onPairedChange={(suffix, value) => {
                  setE7(`layerA${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                  setE7(`layerB${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                }}
                resetTargets={fieldResetTargets}
                scopedSaves={scopedSaves}
                saveExperiment="seven"
                isOpen={isOpen}
                onToggle={toggle}
              />
            )}
            {dockExperiment === 'eight' && (
              <ExperimentMultiLayerSettings
                experimentKey="e8"
                title="Experiment Eight"
                description="Duplicate of Experiment Six with the same compact panel geometry and layer C flow."
                filtering={e6DockFiltering}
                fields={visibleE6Fields}
                sectionOrder={e6SectionOrder}
                settings={e8}
                masterDefault={E4_MASTER_DEFAULT}
                layerEditMode={e6LayerEditMode}
                onChange={(id, value) => setE8(id as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings])}
                onPairedChange={(suffix, value) => {
                  setE8(`layerA${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                  setE8(`layerB${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                }}
                resetTargets={fieldResetTargets}
                scopedSaves={scopedSaves}
                saveExperiment="eight"
                isOpen={isOpen}
                onToggle={toggle}
                alternateFields={e6AlternateFields}
              />
            )}
            {dockExperiment === 'nine' && (
              <ExperimentMultiLayerSettings
                experimentKey="e9"
                title="Experiment Nine"
                description="Duplicate of Experiment Four with its own working state and saves."
                filtering={filtering}
                fields={visibleE4Fields}
                sectionOrder={E4_SECTION_ORDER}
                settings={e9}
                masterDefault={E4_MASTER_DEFAULT}
                layerEditMode={dockLayerEditMode}
                onChange={(id, value) => setE9(id as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings])}
                onPairedChange={(suffix, value) => {
                  setE9(`layerA${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                  setE9(`layerB${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                }}
                resetTargets={fieldResetTargets}
                scopedSaves={scopedSaves}
                saveExperiment="nine"
                isOpen={isOpen}
                onToggle={toggle}
              />
            )}
            {dockExperiment === 'ten' && (
              <ExperimentMultiLayerSettings
                experimentKey="e10"
                title="Experiment Ten"
                description="Duplicate of Experiment Nine with its own working state and saves."
                filtering={filtering}
                fields={visibleE4Fields}
                sectionOrder={E4_SECTION_ORDER}
                settings={e10}
                masterDefault={E4_MASTER_DEFAULT}
                layerEditMode={dockLayerEditMode}
                onChange={(id, value) => setE10(id as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings])}
                onPairedChange={(suffix, value) => {
                  setE10(`layerA${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                  setE10(`layerB${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                }}
                resetTargets={fieldResetTargets}
                scopedSaves={scopedSaves}
                saveExperiment="ten"
                isOpen={isOpen}
                onToggle={toggle}
              />
            )}
            </div>
            </div>
          </div>
          </>
        )}
      </div>
    </ExperimentOneDraggableShell>
  );
}
