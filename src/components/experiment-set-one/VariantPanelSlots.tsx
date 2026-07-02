import { Component, type ReactNode } from 'react';
import { ExperimentFiveDraggableLayerA as DefaultExperimentFiveLayerA } from '../experiment-set-five/primitives';
import { ExperimentSixDraggableLayerA as DefaultExperimentSixLayerA } from '../experiment-set-six/primitives';
import { ExperimentSevenDraggableLayerA as DefaultExperimentSevenLayerA } from '../experiment-set-seven/primitives';
import { ExperimentSixLayerCBezelPortal } from '../experiment-set-six/layerCBezelPortal';
import {
  ExperimentFourDraggableLayerA,
  ExperimentFourDraggableLayerB,
} from '../experiment-set-four/primitives';
import { EXPERIMENT_SET_ONE_POSITION_KEYS } from './dragPositions';
import { EXPERIMENT_SIX_PANEL_SNAP } from './experimentSixPanelGeometry';
import { SHOWCASE_PANEL_SNAP } from './showcasePanelGeometry';
import { useLayerStageVisibility } from './layerStageVisibility';
import { useRenderVariant } from '../../render-variants/RenderVariantContext';

type VariantPanelSlotsProps = {
  layoutResetVersion: number;
  nestedB: boolean;
  experiment: 'four' | 'five' | 'six' | 'seven';
};

const COMPACT_PANEL_SNAP = EXPERIMENT_SIX_PANEL_SNAP;

/**
 * Render the default (main-branch) panels if the active variant pipeline throws,
 * instead of letting one bad branch crash the whole page. Keyed by `resetKey` so a
 * recovered/different variant gets a fresh attempt.
 */
class VariantErrorBoundary extends Component<
  { resetKey: string; fallback: ReactNode; children: ReactNode },
  { failedKey: string | null }
> {
  state = { failedKey: null as string | null };

  static getDerivedStateFromError() {
    return {};
  }

  componentDidCatch(error: unknown) {
    this.setState({ failedKey: this.props.resetKey });
    console.error(`Render variant "${this.props.resetKey}" failed; using default pipeline.`, error);
  }

  render() {
    if (this.state.failedKey === this.props.resetKey) return this.props.fallback;
    return this.props.children;
  }
}

function ExperimentSixStagePanels({
  layoutResetVersion,
  useVariantPortal,
}: {
  layoutResetVersion: number;
  useVariantPortal: boolean;
}) {
  if (!useVariantPortal) return null;
  return <ExperimentSixLayerCBezelPortal layoutResetVersion={layoutResetVersion} />;
}

function DefaultPanels({ layoutResetVersion, nestedB, experiment }: VariantPanelSlotsProps) {
  const { layerBVisible } = useLayerStageVisibility();
  const showNestedB = nestedB && layerBVisible;

  if (experiment === 'five') {
    return (
      <DefaultExperimentFiveLayerA
        initialPosition={SHOWCASE_PANEL_SNAP}
        persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4}
        layoutResetVersion={layoutResetVersion}
      />
    );
  }
  if (experiment === 'six') {
    return (
      <>
        <DefaultExperimentSixLayerA
          initialPosition={COMPACT_PANEL_SNAP}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4}
          layoutResetVersion={layoutResetVersion}
        />
        <ExperimentSixStagePanels layoutResetVersion={layoutResetVersion} useVariantPortal={false} />
      </>
    );
  }
  if (experiment === 'seven') {
    return (
      <DefaultExperimentSevenLayerA
        initialPosition={COMPACT_PANEL_SNAP}
        persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4}
        layoutResetVersion={layoutResetVersion}
      />
    );
  }
  return (
    <>
      <ExperimentFourDraggableLayerA
        initialPosition={SHOWCASE_PANEL_SNAP}
        persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4}
        layoutResetVersion={layoutResetVersion}
        nestedB={showNestedB}
      />
      {!nestedB && (
        <ExperimentFourDraggableLayerB
          initialPosition={{ x: 52, y: 60 }}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerB4}
          layoutResetVersion={layoutResetVersion}
        />
      )}
    </>
  );
}

/** Render only the active branch pipeline — one panel at a time. */
export function VariantPanelSlots(props: VariantPanelSlotsProps) {
  const { layoutResetVersion, nestedB, experiment } = props;
  const { layerBVisible } = useLayerStageVisibility();
  const { slug, module } = useRenderVariant();
  const fallback = <DefaultPanels {...props} />;
  const showNestedB = nestedB && layerBVisible;

  if (experiment === 'six' || experiment === 'seven') {
    const DefaultCompactPanel = experiment === 'six' ? DefaultExperimentSixLayerA : DefaultExperimentSevenLayerA;
    const mainPanel =
      experiment === 'seven' ? (
        <DefaultCompactPanel
          initialPosition={COMPACT_PANEL_SNAP}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4}
          layoutResetVersion={layoutResetVersion}
        />
        ) : module ? (
        <module.ExperimentFiveDraggableLayerA
          initialPosition={COMPACT_PANEL_SNAP}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4}
          layoutResetVersion={layoutResetVersion}
        />
      ) : (
        <DefaultCompactPanel
          initialPosition={COMPACT_PANEL_SNAP}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4}
          layoutResetVersion={layoutResetVersion}
        />
      );

    return (
      <>
        <VariantErrorBoundary resetKey={`${slug ?? 'default'}-${experiment}-main`} fallback={fallback}>
          {mainPanel}
        </VariantErrorBoundary>
        {experiment === 'six' && (
          <ExperimentSixStagePanels layoutResetVersion={layoutResetVersion} useVariantPortal={Boolean(module)} />
        )}
      </>
    );
  }

  if (!module) return fallback;

  const variantPanels =
    experiment === 'five' ? (
      <module.ExperimentFiveDraggableLayerA
        initialPosition={SHOWCASE_PANEL_SNAP}
        persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4}
        layoutResetVersion={layoutResetVersion}
      />
    ) : (
      <>
        <module.ExperimentFourDraggableLayerA
          initialPosition={SHOWCASE_PANEL_SNAP}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4}
          layoutResetVersion={layoutResetVersion}
          nestedB={showNestedB}
        />
        {!nestedB && (
          <module.ExperimentFourDraggableLayerB
            initialPosition={{ x: 52, y: 60 }}
            persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerB4}
            layoutResetVersion={layoutResetVersion}
          />
        )}
      </>
    );

  return (
    <VariantErrorBoundary resetKey={`${slug ?? 'default'}-${experiment}`} fallback={fallback}>
      {variantPanels}
    </VariantErrorBoundary>
  );
}
