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
import {
  ExperimentElevenLayerCSwitcherGlass,
  type ExperimentElevenSwitcherGlassVariant,
} from './ExperimentElevenLayerCSwitcherGlass';
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
import { applyExperimentElevenPanelGeometry } from './experimentElevenPanelGeometry';
import {
  applyExperimentElevenLayerCLayout,
  experimentElevenLayerCDisplayMaterial,
  type ExperimentElevenLayerCLayoutSettings,
} from './experimentElevenLayerCMaterial';
import type { ExperimentSetOneSnapshot } from './savedConfigs';
import { useRenderVariant } from '../../render-variants/RenderVariantContext';

type PreviewExperiment = Extract<
  ExperimentId,
  'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten' | 'eleven'
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
  layerCOverride: Partial<E4MaterialSettings> | null;
  layerDOverride: Partial<E4MaterialSettings> | null;
  layerEOverride: Partial<E4MaterialSettings> | null;
  layerCLayoutOverride: ExperimentElevenLayerCLayoutSettings | null;
  layerDLayoutOverride: ExperimentElevenLayerCLayoutSettings | null;
  layerELayoutOverride: ExperimentElevenLayerCLayoutSettings | null;
  /** When set, Layer C renders the exact reference glass instead of the normal sheet. */
  layerCReferenceGlass: ExperimentElevenSwitcherGlassVariant | null;
  /** Semantic appearance opt-in, driven by the save's own field — not its id. */
  bezelStyle: string | null;
  current: boolean;
};

type SelectedSaveTopLayerId = 'c' | 'd' | 'e';

const PREVIEW_EXPERIMENTS: PreviewExperiment[] = ['four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];
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
  return 60 + order.length - index;
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
  if (!branchSlug) return true;
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
  if (experiment === 'eleven') return applyExperimentElevenPanelGeometry(material);
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

function selectedSaveLayerCMaterial(
  material: E4MaterialSettings,
  override: Partial<E4MaterialSettings> | null,
): E4MaterialSettings {
  return experimentElevenLayerCDisplayMaterial(material, override);
}

function isPreviewSaveCurrent(
  selectedSaveId: number | null | undefined,
  activeRenderVariant: RenderVariantSlug | null | undefined,
  saveId: number,
  branchSlug: RenderVariantSlug | null,
): boolean {
  if (selectedSaveId !== saveId) return false;
  return (branchSlug ?? null) === (activeRenderVariant ?? null);
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

function SelectedSaveLayerC({
  material,
  layerCOverride,
  layoutOverride,
  layerId,
  label,
  referenceGlass,
}: {
  material: E4MaterialSettings;
  layerCOverride: Partial<E4MaterialSettings> | null;
  layoutOverride: ExperimentElevenLayerCLayoutSettings | null;
  layerId: SelectedSaveTopLayerId;
  label: string;
  referenceGlass: ExperimentElevenSwitcherGlassVariant | null;
}) {
  const layerCMaterial = useMemo(
    () => {
      const next = selectedSaveLayerCMaterial(material, layerCOverride);
      return layoutOverride ? applyExperimentElevenLayerCLayout(next, layoutOverride) : next;
    },
    [material, layerCOverride, layoutOverride],
  );
  if (referenceGlass) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <ExperimentElevenLayerCSwitcherGlass
          variant={referenceGlass}
          width={layerCMaterial.layerBWidth as number}
          height={layerCMaterial.layerBHeight as number}
          radius={layerCMaterial.layerBCornerRadius as number}
        />
      </div>
    );
  }
  return (
    <div
      className={`experiment-four-layer-b experiment-eleven-layer-c experiment-eleven-top-layer experiment-eleven-layer-${layerId}`}
      role="presentation"
      aria-label={label}
      data-e11-top-layer={layerId}
      style={{
        ...e4SettingsToCssVars(layerCMaterial),
        ...e4LayerBDimensionStyle(layerCMaterial, false),
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
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
        edgeReflexEnabled={layerBackdropReflexEnabled('layerB', layerCMaterial)}
        rimSideGapTop={layerCMaterial.layerBRimSideGapTop}
        rimSideGapBottom={layerCMaterial.layerBRimSideGapBottom}
        backdropLights={layerBackdropLights('layerB', layerCMaterial)}
      />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--a" aria-hidden="true" />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--b" aria-hidden="true" />
    </div>
  );
}

function SelectedSaveLayerA({ material, showTopLayer }: { material: E4MaterialSettings; showTopLayer: boolean }) {
  const showNestedB = material.layerBNestedInA;
  const showInset = showNestedB || showTopLayer;
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
      {showInset && (
        <div className="experiment-four-layer-a__bezel-inset">
          {showNestedB && <SelectedSaveLayerB material={material} nested />}
        </div>
      )}
    </div>
  );
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
  zIndex,
  position,
  onPositionCommit,
  isCurrent,
}: {
  preview: SavePreview;
  zIndex: number;
  position: DragPoint;
  onPositionCommit: (position: DragPoint) => void;
  isCurrent: boolean;
}) {
  const freeLayerB = !preview.material.layerBNestedInA;
  const { layerCVisible, layerDVisible, layerEVisible } = useExperimentSetOne();
  const topLayers = useMemo(
    () => {
      if (preview.experiment !== 'eleven') return [];
      return [
        {
          id: 'c' as const,
          label: 'Layer C',
          visible: layerCVisible,
          override: preview.layerCOverride,
          layoutOverride: preview.layerCLayoutOverride,
          referenceGlass: preview.layerCReferenceGlass,
        },
        {
          id: 'd' as const,
          label: 'Layer D',
          visible: layerDVisible,
          override: preview.layerDOverride,
          layoutOverride: preview.layerDLayoutOverride,
          referenceGlass: null,
        },
        {
          id: 'e' as const,
          label: 'Layer E',
          visible: layerEVisible,
          referenceGlass: null,
          override: preview.layerEOverride,
          layoutOverride: preview.layerELayoutOverride,
        },
      ].filter((layer) => layer.visible && (layer.id === 'c' || layer.override));
    },
    [
      layerCVisible,
      layerDVisible,
      layerEVisible,
      preview.experiment,
      preview.layerCOverride,
      preview.layerDOverride,
      preview.layerEOverride,
      preview.layerCLayoutOverride,
      preview.layerDLayoutOverride,
      preview.layerELayoutOverride,
      preview.layerCReferenceGlass,
    ],
  );
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
      className={`experiment-set-one-selected-save-stage${isCurrent ? ' experiment-set-one-selected-save-stage--current' : ''}`}
      style={style}
      role="group"
      aria-label={label}
      data-selected-save-id={preview.id}
      data-selected-save-experiment={preview.experiment}
      data-selected-save-branch={preview.branchSlug ?? 'base'}
      data-bezel-style={preview.bezelStyle ?? undefined}
    >
      {isCurrent && <span className="experiment-set-one-selected-save-stage__current-badge">Current</span>}
      <div
        className="experiment-set-one-selected-save-stage__layer-a"
        style={{ transform: `translate(${SHOWCASE_PANEL_SNAP.x}px, ${SHOWCASE_PANEL_SNAP.y}px)` }}
        {...dragHandlers}
      >
        <SelectedSaveLayerA material={preview.material} showTopLayer={topLayers.length > 0} />
      </div>
      {freeLayerB && (
        <div
          className="experiment-set-one-selected-save-stage__free-layer-b"
          style={{ transform: `translate(${FREE_LAYER_B_SNAP.x}px, ${FREE_LAYER_B_SNAP.y}px)` }}
          {...dragHandlers}
        >
          <SelectedSaveLayerB material={preview.material} />
        </div>
      )}
      {topLayers.map((layer) => (
        <div
          key={layer.id}
          className={`experiment-set-one-selected-save-stage__layer-c experiment-set-one-selected-save-stage__layer-${layer.id}`}
          style={{ transform: `translate(${SHOWCASE_PANEL_SNAP.x}px, ${SHOWCASE_PANEL_SNAP.y}px)` }}
          {...dragHandlers}
        >
          <SelectedSaveLayerC
            material={preview.material}
            layerCOverride={layer.override}
            layoutOverride={layer.layoutOverride}
            layerId={layer.id}
            label={layer.label}
            referenceGlass={layer.referenceGlass}
          />
        </div>
      ))}
    </div>
  );
}

