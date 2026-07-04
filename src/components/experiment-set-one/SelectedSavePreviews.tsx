import { useMemo, type CSSProperties } from 'react';
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
import { useRenderVariant } from '../../render-variants/RenderVariantContext';
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

function experimentShortLabel(experiment: PreviewExperiment): string {
  return `E${PREVIEW_EXPERIMENTS.indexOf(experiment) + 4}`;
}

function visualOrderIndex(order: number[], id: number): number {
  const index = order.indexOf(id);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
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

function saveIsCurrentStagePanel(
  preview: SavePreview,
  activeExperiment: ExperimentId,
  selectedSaveIdByExperiment: Record<ExperimentId, number | null>,
  activeRenderVariant: RenderVariantSlug | null,
): boolean {
  return (
    preview.experiment === activeExperiment &&
    preview.id === selectedSaveIdByExperiment[activeExperiment] &&
    preview.branchSlug === activeRenderVariant
  );
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

function SelectedSaveStagePanel({ preview, index, total }: { preview: SavePreview; index: number; total: number }) {
  const freeLayerB = !preview.material.layerBNestedInA;
  const style = {
    ...e4SettingsToCssVars(preview.material),
    zIndex: 30 + total - index,
  } as CSSProperties;
  const label = `${experimentShortLabel(preview.experiment)} ${preview.label}${preview.branchLabel ? ` ${preview.branchLabel}` : ''}`;

  return (
    <div
      className="experiment-set-one-selected-save-stage"
      style={style}
      role="group"
      aria-label={label}
    >
      <div
        className="experiment-set-one-selected-save-stage__layer-a"
        style={{ transform: selectedSaveTransform(SHOWCASE_PANEL_SNAP, index) }}
      >
        <SelectedSaveLayerA material={preview.material} />
      </div>
      {freeLayerB && (
        <div
          className="experiment-set-one-selected-save-stage__free-layer-b"
          style={{ transform: selectedSaveTransform(FREE_LAYER_B_SNAP, index) }}
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
    activeExperiment,
    selectedSaveIdByExperiment,
    selectedSaveKeysByExperiment,
    saveVisualOrder,
  } = useExperimentSetOne();
  const { slug: activeRenderVariant } = useRenderVariant();

  const previews = useMemo(() => {
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
          id: snapshot.id,
          experiment,
          label: snapshot.label,
          branchSlug: parsed.branchSlug,
          branchLabel,
          material,
        }];
      }),
    ).filter(
      (preview) =>
        !saveIsCurrentStagePanel(
          preview,
          activeExperiment,
          selectedSaveIdByExperiment,
          activeRenderVariant,
        ),
    ).sort(
      (a, b) =>
        visualOrderIndex(saveVisualOrder, a.id) - visualOrderIndex(saveVisualOrder, b.id) ||
        a.id - b.id ||
        a.key.localeCompare(b.key),
    );
  }, [
    activeExperiment,
    activeRenderVariant,
    saves,
    selectedSaveIdByExperiment,
    selectedSaveKeysByExperiment,
    saveVisualOrder,
  ]);

  if (previews.length === 0) return null;

  return (
    <>
      {previews.map((preview, index) => (
        <SelectedSaveStagePanel
          key={preview.key}
          preview={preview}
          index={index}
          total={previews.length}
        />
      ))}
    </>
  );
}
