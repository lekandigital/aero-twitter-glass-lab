import { e4InspectAttrs, e4LayerADimensionStyle, e4LayerBDimensionStyle } from '../experiment-set-four/materialSettings';
import { useExperimentSetOne } from '../experiment-set-one/combinedSettings';
import { ExperimentTwoDraggableSheet } from '../experiment-set-two/primitives';
import { GlassFrostSurface } from '../shared/GlassFrostSurface';
import { PwzzovOGlassCorners } from '../shared/PwzzovOGlassCorners';

function layerEdgeReflexEnabled(
  mode: number,
  leftLight: number,
  leftDark: number,
  rightLight: number,
  rightDark: number,
): boolean {
  if (mode !== 3) return false;
  return leftLight > 0 || leftDark > 0 || rightLight > 0 || rightDark > 0;
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

function ExperimentFiveLayerBSheet() {
  const { e5 } = useExperimentSetOne();
  return (
    <div
      className="experiment-four-layer-b"
      role="region"
      aria-label="Experiment Five layer B"
      style={e4LayerBDimensionStyle(e5, true)}
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
        edgeReflexEnabled={layerEdgeReflexEnabled(
          e5.layerBGlassReflexMode,
          e5.layerBGlassReflexLeftLight,
          e5.layerBGlassReflexLeftDark,
          e5.layerBGlassReflexRightLight,
          e5.layerBGlassReflexRightDark,
        )}
        rimSideGapTop={e5.layerBRimSideGapTop}
        rimSideGapBottom={e5.layerBRimSideGapBottom}
        leftLight={e5.layerBGlassReflexLeftLight}
        rightLight={e5.layerBGlassReflexRightLight}
      />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--a" aria-hidden="true" />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--b" aria-hidden="true" />
      <div className="experiment-four-layer-b__content">
        <LayerCopy
          eyebrow="Reference frost"
          title="Layer B"
          subtitle="Experiment Five · nested frost body"
          body="Forced nested mode — layer B stays centered inside layer A."
        />
      </div>
    </div>
  );
}

function ExperimentFiveLayerASheet() {
  const { e5 } = useExperimentSetOne();
  return (
    <div
      className="experiment-four-layer-a"
      role="region"
      aria-label="Experiment Five layer A"
      style={e4LayerADimensionStyle(e5)}
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
        edgeReflexEnabled={layerEdgeReflexEnabled(
          e5.layerAGlassReflexMode,
          e5.layerAGlassReflexLeftLight,
          e5.layerAGlassReflexLeftDark,
          e5.layerAGlassReflexRightLight,
          e5.layerAGlassReflexRightDark,
        )}
        rimSideGapTop={e5.layerARimSideGapTop}
        rimSideGapBottom={e5.layerARimSideGapBottom}
        leftLight={e5.layerAGlassReflexLeftLight}
        rightLight={e5.layerAGlassReflexRightLight}
      />
      <div className="experiment-four-layer-a__bezel-inset">
        <ExperimentFiveLayerBSheet />
      </div>
      <div className="experiment-four-layer-a__content">
        <LayerCopy
          eyebrow="Reference left panel"
          title="Layer A"
          subtitle="Experiment Five · forced nested bezel"
          body="Same materials as Experiment Four saves, but always nested and forced to the Save 19 layout footprint."
        />
      </div>
    </div>
  );
}

export function ExperimentFiveDraggableLayerA({
  initialPosition = { x: 40, y: 48 },
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
      ariaLabel="Experiment Five — composite nested panel"
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentFiveLayerASheet />
    </ExperimentTwoDraggableSheet>
  );
}

