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
  e4LayerBDimensionStyle,
  e4RadialLayoutAttr,
  e4SettingsToCssVars,
  isE4InspectTarget,
  normalizeE4MaterialSettings,
  patchE4LayoutField,
  type E4InspectTarget,
  type E4MaterialSettings,
} from '../experiment-set-four/materialSettings';
import { GlassFrostSurface } from '../shared/GlassFrostSurface';
import { PwzzovOGlassCorners, pwzzovBackdropReflexEnabled } from '../shared/PwzzovOGlassCorners';
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
import {
  sectionsForLayerMode,
  foldableSectionId,
  augmentFieldsWithLayerLayout,
  isTopLayerEditMode,
  type LayerEditMode,
} from '../shared/layerEditMode';
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
  type ExperimentSetOneLayoutSnapshot,
  type ExperimentSetOneSnapshot,
} from './savedConfigs';
import { applyReferenceCornerLighting, REFERENCE_CORNER_PRESET_VERSION } from '../experiment-set-four/referenceCornerLighting';
import {
  E5_BORDER_REFINEMENTS_VERSION,
  refineExperimentFivePanels,
} from '../experiment-set-five/borderCornerRefinements';
import { clearAllExperimentSetOnePositions, EXPERIMENT_SET_ONE_POSITION_KEYS, saveDragPosition } from './dragPositions';
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
import {
  applyExperimentElevenPanelGeometry,
  normalizeExperimentElevenPanelGeometry,
  seedExperimentElevenPanelGeometry,
} from './experimentElevenPanelGeometry';
import {
  EXPERIMENT_ELEVEN_LAYER_C_LAYOUT,
  applyExperimentElevenLayerCLayout,
  experimentElevenLayerCDisplayMaterial,
  experimentElevenLayerCLayoutFromMaterial,
  type ExperimentElevenLayerCLayoutSettings,
} from './experimentElevenLayerCMaterial';
import { ExperimentElevenLayerCSwitcherGlass } from './ExperimentElevenLayerCSwitcherGlass';
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
  E6_LAYER_C_LAYOUT_SECTION,
  E6_LAYER_C_LAYOUT_FIELDS,
  e6SectionOrderForLayerC,
  experimentSixLayerCLayoutCentered,
  experimentSixLayerCMaxHeight,
  experimentSixLayerCMaxWidth,
  normalizeE6LayerCLayout,
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
  | { experiment: 'ten'; target: E4InspectTarget; label: string }
  | { experiment: 'eleven'; target: E4InspectTarget | E6LayerCInspectTarget; label: string };

const EXPERIMENT_ORDER: ExperimentId[] = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];

/**
 * The id used for variant-group / manifest lookup.
 *
 * `sourceSaveId` means ONE thing: "this save is a derived panel of another save
 * and inherits that source's variant-group membership" (e.g. the scope-six/seven
 * derived panels 133–158 inherit showcase saves 20/22/… ). It is NOT a dedupe or
 * uniqueness device — saves are unique by `id` (see dedupeSnapshots). Never set
 * `sourceSaveId` to a save's own id; that carries no meaning.
 */
function catalogSaveId(save: { id: number; sourceSaveId?: number }) {
  return save.sourceSaveId ?? save.id;
}