export function SelectedSaveStagePanels() {
  const {
    saves,
    selectedSaveIdByExperiment,
    selectedSaveKeysByExperiment,
    selectedSaveVisualOrder,
    selectedSavePositions,
    setSelectedSavePosition,
  } = useExperimentSetOne();
  const { slug: activeRenderVariant } = useRenderVariant();

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
        const current = isPreviewSaveCurrent(
          selectedSaveIdByExperiment[experiment],
          activeRenderVariant,
          snapshot.id,
          parsed.branchSlug,
        );
        return [{
          key: `${experiment}:${key}`,
          selectionKey: key,
          id: snapshot.id,
          experiment,
          label: snapshot.label,
          branchSlug: parsed.branchSlug,
          branchLabel,
          material,
          layerCOverride: snapshot.e11LayerC ?? null,
          layerDOverride: snapshot.e11LayerD ?? null,
          layerEOverride: snapshot.e11LayerE ?? null,
          layerCLayoutOverride: snapshot.e11LayerCLayout ?? null,
          layerDLayoutOverride: snapshot.e11LayerDLayout ?? null,
          layerELayoutOverride: snapshot.e11LayerELayout ?? null,
          layerCReferenceGlass: snapshot.e11LayerCReferenceGlass ?? null,
          bezelStyle: snapshot.bezelStyle ?? null,
          current,
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
    selectedSaveIdByExperiment,
    activeRenderVariant,
    selectedSaveKeysByExperiment,
    selectedSaveVisualOrder,
  ]);

  useEffect(() => {
    for (const { preview, layoutIndex } of previews) {
      if (selectedSavePositions[preview.key]) continue;
      setSelectedSavePosition(preview.key, {
        x: SELECTED_SAVE_DEFAULT_OFFSET.x + layoutIndex * SELECTED_SAVE_CASCADE_STEP,
        y: SELECTED_SAVE_DEFAULT_OFFSET.y + layoutIndex * SELECTED_SAVE_CASCADE_STEP,
      });
    }
  }, [previews, selectedSavePositions, setSelectedSavePosition]);

  if (previews.length === 0) return null;

  return (
    <>
      {previews.map(({ preview, zIndex }) => (
        <SelectedSaveStagePanel
          key={preview.key}
          preview={preview}
          zIndex={zIndex}
          position={selectedSavePositions[preview.key] ?? defaultSelectedSavePosition()}
          onPositionCommit={(position) => setSelectedSavePosition(preview.key, position)}
          isCurrent={preview.current}
        />
      ))}
    </>
  );
}
