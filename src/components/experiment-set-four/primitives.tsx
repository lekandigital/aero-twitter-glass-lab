import { e4InspectAttrs, e4LayerADimensionStyle, e4LayerBDimensionStyle } from './materialSettings';
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
        edgeReflexEnabled={layerEdgeReflexEnabled(
          e4.layerBGlassReflexMode,
          e4.layerBGlassReflexLeftLight,
          e4.layerBGlassReflexLeftDark,
          e4.layerBGlassReflexRightLight,
          e4.layerBGlassReflexRightDark,
        )}
        rimSideGapTop={e4.layerBRimSideGapTop}
        rimSideGapBottom={e4.layerBRimSideGapBottom}
        leftLight={e4.layerBGlassReflexLeftLight}
        rightLight={e4.layerBGlassReflexRightLight}
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
        edgeReflexEnabled={layerEdgeReflexEnabled(
          e4.layerAGlassReflexMode,
          e4.layerAGlassReflexLeftLight,
          e4.layerAGlassReflexLeftDark,
          e4.layerAGlassReflexRightLight,
          e4.layerAGlassReflexRightDark,
        )}
        rimSideGapTop={e4.layerARimSideGapTop}
        rimSideGapBottom={e4.layerARimSideGapBottom}
        leftLight={e4.layerAGlassReflexLeftLight}
        rightLight={e4.layerAGlassReflexRightLight}
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