function e4DockExperiment(activeExperiment: ExperimentId): 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten' | 'eleven' {
  if (activeExperiment === 'five' || activeExperiment === 'six' || activeExperiment === 'seven' || activeExperiment === 'eight' || activeExperiment === 'nine' || activeExperiment === 'ten' || activeExperiment === 'eleven') {
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

function parseSelectionKey(key: string): { branchSlug: string | null; id: number } {
  const colonIndex = key.lastIndexOf(':');
  if (colonIndex === -1) return { branchSlug: null, id: Number(key) };
  const branchPart = key.slice(0, colonIndex);
  const idPart = Number(key.slice(colonIndex + 1));
  return { branchSlug: branchPart === 'base' ? null : branchPart, id: idPart };
}

function renderVariantLabel(branchSlug: string | null | undefined): string | null {
  if (!branchSlug) return null;
  return RENDER_VARIANTS.find((variant) => variant.slug === branchSlug)?.label ?? branchSlug;
}

function displayVariantGroupLabel(variant: { slug: string; label: string }, experiment: ExperimentId): string {
  if (experiment === 'eleven' && variant.slug === 'center-overlap-pane') return 'Right Overlap Pane';
  return variant.label;
}

function saveMatchesSelection(
  snapshot: ExperimentSetOneSnapshot,
  branchSlug: string | null,
): boolean {
  if (!branchSlug) return true;
  if (snapshot.branchVariant === branchSlug) return true;
  const variant = RENDER_VARIANTS.find((candidate) => candidate.slug === branchSlug);
  return variant?.saveIds.includes(snapshot.sourceSaveId ?? snapshot.id) ?? false;
}

function formatSaveLabel(
  snapshot: ExperimentSetOneSnapshot | undefined,
  branchSlug: string | null,
): string | null {
  if (!snapshot) return null;
  const variantLabel = renderVariantLabel(branchSlug);
  return variantLabel ? `${snapshot.label} (${variantLabel})` : snapshot.label;
}

function formatLayoutSummary(snapshot: ExperimentSetOneSnapshot): string | null {
  const experimentCount = snapshot.selectedExperimentIds?.length ?? 0;
  const saveCount = Object.values(snapshot.selectedSaveKeysByExperiment ?? {}).reduce(
    (count, keys) => count + (keys?.length ?? 0),
    0,
  );
  const orderCount = snapshot.selectedSaveVisualOrder?.length ?? 0;
  const hasPositions = Object.keys(snapshot.selectedSavePositions ?? {}).length > 0;
  if (experimentCount === 0 && saveCount === 0 && orderCount === 0 && !hasPositions) return null;

  const parts: string[] = [];
  if (experimentCount > 0) parts.push(`${experimentCount} experiments`);
  if (saveCount > 0) parts.push(`${saveCount} saves`);
  if (orderCount > 0) parts.push(`z-order ${orderCount}`);
  if (hasPositions) parts.push('xy saved');
  return parts.join(' · ');
}

function formatSavePlacement(
  position: { x: number; y: number } | undefined,
  zIndex: number | null,
): string | null {
  if (!position && zIndex == null) return null;
  const parts: string[] = [];
  if (position) parts.push(`x ${Math.round(position.x)}`, `y ${Math.round(position.y)}`);
  if (zIndex != null) parts.push(`z ${zIndex}`);
  return parts.join(' · ');
}

function elevenSaveLayerCMaterial(save: ExperimentSetOneSnapshot): E4MaterialSettings | null {
  if (!save.e4) return null;
  const material = experimentElevenLayerCDisplayMaterial(normalizeE4MaterialSettings(save.e4), save.e11LayerC);
  return save.e11LayerCLayout ? applyExperimentElevenLayerCLayout(material, save.e11LayerCLayout) : material;
}

function ElevenSaveLayerCPreview({ save }: { save: ExperimentSetOneSnapshot }) {
  const material = elevenSaveLayerCMaterial(save);
  if (!material) return null;

  return (
    <div className="experiment-one-settings-dock__save-chip-preview" aria-hidden="true">
      {save.e11LayerCReferenceGlass === 'thick-lens' ? (
        <div
          className="experiment-one-settings-dock__save-chip-preview-surface"
          style={{
            width: material.layerBWidth as number,
            height: material.layerBHeight as number,
            borderRadius: material.layerBCornerRadius as number,
            position: 'relative',
            transform: 'scale(0.18)',
            transformOrigin: 'top left',
            background: 'rgba(220, 244, 255, 0.08)',
            boxShadow: 'inset 0 0 0 2px rgba(235, 250, 255, 0.72), 0 3px 14px rgba(0,0,0,0.1)',
          }}
        />
      ) : save.e11LayerCReferenceGlass ? (
        <div
          className="experiment-one-settings-dock__save-chip-preview-surface"
          style={{
            position: 'relative',
            transform: 'scale(0.18)',
            transformOrigin: 'top left',
          }}
        >
          <ExperimentElevenLayerCSwitcherGlass
            variant={save.e11LayerCReferenceGlass}
            width={material.layerBWidth as number}
            height={material.layerBHeight as number}
            radius={material.layerBCornerRadius as number}
            tone={save.e11LayerCReferenceTone}
          />
        </div>
      ) : (
        <div
          className="experiment-four-layer-b experiment-eleven-layer-c experiment-one-settings-dock__save-chip-preview-surface"
          style={{
            ...e4SettingsToCssVars(material),
            ...e4LayerBDimensionStyle(material, false),
            position: 'relative',
            transform: 'scale(0.18)',
            transformOrigin: 'top left',
          }}
        >
          <span className="experiment-four-layer-b__rim-edge experiment-four-layer-b__rim-edge--top" aria-hidden="true" />
          <span className="experiment-four-layer-b__rim-edge experiment-four-layer-b__rim-edge--bottom" aria-hidden="true" />
          <span className="experiment-four-layer-b__rim-side experiment-four-layer-b__rim-side--left" aria-hidden="true" />
          <span className="experiment-four-layer-b__rim-side experiment-four-layer-b__rim-side--right" aria-hidden="true" />
          <GlassFrostSurface />
          <span className="experiment-four-layer-b__shine" aria-hidden="true" />
          <span className="experiment-four-layer-b__radial-corners" aria-hidden="true" />
          <PwzzovOGlassCorners
            layerClass="experiment-four-layer-b"
            inspectTarget="layer-b-corners"
            edgeReflexEnabled={pwzzovBackdropReflexEnabled(material.layerBGlassReflexMode, [
              material.layerBGlassReflexTlLight,
              material.layerBGlassReflexTlDark,
              material.layerBGlassReflexTrLight,
              material.layerBGlassReflexTrDark,
              material.layerBGlassReflexBlLight,
              material.layerBGlassReflexBlDark,
              material.layerBGlassReflexBrLight,
              material.layerBGlassReflexBrDark,
              material.layerBGlassReflexTopLight,
              material.layerBGlassReflexTopDark,
              material.layerBGlassReflexBottomLight,
              material.layerBGlassReflexBottomDark,
              material.layerBGlassReflexLeftLight,
              material.layerBGlassReflexLeftDark,
              material.layerBGlassReflexRightLight,
              material.layerBGlassReflexRightDark,
            ])}
            rimSideGapTop={material.layerBRimSideGapTop}
            rimSideGapBottom={material.layerBRimSideGapBottom}
            backdropLights={{
              tlLight: material.layerBGlassReflexTlLight,
              trLight: material.layerBGlassReflexTrLight,
              blLight: material.layerBGlassReflexBlLight,
              brLight: material.layerBGlassReflexBrLight,
              topLight: material.layerBGlassReflexTopLight,
              bottomLight: material.layerBGlassReflexBottomLight,
              leftLight: material.layerBGlassReflexLeftLight,
              rightLight: material.layerBGlassReflexRightLight,
            }}
          />
        </div>
      )}
    </div>
  );
}

function experimentShortLabel(experiment: ExperimentId): string {
  return `E${EXPERIMENT_ORDER.indexOf(experiment) + 1}`;
}

function experimentPaneLabel(experiment: ExperimentId): string {
  if (experiment === 'four') return 'left long pane 1';
  if (experiment === 'five') return 'left long pane 2';
  if (experiment === 'six') return 'left short pane';
  if (experiment === 'seven') return 'search pill 1';
  if (experiment === 'eight') return 'search pill 2';
  if (experiment === 'nine') return 'center large pane';
  if (experiment === 'ten') return 'center overlap pane';
  if (experiment === 'eleven') return 'right overlap pane';
  return experimentTitle(experiment);
}

type PanelSetEntry = {
  key: string;
  experiment: string;
  saveLabel: string;
  placement: string | null;
};

function describePanelSetSnapshot(
  snapshot: ExperimentSetOneSnapshot,
  allSaves: ExperimentSetOneSnapshot[],
): PanelSetEntry[] {
  const keysByExperiment = snapshot.selectedSaveKeysByExperiment ?? {};
  const visualOrder = normalizeSelectedSaveVisualOrder(snapshot.selectedSaveVisualOrder, keysByExperiment);
  const instanceKeys = selectedSaveInstanceKeys(keysByExperiment);
  const orderedInstanceKeys = [...instanceKeys].sort(
    (a, b) => {
      const orderA = visualOrder.indexOf(a);
      const orderB = visualOrder.indexOf(b);
      const normalizedA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
      const normalizedB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;
      return normalizedA - normalizedB || a.localeCompare(b);
    },
  );

  return orderedInstanceKeys.flatMap((instanceKey) => {
    const [experiment, selectionKey] = instanceKey.split(':', 2);
    if (!experiment || !selectionKey) return [];
    const parsed = parseSelectionKey(selectionKey);
    const parsedId = Number.isFinite(parsed.id) ? parsed.id : Number(selectionKey.slice(selectionKey.lastIndexOf(':') + 1));
    const save = Number.isFinite(parsedId)
      ? allSaves.find((candidate) => candidate.id === parsedId && saveMatchesSelection(candidate, parsed.branchSlug))
      : undefined;
    const placement = formatSavePlacement(snapshot.selectedSavePositions?.[instanceKey], selectedSaveRosterZIndex(visualOrder, instanceKey));
    return [{
      key: instanceKey,
      experiment: experimentShortLabel(experiment as ExperimentId),
      saveLabel: formatSaveLabel(save, parsed.branchSlug) ?? (Number.isFinite(parsedId) ? `Save ${parsedId}` : selectionKey),
      placement,
    }];
  });
}

function saveVariantGroupLabel(save: ExperimentSetOneSnapshot, experiment: ExperimentId): string {
  const variant = RENDER_VARIANTS.find((candidate) => candidate.saveIds.includes(catalogSaveId(save)));
  if (variant) return displayVariantGroupLabel(variant, experiment);
  return save.scope === 'general' ? 'General' : 'Other saves';
}

function panelSetSummary(entryCount: number): string {
  return entryCount === 1 ? '1 panel' : `${entryCount} panels`;
}

function hasPanelSetLayout(save: ExperimentSetOneSnapshot): boolean {
  const saveCount = Object.values(save.selectedSaveKeysByExperiment ?? {}).reduce(
    (count, keys) => count + (keys?.length ?? 0),
    0,
  );
  const orderCount = save.selectedSaveVisualOrder?.length ?? 0;
  const hasPositions = Object.keys(save.selectedSavePositions ?? {}).length > 0;
  return saveCount > 0 || orderCount > 0 || hasPositions;
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

function selectedSaveRosterZIndex(order: string[], key: string): number | null {
  const index = order.indexOf(key);
  if (index === -1) return null;
  return 30 + order.length - index;
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

/** Returns the saves that are available for a given experiment, applying scope filtering. */
function getScopedSavesForExperiment(
  allSaves: ExperimentSetOneSnapshot[],
  experiment: ExperimentId,
): ExperimentSetOneSnapshot[] {
  if (experiment === 'five')
    return allSaves.filter((s) => s.scope === 'four' || s.scope === 'five' || s.scope === 'general' || s.cornersOnly);
  if (experiment === 'six' || experiment === 'eight')
    return allSaves.filter((s) => s.scope === 'six' || s.scope === 'general' || s.cornersOnly);
  if (experiment === 'seven')
    return allSaves.filter((s) => s.scope === 'seven' || s.scope === 'general' || s.cornersOnly);
  if (experiment === 'four')
    return allSaves.filter((s) => s.scope === 'four' || s.scope === 'general' || s.cornersOnly);
  if (experiment === 'nine')
    return allSaves.filter((s) => s.scope === 'four' || s.scope === 'nine' || s.scope === 'general' || s.cornersOnly);
  if (experiment === 'ten')
    return allSaves.filter(
      (s) => s.scope === 'four' || s.scope === 'nine' || s.scope === 'ten' || s.scope === 'general' || s.cornersOnly,
    );
  if (experiment === 'eleven')
    return allSaves.filter((s) => s.scope === 'eleven' || s.scope === 'general' || s.cornersOnly);
  return allSaves.filter((s) => s.scope === experiment || s.cornersOnly);
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
  e11: E4MaterialSettings;
  e6LayerC: E6LayerCLayoutSettings;
  e11LayerCLayout: ExperimentElevenLayerCLayoutSettings;
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
  setE11: <K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => void;
  setE6LayerC: <K extends keyof E6LayerCLayoutSettings>(id: K, value: E6LayerCLayoutSettings[K]) => void;
  setE11LayerCLayout: <K extends keyof ExperimentElevenLayerCLayoutSettings>(id: K, value: ExperimentElevenLayerCLayoutSettings[K]) => void;
  resetAll: () => void;
  saves: ExperimentSetOneSnapshot[];
  saveCurrent: (layout?: ExperimentSetOneLayoutSnapshot) => void;
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
  layerDVisible: boolean;
  layerEVisible: boolean;
  toggleLayerAVisible: () => void;
  toggleLayerBVisible: () => void;
  toggleLayerCVisible: () => void;
  toggleLayerDVisible: () => void;
  toggleLayerEVisible: () => void;
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
  replaceSaveMultiSelection: (experiment: ExperimentId, fromKey: string, toKey: string) => void;
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
  if (boot.e6LayerC) return normalizeE6LayerCLayout(boot.e6LayerC as Partial<E6LayerCLayoutSettings> & { diameter?: number }, e6);
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

function resolveInitialE11(boot: ExperimentSetOneSession): E4MaterialSettings {
  const selectedSaveId = boot.selectedSaveIdByExperiment?.eleven;
  if (selectedSaveId != null) {
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === selectedSaveId);
    if (snapshot?.e4) {
      return normalizeExperimentElevenPanelGeometry(snapshot.e4 as E4MaterialSettings);
    }
  }
  if (boot.e11) return normalizeExperimentElevenPanelGeometry(boot.e11);
  return seedExperimentElevenPanelGeometry(boot.e10 ?? boot.e9 ?? boot.e4);
}

function resolveInitialE11LayerCLayout(
  boot: ExperimentSetOneSession,
  _e11: E4MaterialSettings,
): ExperimentElevenLayerCLayoutSettings {
  const selectedSaveId = boot.selectedSaveIdByExperiment?.eleven;
  if (selectedSaveId != null) {
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === selectedSaveId);
    if (snapshot?.e11LayerCLayout) return snapshot.e11LayerCLayout;
  }
  if (boot.e11LayerCLayout) return boot.e11LayerCLayout;
  return { ...EXPERIMENT_ELEVEN_LAYER_C_LAYOUT };
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
    boot.selectedSaveIdByExperiment?.eleven ??
    boot.selectedSaveIdByExperiment?.ten ??
    boot.selectedSaveIdByExperiment?.nine ??
    boot.selectedSaveIdByExperiment?.eight ??
    boot.selectedSaveIdByExperiment?.seven ??
    boot.selectedSaveIdByExperiment?.six ??
    boot.selectedSaveIdByExperiment?.five ??
    boot.selectedSaveIdByExperiment?.four;
  if (saveId != null) {
    const snapshot = loadExperimentSetOneSaves().find((save) => save.id === saveId);
    if (snapshot?.branchVariant) return snapshot.branchVariant;
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
  const [e11, setE11State] = useState<E4MaterialSettings>(() => resolveInitialE11(boot));
  const [e6LayerC, setE6LayerCState] = useState<E6LayerCLayoutSettings>(() =>
    resolveInitialE6LayerC(boot, resolveInitialE6(boot)),
  );
  const [e11LayerCLayout, setE11LayerCLayoutState] = useState<ExperimentElevenLayerCLayoutSettings>(() =>
    resolveInitialE11LayerCLayout(boot, resolveInitialE11(boot)),
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
  const [layerDVisible, setLayerDVisible] = useState(boot.layerDVisible !== false);
  const [layerEVisible, setLayerEVisible] = useState(boot.layerEVisible !== false);
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
    eleven: boot.selectedSaveIdByExperiment?.eleven ?? null,
  });
  const [selectedPanelSetSaveId, setSelectedPanelSetSaveId] = useState<number | null>(null);
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
  const latestLayoutSnapshotRef = useRef<ExperimentSetOneLayoutSnapshot>({
    activeExperiment: boot.activeExperiment ?? 'four',
    selectedExperimentIds: normalizeExperimentSelectionIds(boot.selectedExperimentIds, boot.activeExperiment ?? 'four'),
    selectedSaveKeysByExperiment: normalizeSaveSelectionKeys(
      boot.selectedSaveKeysByExperiment,
      boot.selectedSaveIdsByExperiment,
      boot.activeExperiment ?? 'four',
      boot.activeRenderVariant,
    ),
    selectedSaveVisualOrder: normalizeSelectedSaveVisualOrder(
      boot.selectedSaveVisualOrder,
      boot.selectedSaveKeysByExperiment ?? {},
    ),
    selectedSavePositions: boot.selectedSavePositions ?? {},
  });

  useLayoutEffect(() => {
    latestLayoutSnapshotRef.current = {
      activeExperiment,
      selectedExperimentIds,
      selectedSaveKeysByExperiment,
      selectedSaveVisualOrder,
      selectedSavePositions,
    };
  }, [activeExperiment, selectedExperimentIds, selectedSaveKeysByExperiment, selectedSaveVisualOrder, selectedSavePositions]);

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
    if (activeExperiment !== 'four' && activeExperiment !== 'five' && activeExperiment !== 'six' && activeExperiment !== 'seven' && activeExperiment !== 'eight' && activeExperiment !== 'nine' && activeExperiment !== 'ten' && activeExperiment !== 'eleven') return;
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
    if (activeExperiment === 'eleven') {
      setE11State((prev) => {
        setE5State(prev);
        return prev;
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
    if (activeExperiment === 'eleven') setE5State(e11);
  }, [activeExperiment, e11]);

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
                      : activeExperiment === 'eleven'
                        ? e4CssVars(e11)
                      : e4CssVars(e4)),
      }) as CSSProperties,
    [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, activeExperiment, e4CssVars],
  );

  const activeE4Materials = useMemo(() => {
    if (activeExperiment === 'five') return e5;
    if (activeExperiment === 'six') return e6;
    if (activeExperiment === 'seven') return e7;
    if (activeExperiment === 'eight') return e8;
    if (activeExperiment === 'nine') return e9;
    if (activeExperiment === 'ten') return e10;
    if (activeExperiment === 'eleven') return e11;
    return e4;
  }, [activeExperiment, e4, e5, e6, e7, e8, e9, e10, e11]);

  // Semantic bezel style for the active center-overlap (E10) save, so the
  // main stage keys appearance CSS on the style, not on the save's literal id.
  const activeTenBezelStyle = useMemo(() => {
    const tenId = selectedSaveIdByExperiment.ten;
    if (tenId == null) return null;
    return saves.find((save) => save.id === tenId)?.bezelStyle ?? null;
  }, [saves, selectedSaveIdByExperiment.ten]);

  const activeElevenBezelStyle = useMemo(() => {
    const elevenId = selectedSaveIdByExperiment.eleven;
    if (elevenId == null) return null;
    return saves.find((save) => save.id === elevenId)?.bezelStyle ?? null;
  }, [saves, selectedSaveIdByExperiment.eleven]);

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

  const setE11 = useCallback(<K extends keyof E4MaterialSettings>(id: K, value: E4MaterialSettings[K]) => {
    setE11State((prev) => {
      const next = applyExperimentElevenPanelGeometry(patchE4LayoutField(prev, id, value));
      if (activeExperiment === 'eleven') setE5State(next);
      return next;
    });
  }, [activeExperiment]);

  const setE6LayerC = useCallback(
    <K extends keyof E6LayerCLayoutSettings>(id: K, value: E6LayerCLayoutSettings[K]) => {
      setE6LayerCState((prev) => clampE6LayerCLayout({ ...prev, [id]: value }, e6));
    },
    [e6],
  );

  const setE11LayerCLayout = useCallback(
    <K extends keyof ExperimentElevenLayerCLayoutSettings>(
      id: K,
      value: ExperimentElevenLayerCLayoutSettings[K],
    ) => {
      setE11LayerCLayoutState((prev) => {
        const next = { ...prev, [id]: value };
        const width = Math.max(16, Math.round(next.width));
        const height = Math.max(1, Math.round(next.height));
        const radius = Math.min(Math.max(0, Math.round(next.radius)), Math.floor(Math.min(width, height) / 2));
        return { width, height, radius };
      });
    },
    [],
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
    const nextE11 = seedExperimentElevenPanelGeometry(E4_MASTER_DEFAULT);
    setE11State(nextE11);
    setE11LayerCLayoutState({ ...EXPERIMENT_ELEVEN_LAYER_C_LAYOUT });
    setLayerAVisible(true);
    setLayerBVisible(true);
    setLayerCVisible(true);
    setLayerDVisible(true);
    setLayerEVisible(true);
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

  const toggleLayerDVisible = useCallback(() => {
    setLayerDVisible((visible) => !visible);
  }, []);

  const toggleLayerEVisible = useCallback(() => {
    setLayerEVisible((visible) => !visible);
  }, []);

  const saveCurrent = useCallback((layout?: ExperimentSetOneLayoutSnapshot) => {
    const scope = selection ? selection.experiment : activeExperiment;
    const currentE8 = e8;
    const currentE9 = e9;
    const currentE10 = e10;
    const currentE11 = e11;
    const layoutSnapshot = layout ?? latestLayoutSnapshotRef.current;
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
                  : activeExperiment === 'eleven'
                    ? currentE11
                  : e4,
      scope,
      layoutSnapshot,
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
                  : activeExperiment === 'eleven'
                    ? e11
                    : e4,
      layoutSnapshot,
    );
  }, [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, selection, activeExperiment]);

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

      const snapshot = snapshotForLookup;
      const selectionExperiment = snapshot?.activeExperiment ?? activeExperiment;
      setSelectedPanelSetSaveId(snapshot && hasPanelSetLayout(snapshot) ? snapshot.id : null);
      setSelectedSaveIdByExperiment((prev) => ({ ...prev, [selectionExperiment]: id }));
      if (!snapshot) return;
      const normalize = loadedModule?.normalizeE4MaterialSettings ?? normalizeE4MaterialSettings;
      if (snapshot.activeExperiment) {
        setActiveExperiment(snapshot.activeExperiment);
      }
      if (Object.prototype.hasOwnProperty.call(snapshot, 'selectedExperimentIds')) {
        setSelectedExperimentIds(snapshot.selectedExperimentIds ?? []);
      }
      if (Object.prototype.hasOwnProperty.call(snapshot, 'selectedSaveKeysByExperiment')) {
        setSelectedSaveKeysByExperiment(snapshot.selectedSaveKeysByExperiment ?? {});
      }
      if (Object.prototype.hasOwnProperty.call(snapshot, 'selectedSaveVisualOrder')) {
        setSelectedSaveVisualOrder(snapshot.selectedSaveVisualOrder ?? []);
      }
      if (Object.prototype.hasOwnProperty.call(snapshot, 'selectedSavePositions')) {
        setSelectedSavePositions(snapshot.selectedSavePositions ?? {});
      }
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
        else if (activeExperiment === 'eleven') {
          setE11State((prev) => {
            const next = applyExperimentElevenPanelGeometry(applyReferenceCornerLighting(prev));
            setE11LayerCLayoutState({ ...EXPERIMENT_ELEVEN_LAYER_C_LAYOUT });
            return next;
          });
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
          } else if (activeExperiment === 'eleven') {
            const next = applyExperimentElevenPanelGeometry(material);
            setE11State(next);
            setE11LayerCLayoutState({ ...EXPERIMENT_ELEVEN_LAYER_C_LAYOUT });
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
          } else if (activeExperiment === 'ten') {
            setE10State(normalizeExperimentTenPanelGeometry(normalized));
          } else if (activeExperiment === 'eleven') {
            const next = normalizeExperimentElevenPanelGeometry(normalized);
            setE11State(next);
            setE11LayerCLayoutState({ ...EXPERIMENT_ELEVEN_LAYER_C_LAYOUT });
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
      if (snapshot.scope === 'eleven') {
        if (snapshot.e4) {
          const next = normalizeExperimentElevenPanelGeometry(normalize(snapshot.e4));
          setE11State(next);
          setE11LayerCLayoutState(snapshot.e11LayerCLayout ?? { ...EXPERIMENT_ELEVEN_LAYER_C_LAYOUT });
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
        } else if (activeExperiment === 'eleven') {
          const next = applyExperimentElevenPanelGeometry(normalized);
          setE11State(next);
          setE11LayerCLayoutState({ ...EXPERIMENT_ELEVEN_LAYER_C_LAYOUT });
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

  const replaceSaveMultiSelection = useCallback((experiment: ExperimentId, fromKey: string, toKey: string) => {
    const fromInstanceKey = selectedSaveInstanceKey(experiment, fromKey);
    const toInstanceKey = selectedSaveInstanceKey(experiment, toKey);

    setSelectedSaveKeysByExperiment((prev) => {
      const currentKeys = prev[experiment] ?? [];
      const replacedKeys = currentKeys.map((key) => (key === fromKey ? toKey : key));
      const dedupedKeys = Array.from(new Set(replacedKeys));
      const next = { ...prev };
      if (dedupedKeys.length > 0) next[experiment] = dedupedKeys;
      else delete next[experiment];
      return next;
    });

    setSelectedSaveVisualOrder((prev) => {
      const existingIndex = prev.indexOf(fromInstanceKey);
      if (existingIndex === -1) {
        if (prev.includes(toInstanceKey)) return prev;
        return [...prev, toInstanceKey];
      }

      const next = prev.filter((key) => key !== fromInstanceKey && key !== toInstanceKey);
      next.splice(existingIndex, 0, toInstanceKey);
      return next;
    });

    setSelectedSavePositions((prev) => {
      if (!(fromInstanceKey in prev)) return prev;
      const next = { ...prev, [toInstanceKey]: prev[fromInstanceKey] };
      delete next[fromInstanceKey];
      return next;
    });
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
      e6,
      e7,
      e8,
      e9,
      e10,
      e11,
      e6LayerC,
      e11LayerCLayout,
      hidePanelText,
      layerAVisible,
      layerBVisible,
      layerCVisible,
      layerDVisible,
      layerEVisible,
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
  }, [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e6LayerC, e11LayerCLayout, hidePanelText, layerAVisible, layerBVisible, layerCVisible, layerDVisible, layerEVisible, inspectMode, experimentVisible, referenceWallpaper, activeExperiment, selectedSaveIdByExperiment, selectedExperimentIds, selectedSaveKeysByExperiment, saveVisualOrder, selectedSaveVisualOrder, selectedSavePositions, e5BorderRefinementsVersion, activeRenderVariant]);

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
        const e6Experiment =
          el.dataset.e6InspectExperiment === 'eight' || el.dataset.e6InspectExperiment === 'eleven'
            ? el.dataset.e6InspectExperiment
            : 'six';
        flashInspectElement(el, 'four');
        setActiveExperiment(e6Experiment);
        setSelection({
          experiment: e6Experiment,
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
      e11,
      e6LayerC,
      e11LayerCLayout,
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
      setE11,
      setE6LayerC,
      setE11LayerCLayout,
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
      layerDVisible,
      layerEVisible,
      toggleLayerAVisible,
      toggleLayerBVisible,
      toggleLayerCVisible,
      toggleLayerDVisible,
      toggleLayerEVisible,
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
      replaceSaveMultiSelection,
      toggleExperimentMultiSelection,
      toggleSaveMultiSelection,
      referenceWallpaper,
      toggleReferenceWallpaper,
    }),
    [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e6LayerC, e11LayerCLayout, setE1, setE2, setE3, setE4, setE5, setE6, setE7, setE8, setE9, setE10, setE11, setE6LayerC, setE11LayerCLayout, resetAll, saves, saveCurrent, loadSave, layoutResetVersion, resetLayoutPositions, inspectMode, hidePanelText, layerAVisible, layerBVisible, layerCVisible, layerDVisible, layerEVisible, experimentVisible, toggleExperimentVisible, activeExperiment, selectedSaveIdByExperiment, selectedExperimentIds, selectedSaveKeysByExperiment, saveVisualOrder, selectedSaveVisualOrder, selectedSavePositions, selection, clearSelection, clearMultiSelection, queueSaveLoad, cancelQueuedSaveLoad, bringSaveForward, sendSaveBackward, setSelectedSavePosition, replaceSaveMultiSelection, toggleExperimentMultiSelection, toggleSaveMultiSelection, referenceWallpaper, toggleReferenceWallpaper],
  );

  return (
    <ExperimentSetOneContext.Provider value={value}>
      <div
        ref={pageRef}
        className="experiment-set-one-page experiment-one-page"
        style={style}
        data-e1-show-sparkles={e1.showSparkles}
        data-e3-layerb-show-sparkles={e3.layerBShowSparkles}
        data-e4-layerb-show-sparkles={activeE4Materials.layerBShowSparkles}
        data-e4-layerb-nested={activeE4Materials.layerBNestedInA}
        data-e4-layera-radial-layout={e4RadialLayoutAttr(activeE4Materials.layerARadialCornerMode)}
        data-e4-layerb-radial-layout={e4RadialLayoutAttr(activeE4Materials.layerBRadialCornerMode)}
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
        data-e11-visible={experimentVisible.eleven}
        data-e1-inspect-mode={inspectMode}
        data-e2-inspect-mode={inspectMode}
        data-e3-inspect-mode={inspectMode}
        data-e4-inspect-mode={inspectMode}
        data-e5-inspect-mode={inspectMode}
        data-e6-inspect-mode={inspectMode}
        data-e8-inspect-mode={inspectMode}
        data-e9-inspect-mode={inspectMode}
        data-e10-inspect-mode={inspectMode}
        data-e11-inspect-mode={inspectMode}
        data-showcase-align={
          activeExperiment === 'four' ||
          activeExperiment === 'five' ||
          activeExperiment === 'six' ||
          activeExperiment === 'seven' ||
          activeExperiment === 'eight' ||
          activeExperiment === 'nine' ||
          activeExperiment === 'ten' ||
          activeExperiment === 'eleven'
        }
        data-hide-panel-text={hidePanelText ? 'true' : 'false'}
        data-layer-a-visible={layerAVisible ? 'true' : 'false'}
        data-layer-b-visible={layerBVisible ? 'true' : 'false'}
        data-layer-c-visible={layerCVisible ? 'true' : 'false'}
        data-layer-d-visible={layerDVisible ? 'true' : 'false'}
        data-layer-e-visible={layerEVisible ? 'true' : 'false'}
        data-render-variant={activeRenderVariant ?? ''}
        data-selected-save-four={selectedSaveIdByExperiment.four ?? ''}
        data-selected-save-five={selectedSaveIdByExperiment.five ?? ''}
        data-selected-save-eight={selectedSaveIdByExperiment.eight ?? ''}
        data-selected-save-nine={selectedSaveIdByExperiment.nine ?? ''}
        data-selected-save-ten={selectedSaveIdByExperiment.ten ?? ''}
        data-selected-save-eleven={selectedSaveIdByExperiment.eleven ?? ''}
        data-selected-panel-set-save-id={selectedPanelSetSaveId ?? ''}
        data-e10-bezel-style={activeTenBezelStyle ?? undefined}
        data-e11-bezel-style={activeElevenBezelStyle ?? undefined}
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
      selection.experiment !== 'eight' &&
      selection.experiment !== 'nine' &&
      selection.experiment !== 'ten' &&
      selection.experiment !== 'eleven')
  ) {
    return null;
  }
  if (
    (selection.experiment === 'six' ||
      selection.experiment === 'eight' ||
      selection.experiment === 'eleven') &&
    isE6LayerCInspectTarget(selection.target)
  ) return null;
  return new Set(E4_INSPECT_CATALOG[selection.target as E4InspectTarget].fields);
}

