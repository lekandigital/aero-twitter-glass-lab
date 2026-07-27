import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useExperimentSetOne } from './combinedSettings';
import { useRenderVariant } from '../../render-variants/RenderVariantContext';
import {
  EXPERIMENT_SET_ONE_POSITION_KEYS,
  experimentElevenLayerCPositionKey,
} from './dragPositions';
import { isValidLayerCPosition } from './experimentElevenLayerCPosition';
import type { ExperimentSetOneSnapshot } from './savedConfigs';
import { ExperimentSetTwoDraggableShell } from '../experiment-set-two/primitives';
import {
  e4InspectAttrs,
  e4LayerBDimensionStyle,
  e4SettingsToCssVars,
  type E4MaterialSettings,
} from '../experiment-set-four/materialSettings';
import { GlassFrostSurface } from '../shared/GlassFrostSurface';
import { PwzzovOGlassCorners, pwzzovBackdropReflexEnabled } from '../shared/PwzzovOGlassCorners';
import {
  applyExperimentElevenLayerCLayout,
  experimentElevenLayerCDisplayMaterial,
  type ExperimentElevenLayerCLayoutSettings,
} from './experimentElevenLayerCMaterial';
import { e6LayerCInspectAttrs } from '../experiment-set-six/layerCMaterialSettings';
import {
  ExperimentElevenLayerCSwitcherGlass,
  type ExperimentElevenSwitcherGlassTone,
  type ExperimentElevenSwitcherGlassVariant,
} from './ExperimentElevenLayerCSwitcherGlass';
import { ThickLensPortal } from './ExperimentTwelveThickLens';
import {
  ExperimentElevenReferencePresetRenderer,
} from './ExperimentElevenReferencePresetRenderer';
import type { ExperimentElevenReferencePresetId } from './experimentElevenReferencePresets';

type ExperimentElevenTopLayerId = 'c' | 'd' | 'e';
type ExperimentElevenTopLayerMaterialField = 'e11LayerC' | 'e11LayerD' | 'e11LayerE';
type ExperimentElevenTopLayerLayoutField = 'e11LayerCLayout' | 'e11LayerDLayout' | 'e11LayerELayout';
type ExperimentElevenReferenceGlass = ExperimentElevenSwitcherGlassVariant | 'thick-lens';

const EXPERIMENT_ELEVEN_TOP_LAYERS = [
  {
    id: 'c',
    label: 'Layer C',
    field: 'e11LayerC',
    layoutField: 'e11LayerCLayout',
    persistKey: EXPERIMENT_SET_ONE_POSITION_KEYS.layerC11,
  },
  {
    id: 'd',
    label: 'Layer D',
    field: 'e11LayerD',
    layoutField: 'e11LayerDLayout',
    persistKey: EXPERIMENT_SET_ONE_POSITION_KEYS.layerD11,
  },
  {
    id: 'e',
    label: 'Layer E',
    field: 'e11LayerE',
    layoutField: 'e11LayerELayout',
    persistKey: EXPERIMENT_SET_ONE_POSITION_KEYS.layerE11,
  },
] as const satisfies readonly {
  id: ExperimentElevenTopLayerId;
  label: string;
  field: ExperimentElevenTopLayerMaterialField;
  layoutField: ExperimentElevenTopLayerLayoutField;
  persistKey: string;
}[];

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

function selectedSaveTopLayerOverride(
  save: ExperimentSetOneSnapshot | undefined,
  field: ExperimentElevenTopLayerMaterialField,
): Partial<E4MaterialSettings> | undefined {
  return save?.[field];
}

function selectedSaveTopLayerLayout(
  save: ExperimentSetOneSnapshot | undefined,
  field: ExperimentElevenTopLayerLayoutField,
): ExperimentElevenLayerCLayoutSettings | undefined {
  return save?.[field];
}

