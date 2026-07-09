import { Component, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ExperimentTwoDraggableSheet } from '../experiment-set-two/primitives';
import { ExperimentFiveDraggableLayerA as DefaultExperimentFiveLayerA } from '../experiment-set-five/primitives';
import { ExperimentSixDraggableLayerA as DefaultExperimentSixLayerA } from '../experiment-set-six/primitives';
import { ExperimentSevenDraggableLayerA as DefaultExperimentSevenLayerA } from '../experiment-set-seven/primitives';
import { ExperimentSixLayerCBezelPortal } from '../experiment-set-six/layerCBezelPortal';
import { ExperimentElevenLayerCBezelPortal } from './experimentElevenLayerC';
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
  experiment: 'four' | 'five' | 'six' | 'seven' | 'eight' | 'nine' | 'ten' | 'eleven';
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
  const { layerAVisible } = useLayerStageVisibility();
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

function ExperimentNineLayerBSheet({ nested = false }: { nested?: boolean }) {
  const { e9 } = useExperimentSetOne();
  return (
    <div
      className="experiment-four-layer-b"
      role="region"
      aria-label="Experiment Nine layer B"
      style={e4LayerBDimensionStyle(e9, nested)}
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
        edgeReflexEnabled={layerBackdropReflexEnabled('layerB', e9)}
        rimSideGapTop={e9.layerBRimSideGapTop}
        rimSideGapBottom={e9.layerBRimSideGapBottom}
        backdropLights={layerBackdropLights('layerB', e9)}
      />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--a" aria-hidden="true" />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--b" aria-hidden="true" />
      <div className="experiment-four-layer-b__content">
        <LayerCopy
          eyebrow="Reference frost"
          title="Layer B"
          subtitle="Experiment Nine · frost body"
          body={
            nested
              ? 'Nested inside layer A bezel — inset and corner radius follow bezel layout settings.'
              : 'Duplicate of Experiment Four frost body with independent E9 state.'
          }
        />
      </div>
    </div>
  );
}

function ExperimentNineLayerASheet({ nestedB = false }: { nestedB?: boolean }) {
  const { e9, layerBVisible } = useExperimentSetOne();
  const showNestedB = nestedB && layerBVisible;
  return (
    <div
      className="experiment-four-layer-a"
      role="region"
      aria-label="Experiment Nine layer A"
      style={e4LayerADimensionStyle(e9)}
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
        edgeReflexEnabled={layerBackdropReflexEnabled('layerA', e9)}
        rimSideGapTop={e9.layerARimSideGapTop}
        rimSideGapBottom={e9.layerARimSideGapBottom}
        backdropLights={layerBackdropLights('layerA', e9)}
      />
      {showNestedB && (
        <div className="experiment-four-layer-a__bezel-inset">
          <ExperimentNineLayerBSheet nested />
        </div>
      )}
      <div className="experiment-four-layer-a__content">
        <LayerCopy
          eyebrow="Reference left panel"
          title="Layer A"
          subtitle="Experiment Nine · bezel frame"
          body={
            showNestedB
              ? 'Composite reference shell — layer B is nested inside with configurable bezel inset.'
              : 'Duplicate of Experiment Four bezel frame with independent E9 state.'
          }
        />
      </div>
    </div>
  );
}

function ExperimentNineDraggableLayerA({
  initialPosition = SHOWCASE_PANEL_SNAP,
  persistKey,
  layoutResetVersion = 0,
  nestedB = false,
}: {
  initialPosition?: { x: number; y: number };
  persistKey?: string;
  layoutResetVersion?: number;
  nestedB?: boolean;
}) {
  const { layerAVisible, layerBVisible, layerCVisible } = useLayerStageVisibility();
  const keepNestedComposite = nestedB && layerBVisible;
  if (!layerAVisible && !keepNestedComposite && !layerCVisible) return null;

  return (
    <ExperimentTwoDraggableSheet
      initialPosition={initialPosition}
      ariaLabel={nestedB ? 'Experiment Nine — reference left panel' : 'Experiment Nine — layer A'}
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentNineLayerASheet nestedB={nestedB} />
    </ExperimentTwoDraggableSheet>
  );
}