function e6Highlighted(selection: ExperimentSelection | null) {
  if (
    !selection ||
    (selection.experiment !== 'six' &&
      selection.experiment !== 'eight' &&
      selection.experiment !== 'eleven')
  ) return e4Highlighted(selection);
  if (isE6LayerCInspectTarget(selection.target)) {
    const fields =
      selection.experiment === 'eleven'
        ? new Set<string>(['width', 'height', 'radius'])
        : new Set(E4_INSPECT_CATALOG['layer-b'].fields);
    if (selection.experiment !== 'eleven') {
      fields.delete('layerBWidth');
      fields.delete('layerBHeight');
      fields.delete('layerBCornerRadius');
      for (const field of E6_LAYER_C_LAYOUT_FIELDS) fields.add(field.id);
    }
    return fields;
  }
  return e4Highlighted(selection);
}

function selectionNote(selection: ExperimentSelection | null) {
  if (!selection) return undefined;
  if (selection.experiment === 'one') return E1_INSPECT_CATALOG[selection.target].note;
  if (selection.experiment === 'two') return E2_INSPECT_CATALOG[selection.target].note;
  if (selection.experiment === 'three') return E3_INSPECT_CATALOG[selection.target].note;
  if (
    (selection.experiment === 'six' ||
      selection.experiment === 'eight' ||
      selection.experiment === 'eleven') &&
    isE6LayerCInspectTarget(selection.target)
  ) return undefined;
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
  if (experiment === 'eleven') return 'Experiment Eleven';
  return 'Experiment Nine';
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
  experiment: 'one' | 'two' | 'three' | 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten' | 'eleven',
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
    e11,
    e6LayerC,
    e11LayerCLayout,
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
    setE11,
    setE6LayerC,
    setE11LayerCLayout,
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
    layerDVisible,
    layerEVisible,
    toggleLayerAVisible,
    toggleLayerBVisible,
    toggleLayerCVisible,
    toggleLayerDVisible,
    toggleLayerEVisible,
    activeExperiment,
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
    replaceSaveMultiSelection,
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
    if (saveScope === 'eleven') {
      return sortSavesByVisualOrder(
        saves.filter((s) => s.scope === 'eleven' || s.scope === 'general' || s.cornersOnly),
        saveVisualOrder,
      );
    }
    return sortSavesByVisualOrder(saves.filter((s) => s.scope === saveScope || s.cornersOnly), saveVisualOrder);
  }, [saves, saveScope, saveVisualOrder]);
  const branchSaveIds = useMemo(
    () => new Set(RENDER_VARIANTS.flatMap((variant) => variant.saveIds)),
    [],
  );
  const panelSetSaves = useMemo(
    () => [...saves.filter(hasPanelSetLayout)].sort((a, b) => a.id - b.id),
    [saves],
  );
  const panelSetSaveIds = useMemo(
    () => new Set(panelSetSaves.map(catalogSaveId)),
    [panelSetSaves],
  );
  const branchSaveGroups = useMemo(
    () =>
    saveScope === 'four' || saveScope === 'five' || saveScope === 'six' || saveScope === 'seven' || saveScope === 'eight' || saveScope === 'nine' || saveScope === 'ten' || saveScope === 'eleven'
          ? RENDER_VARIANTS.map((variant) => ({
            variant,
            saves: scopedSaves
              .filter(
                (save) => save.scope !== 'general' && !panelSetSaveIds.has(catalogSaveId(save)) && variant.saveIds.includes(catalogSaveId(save)),
              )
              .slice(),
          })).filter((group) => group.saves.length > 0)
        : [],
    [scopedSaves, saveScope, panelSetSaveIds],
  );
  const generalScopedSaves = useMemo(
    () => scopedSaves.filter((save) => save.scope === 'general' && !panelSetSaveIds.has(catalogSaveId(save))),
    [scopedSaves, panelSetSaveIds],
  );
  const otherScopedSaves = useMemo(
    () =>
      branchSaveGroups.length > 0
        ? scopedSaves.filter(
            (save) => save.scope !== 'general' && !panelSetSaveIds.has(catalogSaveId(save)) && !branchSaveIds.has(catalogSaveId(save)),
          )
        : scopedSaves.filter((save) => save.scope !== 'general' && !panelSetSaveIds.has(catalogSaveId(save))),
    [scopedSaves, branchSaveGroups.length, branchSaveIds, panelSetSaveIds],
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
  const selectedSaveCount = useMemo(
    () =>
      Object.values(selectedSaveKeysByExperiment).reduce(
        (count, keys) => count + (keys?.length ?? 0),
        0,
      ),
    [selectedSaveKeysByExperiment],
  );
  const selectedExperimentCount = selectedExperimentLabels.length;
  const saveMultiSelectionActive = selectedSaveCount > 0;
  const anyMultiSelectionActive = selectedExperimentCount > 1 || saveMultiSelectionActive;
  const selectedSaveKeysForDockExperiment = selectedSaveKeysByExperiment[dockExperiment] ?? [];
  const selectedSaveInstanceOrder = useMemo(
    () => normalizeSelectedSaveVisualOrder(selectedSaveVisualOrder, selectedSaveKeysByExperiment),
    [selectedSaveVisualOrder, selectedSaveKeysByExperiment],
  );

  // ── Roster panel state ──
  const [expandedSwapKeys, setExpandedSwapKeys] = useState<string[]>([]);

  // Close swap dropdown when selection changes
  const prevSaveCountRef = useRef(selectedSaveCount);
  useEffect(() => {
    if (selectedSaveCount !== prevSaveCountRef.current) {
      prevSaveCountRef.current = selectedSaveCount;
    }
  }, [selectedSaveCount]);

  // Derive roster items: all selected saves, grouped by experiment, with swap alternatives
  type RosterItem = {
    experiment: ExperimentId;
    experimentLabel: string;
    key: string;
    instanceKey: string;
    save: ExperimentSetOneSnapshot | undefined;
    branchSlug: string | null;
    position: { x: number; y: number } | undefined;
    zIndex: number | null;
    swapAlternativeGroups: Array<{
      key: string;
      label: string;
      items: Array<{ save: ExperimentSetOneSnapshot; key: string; branchSlug: string | null }>;
    }>;
  };

  const rosterItems = useMemo(() => {
    const items: RosterItem[] = [];
    for (const experiment of EXPERIMENT_ORDER) {
      const keys = selectedSaveKeysByExperiment[experiment] ?? [];
      if (keys.length === 0) continue;
      const experimentSaves = getScopedSavesForExperiment(saves, experiment);
      for (const key of keys) {
        const parsed = parseSelectionKey(key);
        const save = saves.find((s) => s.id === parsed.id && saveMatchesSelection(s, parsed.branchSlug));
        const instanceKey = selectedSaveInstanceKey(experiment, key);
        const position = selectedSavePositions[instanceKey];
        const zIndex = selectedSaveRosterZIndex(selectedSaveInstanceOrder, instanceKey);
        // Build swap alternatives: all saves for this experiment that are NOT currently selected
        const selectedKeysSet = new Set(keys);
        const alternativeGroups = new Map<string, RosterItem['swapAlternativeGroups'][number]>();
        for (const altSave of experimentSaves) {
          const altVariant = RENDER_VARIANTS.find((variant) => variant.saveIds.includes(catalogSaveId(altSave))) ?? null;
          const altBranch = altSave.branchVariant ?? altVariant?.slug ?? null;
          const altKey = saveSelectionKey(altSave.id, altBranch);
          if (!selectedKeysSet.has(altKey)) {
            const groupKey = altVariant?.slug ?? (altSave.scope === 'general' ? 'general' : 'other');
            const groupLabel = altVariant ? displayVariantGroupLabel(altVariant, experiment) : saveVariantGroupLabel(altSave, experiment);
            const group = alternativeGroups.get(groupKey) ?? {
              key: groupKey,
              label: groupLabel,
              items: [],
            };
            group.items.push({ save: altSave, key: altKey, branchSlug: altBranch });
            alternativeGroups.set(groupKey, group);
          }
        }
        items.push({
          experiment,
          experimentLabel: experimentPaneLabel(experiment),
          key,
          instanceKey,
          save,
          branchSlug: parsed.branchSlug,
          position,
          zIndex,
          swapAlternativeGroups: Array.from(alternativeGroups.values()),
        });
      }
    }
    return items;
  }, [selectedSaveKeysByExperiment, saves, selectedSavePositions, selectedSaveInstanceOrder]);

  // Group roster items by experiment for rendering
  const rosterGroups = useMemo(() => {
    const groups: Array<{ experiment: ExperimentId; label: string; items: RosterItem[] }> = [];
    let currentGroup: (typeof groups)[number] | null = null;
    for (const item of rosterItems) {
      if (!currentGroup || currentGroup.experiment !== item.experiment) {
        currentGroup = { experiment: item.experiment, label: item.experimentLabel, items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push(item);
    }
    return groups;
  }, [rosterItems]);
  const rosterManifestEntries = useMemo(
    () =>
      rosterItems.map((item) => ({
        key: item.instanceKey,
        label: formatSaveLabel(item.save, item.branchSlug) ?? item.key,
        experiment: experimentPaneLabel(item.experiment),
        placement: formatSavePlacement(item.position, item.zIndex),
      })),
    [rosterItems],
  );

  const e1Highlight = useMemo(() => e1Highlighted(selection), [selection]);
  const e2Highlight = useMemo(() => e2Highlighted(selection), [selection]);
  const e3Highlight = useMemo(() => e3Highlighted(selection), [selection]);
  const e4Highlight = useMemo(() => e4Highlighted(selection), [selection]);
  const e6Highlight = useMemo(() => e6Highlighted(selection), [selection]);
  const inspectingLayerC =
    (selection?.experiment === 'six' ||
      selection?.experiment === 'eight' ||
      selection?.experiment === 'eleven') &&
    isE6LayerCInspectTarget(selection.target);
  const inspectingE6LayerC =
    (selection?.experiment === 'six' || selection?.experiment === 'eight') &&
    isE6LayerCInspectTarget(selection.target);
  const inspectingE11LayerC =
    selection?.experiment === 'eleven' &&
    isE6LayerCInspectTarget(selection.target);
  const dockLayerEditMode: LayerEditMode =
    (isTopLayerEditMode(layerEditMode) &&
      dockExperiment !== 'six' &&
      dockExperiment !== 'eight' &&
      dockExperiment !== 'eleven') ||
    ((layerEditMode === 'layerD' || layerEditMode === 'layerE') && dockExperiment !== 'eleven')
      ? 'both'
      : layerEditMode;
  const e6LayerCMode =
    (dockExperiment === 'six' || dockExperiment === 'eight') &&
    (layerEditMode === 'layerC' || (inspectingE6LayerC && layerEditMode === 'both'));
  const e6LayerEditMode: LayerEditMode = e6LayerCMode ? 'layerC' : dockLayerEditMode;
  const e11LayerCMode =
    dockExperiment === 'eleven' &&
    (isTopLayerEditMode(layerEditMode) || (inspectingE11LayerC && layerEditMode === 'both'));
  const e11LayerEditMode: LayerEditMode = e11LayerCMode ? layerEditMode : dockLayerEditMode;
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
        if (field.id === 'width') {
          return { ...field, max: experimentSixLayerCMaxWidth(e6) };
        }
        if (field.id === 'height') {
          return { ...field, max: experimentSixLayerCMaxHeight(e6) };
        }
        if (field.id === 'radius') {
          return { ...field, max: Math.floor(Math.min(e6LayerC.width, e6LayerC.height) / 2) };
        }
        if (field.id === 'offsetX') {
          return { ...field, max: Math.max(0, (e6.layerBWidth as number) - e6LayerC.width) };
        }
        if (field.id === 'offsetY') {
          return { ...field, max: Math.max(0, (e6.layerBHeight as number) - e6LayerC.height) };
        }
        return field;
      }),
    [e6, e6LayerC.width, e6LayerC.height],
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
            value: experimentSixLayerCLayoutCentered(e6, e6LayerC.width, e6LayerC.height)[key],
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
  const e11LayerCLayoutFields = useMemo(
    () =>
      E6_LAYER_C_LAYOUT_FIELDS.filter(
        (field) => field.id === 'width' || field.id === 'height' || field.id === 'radius',
      ).map((field) => {
        if (field.id === 'width') {
          return { ...field, max: e11.layerAWidth as number };
        }
        if (field.id === 'height') {
          return { ...field, max: e11.layerAHeight as number };
        }
        return { ...field, max: Math.floor(Math.min(e11LayerCLayout.width, e11LayerCLayout.height) / 2) };
      }),
    [e11, e11LayerCLayout.width, e11LayerCLayout.height],
  );
  const selectedElevenSave = useMemo(
    () =>
      selectedSaveIdByExperiment.eleven == null
        ? undefined
        : saves.find((save) => save.id === selectedSaveIdByExperiment.eleven),
    [saves, selectedSaveIdByExperiment.eleven],
  );
  const e11LayerCDefaults = useMemo(
    () =>
      selectedElevenSave?.e11LayerCLayout ??
      experimentElevenLayerCLayoutFromMaterial(
        experimentElevenLayerCDisplayMaterial(e11, selectedElevenSave?.e11LayerC),
      ),
    [e11, selectedElevenSave?.e11LayerC, selectedElevenSave?.e11LayerCLayout],
  );
  const visibleE11Fields = useMemo(() => {
    if (e11LayerCMode) return e11LayerCLayoutFields;
    return fieldsForSelection(contextualE4Fields, e6Highlight, selection, dockLayerEditMode);
  }, [e11LayerCMode, e11LayerCLayoutFields, contextualE4Fields, e6Highlight, selection, dockLayerEditMode]);
  const visibleE6SectionsForMode = useMemo(
    () => sectionsForLayerMode(visibleE6Fields, e6SectionOrder, e6LayerEditMode),
    [visibleE6Fields, e6SectionOrder, e6LayerEditMode],
  );
  const visibleE11SectionsForMode = useMemo(
    () => (e11LayerCMode ? [E6_LAYER_C_LAYOUT_SECTION] : sectionsForLayerMode(visibleE11Fields, E4_SECTION_ORDER, dockLayerEditMode)),
    [e11LayerCMode, visibleE11Fields, dockLayerEditMode],
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
                : selection?.experiment === 'eight'
                  ? visibleE6Fields.length
                  : selection?.experiment === 'eleven'
                    ? visibleE11Fields.length
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
      ...visibleE11SectionsForMode.map((s) => foldableSectionId('e11', s)),
    ],
    [visibleE1Sections, visibleE2Sections, visibleE3SectionsForMode, visibleE4SectionsForMode, visibleE5SectionsForMode, visibleE6SectionsForMode, visibleE7SectionsForMode, visibleE11SectionsForMode],
  );
  const { isOpen, toggle, openAll, collapseAll } = useFoldableSections(foldableSectionIds, false);
  const settingsScrollRef = useRef<HTMLDivElement>(null);
  const pendingScrollAnchorRef = useRef<SettingsScrollAnchor | null>(null);

  const handleLayerEditModeChange = useCallback((mode: LayerEditMode) => {
    const container = settingsScrollRef.current;
    if (container) {
      pendingScrollAnchorRef.current = captureSettingsScrollAnchor(container);
    }
    if (isTopLayerEditMode(mode)) clearSelection();
    setLayerEditMode(mode);
  }, [clearSelection]);

  useLayoutEffect(() => {
    const container = settingsScrollRef.current;
    const anchor = pendingScrollAnchorRef.current;
    if (!container || !anchor) return;
    pendingScrollAnchorRef.current = null;
    restoreSettingsScrollAnchor(container, anchor);
  }, [layerEditMode, visibleE3SectionsForMode, visibleE4SectionsForMode, visibleE5SectionsForMode, visibleE6SectionsForMode, visibleE7SectionsForMode, visibleE11SectionsForMode]);

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
    dockExperiment === 'ten' ||
    dockExperiment === 'eleven';

  return (
    <ExperimentOneDraggableShell
      className="experiment-one-settings-dock"
      dragHandleSelector=".experiment-one-settings-dock__header, .experiment-one-settings-dock__edge-grab"
      dragExcludeSelector="button, input, textarea, select, .experiment-one-settings-dock__body, .experiment-one-settings-dock__settings-scroll, .experiment-one-settings-dock__saves-list, .experiment-one-settings-dock__layer-rail, .mat-setting-control, .experiment-one-settings-dock__experiment-tabs, .experiment-one-settings-dock__toolbar"
      initialPosition={{ x: 20, y: 96 }}
      bounds="viewport"
      persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.settingsDock}
      layoutResetVersion={layoutResetVersion}
      ariaLabel="Material settings"
    >
      <div className={`experiment-one-settings-dock__shell${open ? '' : ' experiment-one-settings-dock__shell--collapsed'}`}>
        <span className="experiment-one-settings-dock__edge-grab experiment-one-settings-dock__edge-grab--top" aria-hidden="true" />
        <span className="experiment-one-settings-dock__edge-grab experiment-one-settings-dock__edge-grab--right" aria-hidden="true" />
        <span className="experiment-one-settings-dock__edge-grab experiment-one-settings-dock__edge-grab--bottom" aria-hidden="true" />
        <span className="experiment-one-settings-dock__edge-grab experiment-one-settings-dock__edge-grab--left" aria-hidden="true" />
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
                  ['four', 'left long pane 1'],
                  ['five', 'left long pane 2'],
                  ['six', 'left short pane'],
                  ['seven', 'search pill 1'],
                  ['eight', 'search pill 2'],
                  ['nine', 'center large pane'],
                  ['ten', 'center overlap pane'],
                  ['eleven', 'right overlap pane'],
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
              <div
                className={`experiment-one-settings-dock__saves${
                  selectedSaveCount > 0 || saveSelectionMode ? ' experiment-one-settings-dock__saves--with-roster' : ''
                }`}
              >
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
                    <button
                      type="button"
                      className="experiment-one-settings-dock__toggle"
                      onClick={() =>
                        saveCurrent({
                          activeExperiment,
                          selectedExperimentIds,
                          selectedSaveKeysByExperiment,
                          selectedSaveVisualOrder,
                          selectedSavePositions,
                        })
                      }
                    >
                      Save +
                    </button>
                  </div>
                </div>

                {/* Multi-select roster panel */}
                {(selectedSaveCount > 0 || saveSelectionMode) && (
                  <div className="experiment-one-settings-dock__roster">
                    <div className="experiment-one-settings-dock__roster-header">
                      <span className="experiment-one-settings-dock__roster-title">
                        {selectedSaveCount > 0 ? 'Selected' : 'Click saves to select'}
                      </span>
                      {selectedSaveCount > 0 && (
                        <span className="experiment-one-settings-dock__roster-count">{selectedSaveCount}</span>
                      )}
                      <button
                        type="button"
                        className="experiment-one-settings-dock__toolbar-btn"
                        onClick={() => { clearMultiSelection(); setExpandedSwapKeys([]); }}
                        style={{ marginLeft: 'auto' }}
                        >
                          Clear
                        </button>
                      </div>
                    <div className="experiment-one-settings-dock__roster-scroll">
                      {selectedSaveCount > 0 && rosterManifestEntries.length > 0 && (
                        <div className="experiment-one-settings-dock__roster-manifest" aria-label="Saved panel set">
                          {rosterManifestEntries.map((entry) => (
                            <div key={entry.key} className="experiment-one-settings-dock__roster-manifest-row">
                              <span className="experiment-one-settings-dock__roster-manifest-experiment">{entry.experiment}</span>
                              <span className="experiment-one-settings-dock__roster-manifest-label">{entry.label}</span>
                              {entry.placement && (
                                <span className="experiment-one-settings-dock__roster-manifest-placement">{entry.placement}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {rosterGroups.map((group) => (
                        <div key={group.experiment} className="experiment-one-settings-dock__roster-group">
                          <span className="experiment-one-settings-dock__roster-group-label">{group.label}</span>
                          {group.items.map((item) => {
                            const orderIndex = selectedSaveInstanceOrder.indexOf(item.instanceKey);
                            const canReorder = selectedSaveInstanceOrder.length > 1 && orderIndex !== -1;
                            const isFrontMost = orderIndex === 0;
                            const isBackMost = orderIndex === selectedSaveInstanceOrder.length - 1;
                            const isExpanded = expandedSwapKeys.includes(item.instanceKey);
                            const branchLabel = item.branchSlug && item.branchSlug !== 'base'
                              ? RENDER_VARIANTS.find((v) => v.slug === item.branchSlug)?.label ?? item.branchSlug
                              : null;
                            const placementLabel = formatSavePlacement(item.position, item.zIndex);
                            return (
                              <div key={item.instanceKey}>
                                <div
                                  className={`experiment-one-settings-dock__roster-item${isExpanded ? ' experiment-one-settings-dock__roster-item--expanded' : ''}`}
                                  onClick={() =>
                                    setExpandedSwapKeys((prev) =>
                                      isExpanded
                                        ? prev.filter((key) => key !== item.instanceKey)
                                        : Array.from(new Set([...prev, item.instanceKey])),
                                    )
                                  }
                                  title={`${formatSaveLabel(item.save, item.branchSlug) ?? item.key} · click to swap with another save`}
                                >
                                  <span className="experiment-one-settings-dock__roster-item-dot" />
                                  <span className="experiment-one-settings-dock__roster-item-body">
                                    <span className="experiment-one-settings-dock__roster-item-label">
                                      {formatSaveLabel(item.save, item.branchSlug) ?? `Save ${parseSelectionKey(item.key).id}`}
                                    </span>
                                    <span className="experiment-one-settings-dock__roster-item-meta">
                                      <span>{experimentShortLabel(item.experiment)}</span>
                                      {branchLabel && <span>{branchLabel}</span>}
                                      {placementLabel && <span>{placementLabel}</span>}
                                    </span>
                                  </span>
                                  <span className="experiment-one-settings-dock__roster-item-actions" onClick={(e) => e.stopPropagation()}>
                                    {canReorder && (
                                      <>
                                        <button
                                          type="button"
                                          className="experiment-one-settings-dock__save-context-btn"
                                          onClick={(e) => { e.stopPropagation(); bringSaveForward(item.experiment, item.key); }}
                                          disabled={isFrontMost}
                                          title="Bring forward"
                                        >
                                          ▲
                                        </button>
                                        <button
                                          type="button"
                                          className="experiment-one-settings-dock__save-context-btn"
                                          onClick={(e) => { e.stopPropagation(); sendSaveBackward(item.experiment, item.key); }}
                                          disabled={isBackMost}
                                          title="Send backward"
                                        >
                                          ▼
                                        </button>
                                      </>
                                    )}
                                    <button
                                      type="button"
                                      className="experiment-one-settings-dock__roster-remove"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSaveMultiSelection(item.experiment, item.key, true);
                                        setExpandedSwapKeys((prev) => prev.filter((key) => key !== item.instanceKey));
                                      }}
                                      title="Remove from selection"
                                    >
                                      ✕
                                    </button>
                                  </span>
                                </div>
                                {isExpanded && item.swapAlternativeGroups.length > 0 && (
                                  <div className="experiment-one-settings-dock__swap-dropdown">
                                    <span className="experiment-one-settings-dock__swap-dropdown-title">
                                      {`Swap with ${formatSaveLabel(item.save, item.branchSlug) ?? item.key}`}
                                    </span>
                                    {item.swapAlternativeGroups.map((group) => (
                                      <div key={group.key} className="experiment-one-settings-dock__branch-group">
                                        <span className="experiment-one-settings-dock__branch-label">{group.label}</span>
                                        <div className="experiment-one-settings-dock__branch-saves">
                                          {group.items.map((alt) => {
                                            const altBranchLabel = renderVariantLabel(alt.branchSlug);
                                            return (
                                              <button
                                                key={alt.key}
                                                type="button"
                                                className="experiment-one-settings-dock__swap-option"
                                                onClick={() => {
                                                  replaceSaveMultiSelection(item.experiment, item.key, alt.key);
                                                  setExpandedSwapKeys((prev) => {
                                                    const nextInstanceKey = selectedSaveInstanceKey(item.experiment, alt.key);
                                                    const next = prev.map((key) => (key === item.instanceKey ? nextInstanceKey : key));
                                                    return next.includes(nextInstanceKey) ? next : [...next, nextInstanceKey];
                                                  });
                                                }}
                                                title={`Swap to ${formatSaveLabel(alt.save, alt.branchSlug)}`}
                                              >
                                                <span className="experiment-one-settings-dock__swap-option-label">
                                                  {formatSaveLabel(alt.save, alt.branchSlug)}
                                                </span>
                                                {altBranchLabel && (
                                                  <span className="experiment-one-settings-dock__swap-option-branch">{altBranchLabel}</span>
                                                )}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {isExpanded && item.swapAlternativeGroups.length === 0 && (
                                  <div className="experiment-one-settings-dock__swap-dropdown">
                                    <span className="experiment-one-settings-dock__swap-dropdown-title">No other saves available</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Save chip list */}
                <div className="experiment-one-settings-dock__saves-list" role="group" aria-label="Experiment saves">
                  {panelSetSaves.length > 0 && (
                    <div className="experiment-one-settings-dock__branch-group experiment-one-settings-dock__branch-group--panel-sets">
                      <span className="experiment-one-settings-dock__branch-label">Panel sets</span>
                      <div className="experiment-one-settings-dock__branch-saves">
                        {panelSetSaves.map((save) => {
                          const branchVariant = save.branchVariant ?? null;
                          const selectionKey = saveSelectionKey(save.id, branchVariant);
                          const multiSelected = selectedSaveKeysForDockExperiment.includes(selectionKey);
                          const current = isCurrentSaveActive(
                            selectedSaveIdByExperiment[dockExperiment],
                            activeRenderVariant,
                            save.id,
                            branchVariant,
                          );
                          const showCurrent = current;
                          const saveKey = selectionKey;
                          const saveInstanceKey = selectedSaveInstanceKey(dockExperiment, selectionKey);
                          const selectedOrderIndex = selectedSaveInstanceOrder.indexOf(saveInstanceKey);
                          const canReorderSave = multiSelected && selectedSaveInstanceOrder.length > 1 && selectedOrderIndex !== -1;
                          const isFrontMost = selectedOrderIndex === 0;
                          const isBackMost = selectedOrderIndex === selectedSaveInstanceOrder.length - 1;
                          const panelSetEntries = describePanelSetSnapshot(save, saves);
                          return (
                            <div
                              key={`panel-set-${save.id}`}
                              role="button"
                              tabIndex={0}
                              className={`experiment-one-settings-dock__save-chip experiment-one-settings-dock__save-chip--panel-set${showCurrent ? ' experiment-one-settings-dock__save-chip--current' : ''}${multiSelected ? ' experiment-one-settings-dock__save-chip--selected' : ''}`}
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
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  event.currentTarget.click();
                                }
                              }}
                              title={`${save.label}${save.branchVariant ? ` (${save.branchVariant})` : ''} · click to load · ⌘+click to multi-select`}
                              >
                                <span className="experiment-one-settings-dock__save-chip-main">
                                  <span className="experiment-one-settings-dock__save-chip-label">{save.label}</span>
                                  {formatLayoutSummary(save) && (
                                    <span className="experiment-one-settings-dock__save-chip-meta">{formatLayoutSummary(save)}</span>
                                  )}
                                </span>
                              {showCurrent && <span className="experiment-one-settings-dock__save-chip-current-badge">Current</span>}
                              {dockExperiment === 'eleven' && save.e4 && <ElevenSaveLayerCPreview save={save} />}
                              {panelSetEntries.length > 0 && (
                                <span className="experiment-one-settings-dock__save-chip-panel-set" aria-label="Saved panel set">
                                  <span className="experiment-one-settings-dock__save-chip-panel-set-title">
                                    {`Saved panel set · ${panelSetSummary(panelSetEntries.length)}`}
                                  </span>
                                  <span className="experiment-one-settings-dock__save-chip-panel-set-list">
                                    {panelSetEntries.map((entry) => (
                                      <span key={entry.key} className="experiment-one-settings-dock__save-chip-panel-set-row">
                                        <span className="experiment-one-settings-dock__save-chip-panel-set-experiment">{entry.experiment}</span>
                                        <span className="experiment-one-settings-dock__save-chip-panel-set-save">{entry.saveLabel}</span>
                                        {entry.placement && (
                                          <span className="experiment-one-settings-dock__save-chip-panel-set-placement">{entry.placement}</span>
                                        )}
                                      </span>
                                    ))}
                                  </span>
                                </span>
                              )}
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {branchSaveGroups.map(({ variant, saves: branchSaves }) => (
                    <div key={variant.slug} className="experiment-one-settings-dock__branch-group">
                      <span className="experiment-one-settings-dock__branch-label">{displayVariantGroupLabel(variant, dockExperiment)}</span>
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
                          const showCurrent = current;
                          const saveKey = selectionKey;
                          const saveInstanceKey = selectedSaveInstanceKey(dockExperiment, selectionKey);
                          const selectedOrderIndex = selectedSaveInstanceOrder.indexOf(saveInstanceKey);
                          const canReorderSave = multiSelected && selectedSaveInstanceOrder.length > 1 && selectedOrderIndex !== -1;
                          const isFrontMost = selectedOrderIndex === 0;
                          const isBackMost = selectedOrderIndex === selectedSaveInstanceOrder.length - 1;
                          return (
                            <div
                              key={`${variant.slug}-${save.id}`}
                              role="button"
                              tabIndex={0}
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
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  event.currentTarget.click();
                                }
                              }}
                              title={`${save.label} (${variant.label}) · click to load · ⌘+click to multi-select`}
                              >
                                <span className="experiment-one-settings-dock__save-chip-main">
                                  <span className="experiment-one-settings-dock__save-chip-label">{save.label}</span>
                                  {formatLayoutSummary(save) && (
                                    <span className="experiment-one-settings-dock__save-chip-meta">{formatLayoutSummary(save)}</span>
                                  )}
                                </span>
                              {showCurrent && <span className="experiment-one-settings-dock__save-chip-current-badge">Current</span>}
                              {dockExperiment === 'eleven' && save.e4 && <ElevenSaveLayerCPreview save={save} />}
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
                            </div>
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
                          const showCurrent = current;
                          const saveKey = selectionKey;
                          const saveInstanceKey = selectedSaveInstanceKey(dockExperiment, selectionKey);
                          const selectedOrderIndex = selectedSaveInstanceOrder.indexOf(saveInstanceKey);
                          const canReorderSave = multiSelected && selectedSaveInstanceOrder.length > 1 && selectedOrderIndex !== -1;
                          const isFrontMost = selectedOrderIndex === 0;
                          const isBackMost = selectedOrderIndex === selectedSaveInstanceOrder.length - 1;
                          return (
                            <div
                              key={save.id}
                              role="button"
                              tabIndex={0}
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
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  event.currentTarget.click();
                                }
                              }}
                              title={`${save.label}${save.branchVariant ? ` (${save.branchVariant})` : ''} · click to load · ⌘+click to multi-select`}
                              >
                                <span className="experiment-one-settings-dock__save-chip-main">
                                  <span className="experiment-one-settings-dock__save-chip-label">{save.label}</span>
                                  {formatLayoutSummary(save) && (
                                    <span className="experiment-one-settings-dock__save-chip-meta">{formatLayoutSummary(save)}</span>
                                  )}
                                </span>
                              {showCurrent && <span className="experiment-one-settings-dock__save-chip-current-badge">Current</span>}
                              {dockExperiment === 'eleven' && save.e4 && <ElevenSaveLayerCPreview save={save} />}
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
                            </div>
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
                    const showCurrent = current;
                    const saveKey = selectionKey;
                    const saveInstanceKey = selectedSaveInstanceKey(dockExperiment, selectionKey);
                    const selectedOrderIndex = selectedSaveInstanceOrder.indexOf(saveInstanceKey);
                    const canReorderSave = multiSelected && selectedSaveInstanceOrder.length > 1 && selectedOrderIndex !== -1;
                    const isFrontMost = selectedOrderIndex === 0;
                    const isBackMost = selectedOrderIndex === selectedSaveInstanceOrder.length - 1;
                    return (
                      <div
                        key={save.id}
                        role="button"
                        tabIndex={0}
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
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            event.currentTarget.click();
                          }
                        }}
                        title={`${save.label} · click to load · ⌘+click to multi-select`}
                      >
                        <span className="experiment-one-settings-dock__save-chip-main">
                          <span className="experiment-one-settings-dock__save-chip-label">{save.label}</span>
                          {formatLayoutSummary(save) && (
                            <span className="experiment-one-settings-dock__save-chip-meta">{formatLayoutSummary(save)}</span>
                          )}
                        </span>
                        {showCurrent && <span className="experiment-one-settings-dock__save-chip-current-badge">Current</span>}
                        {dockExperiment === 'eleven' && save.e4 && <ElevenSaveLayerCPreview save={save} />}
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
                      </div>
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
                      showLayerC={dockExperiment === 'six' || dockExperiment === 'eight' || dockExperiment === 'eleven'}
                      showLayerD={dockExperiment === 'eleven'}
                      showLayerE={dockExperiment === 'eleven'}
                    />
                    <span className="experiment-one-settings-dock__layer-rail-label">Show</span>
                    <LayerVisibilityToggles
                      layerAVisible={layerAVisible}
                      layerBVisible={layerBVisible}
                      layerCVisible={layerCVisible}
                      layerDVisible={layerDVisible}
                      layerEVisible={layerEVisible}
                      onToggleLayerA={toggleLayerAVisible}
                      onToggleLayerB={toggleLayerBVisible}
                      onToggleLayerC={toggleLayerCVisible}
                      onToggleLayerD={toggleLayerDVisible}
                      onToggleLayerE={toggleLayerEVisible}
                      showLayerC={dockExperiment === 'six' || dockExperiment === 'eight' || dockExperiment === 'eleven'}
                      showLayerD={dockExperiment === 'eleven'}
                      showLayerE={dockExperiment === 'eleven'}
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
                    ? 'Layer C panel — branch save materials with width, height, radius, and inset.'
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
            {dockExperiment === 'eleven' && (
              <ExperimentMultiLayerSettings
                experimentKey="e11"
                title="Experiment Eleven"
                description={
                  e11LayerCMode
                    ? 'Layer C strip — editable width, height, and radius for the right overlap pane.'
                    : 'Duplicate of Experiment Ten with the right overlap pane and its own working state and saves.'
                }
                filtering={inspectingE11LayerC ? filtering : e11LayerCMode ? false : filtering}
                fields={e11LayerCMode ? e11LayerCLayoutFields : visibleE11Fields}
                sectionOrder={e11LayerCMode ? [E6_LAYER_C_LAYOUT_SECTION] : E4_SECTION_ORDER}
                settings={e11}
                masterDefault={E4_MASTER_DEFAULT}
                layerEditMode={e11LayerEditMode}
                onChange={(id, value) => setE11(id as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings])}
                onPairedChange={(suffix, value) => {
                  setE11(`layerA${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                  setE11(`layerB${suffix}` as keyof E4MaterialSettings, value as E4MaterialSettings[keyof E4MaterialSettings]);
                }}
                resetTargets={fieldResetTargets}
                scopedSaves={scopedSaves}
                saveExperiment="eleven"
                isOpen={isOpen}
                onToggle={toggle}
                alternateFields={
                  e11LayerCMode
                    ? {
                        values: e11LayerCLayout as Record<string, unknown>,
                        defaults: e11LayerCDefaults as Record<string, unknown>,
                        fieldIds: new Set(['width', 'height', 'radius']),
                        onChange: (id: string, value: unknown) =>
                          setE11LayerCLayout(
                            id as keyof ExperimentElevenLayerCLayoutSettings,
                            value as ExperimentElevenLayerCLayoutSettings[keyof ExperimentElevenLayerCLayoutSettings],
                          ),
                      }
                    : undefined
                }
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
