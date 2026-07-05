import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react';
import {
  e4LayerADimensionStyle,
  e4LayerBDimensionStyle,
  e4SettingsToCssVars,
  normalizeE4MaterialSettings,
  type E4MaterialSettings,
} from '../experiment-set-four/materialSettings';
import { GlassFrostSurface } from '../shared/GlassFrostSurface';
import { PwzzovOGlassCorners, pwzzovBackdropReflexEnabled } from '../shared/PwzzovOGlassCorners';
import { RENDER_VARIANTS, type RenderVariantSlug } from '../../render-variants/manifest';
import type { ExperimentId } from './experimentVisibility';
import { useExperimentSetOne } from './combinedSettings';
import { applyExperimentSixPanelGeometry } from './experimentSixPanelGeometry';
import {
  applyExperimentEightPanelGeometry,
  applyExperimentSevenPanelGeometry,
} from './experimentSevenPanelGeometry';
import {
  applyExperimentNinePanelGeometry,
  applyShowcasePanelGeometry,
  SHOWCASE_PANEL_SNAP,
} from './showcasePanelGeometry';
import { normalizeExperimentTenPanelGeometry } from './experimentTenPanelGeometry';
import type { ExperimentSetOneSnapshot } from './savedConfigs';

type PreviewExperiment = Extract<
  ExperimentId,
  'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten'
>;

type SavePreview = {
  key: string;
  selectionKey: string;
  id: number;
  experiment: PreviewExperiment;
  label: string;
  branchSlug: RenderVariantSlug | null;
  branchLabel: string | null;
  material: E4MaterialSettings;
};

const PREVIEW_EXPERIMENTS: PreviewExperiment[] = ['four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const FREE_LAYER_B_SNAP = { x: 52, y: 60 } as const;
const SELECTED_SAVE_CASCADE_STEP = 28;
const SELECTED_SAVE_DRAG_THRESHOLD = 4;
const SELECTED_SAVE_DEFAULT_OFFSET = { x: 676, y: 0 } as const;

type DragPoint = { x: number; y: number };
type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  pending: boolean;
  active: boolean;
};

function experimentShortLabel(experiment: PreviewExperiment): string {
  return `E${PREVIEW_EXPERIMENTS.indexOf(experiment) + 4}`;
}

