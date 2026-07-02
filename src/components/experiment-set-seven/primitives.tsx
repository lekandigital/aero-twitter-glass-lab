import { e4InspectAttrs, e4LayerADimensionStyle, e4LayerBDimensionStyle } from '../experiment-set-four/materialSettings';
import { useExperimentSetOne } from '../experiment-set-one/combinedSettings';
import { EXPERIMENT_SIX_PANEL_SNAP } from '../experiment-set-one/experimentSixPanelGeometry';
import { useLayerStageVisibility } from '../experiment-set-one/layerStageVisibility';
import { ExperimentTwoDraggableSheet } from '../experiment-set-two/primitives';

const E7_GLITCH_SHELL_CLASS = 'experiment-seven-glitch-shell';

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

/** Inner pill — same glitch-shell rendering as layer A, plus top/bottom hairlines. */
function ExperimentSevenLayerBSheet() {
  const { e7 } = useExperimentSetOne();
  return (
    <div
      className={`experiment-four-layer-b ${E7_GLITCH_SHELL_CLASS}`}
      role="region"
      aria-label="Experiment Seven layer B"
      style={e4LayerBDimensionStyle(e7, true)}
      {...e4InspectAttrs('layer-b')}
    >
      <span className="experiment-four-layer-b__rim-edge experiment-four-layer-b__rim-edge--top" aria-hidden="true" />
      <span className="experiment-four-layer-b__rim-edge experiment-four-layer-b__rim-edge--bottom" aria-hidden="true" />
      <div className="experiment-four-layer-b__content">
        <LayerCopy
          eyebrow="Reference frost"
          title="Layer B"
          subtitle="Experiment Seven · nested frost body"
          body="Compact nested inner rectangle — branch save materials from the loaded preset."
        />
      </div>
    </div>
  );
}

/** Outer shell — glitch-shell rendering (transparent body, pseudo rim only). */
function ExperimentSevenLayerASheet() {
  const { e7, layerBVisible } = useExperimentSetOne();

  return (
    <div
      className={`experiment-four-layer-a ${E7_GLITCH_SHELL_CLASS}`}
      role="region"
      aria-label="Experiment Seven layer A"
      style={e4LayerADimensionStyle(e7)}
      {...e4InspectAttrs('layer-a')}
    >
      {e7.layerBNestedInA && layerBVisible && (
        <div className="experiment-four-layer-a__bezel-inset">
          <ExperimentSevenLayerBSheet />
        </div>
      )}
      <div className="experiment-four-layer-a__content">
        <LayerCopy
          eyebrow="Reference left panel"
          title="Layer A"
          subtitle="Experiment Seven · compact nested bezel"
          body="Branch save materials — 326×38 outer, 321×35.3 inner (centered in A)."
        />
      </div>
    </div>
  );
}

export function ExperimentSevenDraggableLayerA({
  initialPosition = EXPERIMENT_SIX_PANEL_SNAP,
  persistKey,
  layoutResetVersion = 0,
}: {
  initialPosition?: { x: number; y: number };
  persistKey?: string;
  layoutResetVersion?: number;
}) {
  const { layerAVisible, layerBVisible } = useLayerStageVisibility();
  const { e7 } = useExperimentSetOne();
  if (!e7.layerBNestedInA) {
    if (!layerAVisible) return null;
  } else if (!layerAVisible && !layerBVisible) {
    return null;
  }

  return (
    <ExperimentTwoDraggableSheet
      initialPosition={initialPosition}
      ariaLabel="Experiment Seven — composite nested panel"
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentSevenLayerASheet />
    </ExperimentTwoDraggableSheet>
  );
}
