import type {
  ReferenceObjectContract,
  ReferenceObjectGeometry,
} from '../shared/sourceObjectContract';

export interface LiquidGlassDistConfig {
  /** Final rendered border-box width. The source's declared content width is 4px smaller. */
  width: number;
  /** Final rendered border-box height. The source's declared content height is 4px smaller. */
  height: number;
  radius: number;
  borderWidth: number;
  background: string;
  displacementScale: number;
  hoverDisplacementScale: number;
  inputBlur: number;
  hoverDurationSeconds: number;
  /**
   * Displacement-map asset driving the `feDisplacementMap`. The source map
   * encodes the native circle; because the `feImage` is declared in
   * `objectBoundingBox` units it is stretched over whatever box the object
   * occupies, which leaves a circular refracting region inside a resized
   * rectangle. See `scripts/generate-rounded-rect-displacement-maps.mjs`.
   */
  displacementMap: string;
}

/** Displacement map generated for the standardized Save 248 Layer C geometry. */
export const LIQUID_GLASS_DIST_ROUNDED_RECT_MAP = 'frosted-map-293x125-r21.png';

export const LIQUID_GLASS_DIST_SOURCE_DECLARATION = {
  contentWidth: 320,
  contentHeight: 320,
  widthCss: '20rem',
  heightCss: '20rem',
  radiusCss: '50%',
  borderWidth: 2,
  rootFontSizeAtSource: 16,
} as const;

export const LIQUID_GLASS_DIST_NATIVE_GEOMETRY = {
  width: 324,
  height: 324,
  radius: 162,
  boxModel: 'content-box',
} as const satisfies ReferenceObjectGeometry;

export const LIQUID_GLASS_DIST_DEFAULT_CONFIG = {
  width: LIQUID_GLASS_DIST_NATIVE_GEOMETRY.width,
  height: LIQUID_GLASS_DIST_NATIVE_GEOMETRY.height,
  radius: LIQUID_GLASS_DIST_NATIVE_GEOMETRY.radius,
  borderWidth: LIQUID_GLASS_DIST_SOURCE_DECLARATION.borderWidth,
  background: 'rgba(255,255,255,.08)',
  displacementScale: 1,
  hoverDisplacementScale: 1.4,
  inputBlur: 0.02,
  hoverDurationSeconds: 0.3,
  displacementMap: 'frosted-map.png',
} as const satisfies LiquidGlassDistConfig;

export function createLiquidGlassDistGeometry(
  width: number,
  height: number,
  radius: number,
  displacementMap: string = LIQUID_GLASS_DIST_DEFAULT_CONFIG.displacementMap,
): LiquidGlassDistConfig {
  return {
    ...LIQUID_GLASS_DIST_DEFAULT_CONFIG,
    width,
    height,
    radius,
    displacementMap,
  };
}

export const LIQUID_GLASS_DIST_CONTRACT = {
  key: 'liquid-glass-dist:.glass',
  nativeGeometry: LIQUID_GLASS_DIST_NATIVE_GEOMETRY,
  defaultConfig: LIQUID_GLASS_DIST_DEFAULT_CONFIG,
  provenance: {
    sourceRepository:
      'https://github.com/lekandigital/glass-projects-lab.git',
    sourceCommit: '49b76e9f67870721bf6c4c02dfb792704b0a635e',
    sourceFamily: 'liquid-glass-dist',
    sourceComponent: 'liquid-glass/dist button.glass',
    sourceSelector: '.glass',
    localAdaptedPath:
      'src/vendor/reference-glass/liquid-glass-dist/LiquidGlassDistSurface.tsx',
    renderer: 'css-backdrop-svg-displacement-smil',
    sourceFiles: [
      {
        path: 'liquid-glass/dist/index.html',
        sha256:
          'ca35410f6722cfcf4ef3df9b2ae93f55c9c3de76cdef8af27e0d6b677c14e132',
        role: 'authoritative object DOM, embedded PNG map, filter graph, SMIL',
      },
      {
        path: 'liquid-glass/dist/style.css',
        sha256:
          '00b6fc020629265fef115d276799454c476a94332fb5a5df3e30ea2f052303b8',
        role: 'authoritative .glass geometry and appearance',
      },
    ],
    omittedVisibleContent: [
      'plus symbol produced by source .glass::before and ::after',
      'three source meadow images',
      'source page scroll bed',
    ],
    intentionalAdaptations: [
      'source filter and SMIL event target ids are collision-scoped per mount',
      'source fixed centering is delegated to the Layer C portal',
      'geometry config names the final border box while preserving the source content-box border',
      'resized variants subtract the unchanged transparent border from source CSS width and height',
    ],
  },
} as const satisfies ReferenceObjectContract<LiquidGlassDistConfig>;