function ExperimentNineDraggableLayerB({
  initialPosition = { x: 52, y: 60 },
  persistKey,
  layoutResetVersion = 0,
}: {
  initialPosition?: { x: number; y: number };
  persistKey?: string;
  layoutResetVersion?: number;
}) {
  const { layerBVisible } = useLayerStageVisibility();
  if (!layerBVisible) return null;

  return (
    <ExperimentTwoDraggableSheet
      initialPosition={initialPosition}
      raised
      ariaLabel="Experiment Nine — layer B"
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentNineLayerBSheet />
    </ExperimentTwoDraggableSheet>
  );
}

function ExperimentTenLayerBSheet({ nested = false }: { nested?: boolean }) {
  const { e10 } = useExperimentSetOne();
  return (
    <div
      className="experiment-four-layer-b"
      role="region"
      aria-label="Experiment Ten layer B"
      style={e4LayerBDimensionStyle(e10, nested)}
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
        edgeReflexEnabled={layerBackdropReflexEnabled('layerB', e10)}
        rimSideGapTop={e10.layerBRimSideGapTop}
        rimSideGapBottom={e10.layerBRimSideGapBottom}
        backdropLights={layerBackdropLights('layerB', e10)}
      />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--a" aria-hidden="true" />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--b" aria-hidden="true" />
      <div className="experiment-four-layer-b__content">
        <LayerCopy
          eyebrow="Reference frost"
          title="Layer B"
          subtitle="Experiment Ten · frost body"
          body={
            nested
              ? 'Nested inside layer A bezel — inset and corner radius follow bezel layout settings.'
              : 'Duplicate of Experiment Nine frost body with independent E10 state.'
          }
        />
      </div>
    </div>
  );
}

function ExperimentTenLayerASheet({ nestedB = false }: { nestedB?: boolean }) {
  const { e10, layerBVisible } = useExperimentSetOne();
  const showNestedB = nestedB && layerBVisible;
  return (
    <div
      className="experiment-four-layer-a"
      role="region"
      aria-label="Experiment Ten layer A"
      style={e4LayerADimensionStyle(e10)}
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
        edgeReflexEnabled={layerBackdropReflexEnabled('layerA', e10)}
        rimSideGapTop={e10.layerARimSideGapTop}
        rimSideGapBottom={e10.layerARimSideGapBottom}
        backdropLights={layerBackdropLights('layerA', e10)}
      />
      {showNestedB && (
        <div className="experiment-four-layer-a__bezel-inset">
          <ExperimentTenLayerBSheet nested />
        </div>
      )}
      <div className="experiment-four-layer-a__content">
        <LayerCopy
          eyebrow="Reference left panel"
          title="Layer A"
          subtitle="Experiment Ten · bezel frame"
          body={
            showNestedB
              ? 'Composite reference shell — layer B is nested inside with configurable bezel inset.'
              : 'Duplicate of Experiment Nine bezel frame with independent E10 state.'
          }
        />
      </div>
    </div>
  );
}

function ExperimentTenDraggableLayerA({
  initialPosition = SHOWCASE_PANEL_SNAP,
  persistKey,
  layoutResetVersion = 0,
  nestedB = false,
}: {
  initialPosition?: { x: number; y: number };
  persistKey?: string;
  layoutResetVersion?: number;
  nestedB?: boolean;
}) {
  const { layerAVisible, layerBVisible, layerCVisible } = useLayerStageVisibility();
  const keepNestedComposite = nestedB && layerBVisible;
  if (!layerAVisible && !keepNestedComposite && !layerCVisible) return null;

  return (
    <ExperimentTwoDraggableSheet
      initialPosition={initialPosition}
      ariaLabel={nestedB ? 'Experiment Ten — reference left panel' : 'Experiment Ten — layer A'}
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentTenLayerASheet nestedB={nestedB} />
    </ExperimentTwoDraggableSheet>
  );
}

