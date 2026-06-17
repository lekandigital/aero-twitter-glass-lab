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
  syncE4LayerBLayoutFromBezel,
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
import { sectionsForLayerMode, foldableSectionId, type LayerEditMode } from '../shared/layerEditMode';
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
  loadExperimentSetOneSaves,
  type ExperimentSetOneSnapshot,
} from './savedConfigs';
import { applyReferenceCornerLighting, REFERENCE_CORNER_PRESET_VERSION } from '../experiment-set-four/referenceCornerLighting';
import {
  E5_BORDER_REFINEMENTS_VERSION,
  refineExperimentFivePanels,
} from '../experiment-set-five/borderCornerRefinements';
import { clearAllExperimentSetOnePositions, EXPERIMENT_SET_ONE_POSITION_KEYS, loadDragPosition } from './dragPositions';
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
import { buildExperimentSetOneConfigText } from './exportConfig';
import { downloadTextFile } from '../../utils/downloadTextFile';

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
  | { experiment: 'five'; target: E4InspectTarget; label: string };

type ExperimentSetOneContextValue = {
  e1: E1MaterialSettings;
  e2: E2MaterialSettings;
  e3: E3MaterialSettings;
  e4: E4MaterialSettings;
  e5: E4MaterialSettings;
  setE1: <K extends keyof E1MaterialSettings>(id: K, value: E1MaterialSettings[K]) => void;
  setE2: <K extends keyof E2MaterialSettings>(id: K, value: E2MaterialSettings[K]) => void;
  setE3: <K extends keyof E3MaterialSettings>(id: K, value: E3MaterialSettings[K]) => void;
  setE4: <K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => void;
  setE5: <K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => void;
  resetAll: () => void;
  saves: ExperimentSetOneSnapshot[];
  saveCurrent: () => void;
  loadSave: (id: number) => void;
  layoutResetVersion: number;
  resetLayoutPositions: () => void;
  inspectMode: boolean;
  setInspectMode: (on: boolean) => void;
  hidePanelText: boolean;
  setHidePanelText: (on: boolean) => void;
  experimentVisible: ExperimentVisibility;
  toggleExperimentVisible: (id: ExperimentId) => void;
  activeExperiment: ExperimentId;
  setActiveExperiment: (id: ExperimentId) => void;
  selectedSaveIdByExperiment: Record<ExperimentId, number | null>;
  selection: ExperimentSelection | null;
  clearSelection: () => void;
  referenceWallpaper: boolean;
  toggleReferenceWallpaper: () => void;
};

const ExperimentSetOneContext = createContext<ExperimentSetOneContextValue | null>(null);

export function useExperimentSetOne() {
  const ctx = useContext(ExperimentSetOneContext);
  if (!ctx) throw new Error('useExperimentSetOne must be used within ExperimentSetOneProvider');
  return ctx;
}

function e5LayoutPresetFromSaves() {
  const all = loadExperimentSetOneSaves();
  const save19 = all.find((s) => s.id === 19 || s.label === 'Save 19');
  const e4Settings = save19?.e4;
  if (!e4Settings) return null;
  return {
    layerAWidth: e4Settings.layerAWidth,
    layerAHeight: e4Settings.layerAHeight,
    layerABezelInsetX: e4Settings.layerABezelInsetX,
    layerABezelInsetY: e4Settings.layerABezelInsetY,
    layerACornerRadius: e4Settings.layerACornerRadius,
  } as const;
}

function applyE5OverridesStatic(raw: E4MaterialSettings): E4MaterialSettings {
  const next = {
    ...raw,
    ...(e5LayoutPresetFromSaves() ?? {}),
    layerBNestedInA: true,
  } as E4MaterialSettings;
  return syncE4LayerBLayoutFromBezel(next);
}

function resolveInitialE5(boot: ExperimentSetOneSession): E4MaterialSettings {
  if (boot.e5) return normalizeE4MaterialSettings(boot.e5);
  const selectedSaveId = boot.selectedSaveIdByExperiment?.five;
  if (selectedSaveId != null) {
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === selectedSaveId);
    if (snapshot?.e4) {
      return applyE5OverridesStatic(normalizeE4MaterialSettings(snapshot.e4));
    }
  }
  return applyE5OverridesStatic(normalizeE4MaterialSettings(boot.e4));
}

