import { e4InspectAttrs, e4LayerADimensionStyle, e4LayerBDimensionStyle } from './materialSettings';
import { useExperimentSetOne } from '../experiment-set-one/combinedSettings';
import { ExperimentTwoDraggableSheet } from '../experiment-set-two/primitives';
import { GlassFrostSurface } from '../shared/GlassFrostSurface';
import type { E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { PwzzovOGlassCorners, pwzzovBackdropReflexEnabled } from '../shared/PwzzovOGlassCorners';

/**
 * Subtle SVG displacement filter used by the Layer A/B refraction edge glint
 * (`.experiment-four-layer-*::before`). Mounted once per stage so the
 * `url(#e4-glass-refract)` reference resolves for Experiments Four and Five.
 */
export function ExperimentFourRefractionFilterDefs() {
  return (
    <svg
      className="experiment-four-svg-filters"
      aria-hidden="true"
      width="0"
      height="0"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter id="e4-glass-refract" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.016" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3.2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
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

function LayerCopy({
  eyebrow,
  title,
  subtitle,
  body,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
}) {
  return (
    <>
      <p className="experiment-one-panel__eyebrow">{eyebrow}</p>
      <h2 className="experiment-one-panel__title">{title}</h2>
      <p className="experiment-one-panel__subtitle">{subtitle}</p>
      <p className="experiment-one-panel__body">{body}</p>
      <p className="experiment-one-panel__drag-hint">Hold and drag · click to inspect</p>
    </>
  );
}

export function ExperimentFourLayerBSheet({ nested = false }: { nested?: boolean }) {
  const { e4 } = useExperimentSetOne();
  return (
    <div
      className="experiment-four-layer-b"
      role="region"
      aria-label="Experiment Four layer B"
      style={e4LayerBDimensionStyle(e4, nested)}
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
        edgeReflexEnabled={layerBackdropReflexEnabled('layerB', e4)}
        rimSideGapTop={e4.layerBRimSideGapTop}
        rimSideGapBottom={e4.layerBRimSideGapBottom}
        backdropLights={layerBackdropLights('layerB', e4)}
      />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--a" aria-hidden="true" />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--b" aria-hidden="true" />
      <div className="experiment-four-layer-b__content">
        <LayerCopy
          eyebrow="Reference frost"
          title="Layer B"
          subtitle="Experiment Four · frost body"
          body={
            nested
              ? 'Nested inside layer A bezel — inset and corner radius follow bezel layout settings.'
              : 'Frost body with opposite-corner shine.'
          }
        />
      </div>
    </div>
  );
}

export function ExperimentFourLayerASheet({ nestedB = false }: { nestedB?: boolean }) {
  const { e4 } = useExperimentSetOne();
  return (
    <div
      className="experiment-four-layer-a"
      role="region"
      aria-label="Experiment Four layer A"
      style={e4LayerADimensionStyle(e4)}
      {...e4InspectAttrs('layer-a')}
    >
      <span className="experiment-four-layer-a__bezel-rim" aria-hidden="true" {...e4InspectAttrs('layer-a-rim')} />
      <GlassFrostSurface />
      <span className="experiment-four-layer-a__bezel-rim-edge experiment-four-layer-a__bezel-rim-edge--top" aria-hidden="true" />
      <span className="experiment-four-layer-a__bezel-rim-edge experiment-four-layer-a__bezel-rim-edge--bottom" aria-hidden="true" />
      <span
        className="experiment-four-layer-a__bezel-rim-side experiment-four-layer-a__bezel-rim-side--left"
        aria-hidden="true"
      />
      <span
        className="experiment-four-layer-a__bezel-rim-side experiment-four-layer-a__bezel-rim-side--right"
        aria-hidden="true"
      />
      <span
        className="experiment-four-layer-a__radial-corners"
        aria-hidden="true"
        {...e4InspectAttrs('layer-a-radial')}
      />
      <PwzzovOGlassCorners
        layerClass="experiment-four-layer-a"
        inspectTarget="layer-a-corners"
        edgeReflexEnabled={layerBackdropReflexEnabled('layerA', e4)}
        rimSideGapTop={e4.layerARimSideGapTop}
        rimSideGapBottom={e4.layerARimSideGapBottom}
        backdropLights={layerBackdropLights('layerA', e4)}
      />
      {nestedB && (
        <div className="experiment-four-layer-a__bezel-inset">
          <ExperimentFourLayerBSheet nested />
        </div>
      )}
      <div className="experiment-four-layer-a__content">
        <LayerCopy
          eyebrow="Reference left panel"
          title="Layer A"
          subtitle="Experiment Four · bezel frame"
          body={
            nestedB
              ? 'Composite reference shell — layer B is nested inside with configurable bezel inset.'
              : 'Bezel frame — drag independently from layer B and stack to match the reference.'
          }
        />
      </div>
    </div>
  );
}

export function ExperimentFourDraggableLayerA({
  initialPosition = { x: 40, y: 48 },
  persistKey,
  layoutResetVersion = 0,
  nestedB = false,
}: {
  initialPosition?: { x: number; y: number };
  persistKey?: string;
  layoutResetVersion?: number;
  nestedB?: boolean;
}) {
  return (
    <ExperimentTwoDraggableSheet
      initialPosition={initialPosition}
      ariaLabel={nestedB ? 'Experiment Four — reference left panel' : 'Experiment Four — layer A'}
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentFourLayerASheet nestedB={nestedB} />
    </ExperimentTwoDraggableSheet>
  );
}

/** Separate draggable layer B — hidden when nested inside layer A. */
export function ExperimentFourDraggableLayerB({
  initialPosition = { x: 52, y: 132 },
  persistKey,
  layoutResetVersion = 0,
}: {
  initialPosition?: { x: number; y: number };
  persistKey?: string;
  layoutResetVersion?: number;
}) {
  return (
    <ExperimentTwoDraggableSheet
      initialPosition={initialPosition}
      raised
      ariaLabel="Experiment Four — layer B"
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentFourLayerBSheet />
    </ExperimentTwoDraggableSheet>
  );
}
