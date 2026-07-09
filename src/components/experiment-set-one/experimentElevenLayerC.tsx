import { useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useExperimentSetOne } from './combinedSettings';
import { useRenderVariant } from '../../render-variants/RenderVariantContext';
import { EXPERIMENT_SET_ONE_POSITION_KEYS } from './dragPositions';
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
  type ExperimentElevenSwitcherGlassVariant,
} from './ExperimentElevenLayerCSwitcherGlass';

type ExperimentElevenTopLayerId = 'c' | 'd' | 'e';
type ExperimentElevenTopLayerMaterialField = 'e11LayerC' | 'e11LayerD' | 'e11LayerE';
type ExperimentElevenTopLayerLayoutField = 'e11LayerCLayout' | 'e11LayerDLayout' | 'e11LayerELayout';

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
}: {
  material: E4MaterialSettings;
  layerId: ExperimentElevenTopLayerId;
  label: string;
  dampenTranslucency: boolean;
  initialPosition: { x: number; y: number };
  persistKey: string;
  layoutResetVersion?: number;
  backgroundOverride?: string;
  referenceGlass?: ExperimentElevenSwitcherGlassVariant;
}) {
  return (
    <ExperimentSetTwoDraggableShell
      bounds="parent"
      initialPosition={initialPosition}
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
      ariaLabel={`Experiment Eleven — layer ${layerId.toUpperCase()}`}
      className="experiment-six-layer-c-draggable"
    >
      {referenceGlass ? (
        <ExperimentElevenLayerCSwitcherGlass
          variant={referenceGlass}
          width={material.layerBWidth as number}
          height={material.layerBHeight as number}
          radius={material.layerBCornerRadius as number}
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
        return [{
          ...layer,
          material,
          dampenTranslucency: layerAVisible && layerBVisible && !preserveOpacity,
          backgroundOverride,
          referenceGlass,
          initialPosition: {
            x: Math.max(0, Math.round((e11.layerBWidth as number - (material.layerBWidth as number)) / 2)),
            y: 0,
          },
        }];
      }),
    [e11, e11LayerCLayout, layerAVisible, layerBVisible, layerCVisible, layerDVisible, layerEVisible, selectedSave],
  );

  useLayoutEffect(() => {
    if (topLayers.length === 0) {
      setInset(null);
      return;
    }
    const found = document.querySelector<HTMLElement>(
      '.experiment-set-one-stage__canvas .experiment-four-layer-a__bezel-inset',
    );
    setInset(found);
    return () => setInset(null);
  }, [layoutResetVersion, slug, topLayers.length]);

  if (topLayers.length === 0 || !inset) return null;

  return createPortal(
    <>
      {topLayers.map((layer) => (
        <ExperimentElevenLayerCDraggablePane
          key={layer.id}
          material={layer.material}
          layerId={layer.id}
          label={layer.label}
          dampenTranslucency={layer.dampenTranslucency}
          initialPosition={layer.initialPosition}
          persistKey={layer.persistKey}
          layoutResetVersion={layoutResetVersion}
          backgroundOverride={layer.backgroundOverride}
          referenceGlass={layer.referenceGlass}
        />
      ))}
    </>,
    inset,
  );
}