export function ExperimentSetOneProvider({ children }: { children: ReactNode }) {
  const boot = loadExperimentSetOneSession() ?? defaultSession();
  const [e1, setE1State] = useState<E1MaterialSettings>(boot.e1);
  const [e2, setE2State] = useState<E2MaterialSettings>(boot.e2);
  const [e3, setE3State] = useState<E3MaterialSettings>(boot.e3);
  const [e4, setE4State] = useState<E4MaterialSettings>(() => normalizeE4MaterialSettings(boot.e4));
  const [e5, setE5State] = useState<E4MaterialSettings>(() => resolveInitialE5(boot));
  const [e5BorderRefinementsVersion, setE5BorderRefinementsVersion] = useState(
    boot.e5BorderRefinementsVersion ?? 0,
  );
  const [saves, setSaves] = useState<ExperimentSetOneSnapshot[]>(() => loadExperimentSetOneSaves());
  const [inspectMode, setInspectMode] = useState(boot.inspectMode);
  const [hidePanelText, setHidePanelText] = useState(boot.hidePanelText);
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
  });
  const [selection, setSelection] = useState<ExperimentSelection | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const selectedElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const style = useMemo(
    () =>
      ({
        ...e1SettingsToCssVars(e1),
        ...e2SettingsToCssVars(e2),
        ...e3SettingsToCssVars(e3),
        ...(activeExperiment === 'five' ? e4SettingsToCssVars(e5) : e4SettingsToCssVars(e4)),
      }) as CSSProperties,
    [e1, e2, e3, e4, e5, activeExperiment],
  );

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

  const resetAll = useCallback(() => {
    setE1State(E1_MASTER_DEFAULT);
    setE2State(E2_MASTER_DEFAULT);
    setE3State(E3_MASTER_DEFAULT);
    setE4State(E4_MASTER_DEFAULT);
    setE5State(E4_MASTER_DEFAULT);
  }, []);

  const saveCurrent = useCallback(() => {
    const scope = selection ? selection.experiment : activeExperiment;
    addExperimentSetOneSave(e1, e2, e3, activeExperiment === 'five' ? e5 : e4, scope);
    setSaves(loadExperimentSetOneSaves());
    downloadExperimentSetOneConfig(e1, e2, e3, activeExperiment === 'five' ? e5 : e4);
  }, [e1, e2, e3, e4, e5, selection, activeExperiment]);

  const applyE5Overrides = useCallback(
    (raw: E4MaterialSettings) => applyE5OverridesStatic(raw),
    [],
  );

  useEffect(() => {
    if (activeExperiment !== 'five') return;
    if (e5BorderRefinementsVersion >= E5_BORDER_REFINEMENTS_VERSION) return;
    setE5State((prev) => refineExperimentFivePanels(prev));
    setE5BorderRefinementsVersion(E5_BORDER_REFINEMENTS_VERSION);
  }, [activeExperiment, e5BorderRefinementsVersion]);

  const loadSave = useCallback((id: number) => {
    setSelectedSaveIdByExperiment((prev) => ({ ...prev, [activeExperiment]: id }));
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === id);
    if (!snapshot) return;
    if (snapshot.cornersOnly) {
      if (activeExperiment === 'five') setE5State((prev) => applyReferenceCornerLighting(prev));
      else setE4State((prev) => applyReferenceCornerLighting(prev));
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
        const normalized = normalizeE4MaterialSettings(snapshot.e4);
        if (activeExperiment === 'five') setE5State(applyE5Overrides(normalized));
        else setE4State(normalized);
      }
      return;
    }
    if (snapshot.scope === 'five') {
      if (snapshot.e4) setE5State(applyE5Overrides(normalizeE4MaterialSettings(snapshot.e4)));
      return;
    }
    setE1State(snapshot.e1);
    setE2State(snapshot.e2);
    setE3State(snapshot.e3);
    if (snapshot.e4) setE4State(normalizeE4MaterialSettings(snapshot.e4));
  }, [activeExperiment, applyE5Overrides]);

  const e5DownloadRanRef = useRef(false);

  useEffect(() => {
    if (activeExperiment !== 'five') return;
    if (e5DownloadRanRef.current) return;
    try {
      if (localStorage.getItem('exp-set-1:e5-download-all-v1') === '1') {
        e5DownloadRanRef.current = true;
        return;
      }
      localStorage.setItem('exp-set-1:e5-download-all-v1', '1');
    } catch {
      // If storage is blocked, still proceed once per session.
    }
    e5DownloadRanRef.current = true;

    const e4Saves = loadExperimentSetOneSaves().filter((s) => s.scope === 'four' && !s.cornersOnly && s.e4);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    for (const save of e4Saves) {
      const e5Material = applyE5Overrides(normalizeE4MaterialSettings(save.e4!));
      const filename = `experiment-set-1-e5-${stamp}-${save.label.replace(/\s+/g, '-').toLowerCase()}.txt`;
      downloadTextFile(filename, buildExperimentSetOneConfigText(e1, e2, e3, e5Material));
    }
  }, [activeExperiment, applyE5Overrides, e1, e2, e3]);

  const resetLayoutPositions = useCallback(() => {
    clearAllExperimentSetOnePositions();
    setLayoutResetVersion((v) => v + 1);
  }, []);

  const clearSelection = useCallback(() => {
    clearInspectFlash();
    selectedElRef.current = null;
    setSelection(null);
  }, []);

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
      hidePanelText,
      inspectMode,
      experimentVisible,
      referenceWallpaper,
      activeExperiment,
      selectedSaveIdByExperiment,
      cornerPresetVersion: REFERENCE_CORNER_PRESET_VERSION,
      e5BorderRefinementsVersion,
    });
  }, [e1, e2, e3, e4, e5, hidePanelText, inspectMode, experimentVisible, referenceWallpaper, activeExperiment, selectedSaveIdByExperiment, e5BorderRefinementsVersion]);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !inspectMode) return;

    const onClick = (event: MouseEvent) => {
      if (consumeClickAfterHoldDrag()) return;
      if ((event.target as HTMLElement).closest('.experiment-one-settings-dock')) return;

      const e4El = (event.target as HTMLElement).closest('[data-e4-inspect]') as HTMLElement | null;
      const e3El = (event.target as HTMLElement).closest('[data-e3-inspect]') as HTMLElement | null;
      const e2El = (event.target as HTMLElement).closest('[data-e2-inspect]') as HTMLElement | null;
      const e1El = (event.target as HTMLElement).closest('[data-e1-inspect]') as HTMLElement | null;
      const el = e4El ?? e3El ?? e2El ?? e1El;

      if (!el) {
        clearSelection();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      selectedElRef.current = el;

      const e4Target = el.dataset.e4Inspect;
      if (e4Target && isE4InspectTarget(e4Target)) {
        flashInspectElement(el, 'four');
        setActiveExperiment(activeExperiment === 'five' ? 'five' : 'four');
        setSelection({
          experiment: activeExperiment === 'five' ? 'five' : 'four',
          target: e4Target,
          label: el.dataset.e4InspectLabel ?? E4_INSPECT_CATALOG[e4Target].label,
        });
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
      setE1,
      setE2,
      setE3,
      setE4,
      setE5,
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
      experimentVisible,
      toggleExperimentVisible,
      activeExperiment,
      setActiveExperiment,
      selectedSaveIdByExperiment,
      selection,
      clearSelection,
      referenceWallpaper,
      toggleReferenceWallpaper,
    }),
    [e1, e2, e3, e4, e5, setE1, setE2, setE3, setE4, setE5, resetAll, saves, saveCurrent, loadSave, layoutResetVersion, resetLayoutPositions, inspectMode, hidePanelText, experimentVisible, toggleExperimentVisible, activeExperiment, selectedSaveIdByExperiment, selection, clearSelection, referenceWallpaper, toggleReferenceWallpaper],
  );

  return (
    <ExperimentSetOneContext.Provider value={value}>
      <div
        ref={pageRef}
        className="experiment-set-one-page experiment-one-page"
        style={style}
        data-e1-show-sparkles={e1.showSparkles}
        data-e3-layerB-show-sparkles={e3.layerBShowSparkles}
        data-e4-layerB-show-sparkles={e4.layerBShowSparkles}
        data-e4-layerB-nested={e4.layerBNestedInA}
        data-e4-layerA-radial-layout={e4RadialLayoutAttr(e4.layerARadialCornerMode)}
        data-e4-layerB-radial-layout={e4RadialLayoutAttr(e4.layerBRadialCornerMode)}
        data-e1-visible={experimentVisible.one}
        data-e2-visible={experimentVisible.two}
        data-e3-visible={experimentVisible.three}
        data-e4-visible={experimentVisible.four}
        data-e1-inspect-mode={inspectMode}
        data-e2-inspect-mode={inspectMode}
        data-e3-inspect-mode={inspectMode}
        data-e4-inspect-mode={inspectMode}
        data-hide-panel-text={hidePanelText}
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
  if (!selection || selection.experiment !== 'four') return null;
  return new Set(E4_INSPECT_CATALOG[selection.target].fields);
}

