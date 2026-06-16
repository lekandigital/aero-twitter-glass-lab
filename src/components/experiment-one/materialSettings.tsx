import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ExperimentOneDraggableShell } from './primitives';
import { MaterialSettingCollapsibleSection } from '../shared/MaterialSettingCollapsibleSection';
import { MaterialSettingFieldRow, type MaterialFieldBase } from '../shared/MaterialSettingControl';
import { consumeClickAfterHoldDrag } from '../shared/useHoldDrag';
import { orderedSections, sectionFieldCount } from '../shared/materialSettingGroups';
import { useFoldableSections } from '../shared/useFoldableSections';
import {
  buildFrostSurfaceProfileFields,
  frostSurfaceProfileCssVars,
  frostSurfaceProfileDefaults,
  pickFrostSurfaceProfile,
} from '../shared/frostSurfaceFinish';

/* Experiment 1 — Material settings */

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

export type E1MaterialSettings = {
  colorCyan: string;
  colorBlue: string;
  colorDeep: string;
  transparency: number;
  frost: number;
  frostMatte: number;
  frostMatteTexture: number;
  frostGloss: number;
  frostSurfaceRegion: number;
  frostSurfacePeak: number;
  frostSurfaceSpread: number;
  frostSurfaceFadeEnd: number;
  frostSurfaceSoftness: number;
  frostSurfaceDirection: number;
  saturate: number;
  brightness: number;
  cornerRadius: number;
  fillTop: number;
  fillMid: number;
  fillBottom: number;
  bodyTint: number;
  rim: number;
  rimBorder: number;
  innerBevel: number;
  topShine: number;
  topRadial: number;
  shineOpacity: number;
  diagonalGloss: number;
  depth: number;
  innerDepth: number;
  outerShadow: number;
  shadowSpread: number;
  glow: number;
  refraction: number;
  sparkle: number;
  showSparkles: boolean;
};

export const E1_DEFAULT_SETTINGS: E1MaterialSettings = {
  colorCyan: '#7ee8ff',
  colorBlue: '#2d8ee8',
  colorDeep: '#0a4a9a',
  transparency: 68,
  frost: 5,
  frostMatte: 0,
  frostMatteTexture: 160,
  frostGloss: 0,
  ...frostSurfaceProfileDefaults(),
  saturate: 130,
  brightness: 104,
  cornerRadius: 28,
  fillTop: 38,
  fillMid: 18,
  fillBottom: 14,
  bodyTint: 5,
  rim: 88,
  rimBorder: 62,
  innerBevel: 42,
  topShine: 55,
  topRadial: 45,
  shineOpacity: 92,
  diagonalGloss: 42,
  depth: 72,
  innerDepth: 32,
  outerShadow: 38,
  shadowSpread: 56,
  glow: 28,
  refraction: 22,
  sparkle: 100,
  showSparkles: true,
};

export type E1InspectTarget =
  | 'panel'
  | 'panel-rim'
  | 'panel-bevel'
  | 'panel-shine'
  | 'panel-refraction'
  | 'panel-sparkle';

type SettingField = MaterialFieldBase<keyof E1MaterialSettings> & {
  when?: (settings: Record<string, unknown>) => boolean;
};