function ExperimentTenDraggableLayerB({
  initialPosition = { x: 52, y: 60 },
  persistKey,
  layoutResetVersion = 0,
}: {
  initialPosition?: { x: number; y: number };
  persistKey?: string;
  layoutResetVersion?: number;
}) {
  const { layerBVisible } = useLayerStageVisibility();
  if (!layerBVisible) return null;

  return (
    <ExperimentTwoDraggableSheet
      initialPosition={initialPosition}
      raised
      ariaLabel="Experiment Ten — layer B"
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentTenLayerBSheet />
    </ExperimentTwoDraggableSheet>
  );
}

function ExperimentElevenLayerBSheet({
  nested = false,
  clipPath,
}: {
  nested?: boolean;
  clipPath?: string;
}) {
  const { e11 } = useExperimentSetOne();
  return (
    <div
      className="experiment-four-layer-b"
      role="region"
      aria-label="Experiment Eleven layer B"
      style={{ ...e4LayerBDimensionStyle(e11, nested), clipPath }}
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
        edgeReflexEnabled={layerBackdropReflexEnabled('layerB', e11)}
        rimSideGapTop={e11.layerBRimSideGapTop}
        rimSideGapBottom={e11.layerBRimSideGapBottom}
        backdropLights={layerBackdropLights('layerB', e11)}
      />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--a" aria-hidden="true" />
      <span className="experiment-four-layer-b__sparkle experiment-four-layer-b__sparkle--b" aria-hidden="true" />
      <div className="experiment-four-layer-b__content">
        <LayerCopy
          eyebrow="Reference frost"
          title="Layer B"
          subtitle="Experiment Eleven · frost body"
          body={
            nested
              ? 'Nested inside layer A bezel — inset and corner radius follow bezel layout settings.'
              : 'Duplicate of Experiment Ten frost body with independent E11 state.'
          }
        />
      </div>
    </div>
  );
}

/** Rounded-rect "hole" path (evenodd) cut out of a `width`x`height` box, sized/positioned to `hole`. */
function roundedNotchClipPath(width: number, height: number, hole: { x: number; y: number; width: number; height: number; radius: number }) {
  const r = Math.max(0, Math.min(hole.radius, hole.width / 2, hole.height / 2));
  const x = hole.x;
  const y = hole.y;
  const w = hole.width;
  const h = hole.height;
  const inner =
    r > 0
      ? `M${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`
      : `M${x},${y}H${x + w}V${y + h}H${x}Z`;
  return `path(evenodd, "M0,0H${width}V${height}H0Z ${inner}")`;
}

/** Tracks the live rect of `[data-e11-top-layer="c"]` inside `containerRef`, relative to the container. */
function useLiveLayerCRect(containerRef: RefObject<HTMLElement | null>, enabled: boolean) {
  const [rect, setRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!enabled) {
      setRect(null);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const target = container.querySelector<HTMLElement>('[data-e11-top-layer="c"]');
      if (!target) {
        setRect(null);
        return;
      }
      const containerBox = container.getBoundingClientRect();
      const targetBox = target.getBoundingClientRect();
      const next = {
        x: targetBox.left - containerBox.left,
        y: targetBox.top - containerBox.top,
        width: targetBox.width,
        height: targetBox.height,
      };
      setRect((prev) =>
        prev &&
        prev.x === next.x &&
        prev.y === next.y &&
        prev.width === next.width &&
        prev.height === next.height
          ? prev
          : next,
      );
    };

    measure();
    const observer = new MutationObserver(measure);
    observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, [containerRef, enabled]);

  return rect;
}

