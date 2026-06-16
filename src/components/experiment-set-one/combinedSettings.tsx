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
import { consumeClickAfterHoldDrag } from '../shared/useHoldDrag';
import { orderedSections } from '../shared/materialSettingGroups';
import { useFoldableSections } from '../shared/useFoldableSections';
import { downloadExperimentSetOneConfig } from './exportConfig';
import {
  addExperimentSetOneSave,
  getFieldFromSnapshot,
  loadExperimentSetOneSaves,
  type ExperimentSetOneSnapshot,
} from './savedConfigs';
import { applyReferenceCornerLighting, REFERENCE_CORNER_PRESET_VERSION } from '../experiment-set-four/referenceCornerLighting';
import { clearAllExperimentSetOnePositions, EXPERIMENT_SET_ONE_POSITION_KEYS } from './dragPositions';
import {
  defaultSession,
  loadExperimentSetOneSession,
  saveExperimentSetOneSession,
} from './sessionState';
import {
  DEFAULT_EXPERIMENT_VISIBILITY,
  type ExperimentId,
  type ExperimentVisibility,
} from './experimentVisibility';
import { clearInspectFlash, flashInspectElement } from '../shared/inspectFlash';
import { useReferenceWallpaper } from '../shared/useReferenceWallpaper';

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
  | { experiment: 'four'; target: E4InspectTarget; label: string };

