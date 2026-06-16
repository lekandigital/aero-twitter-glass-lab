import { e3InspectAttrs } from './materialSettings';
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

/** Layer A — ultra-transparent bezel frame (independent draggable) */
export function ExperimentThreeLayerASheet() {
  return (
    <div
      className="experiment-three-layer-a"
      role="region"
      aria-label="Experiment Three layer A"
      {...e3InspectAttrs('layer-a')}
    >
      <span className="experiment-three-layer-a__bezel-rim" aria-hidden="true" {...e3InspectAttrs('layer-a-rim')} />
      <div className="experiment-three-layer-a__content">
        <LayerCopy
          eyebrow="Reference bezel"
          title="Layer A"
          subtitle="Experiment Three · bezel frame"
          body="Ultra-clear outer pane — drag and place independently, then layer B on top."
        />
      </div>
    </div>
  );
}

/** Layer B — frosted body sheet (independent draggable) */
export function ExperimentThreeLayerBSheet() {
  return (
    <div
      className="experiment-three-layer-b"
      role="region"
      aria-label="Experiment Three layer B"
      {...e3InspectAttrs('layer-b')}
    >
      <span className="experiment-three-layer-b__shine" aria-hidden="true" {...e3InspectAttrs('layer-b-shine')} />
      <span className="experiment-three-layer-b__sparkle experiment-three-layer-b__sparkle--a" aria-hidden="true" />
      <span className="experiment-three-layer-b__sparkle experiment-three-layer-b__sparkle--b" aria-hidden="true" />
      <div className="experiment-three-layer-b__content">
        <LayerCopy
          eyebrow="Reference frost"
          title="Layer B"
          subtitle="Experiment Three · frost body"
          body="Milky frosted inner sheet — drag on top of layer A yourself."
        />
      </div>
    </div>
  );
}

export function ExperimentThreeDraggableLayerA({
  initialPosition = { x: 120, y: 320 },
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
      ariaLabel="Experiment Three — layer A"
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentThreeLayerASheet />
    </ExperimentTwoDraggableSheet>
  );
}

export function ExperimentThreeDraggableLayerB({
  initialPosition = { x: 200, y: 260 },
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
      ariaLabel="Experiment Three — layer B"
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentThreeLayerBSheet />
    </ExperimentTwoDraggableSheet>
  );
}
