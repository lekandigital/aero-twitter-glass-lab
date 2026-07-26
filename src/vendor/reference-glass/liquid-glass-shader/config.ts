import type {
  ReferenceObjectContract,
  ReferenceObjectGeometry,
} from '../shared/sourceObjectContract';

export type LiquidGlassShaderOutputMask =
  | 'source-superellipse'
  | 'rounded-rect-geometry-adaptation';

export interface LiquidGlassShaderConfig {
  width: number;
  height: number;
  radius: number | null;
  outputMask: LiquidGlassShaderOutputMask;
  sourceCanvasDpr: 1;
  powerExponent: 6;
  sampleRange: 4;
  sampleOffset: 0.5;
  lightingIntensity: 0.3;
}

export const LIQUID_GLASS_SHADER_REFERENCE_VIEWPORT = {
  width: 1440,
  height: 1000,
} as const;

export const LIQUID_GLASS_SHADER_SOURCE_GEOMETRY = {
  kind: 'viewport-coupled-superellipse',
  cssRadius: null,
  powerExponent: 6,
  threshold: 0.0001,
  boundingSizePerViewportHeight: 2 * Math.pow(0.0001, 1 / 6),
  referenceViewport: LIQUID_GLASS_SHADER_REFERENCE_VIEWPORT,
  referenceBoundingWidth:
    2 *
    Math.pow(0.0001, 1 / 6) *
    LIQUID_GLASS_SHADER_REFERENCE_VIEWPORT.height,
  referenceBoundingHeight:
    2 *
    Math.pow(0.0001, 1 / 6) *
    LIQUID_GLASS_SHADER_REFERENCE_VIEWPORT.height,
} as const;

/**
 * The source has no discrete native DOM object. This 431px technical envelope
 * is the rounded source shader's observed bounding square at the audited
 * 1440x1000 reference viewport; the alpha mask inside remains the exact p=6
 * source superellipse.
 */
export const LIQUID_GLASS_SHADER_NATIVE_GEOMETRY = {
  width: Math.ceil(LIQUID_GLASS_SHADER_SOURCE_GEOMETRY.referenceBoundingWidth),
  height: Math.ceil(LIQUID_GLASS_SHADER_SOURCE_GEOMETRY.referenceBoundingHeight),
  radius: null,
  boxModel: 'viewport-coupled',
} as const satisfies ReferenceObjectGeometry;

export const LIQUID_GLASS_SHADER_DEFAULT_CONFIG = {
  width: LIQUID_GLASS_SHADER_NATIVE_GEOMETRY.width,
  height: LIQUID_GLASS_SHADER_NATIVE_GEOMETRY.height,
  radius: null,
  outputMask: 'source-superellipse',
  sourceCanvasDpr: 1,
  powerExponent: 6,
  sampleRange: 4,
  sampleOffset: 0.5,
  lightingIntensity: 0.3,
} as const satisfies LiquidGlassShaderConfig;

export function createLiquidGlassShaderGeometryAdaptation(
  width: number,
  height: number,
  radius: number,
): LiquidGlassShaderConfig {
  return {
    ...LIQUID_GLASS_SHADER_DEFAULT_CONFIG,
    width,
    height,
    radius,
    outputMask: 'rounded-rect-geometry-adaptation',
  };
}

export const LIQUID_GLASS_SHADER_CONTRACT = {
  key: 'liquid-glass-shader:viewport-lens',
  nativeGeometry: LIQUID_GLASS_SHADER_NATIVE_GEOMETRY,
  defaultConfig: LIQUID_GLASS_SHADER_DEFAULT_CONFIG,
  provenance: {
    sourceRepository:
      'https://github.com/lekandigital/glass-projects-lab.git',
    sourceCommit: '49b76e9f67870721bf6c4c02dfb792704b0a635e',
    sourceFamily: 'liquid-glass-shader',
    sourceComponent: 'dist canvas#canvas + #fragShader',
    sourceSelector: '#canvas',
    localAdaptedPath:
      'src/vendor/reference-glass/liquid-glass-shader/LiquidGlassShaderSurface.tsx',
    renderer: 'webgl1-exact-fragment-transparent-composite',
    sourceFiles: [
      {
        path: 'liquid-glass-shader/dist/index.html',
        sha256:
          '96733e82fb7d4e1fad561d86f92abc26d64c4bc13cf9848e2a09f8c26769a2aa',
        role: 'authoritative fragment shader and source texture element',
      },
      {
        path: 'liquid-glass-shader/dist/style.css',
        sha256:
          'b8a2807568c40e276b16ff2f528ffeccb3f872499ef4a1192b1b4da9c35747e5',
        role: 'authoritative full-viewport canvas behavior',
      },
      {
        path: 'liquid-glass-shader/dist/script.js',
        sha256:
          '2b051c0e83263aa21976cf3b669acdc848cf1d890de74b8dc6a8c954a4c1b0e8',
        role: 'authoritative WebGL1 setup, vertex shader, uniforms, RAF, and DPR behavior',
      },
    ],
    omittedVisibleContent: [
      'remote Pexels source image',
      'opaque source pixels outside the procedural lens',
      'source page background',
    ],
    intentionalAdaptations: [
      'the live Experiment Eleven optical input replaces the remote Pexels texture',
      'mouse uniform follows the Layer C object center instead of autonomous pointer motion',
      'the exact source fragment runs unchanged into an offscreen framebuffer',
      'a second transparent compositing pass removes source pixels outside the lens',
      '358x140 r54 uses an explicit rounded-rect output mask because the source exposes no width, height, or radius uniforms',
      'source canvas and optical capture remain one internal pixel per CSS pixel with no DPR multiplier',
      'all WebGL resources, capture callbacks, observers, listeners, and frames are released at unmount',
    ],
  },
} as const satisfies ReferenceObjectContract<LiquidGlassShaderConfig>;
