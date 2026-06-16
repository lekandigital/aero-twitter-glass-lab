import { e4InspectAttrs } from './materialSettings';
import { ExperimentTwoDraggableSheet } from '../experiment-set-two/primitives';

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

export function ExperimentFourLayerASheet() {
  return (
    <div
      className="experiment-four-layer-a"
      role="region"
      aria-label="Experiment Four layer A"
      {...e4InspectAttrs('layer-a')}
    >
      <span className="experiment-four-layer-a__bezel-rim" aria-hidden="true" {...e4InspectAttrs('layer-a-rim')} />
      <span
        className="experiment-four-layer-a__radial-corners"
        aria-hidden="true"
        {...e4InspectAttrs('layer-a-radial')}
      />
      <span
        className="experiment-four-layer-a__pwzzovO-glass"
        aria-hidden="true"
        {...e4InspectAttrs('layer-a-corners')}
      />
      <div className="experiment-four-layer-a__content">
        <LayerCopy
          eyebrow="Reference left panel"
          title="Layer A"
          subtitle="Experiment Four · bezel frame"
          body="Reference-sized bezel with diagonal opposite-corner highlights — drag independently."
        />
      </div>
    </div>
  );
}

export function ExperimentFourLayerBSheet() {
  return (
    <div
      className="experiment-four-layer-b"
      role="region"
      aria-label="Experiment Four layer B"
      {...e4InspectAttrs('layer-b')}
    >
      <span className="experiment-four-layer-b__shine" aria-hidden="true" {...e4InspectAttrs('layer-b-shine')} />
      <span
        className="experiment-four-layer-b__radial-corners"
        aria-hidden="true"
        {...e4InspectAttrs('layer-b-radial')}
      />
      <span
        className="experiment-four-layer-b__pwzzovO-glass"
        aria-hidden="true"
        {...e4InspectAttrs('layer-b-corners')}
      />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--a" aria-hidden="true" />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--b" aria-hidden="true" />
      <div className="experiment-four-layer-b__content">
        <LayerCopy
          eyebrow="Reference frost"
          title="Layer B"
          subtitle="Experiment Four · frost body"
          body="Same height as layer A, inset frost body with opposite-corner shine."
        />
      </div>
    </div>
  );
}

export function ExperimentFourDraggableLayerA({
  initialPosition = { x: 280, y: 320 },
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
      ariaLabel="Experiment Four — layer A"
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentFourLayerASheet />
    </ExperimentTwoDraggableSheet>
  );
}

export function ExperimentFourDraggableLayerB({
  initialPosition = { x: 360, y: 260 },
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