export const E1_SETTING_FIELDS: SettingField[] = [
  { id: 'colorCyan', label: 'Cyan accent', dataType: 'color', section: 'Palette' },
  { id: 'colorBlue', label: 'Blue', dataType: 'color', section: 'Palette' },
  { id: 'colorDeep', label: 'Deep blue', dataType: 'color', section: 'Palette' },

  { id: 'transparency', label: 'Transparency', dataType: 'number', section: 'Background', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'frost', label: 'Frost blur', dataType: 'number', section: 'Background', min: 0, max: 40, step: 1, unit: 'px' },
  { id: 'frostMatte', label: 'Frost matte', dataType: 'number', section: 'Background', min: 0, max: 100, step: 1, unit: '%', hint: 'Diffuse matte tooth on the frost — dulls the surface without harsh grain.' },
  { id: 'frostMatteTexture', label: 'Matte texture', dataType: 'number', section: 'Background', min: 80, max: 320, step: 4, unit: 'px', hint: 'Scale of the matte micro-texture. Larger = softer, more velvety.' },
  { id: 'frostGloss', label: 'Frost gloss', dataType: 'number', section: 'Background', min: 0, max: 100, step: 1, unit: '%', hint: 'Oily specular sheen on the same region — like light on a matte surface wiped with oil.' },
  ...(buildFrostSurfaceProfileFields('', 'Background') as SettingField[]),
  { id: 'saturate', label: 'Saturation', dataType: 'number', section: 'Background', min: 80, max: 220, step: 1, unit: '%' },
  { id: 'brightness', label: 'Brightness', dataType: 'number', section: 'Background', min: 80, max: 140, step: 1, unit: '%' },

  { id: 'cornerRadius', label: 'Corner radius', dataType: 'number', section: 'Shape', min: 8, max: 48, step: 1, unit: 'px' },

  { id: 'fillTop', label: 'Top fill', dataType: 'number', section: 'Surface', min: 0, max: 80, step: 1, unit: '%' },
  { id: 'fillMid', label: 'Mid fill', dataType: 'number', section: 'Surface', min: 0, max: 60, step: 1, unit: '%' },
  { id: 'fillBottom', label: 'Bottom fill', dataType: 'number', section: 'Surface', min: 0, max: 60, step: 1, unit: '%' },
  { id: 'bodyTint', label: 'Body cyan tint', dataType: 'number', section: 'Surface', min: 0, max: 30, step: 1, unit: '%' },

  { id: 'rim', label: 'Rim strength', dataType: 'number', section: 'Bezel', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'rimBorder', label: 'Border opacity', dataType: 'number', section: 'Bezel', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'innerBevel', label: 'Inner bevel', dataType: 'number', section: 'Bezel', min: 0, max: 100, step: 1, unit: '%' },

  { id: 'topShine', label: 'Top radial shine', dataType: 'number', section: 'Reflection', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'topRadial', label: 'Top white radial', dataType: 'number', section: 'Reflection', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'diagonalGloss', label: 'Diagonal gloss', dataType: 'number', section: 'Reflection', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'shineOpacity', label: 'Shine layer opacity', dataType: 'number', section: 'Reflection', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'sparkle', label: 'Sparkle intensity', dataType: 'number', section: 'Reflection', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'showSparkles', label: 'Show sparkles', dataType: 'boolean', section: 'Reflection' },

  { id: 'depth', label: 'Depth strength', dataType: 'number', section: 'Depth', min: 0, max: 100, step: 1, unit: '%' },
  { id: 'innerDepth', label: 'Inner bottom depth', dataType: 'number', section: 'Depth', min: 0, max: 80, step: 1, unit: '%' },
  { id: 'outerShadow', label: 'Outer shadow', dataType: 'number', section: 'Depth', min: 0, max: 80, step: 1, unit: '%' },
  { id: 'shadowSpread', label: 'Shadow spread', dataType: 'number', section: 'Depth', min: 8, max: 80, step: 1, unit: 'px' },
  { id: 'glow', label: 'Outer glow', dataType: 'number', section: 'Depth', min: 0, max: 80, step: 1, unit: '%' },

  { id: 'refraction', label: 'Edge refraction', dataType: 'number', section: 'Refraction', min: 0, max: 100, step: 1, unit: '%' },
];

const palette: (keyof E1MaterialSettings)[] = ['colorCyan', 'colorBlue', 'colorDeep'];

export const E1_INSPECT_CATALOG: Record<
  E1InspectTarget,
  { label: string; fields: (keyof E1MaterialSettings)[]; note?: string }
> = {
  panel: {
    label: 'Glass panel',
    fields: [
      'transparency', 'frost', 'frostMatte', 'frostMatteTexture', 'frostGloss', 'saturate', 'brightness', 'cornerRadius',
      'fillTop', 'fillMid', 'fillBottom', 'bodyTint',
      'rim', 'rimBorder', 'depth', 'innerDepth', 'outerShadow', 'shadowSpread', 'glow',
      ...palette,
    ],
  },
  'panel-rim': {
    label: 'Outer rim layer',
    fields: ['rim', 'rimBorder', 'topRadial', 'depth', ...palette],
  },
  'panel-bevel': {
    label: 'Inner bevel layer',
    fields: ['innerBevel', 'rim', 'depth', ...palette],
  },
  'panel-shine': {
    label: 'Shine / gloss layer',
    fields: ['topShine', 'topRadial', 'diagonalGloss', 'shineOpacity', 'rim', ...palette],
  },
  'panel-refraction': {
    label: 'Refraction layer',
    fields: ['refraction', 'rim', ...palette],
  },
  'panel-sparkle': {
    label: 'Sparkle glints',
    fields: ['sparkle', 'showSparkles', ...palette],
  },
};

export function isE1InspectTarget(value: string): value is E1InspectTarget {
  return value in E1_INSPECT_CATALOG;
}

export function e1InspectAttrs(target: E1InspectTarget, label?: string) {
  return {
    'data-e1-inspect': target,
    'data-e1-inspect-label': label ?? E1_INSPECT_CATALOG[target].label,
  };
}

const pct = (n: number) => n / 100;