type ExperimentSetOneContextValue = {
  e1: E1MaterialSettings;
  e2: E2MaterialSettings;
  e3: E3MaterialSettings;
  e4: E4MaterialSettings;
  setE1: <K extends keyof E1MaterialSettings>(id: K, value: E1MaterialSettings[K]) => void;
  setE2: <K extends keyof E2MaterialSettings>(id: K, value: E2MaterialSettings[K]) => void;
  setE3: <K extends keyof E3MaterialSettings>(id: K, value: E3MaterialSettings[K]) => void;
  setE4: <K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => void;
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

export function ExperimentSetOneProvider({ children }: { children: ReactNode }) {
  const boot = loadExperimentSetOneSession() ?? defaultSession();
  const [e1, setE1State] = useState<E1MaterialSettings>(boot.e1);
  const [e2, setE2State] = useState<E2MaterialSettings>(boot.e2);
  const [e3, setE3State] = useState<E3MaterialSettings>(boot.e3);
  const [e4, setE4State] = useState<E4MaterialSettings>(() => normalizeE4MaterialSettings(boot.e4));
  const [saves, setSaves] = useState<ExperimentSetOneSnapshot[]>(() => loadExperimentSetOneSaves());
  const [inspectMode, setInspectMode] = useState(boot.inspectMode);
  const [hidePanelText, setHidePanelText] = useState(boot.hidePanelText);
  const [experimentVisible, setExperimentVisible] = useState<ExperimentVisibility>(
    boot.experimentVisible ?? DEFAULT_EXPERIMENT_VISIBILITY,
  );
  const { referenceWallpaper, toggleReferenceWallpaper } = useReferenceWallpaper();
  const [layoutResetVersion, setLayoutResetVersion] = useState(0);
  const [selection, setSelection] = useState<ExperimentSelection | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const selectedElRef = useRef<HTMLElement | null>(null);

  const style = useMemo(
    () =>
      ({
        ...e1SettingsToCssVars(e1),
        ...e2SettingsToCssVars(e2),
        ...e3SettingsToCssVars(e3),
        ...e4SettingsToCssVars(e4),
      }) as CSSProperties,
    [e1, e2, e3, e4],
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

  const resetAll = useCallback(() => {
    setE1State(E1_MASTER_DEFAULT);
    setE2State(E2_MASTER_DEFAULT);
    setE3State(E3_MASTER_DEFAULT);
    setE4State(E4_MASTER_DEFAULT);
  }, []);

  const saveCurrent = useCallback(() => {
    addExperimentSetOneSave(e1, e2, e3, e4);
    setSaves(loadExperimentSetOneSaves());
    downloadExperimentSetOneConfig(e1, e2, e3, e4);
  }, [e1, e2, e3, e4]);

  const loadSave = useCallback((id: number) => {
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === id);
    if (!snapshot) return;
    if (snapshot.cornersOnly) {
      setE4State((prev) => applyReferenceCornerLighting(prev));
      return;
    }
    setE1State(snapshot.e1);
    setE2State(snapshot.e2);
    setE3State(snapshot.e3);
    if (snapshot.e4) setE4State(normalizeE4MaterialSettings(snapshot.e4));
  }, []);

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
    clearInspectFlash();
    selectedElRef.current = null;
  }, []);

  useLayoutEffect(() => {
    saveExperimentSetOneSession({
      e1,
      e2,
      e3,
      e4,
      hidePanelText,
      inspectMode,
      experimentVisible,
      referenceWallpaper,
      cornerPresetVersion: REFERENCE_CORNER_PRESET_VERSION,
    });
  }, [e1, e2, e3, e4, hidePanelText, inspectMode, experimentVisible, referenceWallpaper]);

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
        setSelection({
          experiment: 'four',
          target: e4Target,
          label: el.dataset.e4InspectLabel ?? E4_INSPECT_CATALOG[e4Target].label,
        });
        return;
      }

      const e3Target = el.dataset.e3Inspect;
      if (e3Target && isE3InspectTarget(e3Target)) {
        flashInspectElement(el, 'three');
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
        setSelection({
          experiment: 'one',
          target: e1Target,
          label: el.dataset.e1InspectLabel ?? E1_INSPECT_CATALOG[e1Target].label,
        });
      }
    };

    page.addEventListener('click', onClick, true);
    return () => page.removeEventListener('click', onClick, true);
  }, [inspectMode, clearSelection]);

  const value = useMemo(
    () => ({
      e1,
      e2,
      e3,
      e4,
      setE1,
      setE2,
      setE3,
      setE4,
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
      selection,
      clearSelection,
      referenceWallpaper,
      toggleReferenceWallpaper,
    }),
    [e1, e2, e3, e4, setE1, setE2, setE3, setE4, resetAll, saves, saveCurrent, loadSave, layoutResetVersion, resetLayoutPositions, inspectMode, hidePanelText, experimentVisible, toggleExperimentVisible, selection, clearSelection, referenceWallpaper, toggleReferenceWallpaper],
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

function experimentTitle(experiment: ExperimentSelection['experiment']) {
  if (experiment === 'one') return 'Experiment One';
  if (experiment === 'two') return 'Experiment Two';
  if (experiment === 'three') return 'Experiment Three';
  return 'Experiment Four';
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
    setE1,
    setE2,
    setE3,
    setE4,
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
    selection,
    clearSelection,
    referenceWallpaper,
    toggleReferenceWallpaper,
  } = useExperimentSetOne();
  const [open, setOpen] = useState(true);

  const e1Highlight = useMemo(() => e1Highlighted(selection), [selection]);
  const e2Highlight = useMemo(() => e2Highlighted(selection), [selection]);
  const e3Highlight = useMemo(() => e3Highlighted(selection), [selection]);
  const e4Highlight = useMemo(() => e4Highlighted(selection), [selection]);
  const note = selectionNote(selection);
  const filtering = selection !== null;
  const visibleE1Fields = useMemo(
    () => fieldsForSelection(E1_SETTING_FIELDS, e1Highlight, selection),
    [selection, e1Highlight],
  );
  const visibleE2Fields = useMemo(
    () => fieldsForSelection(E2_SETTING_FIELDS, e2Highlight, selection),
    [selection, e2Highlight],
  );
  const visibleE3Fields = useMemo(
    () => fieldsForSelection(E3_SETTING_FIELDS, e3Highlight, selection),
    [selection, e3Highlight],
  );
  const contextualE4Fields = useMemo(() => e4FieldsVisibleForSettings(e4), [e4]);
  const visibleE4Fields = useMemo(
    () => fieldsForSelection(contextualE4Fields, e4Highlight, selection),
    [selection, e4Highlight, contextualE4Fields],
  );
  const visibleE1Sections = useMemo(
    () => sectionsForFields(E1_SECTION_ORDER, visibleE1Fields),
    [visibleE1Fields],
  );
  const visibleE2Sections = useMemo(
    () => sectionsForFields(E2_SECTION_ORDER, visibleE2Fields),
    [visibleE2Fields],
  );
  const visibleE3Sections = useMemo(
    () => sectionsForFields(E3_SECTION_ORDER, visibleE3Fields),
    [visibleE3Fields],
  );
  const visibleE4Sections = useMemo(
    () => sectionsForFields(E4_SECTION_ORDER, visibleE4Fields),
    [visibleE4Fields],
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
      ...visibleE3Sections.map((s) => `e3-${s}`),
      ...visibleE4Sections.map((s) => `e4-${s}`),
    ],
    [visibleE1Sections, visibleE2Sections, visibleE3Sections, visibleE4Sections],
  );
  const { isOpen, toggle, openAll, collapseAll } = useFoldableSections(foldableSectionIds, false);

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
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`experiment-one-settings-dock__toggle${experimentVisible[id] ? ' experiment-one-settings-dock__toggle--active' : ''}`}
                onClick={() => toggleExperimentVisible(id)}
                aria-pressed={experimentVisible[id]}
                title={experimentVisible[id] ? `Hide ${label} panels` : `Show ${label} panels`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              className="experiment-one-settings-dock__toggle"
              onClick={saveCurrent}
            >
              Save
            </button>
            {saves.map((save) => (
              <button
                key={save.id}
                type="button"
                className="experiment-one-settings-dock__toggle experiment-one-settings-dock__toggle--save"
                onClick={() => loadSave(save.id)}
                title={`Restore ${save.label} from ${new Date(save.savedAt).toLocaleString()}`}
              >
                {save.label}
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
            {selection ? (
              <div className="experiment-one-settings-dock__selection">
                <span className="experiment-one-settings-dock__selection-label">Inspecting</span>
                <strong className="experiment-one-settings-dock__selection-name">{selection.label}</strong>
                <span className="experiment-one-settings-dock__selection-meta">
                  {relatedCount} settings for this layer
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

            {experimentVisible.one && (!filtering || selection.experiment === 'one') && visibleE1Fields.length > 0 && (
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
                  {sectionFields.map((field) => (
                    <MaterialSettingFieldRow
                      key={`e1-${field.id}`}
                      field={field}
                      value={e1[field.id]}
                      onChange={(v) => setE1(field.id, v as E1MaterialSettings[typeof field.id])}
                      defaultValue={E1_MASTER_DEFAULT[field.id]}
                      resetTargets={fieldResetTargets(
                        E1_MASTER_DEFAULT[field.id],
                        'one',
                        field.id,
                        saves,
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

            {experimentVisible.two && (!filtering || selection.experiment === 'two') && visibleE2Fields.length > 0 && (
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
                  {sectionFields.map((field) => (
                    <MaterialSettingFieldRow
                      key={`e2-${field.id}`}
                      field={field}
                      value={e2[field.id]}
                      onChange={(v) => setE2(field.id, v as E2MaterialSettings[typeof field.id])}
                      defaultValue={E2_MASTER_DEFAULT[field.id]}
                      resetTargets={fieldResetTargets(
                        E2_MASTER_DEFAULT[field.id],
                        'two',
                        field.id,
                        saves,
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

            {experimentVisible.three && (!filtering || selection.experiment === 'three') && visibleE3Fields.length > 0 && (
            <section className="experiment-set-one-dock__experiment">
              {!filtering && (
                <>
                  <h2 className="experiment-set-one-dock__experiment-title">Experiment Three</h2>
                  <p className="experiment-set-one-dock__experiment-desc">
                    Layer A ultra-clear bezel frame, Layer B frosted body inset inside.
                  </p>
                </>
              )}
              {visibleE3Sections.map((section) => {
                const sectionFields = visibleE3Fields.filter((field) => field.section === section);
                if (sectionFields.length === 0) return null;
                return (
                <MaterialSettingCollapsibleSection
                  key={`e3-${section}`}
                  id={`e3-${section}`}
                  title={section}
                  count={sectionFields.length}
                  open={isOpen(`e3-${section}`)}
                  onToggle={toggle}
                  titleClassName="experiment-one-settings-dock__section-title"
                  fieldsClassName="experiment-one-settings-dock__fields"
                >
                  {sectionFields.map((field) => (
                    <MaterialSettingFieldRow
                      key={`e3-${field.id}`}
                      field={field}
                      value={e3[field.id as keyof E3MaterialSettings]}
                      onChange={(v) => setE3(field.id as keyof E3MaterialSettings, v as E3MaterialSettings[keyof E3MaterialSettings])}
                      defaultValue={E3_MASTER_DEFAULT[field.id as keyof E3MaterialSettings]}
                      resetTargets={fieldResetTargets(
                        E3_MASTER_DEFAULT[field.id as keyof E3MaterialSettings],
                        'three',
                        field.id,
                        saves,
                      )}
                      onResetTo={(v) =>
                        setE3(field.id as keyof E3MaterialSettings, v as E3MaterialSettings[keyof E3MaterialSettings])
                      }
                      classPrefix="e2"
                      highlighted={false}
                    />
                  ))}
                </MaterialSettingCollapsibleSection>
                );
              })}
            </section>
            )}

            {experimentVisible.four && (!filtering || selection.experiment === 'four') && visibleE4Fields.length > 0 && (
            <section className="experiment-set-one-dock__experiment">
              {!filtering && (
                <>
                  <h2 className="experiment-set-one-dock__experiment-title">Experiment Four</h2>
                  <p className="experiment-set-one-dock__experiment-desc">
                    Save 2 materials + reference left-panel sizing with diagonal opposite-corner highlights.
                  </p>
                </>
              )}
              {visibleE4Sections.map((section) => {
                const sectionFields = visibleE4Fields.filter((field) => field.section === section);
                if (sectionFields.length === 0) return null;
                return (
                <MaterialSettingCollapsibleSection
                  key={`e4-${section}`}
                  id={`e4-${section}`}
                  title={section}
                  count={sectionFields.length}
                  open={isOpen(`e4-${section}`)}
                  onToggle={toggle}
                  titleClassName="experiment-one-settings-dock__section-title"
                  fieldsClassName="experiment-one-settings-dock__fields"
                >
                  {sectionFields.map((field) => (
                    <MaterialSettingFieldRow
                      key={`e4-${field.id}`}
                      field={field}
                      value={e4[field.id as keyof E4MaterialSettings]}
                      onChange={(v) => setE4(field.id as keyof E4MaterialSettings, v as E4MaterialSettings[keyof E4MaterialSettings])}
                      defaultValue={E4_MASTER_DEFAULT[field.id as keyof E4MaterialSettings]}
                      resetTargets={fieldResetTargets(
                        E4_MASTER_DEFAULT[field.id as keyof E4MaterialSettings],
                        'four',
                        field.id,
                        saves,
                      )}
                      onResetTo={(v) =>
                        setE4(field.id as keyof E4MaterialSettings, v as E4MaterialSettings[keyof E4MaterialSettings])
                      }
                      classPrefix="e2"
                      highlighted={false}
                    />
                  ))}
                </MaterialSettingCollapsibleSection>
                );
              })}
            </section>
            )}
          </div>
        )}
      </div>
    </ExperimentOneDraggableShell>
  );
}