function ExperimentElevenTopLayerSheet({
  material,
  layerId,
  label,
  dampenTranslucency = false,
  backgroundOverride,
}: {
  material: E4MaterialSettings;
  layerId: ExperimentElevenTopLayerId;
  label: string;
  dampenTranslucency?: boolean;
  backgroundOverride?: string;
}) {
  const layerSettings = material;
  return (
    <div
      className={`experiment-four-layer-b experiment-eleven-layer-c experiment-eleven-top-layer experiment-eleven-layer-${layerId}`}
      role="region"
      aria-label={`Experiment Eleven layer ${layerId.toUpperCase()}`}
      style={{
        ...e4SettingsToCssVars(layerSettings),
        ...e4LayerBDimensionStyle(layerSettings, false),
        opacity: dampenTranslucency ? 0.9 : undefined,
        ...(backgroundOverride ? { background: backgroundOverride } : null),
      }}
      data-e11-top-layer={layerId}
      {...e6LayerCInspectAttrs('layer-c', `${label} · panel`, 'eleven')}
    >
      <span className="experiment-four-layer-b__rim-edge experiment-four-layer-b__rim-edge--top" aria-hidden="true" />
      <span className="experiment-four-layer-b__rim-edge experiment-four-layer-b__rim-edge--bottom" aria-hidden="true" />
      <span className="experiment-four-layer-b__rim-side experiment-four-layer-b__rim-side--left" aria-hidden="true" />
      <span className="experiment-four-layer-b__rim-side experiment-four-layer-b__rim-side--right" aria-hidden="true" />
      <GlassFrostSurface />
      <span className="experiment-four-layer-b__shine" aria-hidden="true" {...e4InspectAttrs('layer-b-shine')} />
      <span
        className="experiment-four-layer-b__radial-corners"
        aria-hidden="true"
        {...e4InspectAttrs('layer-b-radial')}
      />
      <PwzzovOGlassCorners
        layerClass="experiment-four-layer-b"
        inspectTarget="layer-b-corners"
        edgeReflexEnabled={layerBackdropReflexEnabled('layerB', layerSettings)}
        rimSideGapTop={layerSettings.layerBRimSideGapTop}
        rimSideGapBottom={layerSettings.layerBRimSideGapBottom}
        backdropLights={layerBackdropLights('layerB', layerSettings)}
      />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--a" aria-hidden="true" />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--b" aria-hidden="true" />
    </div>
  );
}

function ExperimentElevenLayerCDraggablePane({
  material,
  layerId,
  label,
  dampenTranslucency,
  initialPosition,
  persistKey,
  layoutResetVersion = 0,
  backgroundOverride,
  referenceGlass,
  referenceGlassTone,
  referencePreset,
}: {
  material: E4MaterialSettings;
  layerId: ExperimentElevenTopLayerId;
  label: string;
  dampenTranslucency: boolean;
  initialPosition: { x: number; y: number };
  persistKey: string;
  layoutResetVersion?: number;
  backgroundOverride?: string;
  referenceGlass?: ExperimentElevenReferenceGlass;
  referenceGlassTone?: ExperimentElevenSwitcherGlassTone;
  referencePreset?: ExperimentElevenReferencePresetId;
}) {
  const referenceAnchorRef = useRef<HTMLDivElement>(null);

  return (
    <ExperimentSetTwoDraggableShell
      bounds={referencePreset ? 'parent-overflow' : 'parent'}
      initialPosition={initialPosition}
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
      ariaLabel={`Experiment Eleven — layer ${layerId.toUpperCase()}`}
      className="experiment-six-layer-c-draggable"
    >
      {referencePreset ? (
        <div
          ref={referenceAnchorRef}
          className="experiment-eleven-reference-anchor"
          style={{
            width: material.layerBWidth as number,
            height: material.layerBHeight as number,
            borderRadius: material.layerBCornerRadius as number,
          }}
          data-e11-reference-anchor={referencePreset}
          data-e11-top-layer={layerId}
          aria-label={`${label} · ${referencePreset}`}
        >
          <ExperimentElevenReferencePresetRenderer
            key={referencePreset}
            presetId={referencePreset}
            anchorRef={referenceAnchorRef}
          />
        </div>
      ) : referenceGlass === 'thick-lens' ? (
        <>
          <div
            ref={referenceAnchorRef}
            className="experiment-eleven-thick-lens-anchor"
            style={{
              width: material.layerBWidth as number,
              height: material.layerBHeight as number,
              borderRadius: material.layerBCornerRadius as number,
            }}
            data-e11-top-layer={layerId}
            aria-hidden="true"
          />
          <ThickLensPortal
            anchorRef={referenceAnchorRef}
            ariaLabel="Experiment Eleven Layer C Thick lens"
            testId="experiment-eleven-thick-lens-surface"
          />
        </>
      ) : referenceGlass ? (
        <ExperimentElevenLayerCSwitcherGlass
          variant={referenceGlass}
          width={material.layerBWidth as number}
          height={material.layerBHeight as number}
          radius={material.layerBCornerRadius as number}
          tone={referenceGlassTone}
        />
      ) : (
        <ExperimentElevenTopLayerSheet
          material={material}
          layerId={layerId}
          label={label}
          dampenTranslucency={dampenTranslucency}
          backgroundOverride={backgroundOverride}
        />
      )}
    </ExperimentSetTwoDraggableShell>
  );
}

