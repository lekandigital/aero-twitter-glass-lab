import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useExperimentSetOne } from './combinedSettings';
import { useRenderVariant } from '../../render-variants/RenderVariantContext';
import { EXPERIMENT_SET_ONE_POSITION_KEYS } from './dragPositions';
import { useHoldDrag } from '../shared/useHoldDrag';
import {
  e4InspectAttrs,
  e4LayerBDimensionStyle,
  e4SettingsToCssVars,
  type E4MaterialSettings,
} from '../experiment-set-four/materialSettings';
import { GlassFrostSurface } from '../shared/GlassFrostSurface';
import { PwzzovOGlassCorners, pwzzovBackdropReflexEnabled } from '../shared/PwzzovOGlassCorners';
import { experimentElevenLayerCDisplayMaterial } from './experimentElevenLayerCMaterial';

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

function ExperimentElevenLayerCSheet() {
  const { e11, saves, selectedSaveIdByExperiment } = useExperimentSetOne();
  const selectedSaveId = selectedSaveIdByExperiment.eleven;
  const selectedSave = useMemo(
    () => (selectedSaveId == null ? undefined : saves.find((save) => save.id === selectedSaveId)),
    [saves, selectedSaveId],
  );
  const layerCSettings: E4MaterialSettings = useMemo(
    () => experimentElevenLayerCDisplayMaterial(e11, selectedSave?.e11LayerC),
    [e11, selectedSave?.e11LayerC],
  );

  return (
    <div
      className="experiment-four-layer-b experiment-eleven-layer-c"
      role="region"
      aria-label="Experiment Eleven layer C"
      style={{ ...e4SettingsToCssVars(layerCSettings), ...e4LayerBDimensionStyle(layerCSettings, false) }}
      {...e4InspectAttrs('layer-b')}
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
        edgeReflexEnabled={layerBackdropReflexEnabled('layerB', layerCSettings)}
        rimSideGapTop={layerCSettings.layerBRimSideGapTop}
        rimSideGapBottom={layerCSettings.layerBRimSideGapBottom}
        backdropLights={layerBackdropLights('layerB', layerCSettings)}
      />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--a" aria-hidden="true" />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--b" aria-hidden="true" />
    </div>
  );
}

function ExperimentElevenLayerCDraggablePane({
  initialPosition,
  layoutResetVersion = 0,
}: {
  initialPosition: { x: number; y: number };
  layoutResetVersion?: number;
}) {
  const boundsRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const { position, dragging, onPointerDown, onPointerMove, endDrag } = useHoldDrag({
    shellRef,
    boundsRef,
    initialPosition,
    bounds: 'viewport',
    persistKey: EXPERIMENT_SET_ONE_POSITION_KEYS.layerC11,
    layoutResetVersion,
  });

  return (
    <div
      ref={shellRef}
      className={`experiment-set-two-draggable experiment-six-layer-c-draggable${dragging ? ' experiment-set-two-draggable--active' : ''}`}
      style={{
        position: 'fixed',
        left: position?.x ?? initialPosition.x,
        top: position?.y ?? initialPosition.y,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="application"
      aria-label="Experiment Eleven — layer C"
      aria-roledescription="draggable"
    >
      <ExperimentElevenLayerCSheet />
    </div>
  );
}

export function ExperimentElevenLayerCBezelPortal({ layoutResetVersion }: { layoutResetVersion: number }) {
  const { layerCVisible } = useExperimentSetOne();
  const { slug } = useRenderVariant();
  const [inset, setInset] = useState<HTMLElement | null>(null);

  const initialPosition = useMemo(
    () => ({
      x: 0,
      y: 0,
    }),
    [],
  );

  useLayoutEffect(() => {
    if (!layerCVisible) {
      setInset(null);
      return;
    }
    const found = document.querySelector<HTMLElement>(
      '.experiment-set-one-stage__canvas .experiment-four-layer-a__bezel-inset',
    );
    setInset(found);
    return () => setInset(null);
  }, [layoutResetVersion, slug, layerCVisible]);

  if (!layerCVisible || !inset) return null;

  return createPortal(
    <ExperimentElevenLayerCDraggablePane initialPosition={initialPosition} layoutResetVersion={layoutResetVersion} />,
    inset,
  );
}