function ExperimentElevenLayerASheet({ nestedB = false }: { nestedB?: boolean }) {
  const {
    e11,
    layerBVisible,
    layerCVisible,
    layerDVisible,
    layerEVisible,
    saves,
    selectedSaveIdByExperiment,
    e11LayerCLayout,
  } = useExperimentSetOne();
  const selectedSaveId = selectedSaveIdByExperiment.eleven;
  const selectedSave = selectedSaveId == null ? undefined : saves.find((save) => save.id === selectedSaveId);
  const forceHideNestedBForLayerC = selectedSave?.e11LayerCPreserveOpacity === true;
  const paintNestedB = layerBVisible;
  const showNestedB = nestedB && layerBVisible;
  const showInset = layerBVisible || layerCVisible || layerDVisible || layerEVisible;
  const insetRef = useRef<HTMLDivElement>(null);
  const liveCRect = useLiveLayerCRect(insetRef, forceHideNestedBForLayerC && layerCVisible);
  const nestedBClipPath =
    forceHideNestedBForLayerC && layerCVisible && liveCRect
      ? (() => {
          const bWidth = e11.layerBWidth as number;
          const bHeight = e11.layerBHeight as number;
          const cutoutLayout = selectedSave?.e11LayerCLayout ?? e11LayerCLayout;
          if (!bWidth || !bHeight) return undefined;
          return roundedNotchClipPath(bWidth, bHeight, {
            x: liveCRect.x,
            y: liveCRect.y,
            width: liveCRect.width,
            height: liveCRect.height,
            radius: cutoutLayout.radius,
          });
        })()
      : undefined;
  return (
    <div
      className="experiment-four-layer-a"
      role="region"
      aria-label="Experiment Eleven layer A"
      style={e4LayerADimensionStyle(e11)}
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
        edgeReflexEnabled={layerBackdropReflexEnabled('layerA', e11)}
        rimSideGapTop={e11.layerARimSideGapTop}
        rimSideGapBottom={e11.layerARimSideGapBottom}
        backdropLights={layerBackdropLights('layerA', e11)}
      />
      {showInset && (
        <div className="experiment-four-layer-a__bezel-inset" ref={insetRef}>
          {paintNestedB && <ExperimentElevenLayerBSheet nested clipPath={nestedBClipPath} />}
        </div>
      )}
      <div className="experiment-four-layer-a__content">
        <LayerCopy
          eyebrow="Reference left panel"
          title="Layer A"
          subtitle="Experiment Eleven · right overlap pane"
          body={
            showNestedB
              ? 'Composite reference shell — layer B is nested inside with configurable bezel inset.'
              : 'Duplicate of Experiment Ten bezel frame with independent E11 state.'
          }
        />
      </div>
    </div>
  );
}

function ExperimentElevenDraggableLayerA({
  initialPosition = SHOWCASE_PANEL_SNAP,
  persistKey,
  layoutResetVersion = 0,
  nestedB = false,
}: {
  initialPosition?: { x: number; y: number };
  persistKey?: string;
  layoutResetVersion?: number;
  nestedB?: boolean;
}) {
  const { layerAVisible, layerBVisible, layerCVisible, layerDVisible, layerEVisible } = useLayerStageVisibility();
  const keepNestedComposite = nestedB && layerBVisible;
  const hasTopLayer = layerCVisible || layerDVisible || layerEVisible;
  if (!layerAVisible && !keepNestedComposite && !hasTopLayer) return null;

  return (
    <ExperimentTwoDraggableSheet
      initialPosition={initialPosition}
      ariaLabel={nestedB ? 'Experiment Eleven — right overlap pane' : 'Experiment Eleven — layer A'}
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentElevenLayerASheet nestedB={nestedB} />
    </ExperimentTwoDraggableSheet>
  );
}

