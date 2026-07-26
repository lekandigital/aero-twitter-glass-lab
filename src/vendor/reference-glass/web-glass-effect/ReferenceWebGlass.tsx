import { useId } from 'react';
import { useMotionValue } from 'motion/react';
import { LiquidFilter } from '../../web-glass-effect/motion/liquid/filter';
import {
  BUBBLE,
  CONCAVE,
  CONVEX,
  CONVEX_CIRCLE,
  ELASTIC,
  LIP,
  STEPPED,
  WAVE,
} from '../../web-glass-effect/motion/liquid/liquid-lib';

export type WebGlassSurfaceKey =
  | 'CONVEX_CIRCLE'
  | 'CONVEX'
  | 'CONCAVE'
  | 'LIP'
  | 'WAVE'
  | 'STEPPED'
  | 'ELASTIC'
  | 'BUBBLE';

export type WebGlassReferenceConfig = {
  glassThickness: number;
  bezelWidth: number;
  refractiveIndex: number;
  blur: number;
  specularOpacity: number;
  specularSaturation: number;
  surface: WebGlassSurfaceKey;
  width: number;
  height: number;
  radius: number;
  dpr: number;
  scaleRatio: number;
  canvasPad: number;
};

const SURFACES = {
  CONVEX_CIRCLE,
  CONVEX,
  CONCAVE,
  LIP,
  WAVE,
  STEPPED,
  ELASTIC,
  BUBBLE,
} as const;

function safeFilterId(prefix: string, presetId: string, reactId: string) {
  return `${prefix}-${presetId}-${reactId}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

/**
 * Exact `LiquidFilter` renderer used by web-glass-effectshowcase. The five
 * requested presets all use the source's CONVEX surface, but the adapter keeps
 * the complete source surface-key contract so the registry remains extensible.
 */
export function WebGlassReferenceSurface({
  presetId,
  config,
  interactive = false,
  children,
}: {
  presetId: string;
  config: WebGlassReferenceConfig;
  interactive?: boolean;
  children?: React.ReactNode;
}) {
  const reactId = useId();
  const filterId = safeFilterId('e11-web-glass', presetId, reactId);
  const scaleRatio = useMotionValue(config.scaleRatio);
  const canvasWidth = config.width + config.canvasPad * 2;
  const canvasHeight = config.height + config.canvasPad * 2;

  return (
    <div
      className={`e11-web-glass-surface${
        interactive ? ' experiment-eleven-reference-interactive' : ''
      }`}
      data-e11-web-glass-preset={presetId}
      data-glass-thickness={config.glassThickness}
      data-bezel-width={config.bezelWidth}
      data-refractive-index={config.refractiveIndex}
      data-blur={config.blur}
      data-specular-opacity={config.specularOpacity}
      data-specular-saturation={config.specularSaturation}
      data-surface={config.surface}
      data-dpr={config.dpr}
      data-scale-ratio={config.scaleRatio}
      data-canvas-pad={config.canvasPad}
      style={{
        width: config.width,
        height: config.height,
        borderRadius: config.radius,
        backdropFilter: `url(#${filterId})`,
        WebkitBackdropFilter: `url(#${filterId})`,
      }}
    >
      <LiquidFilter
        id={filterId}
        width={config.width}
        height={config.height}
        radius={config.radius}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        glassThickness={config.glassThickness}
        bezelWidth={config.bezelWidth}
        refractiveIndex={config.refractiveIndex}
        blur={config.blur}
        specularOpacity={config.specularOpacity}
        specularSaturation={config.specularSaturation}
        bezelHeightFn={SURFACES[config.surface].fn}
        scaleRatio={scaleRatio}
        dpr={config.dpr}
      />
      {children}
    </div>
  );
}

export type LiquidMainReferenceConfig = {
  width: number;
  height: number;
  radius: number;
  glassThickness: number;
  bezelWidth: number;
  refractiveIndex: number;
  scaleRatio: number;
  blur: number;
  specularOpacity: number;
  specularSaturation: number;
  innerShadowColor: string;
  innerShadowBlur: number;
  innerShadowSpread: number;
  tintColor: string;
  tintOpacity: number;
  outerShadowBlur: number;
  outerShadowColor: string;
};

/**
 * The current liquid-glass-main CPU-canvas/SVG graph. It intentionally does
 * not use the showcase preset adapter above: the source clamps its bezel to
 * radius - 1 / half-size - 1 and derives the specular bezel as 2.5× that
 * clamped value.
 */
export function LiquidMainReferenceSurface({
  presetId,
  config,
}: {
  presetId: string;
  config: LiquidMainReferenceConfig;
}) {
  const reactId = useId();
  const filterId = safeFilterId('e11-liquid-main', presetId, reactId);
  const scaleRatio = useMotionValue(config.scaleRatio);
  const clampedBezel = Math.min(
    config.bezelWidth,
    config.radius - 1,
    Math.min(config.width, config.height) / 2 - 1,
  );

  return (
    <div
      className="e11-liquid-main-surface"
      data-e11-liquid-main-preset={presetId}
      data-glass-thickness={config.glassThickness}
      data-bezel-width={config.bezelWidth}
      data-clamped-bezel-width={clampedBezel}
      data-refractive-index={config.refractiveIndex}
      data-scale-ratio={config.scaleRatio}
      data-blur={config.blur}
      data-specular-opacity={config.specularOpacity}
      data-specular-saturation={config.specularSaturation}
      data-inner-shadow-color={config.innerShadowColor}
      data-tint-color={config.tintColor}
      data-tint-opacity={config.tintOpacity}
      style={{
        width: config.width,
        height: config.height,
        borderRadius: config.radius,
        boxShadow: `0 4px ${config.outerShadowBlur}px ${config.outerShadowColor}`,
      }}
    >
      <LiquidFilter
        id={filterId}
        width={config.width}
        height={config.height}
        radius={config.radius}
        canvasWidth={config.width}
        canvasHeight={config.height}
        glassThickness={config.glassThickness}
        bezelWidth={clampedBezel}
        refractiveIndex={config.refractiveIndex}
        blur={config.blur}
        specularOpacity={config.specularOpacity}
        specularSaturation={config.specularSaturation}
        specularBezelWidth={clampedBezel * 2.5}
        bezelHeightFn={CONVEX.fn}
        scaleRatio={scaleRatio}
        dpr={1}
      />
      <div
        className="e11-liquid-main-surface__refraction"
        style={{
          borderRadius: config.radius,
          backdropFilter: `url(#${filterId})`,
          WebkitBackdropFilter: `url(#${filterId})`,
        }}
        aria-hidden="true"
      />
      <div
        className="e11-liquid-main-surface__appearance"
        style={{
          borderRadius: config.radius,
          boxShadow: `inset 0 0 ${config.innerShadowBlur}px ${config.innerShadowSpread}px ${config.innerShadowColor}`,
          backgroundColor: `color-mix(in srgb, ${config.tintColor} ${
            config.tintOpacity * 100
          }%, transparent)`,
        }}
        aria-hidden="true"
      />
    </div>
  );
}

