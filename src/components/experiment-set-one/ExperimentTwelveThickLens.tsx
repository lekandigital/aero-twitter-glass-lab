import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue } from 'motion/react';
import { LiquidFilter } from '../../vendor/web-glass-effect/motion/liquid/filter';
import { CONVEX } from '../../vendor/web-glass-effect/motion/liquid/liquid-lib';

const THICK_LENS = {
  width: 320,
  height: 200,
  radius: 60,
  glassThickness: 260,
  bezelWidth: 70,
  refractiveIndex: 1.9,
  blur: 0.2,
  specularOpacity: 0.7,
  specularSaturation: 4,
  dpr: 1,
} as const;

/**
 * Experiment Twelve renders the upstream Thick lens as a page-level surface.
 *
 * Keeping the SVG filter and the draggable surface outside the transformed
 * experiment camera avoids the nested transform/backdrop coordinate mismatch
 * that changed the effect when it was mounted inside Experiment Eleven.
 */
export function ExperimentTwelveThickLens() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const filterId = `e12-thick-lens-${reactId.replace(/:/g, '')}`;
  const scaleRatio = useMotionValue(1);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="experiment-twelve-thick-lens-overlay"
      data-stage-experiment="twelve"
    >
      <LiquidFilter
        id={filterId}
        width={THICK_LENS.width}
        height={THICK_LENS.height}
        radius={THICK_LENS.radius}
        canvasWidth={THICK_LENS.width}
        canvasHeight={THICK_LENS.height}
        glassThickness={THICK_LENS.glassThickness}
        bezelWidth={THICK_LENS.bezelWidth}
        refractiveIndex={THICK_LENS.refractiveIndex}
        blur={THICK_LENS.blur}
        specularOpacity={THICK_LENS.specularOpacity}
        specularSaturation={THICK_LENS.specularSaturation}
        bezelHeightFn={CONVEX.fn}
        scaleRatio={scaleRatio}
        dpr={THICK_LENS.dpr}
      />
      <motion.div
        className="experiment-twelve-thick-lens"
        drag
        dragConstraints={overlayRef}
        dragElastic={0.04}
        dragMomentum={false}
        data-testid="experiment-twelve-surface"
        style={{
          width: THICK_LENS.width,
          height: THICK_LENS.height,
          borderRadius: THICK_LENS.radius,
          backdropFilter: `url(#${filterId})`,
          WebkitBackdropFilter: `url(#${filterId})`,
          boxShadow: '0 3px 14px rgba(0,0,0,0.1)',
        }}
        role="img"
        aria-label="Experiment Twelve Thick lens"
      />
    </div>,
    document.body,
  );
}