function ExperimentElevenDraggableLayerB({
  initialPosition = { x: 52, y: 60 },
  persistKey,
  layoutResetVersion = 0,
}: {
  initialPosition?: { x: number; y: number };
  persistKey?: string;
  layoutResetVersion?: number;
}) {
  const { layerBVisible } = useLayerStageVisibility();
  if (!layerBVisible) return null;

  return (
    <ExperimentTwoDraggableSheet
      initialPosition={initialPosition}
      raised
      ariaLabel="Experiment Eleven — layer B"
      persistKey={persistKey}
      layoutResetVersion={layoutResetVersion}
    >
      <ExperimentElevenLayerBSheet />
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
  if (experiment === 'nine') {
    return (
      <>
        <ExperimentNineDraggableLayerA
          initialPosition={SHOWCASE_PANEL_SNAP}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4}
          layoutResetVersion={layoutResetVersion}
          nestedB={showNestedB}
        />
        {!nestedB && (
          <ExperimentNineDraggableLayerB
            initialPosition={{ x: 52, y: 60 }}
            persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerB4}
            layoutResetVersion={layoutResetVersion}
          />
        )}
      </>
    );
  }
  if (experiment === 'ten') {
    return (
      <>
        <ExperimentTenDraggableLayerA
          initialPosition={SHOWCASE_PANEL_SNAP}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA10}
          layoutResetVersion={layoutResetVersion}
          nestedB={showNestedB}
        />
        {!nestedB && (
          <ExperimentTenDraggableLayerB
            initialPosition={{ x: 52, y: 60 }}
            persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerB10}
            layoutResetVersion={layoutResetVersion}
          />
        )}
      </>
    );
  }
  if (experiment === 'eleven') {
    return (
      <>
        <ExperimentElevenDraggableLayerA
          initialPosition={SHOWCASE_PANEL_SNAP}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA11}
          layoutResetVersion={layoutResetVersion}
          nestedB={showNestedB}
        />
        {!nestedB && (
          <ExperimentElevenDraggableLayerB
            initialPosition={{ x: 52, y: 60 }}
            persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerB11}
            layoutResetVersion={layoutResetVersion}
          />
        )}
        <ExperimentElevenLayerCBezelPortal layoutResetVersion={layoutResetVersion} />
      </>
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
    ) : experiment === 'ten' ? (
      <>
        <ExperimentTenDraggableLayerA
          initialPosition={SHOWCASE_PANEL_SNAP}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA10}
          layoutResetVersion={layoutResetVersion}
          nestedB={showNestedB}
        />
        {!nestedB && (
          <ExperimentTenDraggableLayerB
            initialPosition={{ x: 52, y: 60 }}
            persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerB10}
            layoutResetVersion={layoutResetVersion}
          />
        )}
      </>
    ) : experiment === 'eleven' ? (
      <>
        <ExperimentElevenDraggableLayerA
          initialPosition={SHOWCASE_PANEL_SNAP}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA11}
          layoutResetVersion={layoutResetVersion}
          nestedB={showNestedB}
        />
        {!nestedB && (
          <ExperimentElevenDraggableLayerB
            initialPosition={{ x: 52, y: 60 }}
            persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerB11}
            layoutResetVersion={layoutResetVersion}
          />
        )}
        <ExperimentElevenLayerCBezelPortal layoutResetVersion={layoutResetVersion} />
      </>
    ) : experiment === 'nine' ? (
      <>
        <ExperimentNineDraggableLayerA
          initialPosition={SHOWCASE_PANEL_SNAP}
          persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerA4}
          layoutResetVersion={layoutResetVersion}
          nestedB={showNestedB}
        />
        {!nestedB && (
          <ExperimentNineDraggableLayerB
            initialPosition={{ x: 52, y: 60 }}
            persistKey={EXPERIMENT_SET_ONE_POSITION_KEYS.layerB4}
            layoutResetVersion={layoutResetVersion}
          />
        )}
      </>
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