export function e1SettingsToCssVars(s: E1MaterialSettings): CSSProperties {
  const fillOpacity = 1 - s.transparency / 100;
  return {
    '--e1-cyan': s.colorCyan,
    '--e1-blue': s.colorBlue,
    '--e1-deep': s.colorDeep,
    '--e1-radius': `${s.cornerRadius}px`,
    '--e1-transparency': fillOpacity,
    '--e1-frost': `${s.frost}px`,
    ...frostSurfaceProfileCssVars(pickFrostSurfaceProfile(s as Record<string, unknown>, ''), '--e1'),
    '--e1-saturate': `${s.saturate}%`,
    '--e1-brightness': `${s.brightness}%`,
    '--e1-fill-top': pct(s.fillTop),
    '--e1-fill-mid': pct(s.fillMid),
    '--e1-fill-bottom': pct(s.fillBottom),
    '--e1-body-tint': pct(s.bodyTint),
    '--e1-rim-strength': pct(s.rim),
    '--e1-rim-border': pct(s.rimBorder),
    '--e1-inner-bevel': pct(s.innerBevel),
    '--e1-top-shine': pct(s.topShine),
    '--e1-top-radial': pct(s.topRadial),
    '--e1-diagonal-gloss': pct(s.diagonalGloss),
    '--e1-shine-opacity': pct(s.shineOpacity),
    '--e1-depth-strength': pct(s.depth),
    '--e1-inner-depth': pct(s.innerDepth),
    '--e1-outer-shadow': pct(s.outerShadow),
    '--e1-shadow-spread': `${s.shadowSpread}px`,
    '--e1-glow': pct(s.glow),
    '--e1-refraction': pct(s.refraction),
    '--e1-sparkle': pct(s.sparkle),
  } as CSSProperties;
}

type E1ContextValue = {
  settings: E1MaterialSettings;
  setSetting: <K extends keyof E1MaterialSettings>(id: K, value: E1MaterialSettings[K]) => void;
  resetSettings: () => void;
  inspectMode: boolean;
  setInspectMode: (on: boolean) => void;
  selection: { target: E1InspectTarget; label: string } | null;
  clearSelection: () => void;
};

const E1MaterialContext = createContext<E1ContextValue | null>(null);

export function useE1MaterialSettings() {
  const ctx = useContext(E1MaterialContext);
  if (!ctx) throw new Error('useE1MaterialSettings must be used within E1MaterialSettingsProvider');
  return ctx;
}

export function E1MaterialSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<E1MaterialSettings>(E1_DEFAULT_SETTINGS);
  const [inspectMode, setInspectMode] = useState(true);
  const [selection, setSelection] = useState<{ target: E1InspectTarget; label: string } | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const selectedElRef = useRef<HTMLElement | null>(null);
  const style = useMemo(() => e1SettingsToCssVars(settings), [settings]);

  const setSetting = useCallback(<K extends keyof E1MaterialSettings>(id: K, value: E1MaterialSettings[K]) => {
    setSettings((prev) => ({ ...prev, [id]: value }));
  }, []);

  const resetSettings = useCallback(() => setSettings(E1_DEFAULT_SETTINGS), []);

  const clearSelection = useCallback(() => {
    selectedElRef.current?.classList.remove('e1-inspect-selected');
    selectedElRef.current = null;
    setSelection(null);
  }, []);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !inspectMode) return;

    const onClick = (event: MouseEvent) => {
      if (consumeClickAfterHoldDrag()) return;
      if ((event.target as HTMLElement).closest('.experiment-one-settings-dock')) return;

      const el = (event.target as HTMLElement).closest('[data-e1-inspect]') as HTMLElement | null;
      if (!el) {
        clearSelection();
        return;
      }

      const rawTarget = el.dataset.e1Inspect;
      if (!rawTarget || !isE1InspectTarget(rawTarget)) return;

      event.preventDefault();
      event.stopPropagation();

      selectedElRef.current?.classList.remove('e1-inspect-selected');
      el.classList.add('e1-inspect-selected');
      selectedElRef.current = el;

      setSelection({
        target: rawTarget,
        label: el.dataset.e1InspectLabel ?? E1_INSPECT_CATALOG[rawTarget].label,
      });
    };

    page.addEventListener('click', onClick, true);
    return () => page.removeEventListener('click', onClick, true);
  }, [inspectMode, clearSelection]);

  const value = useMemo(
    () => ({ settings, setSetting, resetSettings, inspectMode, setInspectMode, selection, clearSelection }),
    [settings, setSetting, resetSettings, inspectMode, selection, clearSelection],
  );

  return (
    <E1MaterialContext.Provider value={value}>
      <div
        ref={pageRef}
        className="experiment-one-page"
        style={style}
        data-e1-show-sparkles={settings.showSparkles}
        data-e1-inspect-mode={inspectMode}
      >
        {children}
      </div>
    </E1MaterialContext.Provider>
  );
}