function visualOrderIndex(order: string[], key: string): number {
  const index = order.indexOf(key);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function selectedSaveInstanceKeys(keysByExperiment: Partial<Record<ExperimentId, string[]>>): string[] {
  return PREVIEW_EXPERIMENTS.flatMap((experiment) =>
    (keysByExperiment[experiment] ?? []).map((key) => `${experiment}:${key}`),
  );
}

function normalizeVisualOrder(order: string[], layoutOrder: string[]): string[] {
  const layoutSet = new Set(layoutOrder);
  const next = Array.from(new Set(order.filter((key) => layoutSet.has(key))));
  for (const key of layoutOrder) {
    if (!next.includes(key)) next.push(key);
  }
  return next;
}

function selectedSaveZIndex(order: string[], key: string): number {
  const index = visualOrderIndex(order, key);
  if (index === Number.MAX_SAFE_INTEGER) return 30;
  return 30 + order.length - index;
}

function parseSaveSelectionKey(key: string): { branchSlug: RenderVariantSlug | null; id: number } | null {
  const [branchPart, idPart] = key.split(':');
  const id = Number(idPart);
  if (!Number.isFinite(id)) return null;
  if (branchPart === 'base') return { branchSlug: null, id };
  const branch = RENDER_VARIANTS.find((variant) => variant.slug === branchPart);
  return branch ? { branchSlug: branch.slug, id } : null;
}

function saveMatchesBranch(
  snapshot: ExperimentSetOneSnapshot,
  branchSlug: RenderVariantSlug | null,
): boolean {
  if (!branchSlug) return !snapshot.branchVariant;
  if (snapshot.branchVariant === branchSlug) return true;
  const variant = RENDER_VARIANTS.find((candidate) => candidate.slug === branchSlug);
  return variant?.saveIds.includes(snapshot.sourceSaveId ?? snapshot.id) ?? false;
}

function findSelectedSave(
  saves: ExperimentSetOneSnapshot[],
  parsed: { branchSlug: RenderVariantSlug | null; id: number },
): ExperimentSetOneSnapshot | undefined {
  return saves.find((save) => save.id === parsed.id && saveMatchesBranch(save, parsed.branchSlug));
}

function materialForPreview(
  experiment: PreviewExperiment,
  snapshot: ExperimentSetOneSnapshot,
): E4MaterialSettings | null {
  if (!snapshot.e4) return null;
  const material = normalizeE4MaterialSettings(snapshot.e4);
  if (experiment === 'six') return applyExperimentSixPanelGeometry(material);
  if (experiment === 'seven') return applyExperimentSevenPanelGeometry(material);
  if (experiment === 'eight') return applyExperimentEightPanelGeometry(material);
  if (experiment === 'nine') return applyExperimentNinePanelGeometry(material);
  if (experiment === 'ten') return normalizeExperimentTenPanelGeometry(material);
  return applyShowcasePanelGeometry(material);
}

function layerBackdropLights(prefix: 'layerA' | 'layerB', settings: E4MaterialSettings) {
  return {
    tlLight: settings[`${prefix}GlassReflexTlLight`],
    trLight: settings[`${prefix}GlassReflexTrLight`],
    blLight: settings[`${prefix}GlassReflexBlLight`],
    brLight: settings[`${prefix}GlassReflexBrLight`],
    topLight: settings[`${prefix}GlassReflexTopLight`],
    bottomLight: settings[`${prefix}GlassReflexBottomLight`],
    leftLight: settings[`${prefix}GlassReflexLeftLight`],
    rightLight: settings[`${prefix}GlassReflexRightLight`],
  };
}

function layerBackdropReflexEnabled(prefix: 'layerA' | 'layerB', settings: E4MaterialSettings): boolean {
  return pwzzovBackdropReflexEnabled(settings[`${prefix}GlassReflexMode`], [
    settings[`${prefix}GlassReflexTlLight`],
    settings[`${prefix}GlassReflexTlDark`],
    settings[`${prefix}GlassReflexTrLight`],
    settings[`${prefix}GlassReflexTrDark`],
    settings[`${prefix}GlassReflexBlLight`],
    settings[`${prefix}GlassReflexBlDark`],
    settings[`${prefix}GlassReflexBrLight`],
    settings[`${prefix}GlassReflexBrDark`],
    settings[`${prefix}GlassReflexTopLight`],
    settings[`${prefix}GlassReflexTopDark`],
    settings[`${prefix}GlassReflexBottomLight`],
    settings[`${prefix}GlassReflexBottomDark`],
    settings[`${prefix}GlassReflexLeftLight`],
    settings[`${prefix}GlassReflexLeftDark`],
    settings[`${prefix}GlassReflexRightLight`],
    settings[`${prefix}GlassReflexRightDark`],
  ]);
}

function SelectedSaveLayerB({ material, nested = false }: { material: E4MaterialSettings; nested?: boolean }) {
  return (
    <div
      className="experiment-four-layer-b"
      role="presentation"
      style={e4LayerBDimensionStyle(material, nested)}
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
        edgeReflexEnabled={layerBackdropReflexEnabled('layerB', material)}
        rimSideGapTop={material.layerBRimSideGapTop}
        rimSideGapBottom={material.layerBRimSideGapBottom}
        backdropLights={layerBackdropLights('layerB', material)}
      />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--a" aria-hidden="true" />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--b" aria-hidden="true" />
    </div>
  );
}

function SelectedSaveLayerA({ material }: { material: E4MaterialSettings }) {
  const showNestedB = material.layerBNestedInA;
  return (
    <div
      className="experiment-four-layer-a"
      role="presentation"
      style={e4LayerADimensionStyle(material)}
    >
      <span className="experiment-four-layer-a__bezel-rim" aria-hidden="true" />
      <GlassFrostSurface />
      <span className="experiment-four-layer-a__bezel-rim-edge experiment-four-layer-a__bezel-rim-edge--top" aria-hidden="true" />
      <span className="experiment-four-layer-a__bezel-rim-edge experiment-four-layer-a__bezel-rim-edge--bottom" aria-hidden="true" />
      <span className="experiment-four-layer-a__bezel-rim-side experiment-four-layer-a__bezel-rim-side--left" aria-hidden="true" />
      <span className="experiment-four-layer-a__bezel-rim-side experiment-four-layer-a__bezel-rim-side--right" aria-hidden="true" />
      <span className="experiment-four-layer-a__radial-corners" aria-hidden="true" />
      <PwzzovOGlassCorners
        layerClass="experiment-four-layer-a"
        inspectTarget="layer-a-corners"
        edgeReflexEnabled={layerBackdropReflexEnabled('layerA', material)}
        rimSideGapTop={material.layerARimSideGapTop}
        rimSideGapBottom={material.layerARimSideGapBottom}
        backdropLights={layerBackdropLights('layerA', material)}
      />
      {showNestedB && (
        <div className="experiment-four-layer-a__bezel-inset">
          <SelectedSaveLayerB material={material} nested />
        </div>
      )}
    </div>
  );
}

function selectedSaveTransform(base: { x: number; y: number }, index: number) {
  const cascade = index * SELECTED_SAVE_CASCADE_STEP;
  return `translate(${base.x + cascade}px, ${base.y + cascade}px)`;
}

function defaultSelectedSavePosition(): DragPoint {
  return { ...SELECTED_SAVE_DEFAULT_OFFSET };
}

function emptyDragState(): DragState {
  return {
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    pending: false,
    active: false,
  };
}

function SelectedSaveStagePanel({
  preview,
  layoutIndex,
  zIndex,
  position,
  onPositionCommit,
}: {
  preview: SavePreview;
  layoutIndex: number;
  zIndex: number;
  position: DragPoint;
  onPositionCommit: (position: DragPoint) => void;
}) {
  const freeLayerB = !preview.material.layerBNestedInA;
  const dragRef = useRef<DragState>(emptyDragState());
  const [draftPosition, setDraftPosition] = useState(position);
  const positionRef = useRef(position);
  const draftPositionRef = useRef(position);

  useEffect(() => {
    positionRef.current = position;
    setDraftPosition(position);
    draftPositionRef.current = position;
  }, [position.x, position.y]);

  const style = {
    ...e4SettingsToCssVars(preview.material),
    transform: `translate(${draftPosition.x}px, ${draftPosition.y}px)`,
    zIndex,
  } as CSSProperties;
  const label = `${experimentShortLabel(preview.experiment)} ${preview.label}${preview.branchLabel ? ` ${preview.branchLabel}` : ''}`;
  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: positionRef.current.x,
      originY: positionRef.current.y,
      pending: true,
      active: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    if (state.pointerId !== event.pointerId || (!state.pending && !state.active)) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (state.pending) {
      if (Math.abs(dx) < SELECTED_SAVE_DRAG_THRESHOLD && Math.abs(dy) < SELECTED_SAVE_DRAG_THRESHOLD) return;
      state.pending = false;
      state.active = true;
    }
    if (!state.active) return;
    const next = { x: state.originX + dx, y: state.originY + dy };
    draftPositionRef.current = next;
    setDraftPosition(next);
    event.preventDefault();
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const state = dragRef.current;
    if (state.pointerId !== event.pointerId || (!state.pending && !state.active)) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (state.active) {
      positionRef.current = draftPositionRef.current;
      onPositionCommit(draftPositionRef.current);
    }
    dragRef.current = emptyDragState();
  };
  const dragHandlers = {
    onPointerDown: startDrag,
    onPointerMove: moveDrag,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  return (
    <div
      className="experiment-set-one-selected-save-stage"
      style={style}
      role="group"
      aria-label={label}
    >
      <div
        className="experiment-set-one-selected-save-stage__layer-a"
        style={{ transform: selectedSaveTransform(SHOWCASE_PANEL_SNAP, layoutIndex) }}
        {...dragHandlers}
      >
        <SelectedSaveLayerA material={preview.material} />
      </div>
      {freeLayerB && (
        <div
          className="experiment-set-one-selected-save-stage__free-layer-b"
          style={{ transform: selectedSaveTransform(FREE_LAYER_B_SNAP, layoutIndex) }}
          {...dragHandlers}
        >
          <SelectedSaveLayerB material={preview.material} />
        </div>
      )}
    </div>
  );
}

export function SelectedSaveStagePanels() {
  const {
    saves,
    selectedSaveKeysByExperiment,
    selectedSaveVisualOrder,
    selectedSavePositions,
    setSelectedSavePosition,
  } = useExperimentSetOne();

  const previews = useMemo(() => {
    const layoutOrder = selectedSaveInstanceKeys(selectedSaveKeysByExperiment);
    const visualOrder = normalizeVisualOrder(selectedSaveVisualOrder, layoutOrder);
    return PREVIEW_EXPERIMENTS.flatMap((experiment) =>
      (selectedSaveKeysByExperiment[experiment] ?? []).flatMap((key): SavePreview[] => {
        const parsed = parseSaveSelectionKey(key);
        if (!parsed) return [];
        const snapshot = findSelectedSave(saves, parsed);
        if (!snapshot) return [];
        const material = materialForPreview(experiment, snapshot);
        if (!material) return [];
        const branchLabel = parsed.branchSlug
          ? RENDER_VARIANTS.find((variant) => variant.slug === parsed.branchSlug)?.label ?? parsed.branchSlug
          : null;
        return [{
          key: `${experiment}:${key}`,
          selectionKey: key,
          id: snapshot.id,
          experiment,
          label: snapshot.label,
          branchSlug: parsed.branchSlug,
          branchLabel,
          material,
        }];
      }),
    ).sort(
      (a, b) =>
        visualOrderIndex(layoutOrder, a.key) - visualOrderIndex(layoutOrder, b.key) ||
        a.key.localeCompare(b.key),
    ).map((preview) => ({
      preview,
      layoutIndex: visualOrderIndex(layoutOrder, preview.key),
      zIndex: selectedSaveZIndex(visualOrder, preview.key),
    }));
  }, [
    saves,
    selectedSaveKeysByExperiment,
    selectedSaveVisualOrder,
  ]);

  if (previews.length === 0) return null;

  return (
    <>
      {previews.map(({ preview, layoutIndex, zIndex }) => (
        <SelectedSaveStagePanel
          key={preview.key}
          preview={preview}
          layoutIndex={layoutIndex}
          zIndex={zIndex}
          position={selectedSavePositions[preview.key] ?? defaultSelectedSavePosition()}
          onPositionCommit={(position) => setSelectedSavePosition(preview.key, position)}
        />
      ))}
    </>
  );
}
