import { Component, type ReactNode } from 'react';
import { ExperimentTwoDraggableSheet } from '../experiment-set-two/primitives';
import { ExperimentFiveDraggableLayerA as DefaultExperimentFiveLayerA } from '../experiment-set-five/primitives';
import { ExperimentSixDraggableLayerA as DefaultExperimentSixLayerA } from '../experiment-set-six/primitives';
import { ExperimentSevenDraggableLayerA as DefaultExperimentSevenLayerA } from '../experiment-set-seven/primitives';
import { ExperimentSixLayerCBezelPortal } from '../experiment-set-six/layerCBezelPortal';
import {
  ExperimentFourDraggableLayerA,
  ExperimentFourDraggableLayerB,
} from '../experiment-set-four/primitives';
import { e4InspectAttrs, e4LayerADimensionStyle, e4LayerBDimensionStyle, type E4MaterialSettings } from '../experiment-set-four/materialSettings';
import { GlassFrostSurface } from '../shared/GlassFrostSurface';
import { useExperimentSetOne } from './combinedSettings';
import { EXPERIMENT_SET_ONE_POSITION_KEYS } from './dragPositions';
import { EXPERIMENT_SIX_PANEL_SNAP } from './experimentSixPanelGeometry';
import { SHOWCASE_PANEL_SNAP } from './showcasePanelGeometry';
import { useLayerStageVisibility } from './layerStageVisibility';
import { useRenderVariant } from '../../render-variants/RenderVariantContext';
import { PwzzovOGlassCorners, pwzzovBackdropReflexEnabled } from '../shared/PwzzovOGlassCorners';

type VariantPanelSlotsProps = {
  layoutResetVersion: number;
  nestedB: boolean;
  experiment: 'four' | 'five' | 'six' | 'seven' | 'eight';
};

const COMPACT_PANEL_SNAP = EXPERIMENT_SIX_PANEL_SNAP;

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

function ExperimentEightLayerBSheet() {
  const { e8 } = useExperimentSetOne();
  return (
    <div
      className="experiment-four-layer-b"
      role="region"
      aria-label="Experiment Eight layer B"
      style={e4LayerBDimensionStyle(e8, true)}
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
        edgeReflexEnabled={layerBackdropReflexEnabled('layerB', e8)}
        rimSideGapTop={e8.layerBRimSideGapTop}
        rimSideGapBottom={e8.layerBRimSideGapBottom}
        backdropLights={layerBackdropLights('layerB', e8)}
      />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--a" aria-hidden="true" />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--b" aria-hidden="true" />
      <div className="experiment-four-layer-b__content">
        <LayerCopy
          eyebrow="Reference frost"
          title="Layer B"
          subtitle="Experiment Eight · frost body"
          body="Compact geometry only — E8 keeps its own styling while matching the E7 dimensions and radii."
        />
      </div>
    </div>
  );
}

function ExperimentEightLayerASheet() {
  const { e8, layerBVisible } = useExperimentSetOne();
  const showNestedB = e8.layerBNestedInA && layerBVisible;
  return (
    <div
      className="experiment-four-layer-a"
      role="region"
      aria-label="Experiment Eight layer A"
      style={e4LayerADimensionStyle(e8)}
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
        edgeReflexEnabled={layerBackdropReflexEnabled('layerA', e8)}
        rimSideGapTop={e8.layerARimSideGapTop}
        rimSideGapBottom={e8.layerARimSideGapBottom}
        backdropLights={layerBackdropLights('layerA', e8)}
      />
      {showNestedB && (
        <div className="experiment-four-layer-a__bezel-inset">
          <ExperimentEightLayerBSheet />
        </div>
      )}
      <div className="experiment-four-layer-a__content">
        <LayerCopy
          eyebrow="Reference left panel"
          title="Layer A"
          subtitle="Experiment Eight · compact nested bezel"
          body="E8 preserves its own styling and only adopts the compact E7 dimensions and radii."
        />
      </div>
    </div>
  );
}

function ExperimentEightDraggableLayerA({
  initialPosition = COMPACT_PANEL_SNAP,
  persistKey,
  layoutResetVersion = 0,
}: {
  initialPosition?: { x: number; y: number };
  persistKey?: string;
  layoutResetVersion?: number;
}) {
  const { layerAVisible, layerBVisible } = useLayerStageVisibility();
  const { e8 } = useExperimentSetOne();
  if (!layerAVisible) return null;

  return (
    <ExperimentTwoDraggableSheet
      initialPosition={initialPosition}
      ariaLabel="Experiment Eight — compact panel"
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentEightLayerASheet />
    </ExperimentTwoDraggableSheet>
  );
}

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
  if (experiment === 'eight') {
    return (
      <ExperimentEightDraggableLayerA
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

  if (experiment === 'six' || experiment === 'seven' || experiment === 'eight') {
    const DefaultCompactPanel = experiment === 'six' ? DefaultExperimentSixLayerA : DefaultExperimentSevenLayerA;
    const mainPanel =
      experiment === 'seven' ? (
        <DefaultCompactPanel
          initialPosition={COMPACT_PANEL_SNAP}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4}
          layoutResetVersion={layoutResetVersion}
        />
      ) : experiment === 'eight' ? (
        <ExperimentEightDraggableLayerA
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