function selectionNote(selection: ExperimentSelection | null) {
  if (!selection) return undefined;
  if (selection.experiment === 'one') return E1_INSPECT_CATALOG[selection.target].note;
  if (selection.experiment === 'two') return E2_INSPECT_CATALOG[selection.target].note;
  if (selection.experiment === 'three') return E3_INSPECT_CATALOG[selection.target].note;
  return E4_INSPECT_CATALOG[selection.target].note;
}

function experimentTitle(experiment: ExperimentSelection['experiment'] | ExperimentId) {
  if (experiment === 'one') return 'Experiment One';
  if (experiment === 'two') return 'Experiment Two';
  if (experiment === 'three') return 'Experiment Three';
  if (experiment === 'four') return 'Experiment Four';
  return 'Experiment Five';
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
  if (selection.experiment === 'four') {
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
): T[] {
  if (!selection || !highlight) return allFields;
  return allFields.filter((field) => highlight.has(field.id as string));
}

function sectionsForFields<T extends { section: string }>(
  order: readonly string[],
  fields: T[],
): string[] {
  return orderedSections(fields, order);
}

function fieldResetTargets<T extends string | number | boolean>(
  masterValue: T,
  experiment: 'one' | 'two' | 'three' | 'four',
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
    setE1,
    setE2,
    setE3,
    setE4,
    setE5,
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
    activeExperiment,
    setActiveExperiment,
    selectedSaveIdByExperiment,
    selection,
    clearSelection,
    referenceWallpaper,
    toggleReferenceWallpaper,
  } = useExperimentSetOne();
  const [open, setOpen] = useState(true);
  const [layerEditMode, setLayerEditMode] = useState<LayerEditMode>(
    () => loadExperimentSetOneSession()?.layerEditMode ?? 'both',
  );
  const saveScope = selection ? selection.experiment : activeExperiment;
  const scopedSaves = useMemo(
    () =>
      saveScope === 'five'
        ? saves.filter((s) => s.scope === 'four' || s.scope === 'five' || s.cornersOnly)
        : saves.filter((s) => s.scope === saveScope || s.cornersOnly),
    [saves, saveScope],
  );
  const dockExperiment = selection ? selection.experiment : activeExperiment;

  const e1Highlight = useMemo(() => e1Highlighted(selection), [selection]);
  const e2Highlight = useMemo(() => e2Highlighted(selection), [selection]);
  const e3Highlight = useMemo(() => e3Highlighted(selection), [selection]);
  const e4Highlight = useMemo(() => e4Highlighted(selection), [selection]);
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
    () => fieldsForSelection(filterFieldsWhen(E3_SETTING_FIELDS, e3), e3Highlight, selection),
    [selection, e3Highlight, e3],
  );
  const contextualE4Fields = useMemo(() => e4FieldsVisibleForSettings(e4), [e4]);
  const visibleE4Fields = useMemo(
    () => fieldsForSelection(contextualE4Fields, e4Highlight, selection),
    [selection, e4Highlight, contextualE4Fields],
  );
  const contextualE5Fields = useMemo(() => e4FieldsVisibleForSettings(e5), [e5]);
  const visibleE5Fields = useMemo(
    () => fieldsForSelection(contextualE5Fields, e4Highlight, selection),
    [selection, e4Highlight, contextualE5Fields],
  );
  const visibleE1Sections = useMemo(
    () => sectionsForFields(E1_SECTION_ORDER, visibleE1Fields),
    [visibleE1Fields],
  );
  const visibleE2Sections = useMemo(
    () => sectionsForFields(E2_SECTION_ORDER, visibleE2Fields),
    [visibleE2Fields],
  );
  const visibleE3SectionsForMode = useMemo(
    () => sectionsForLayerMode(visibleE3Fields, E3_SECTION_ORDER, layerEditMode),
    [visibleE3Fields, layerEditMode],
  );
  const visibleE4SectionsForMode = useMemo(
    () => sectionsForLayerMode(visibleE4Fields, E4_SECTION_ORDER, layerEditMode),
    [visibleE4Fields, layerEditMode],
  );
  const visibleE5SectionsForMode = useMemo(
    () => sectionsForLayerMode(visibleE5Fields, E4_SECTION_ORDER, layerEditMode),
    [visibleE5Fields, layerEditMode],
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
    ],
    [visibleE1Sections, visibleE2Sections, visibleE3SectionsForMode, visibleE4SectionsForMode, visibleE5SectionsForMode],
  );
  const { isOpen, toggle, openAll, collapseAll } = useFoldableSections(foldableSectionIds, false);
  const settingsScrollRef = useRef<HTMLDivElement>(null);
  const pendingScrollAnchorRef = useRef<SettingsScrollAnchor | null>(null);

  const handleLayerEditModeChange = useCallback((mode: LayerEditMode) => {
    const container = settingsScrollRef.current;
    if (container) {
      pendingScrollAnchorRef.current = captureSettingsScrollAnchor(container);
    }
    setLayerEditMode(mode);
  }, []);

  useLayoutEffect(() => {
    const container = settingsScrollRef.current;
    const anchor = pendingScrollAnchorRef.current;
    if (!container || !anchor) return;
    pendingScrollAnchorRef.current = null;
    restoreSettingsScrollAnchor(container, anchor);
  }, [layerEditMode, visibleE3SectionsForMode, visibleE4SectionsForMode, visibleE5SectionsForMode]);

  useEffect(() => {
    const session = loadExperimentSetOneSession();
    if (!session) return;
    saveExperimentSetOneSession({ ...session, layerEditMode });
  }, [layerEditMode]);

  const showLayerEditToggle = dockExperiment === 'three' || dockExperiment === 'four' || dockExperiment === 'five';

  return (
    <ExperimentOneDraggableShell
      className="experiment-one-settings-dock"
      dragHandleSelector=".experiment-one-settings-dock__header"
      dragExcludeSelector="button, input, textarea, select, .experiment-one-settings-dock__body, .mat-setting-control"
      initialPosition={{ x: 20, y: 96 }}
      bounds="viewport"
      persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.settingsDock}
      layoutResetVersion={layoutResetVersion}
      ariaLabel="Material settings"
    >
      <div className={`experiment-one-settings-dock__shell${open ? '' : ' experiment-one-settings-dock__shell--collapsed'}`}>
        <header className="experiment-one-settings-dock__header">
          <div className="experiment-one-settings-dock__drag-handle" title="Drag settings panel">
            <span className="experiment-one-settings-dock__grip" aria-hidden="true" />
            <span className="experiment-one-settings-dock__title">
              {dockTitle}
              <span className="experiment-one-settings-dock__title-meta">{dockCountLabel}</span>
            </span>
          </div>
          <div className="experiment-one-settings-dock__header-actions">
            <button
              type="button"
              className={`experiment-one-settings-dock__toggle${inspectMode ? ' experiment-one-settings-dock__toggle--active' : ''}`}
              onClick={() => setInspectMode(!inspectMode)}
              aria-pressed={inspectMode}
            >
              Inspect
            </button>
            {selection && (
              <button type="button" className="experiment-one-settings-dock__toggle" onClick={clearSelection}>
                Clear
              </button>
            )}
            <button
              type="button"
              className={`experiment-one-settings-dock__toggle${hidePanelText ? ' experiment-one-settings-dock__toggle--active' : ''}`}
              onClick={() => setHidePanelText(!hidePanelText)}
              aria-pressed={hidePanelText}
            >
              Hide text
            </button>
            <button
              type="button"
              className={`experiment-one-settings-dock__toggle${referenceWallpaper ? ' experiment-one-settings-dock__toggle--active' : ''}`}
              onClick={toggleReferenceWallpaper}
              aria-pressed={referenceWallpaper}
              title="Overlay reference.png on aero-bg at matched scale"
            >
              Reference bg
            </button>
            {(
              [
                ['one', 'E1'],
                ['two', 'E2'],
                ['three', 'E3'],
                ['four', 'E4'],
                ['five', 'E5'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`experiment-one-settings-dock__toggle${dockExperiment === id ? ' experiment-one-settings-dock__toggle--active' : ''}`}
                onClick={() => {
                  clearSelection();
                  setActiveExperiment(id);
                }}
                aria-pressed={dockExperiment === id}
                title={`Show ${label} settings`}
              >
                {label}
              </button>
            ))}
            <button type="button" className="experiment-one-settings-dock__toggle" onClick={collapseAll}>
              Collapse
            </button>
            <button type="button" className="experiment-one-settings-dock__toggle" onClick={openAll}>
              Expand
            </button>
            <button type="button" className="experiment-one-settings-dock__toggle" onClick={resetLayoutPositions} title="Reset panel and settings dock positions to defaults">
              Reset layout
            </button>
            <button type="button" className="experiment-one-settings-dock__toggle" onClick={resetAll} title="Reset all experiments to master default">
              Reset
            </button>
            <button type="button" className="experiment-one-settings-dock__toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
              {open ? 'Hide' : 'Show'}
            </button>
          </div>
        </header>

        {open && (
          <div className="experiment-one-settings-dock__body">
            <div className="experiment-one-settings-dock__saves">
              <div className="experiment-one-settings-dock__saves-head">
                <span className="experiment-one-settings-dock__saves-title">Saves</span>
                <button type="button" className="experiment-one-settings-dock__toggle" onClick={saveCurrent}>
                  Save
                </button>
              </div>
              <div className="experiment-one-settings-dock__saves-list" role="group" aria-label="Experiment saves">
                {scopedSaves.map((save) => (
                  <button
                    key={save.id}
                    type="button"
                    className={`experiment-one-settings-dock__toggle experiment-one-settings-dock__toggle--save${selectedSaveIdByExperiment[dockExperiment] === save.id ? ' experiment-one-settings-dock__toggle--selected' : ''}`}
                    onClick={() => loadSave(save.id)}
                    title={`Restore ${save.label} from ${new Date(save.savedAt).toLocaleString()}`}
                  >
                    {save.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`experiment-one-settings-dock__workspace${showLayerEditToggle ? ' experiment-one-settings-dock__workspace--layered' : ''}`}
            >
              {showLayerEditToggle && (
                <aside className="experiment-one-settings-dock__layer-rail" aria-label="Layer edit mode">
                  <span className="experiment-one-settings-dock__layer-rail-label">Edit</span>
                  <LayerEditModeToggle value={layerEditMode} onChange={handleLayerEditModeChange} layout="side" />
                </aside>
              )}

            <div ref={settingsScrollRef} className="experiment-one-settings-dock__settings-scroll">
              {selection ? (
                <div className="experiment-one-settings-dock__selection">
                  <span className="experiment-one-settings-dock__selection-label">Inspecting</span>
                  <strong className="experiment-one-settings-dock__selection-name">{selection.label}</strong>
                  <span className="experiment-one-settings-dock__selection-meta">
                    {relatedCount} settings for this layer
                    {(() => {
                      const key = selectionPersistKey(selection);
                      const pos = loadDragPosition(key);
                      if (!pos) return null;
                      return ` · x ${Math.round(pos.x)} · y ${Math.round(pos.y)}`;
                    })()}
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
                layerEditMode={layerEditMode}
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
                layerEditMode={layerEditMode}
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
                description="Copy of Experiment Four saves with forced nested bezel + Save 19 layout footprint."
                filtering={filtering}
                fields={visibleE5Fields}
                sectionOrder={E4_SECTION_ORDER}
                settings={e5}
                masterDefault={E4_MASTER_DEFAULT}
                layerEditMode={layerEditMode}
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
            </div>
            </div>
          </div>
        )}
      </div>
    </ExperimentOneDraggableShell>
  );
}