function highlightedFieldIds(selection: { target: E1InspectTarget; label: string } | null) {
  if (!selection) return null;
  return new Set(E1_INSPECT_CATALOG[selection.target].fields);
}

export function ExperimentOneSettingsDock() {
  const { settings, setSetting, resetSettings, inspectMode, setInspectMode, selection, clearSelection } =
    useE1MaterialSettings();
  const [open, setOpen] = useState(true);
  const allFields = E1_SETTING_FIELDS;
  const sections = useMemo(() => orderedSections(allFields, E1_SECTION_ORDER), []);
  const highlighted = useMemo(() => highlightedFieldIds(selection), [selection]);
  const selectionNote = selection ? E1_INSPECT_CATALOG[selection.target].note : undefined;
  const relatedCount = highlighted?.size ?? 0;
  const sectionIds = useMemo(() => sections.map((section) => section), [sections]);
  const { isOpen, toggle, openAll, collapseAll } = useFoldableSections(sectionIds, false);

  return (
    <ExperimentOneDraggableShell
      className="experiment-one-settings-dock"
      dragHandleSelector=".experiment-one-settings-dock__header"
      dragExcludeSelector="button, input, textarea, select, .experiment-one-settings-dock__body, .mat-setting-control"
      initialPosition={{ x: 20, y: 96 }}
      bounds="viewport"
      ariaLabel="Material settings"
    >
      <div className={`experiment-one-settings-dock__shell${open ? '' : ' experiment-one-settings-dock__shell--collapsed'}`}>
        <header className="experiment-one-settings-dock__header">
          <div className="experiment-one-settings-dock__drag-handle" title="Drag settings panel">
            <span className="experiment-one-settings-dock__grip" aria-hidden="true" />
            <span className="experiment-one-settings-dock__title">
              Experiment Set 1 settings
              <span className="experiment-one-settings-dock__title-meta">{allFields.length} total</span>
            </span>
          </div>
          <div className="experiment-one-settings-dock__header-actions">
            <button type="button" className={`experiment-one-settings-dock__toggle${inspectMode ? ' experiment-one-settings-dock__toggle--active' : ''}`} onClick={() => setInspectMode(!inspectMode)} aria-pressed={inspectMode}>Inspect</button>
            {selection && <button type="button" className="experiment-one-settings-dock__toggle" onClick={clearSelection}>Clear</button>}
            <button type="button" className="experiment-one-settings-dock__toggle" onClick={collapseAll}>Collapse</button>
            <button type="button" className="experiment-one-settings-dock__toggle" onClick={openAll}>Expand</button>
            <button type="button" className="experiment-one-settings-dock__toggle" onClick={resetSettings}>Reset</button>
            <button type="button" className="experiment-one-settings-dock__toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>{open ? 'Hide' : 'Show'}</button>
          </div>
        </header>

        {open && (
          <div id="experiment-one-settings-body" className="experiment-one-settings-dock__body">
            {selection ? (
              <div className="experiment-one-settings-dock__selection">
                <span className="experiment-one-settings-dock__selection-label">Inspecting</span>
                <strong className="experiment-one-settings-dock__selection-name">{selection.label}</strong>
                <span className="experiment-one-settings-dock__selection-meta">
                  {relatedCount} related · {allFields.length} total visible
                </span>
              </div>
            ) : (
              <p className="experiment-one-settings-dock__hint">
                {inspectMode
                  ? 'All material settings are listed below. Click a layer to highlight its related values.'
                  : 'Enable Inspect, then click a layer to highlight related settings.'}
              </p>
            )}
            {selectionNote && <p className="experiment-one-settings-dock__note">{selectionNote}</p>}

            {sections.map((section) => {
              const sectionFields = allFields.filter((field) => field.section === section);
              return (
                <MaterialSettingCollapsibleSection
                  key={section}
                  id={section}
                  title={section}
                  count={sectionFieldCount(allFields, section)}
                  open={isOpen(section)}
                  onToggle={toggle}
                  titleClassName="experiment-one-settings-dock__section-title"
                  fieldsClassName="experiment-one-settings-dock__fields"
                >
                  {sectionFields.map((field) => (
                    <MaterialSettingFieldRow
                      key={field.id}
                      field={field}
                      value={settings[field.id]}
                      onChange={(v) => setSetting(field.id, v as E1MaterialSettings[typeof field.id])}
                      defaultValue={E1_DEFAULT_SETTINGS[field.id]}
                      onReset={() => setSetting(field.id, E1_DEFAULT_SETTINGS[field.id])}
                      classPrefix="e1"
                      highlighted={highlighted?.has(field.id) ?? false}
                    />
                  ))}
                </MaterialSettingCollapsibleSection>
              );
            })}
          </div>
        )}
      </div>
    </ExperimentOneDraggableShell>
  );
}