export function ExperimentElevenLayerCBezelPortal({ layoutResetVersion }: { layoutResetVersion: number }) {
  const {
    layerAVisible,
    layerBVisible,
    layerCVisible,
    layerDVisible,
    layerEVisible,
    e11,
    e11LayerCLayout,
    saves,
    selectedSaveIdByExperiment,
  } = useExperimentSetOne();
  const { slug } = useRenderVariant();
  const [inset, setInset] = useState<HTMLElement | null>(null);
  const selectedSaveId = selectedSaveIdByExperiment.eleven;
  const selectedSave = useMemo(
    () => (selectedSaveId == null ? undefined : saves.find((save) => save.id === selectedSaveId)),
    [saves, selectedSaveId],
  );
  const topLayers = useMemo(
    () =>
      EXPERIMENT_ELEVEN_TOP_LAYERS.flatMap((layer) => {
        const visible =
          layer.id === 'c' ? layerCVisible : layer.id === 'd' ? layerDVisible : layerEVisible;
        if (!visible) return [];
        const override = selectedSaveTopLayerOverride(selectedSave, layer.field);
        if (layer.id !== 'c' && !override) return [];
        const layout = selectedSaveTopLayerLayout(selectedSave, layer.layoutField) ?? e11LayerCLayout;
        const material = applyExperimentElevenLayerCLayout(
          experimentElevenLayerCDisplayMaterial(e11, override),
          layout,
        );
        const preserveOpacity = layer.id === 'c' && selectedSave?.e11LayerCPreserveOpacity;
        const backgroundOverride = layer.id === 'c' ? selectedSave?.e11LayerCBackgroundOverride : undefined;
        const referenceGlass = layer.id === 'c' ? selectedSave?.e11LayerCReferenceGlass : undefined;
        const referenceGlassTone = layer.id === 'c' ? selectedSave?.e11LayerCReferenceTone : undefined;
        const referencePreset = layer.id === 'c' ? selectedSave?.e11LayerCReferencePreset : undefined;
        return [{
          ...layer,
          material,
          dampenTranslucency: layerAVisible && layerBVisible && !preserveOpacity,
          backgroundOverride,
          referenceGlass,
          referenceGlassTone,
          referencePreset,
          // Layer C's stored position is namespaced per mounted reference
          // object. Without this a position dragged for one object is reapplied
          // to the next, differently sized object, which leaves a freshly
          // selected save visibly off its intended initial placement.
          persistKey:
            layer.id === 'c'
              ? experimentElevenLayerCPositionKey(referencePreset)
              : layer.persistKey,
          // An explicit saved position wins. The standardized reference saves
          // carry Save 248's exact Layer C offset, so they must not fall back to
          // the generic vertically-centred reference placement.
          initialPosition:
            (layer.id === 'c' && isValidLayerCPosition(selectedSave?.e11LayerCInitialPosition)
              ? selectedSave.e11LayerCInitialPosition
              : undefined) ?? {
              x: referencePreset
                ? Math.round((e11.layerBWidth as number - (material.layerBWidth as number)) / 2)
                : Math.max(0, Math.round((e11.layerBWidth as number - (material.layerBWidth as number)) / 2)),
              y: referencePreset
                ? Math.round((e11.layerBHeight as number - (material.layerBHeight as number)) / 2)
                : 0,
            },
        }];
      }),
    [e11, e11LayerCLayout, layerAVisible, layerBVisible, layerCVisible, layerDVisible, layerEVisible, selectedSave],
  );

  useLayoutEffect(() => {
    // Subscribing to an external system: the portal target is rendered by the
    // stage, not by this component, so it can only be resolved from the DOM
    // after layout. The previous run's cleanup already clears the target, so
    // the empty case needs no separate reset.
    if (topLayers.length === 0) return;
    const found = document.querySelector<HTMLElement>(
      '.experiment-set-one-stage__canvas .experiment-four-layer-a__bezel-inset',
    );
    // Resolving a portal target owned by another subtree is only possible
    // after layout; this matches the convention already used in GlassSurface
    // and FluidGlass.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInset(found);
    return () => setInset(null);
  }, [layoutResetVersion, slug, topLayers.length]);

  if (topLayers.length === 0 || !inset) return null;

  return createPortal(
    <>
      {topLayers.map((layer) => (
        <ExperimentElevenLayerCDraggablePane
          // Remount when the mounted object changes so the pane re-runs its
          // initial placement for the new geometry instead of keeping the
          // previous object's coordinates.
          key={`${layer.id}:${layer.referencePreset ?? layer.referenceGlass ?? 'sheet'}`}
          material={layer.material}
          layerId={layer.id}
          label={layer.label}
          dampenTranslucency={layer.dampenTranslucency}
          initialPosition={layer.initialPosition}
          persistKey={layer.persistKey}
          layoutResetVersion={layoutResetVersion}
          backgroundOverride={layer.backgroundOverride}
          referenceGlass={layer.referenceGlass}
          referenceGlassTone={layer.referenceGlassTone}
          referencePreset={layer.referencePreset}
        />
      ))}
    </>,
    inset,
  );
}
