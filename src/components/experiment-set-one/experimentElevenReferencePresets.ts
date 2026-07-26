/**
 * Experiment Eleven Layer C reference presets.
 *
 * This is the single source of truth for preset identity, provenance, exact source
 * configuration, native geometry, compositing, and interaction requirements. Family
 * renderers consume this registry; saves only persist the namespaced preset id and
 * native layout.
 */
import {
  DEMO_CONFIGS as FLUID_GLASS_SOURCE_DEMO_CONFIGS,
  INTERNALS as FLUID_GLASS_SOURCE_INTERNALS,
} from '../../vendor/reference-glass/fluid-glass/config.ts'
import {
  DEMO_CONFIGS as GLASS_SURFACE_SOURCE_DEMO_CONFIGS,
  GLASS_SURFACE_DEFAULTS as GLASS_SURFACE_SOURCE_DEFAULTS,
} from '../../vendor/reference-glass/glass-surface/config.ts'
import {
  GLASS_PROJECT_PRESET_BY_ID,
} from '../../vendor/reference-glass/glass-projects-apps/presets.ts'
import type { GlassProjectObjectId } from '../../vendor/reference-glass/glass-projects-apps/types.ts'
import { APPLE_LIQUID_GLASS_SHADER_PARAMETERS } from '../../vendor/reference-glass/glass-projects-apps/apple-liquid-glass/appleShaderSource.ts'
import {
  CSS_LIQUID_GLASS_SWITCHER_CONTRACT,
  CSS_LIQUID_GLASS_SWITCHER_DEFAULT_CONFIG,
  createCssLiquidGlassSwitcherGeometry,
} from '../../vendor/reference-glass/css-liquid-glass-switcher/config.ts'
import {
  LIQUID_GLASS_DIST_CONTRACT,
  LIQUID_GLASS_DIST_DEFAULT_CONFIG,
  createLiquidGlassDistGeometry,
} from '../../vendor/reference-glass/liquid-glass-dist/config.ts'
import {
  CHROMIUM_CONFIGURABLE_GLASS_CONTRACT,
  CHROMIUM_CONFIGURABLE_GLASS_EXACT_CONFIG,
  createChromiumConfigurableGlassGeometry,
} from '../../vendor/reference-glass/chromium-configurable-glass/config.ts'
import {
  LIQUID_GLASS_SHADER_CONTRACT,
  LIQUID_GLASS_SHADER_DEFAULT_CONFIG,
  createLiquidGlassShaderGeometryAdaptation,
} from '../../vendor/reference-glass/liquid-glass-shader/config.ts'
import {
  PURE_CSS_IOS_26_CONTAINER_CONTRACT,
  PURE_CSS_IOS_26_CONTAINER_DEFAULT_CONFIG,
  createPureCssIos26ContainerGeometry,
} from '../../vendor/reference-glass/pure-css-ios-26/config.ts'
import {
  LIQUID_GLASS_JS_RECT_CONTRACT,
  LIQUID_GLASS_JS_RECT_DEFAULT_CONFIG,
  createLiquidGlassJsRectGeometry,
} from '../../vendor/reference-glass/liquid-glass-js/config.ts'
import type { ReferenceObjectContract } from '../../vendor/reference-glass/shared/sourceObjectContract'

export type ExperimentElevenReferenceSourceFamily =
  | 'liquid-main'
  | 'liquidgl'
  | 'fluid-glass'
  | 'liquid-glass-web-react'
  | 'wge-next'
  | 'web-glass-effect'
  | 'glass-surface'
  | 'liquid-dom'
  | 'lucas-romero'
  | 'apple-liquid-glass'
  | 'frontend-vue'
  | 'css-liquid-glass-switcher'
  | 'liquid-glass-dist'
  | 'liquid-glass-scroll-drag-configure-chromium'
  | 'liquid-glass-shader'
  | 'pure-css-ios-26'
  | 'liquid-glass-js'

export type ExperimentElevenReferenceRenderer =
  | 'liquid-main-svg-filter'
  | 'liquidgl-webgl'
  | 'fluid-glass-r3f'
  | 'liquid-glass-web-react'
  | 'wge-next-submit-button'
  | 'wge-next-bottom-bar'
  | 'web-glass-svg-filter'
  | 'glass-surface-svg-filter'
  | 'glass-project-app-object'
  | 'extracted-source-glass-object'

export type ExperimentElevenReferenceCompositingStrategy =
  | 'transparent-page-portal-backdrop-filter'
  | 'transparent-webgl-object'
  | 'live-document-webgl-snapshot'

export interface ExperimentElevenReferenceNativeLayout {
  width: number
  height: number
  radius: number
  geometry:
    | 'rounded-rect'
    | 'circle'
    | 'liquidgl-menu'
    | 'three-lens'
    | 'three-bar'
    | 'three-cube'
    | 'source-button'
    | 'shader-superellipse'
}

export interface ExperimentElevenReferenceCompositing {
  strategy: ExperimentElevenReferenceCompositingStrategy
  pageLevelPortal: boolean
  samplingSource:
    | 'live-experiment-composition'
    | 'transparent-private-fbo'
    | 'live-experiment-stage-capture'
    | 'live-document-composition'
  notes: string
}

export interface ExperimentElevenReferenceInteractions {
  draggableLayerC: true
  pointerInteraction: boolean
  animation: boolean
  sourceBehaviors: readonly string[]
}

export interface ExperimentElevenReferenceSourceContext {
  /** Filtered source-composition box at the 1600px verification viewport. */
  width: number
  height: number
  /** Initial native lens top-left within that source box. */
  lensOffsetX: number
  lensOffsetY: number
  radius: number
  provenance: string
}

export interface ExperimentElevenReferencePreset {
  id: string
  sourceFamily: ExperimentElevenReferenceSourceFamily
  sourceRepository: 'glass-projects-lab'
  sourcePresetKey: string
  sourceComponent: string
  displayLabel: string
  renderer: ExperimentElevenReferenceRenderer
  contentPolicy: 'object-only'
  portalMode: 'inline' | 'anchored-portal'
  transparentOutside: true
  disableAutonomousMotion?: boolean
  transparentRenderSurface: true
  config: Readonly<Record<string, unknown>>
  nativeLayout: ExperimentElevenReferenceNativeLayout
  sourceContext?: ExperimentElevenReferenceSourceContext
  compositing: ExperimentElevenReferenceCompositing
  interactions: ExperimentElevenReferenceInteractions
  sourcePath: readonly string[]
  provenance: string
}

export const LIQUID_MAIN_CUSTOM_CONFIG = {
  width: 300,
  height: 200,
  borderRadius: 60,
  surface: 'convex_squircle',
  glassThickness: 200,
  bezelWidth: 60,
  refractiveIndex: 3,
  scaleRatio: 1,
  blur: 0.3,
  specularOpacity: 0.5,
  specularSaturation: 4,
  innerShadow: {
    color: '#ffffff',
    blur: 20,
    spread: -5,
    offsetX: 0,
    offsetY: 0,
  },
  tint: {
    color: '#ffffff',
    opacity: 0.06,
  },
  outerShadow: {
    offsetX: 0,
    offsetY: 4,
    blur: 24,
    color: 'rgba(0, 0, 0, 0.18)',
  },
  rendererInternals: {
    refractionSamples: 128,
    derivativeStep: 0.0001,
    specularBezelMultiplier: 2.5,
    specularLightAngleRadians: Math.PI / 3,
    neutralDisplacementPixel: [128, 128, 0, 255],
  },
} as const

export const LIQUIDGL_DEMO_1_NAV_CONFIG = {
  target: '.menu-wrap',
  options: {
    refraction: 0,
    bevelDepth: 0.052,
    bevelWidth: 0.211,
    frost: 2,
    magnify: 1,
    shadow: true,
    specular: true,
    tilt: false,
    tiltFactor: 5,
    reveal: 'fade',
  },
  snapshot: {
    resolution: 2,
    sourceDefaultScope: 'body',
    integrationScope: 'live Experiment Eleven Layer B',
    selector:
      '.experiment-set-one-stage__canvas .experiment-set-one-stage__multi-shell[data-stage-experiment="eleven"] [role="region"][aria-label="Experiment Eleven layer B"]',
    disposableCloneNormalization: true,
  },
  content: {
    version: 'v1.0.1',
    logoAsset: '/vendor/reference-glass/liquidgl/assets/naughtyduk-logo.svg',
    downloadAsset: '/vendor/reference-glass/liquidgl/assets/download-icon.svg',
  },
  revealDurationMs: 1000,
} as const

export const FLUID_GLASS_INTERNALS = FLUID_GLASS_SOURCE_INTERNALS

/** Direct references to the authoritative showcase's central DEMO_CONFIGS. */
export const FLUID_GLASS_CONFIGS = {
  lensDefault: FLUID_GLASS_SOURCE_DEMO_CONFIGS.lensDefault,
  frosted: FLUID_GLASS_SOURCE_DEMO_CONFIGS.frosted,
  barDefault: FLUID_GLASS_SOURCE_DEMO_CONFIGS.barDefault,
  diamond: FLUID_GLASS_SOURCE_DEMO_CONFIGS.diamond,
  fluid: FLUID_GLASS_SOURCE_DEMO_CONFIGS.fluid,
} as const

export const LIQUID_GLASS_WEB_DEFAULT_OPTIONS = {
  width: 160,
  height: 120,
  radius: 'auto',
  strength: 0.1,
  chromaticAberration: 0.2,
  blur: 0,
  depth: 10,
  curvature: 0.65,
  splay: 1,
  glow: 0.1,
  glowSpread: 1,
  glowExponent: 1.5,
  edgeHighlight: 0.25,
  edgeWidth: 3,
  edgeExponent: 1.5,
  specular: 1,
  specularAngle: 45,
  quality: 512,
} as const

export const LIQUID_GLASS_WEB_CONFIGS = {
  apple: {
    ...LIQUID_GLASS_WEB_DEFAULT_OPTIONS,
    width: 220,
    height: 220,
    radius: 'auto',
    strength: 0.07,
    chromaticAberration: 0.45,
    curvature: 0.8,
    depth: 26,
    glow: 0.6,
    edgeHighlight: 0.7,
    specularAngle: 130,
  },
  libraryDefault: {
    ...LIQUID_GLASS_WEB_DEFAULT_OPTIONS,
    width: 220,
    height: 220,
  },
  fishbowl: {
    ...LIQUID_GLASS_WEB_DEFAULT_OPTIONS,
    width: 220,
    height: 220,
    radius: 'auto',
    strength: 0.16,
    chromaticAberration: 0.7,
    blur: 0,
    depth: 80,
    curvature: 1,
    splay: 1,
    glow: 0.35,
    glowSpread: 1,
    glowExponent: 2.2,
    edgeHighlight: 0.9,
    edgeWidth: 5,
    edgeExponent: 1.5,
    specular: 1.2,
    specularAngle: 45,
  },
  frosted: {
    ...LIQUID_GLASS_WEB_DEFAULT_OPTIONS,
    width: 300,
    height: 190,
    radius: 40,
    strength: 0.03,
    chromaticAberration: 0.1,
    blur: 6,
    depth: 18,
    curvature: 0.4,
    splay: 1,
    glow: 0.25,
    glowSpread: 1,
    glowExponent: 1.5,
    edgeHighlight: 0.5,
    edgeWidth: 4,
    edgeExponent: 1.5,
    specular: 1,
    specularAngle: 120,
  },
  prism: {
    ...LIQUID_GLASS_WEB_DEFAULT_OPTIONS,
    width: 240,
    height: 240,
    radius: 'auto',
    strength: 0.12,
    chromaticAberration: 1,
    blur: 0,
    depth: 40,
    curvature: 0.9,
    splay: 1,
    glow: 0.15,
    glowSpread: 0.6,
    glowExponent: 1.5,
    edgeHighlight: 0.35,
    edgeWidth: 3,
    edgeExponent: 1.5,
    specular: 1,
    specularAngle: 200,
  },
  flatPane: {
    ...LIQUID_GLASS_WEB_DEFAULT_OPTIONS,
    width: 260,
    height: 260,
    radius: 20,
    strength: 0.06,
    chromaticAberration: 0.3,
    blur: 0,
    depth: 60,
    curvature: 0,
    splay: 0,
    glow: 0.1,
    glowSpread: 1,
    glowExponent: 1.5,
    edgeHighlight: 0.6,
    edgeWidth: 6,
    edgeExponent: 1.5,
    specular: 1,
    specularAngle: 90,
  },
  hero: {
    ...LIQUID_GLASS_WEB_DEFAULT_OPTIONS,
    width: 200,
    height: 200,
    radius: 'auto',
    strength: 0.07,
    chromaticAberration: 0.5,
    curvature: 0.85,
    depth: 28,
    glow: 0.7,
    edgeHighlight: 0.8,
    specularAngle: 130,
  },
  reading: {
    ...LIQUID_GLASS_WEB_DEFAULT_OPTIONS,
    width: 150,
    height: 150,
    radius: 'auto',
    strength: 0.05,
    chromaticAberration: 0.35,
    curvature: 1,
    depth: 30,
    glow: 0.3,
    edgeHighlight: 0.55,
    specularAngle: 90,
  },
  orbit: {
    ...LIQUID_GLASS_WEB_DEFAULT_OPTIONS,
    width: 170,
    height: 170,
    radius: 'auto',
    strength: 0.07,
    chromaticAberration: 0.45,
    curvature: 0.85,
    depth: 24,
    glow: 0.55,
    edgeHighlight: 0.75,
    specularAngle: 130,
  },
  engine: {
    ...LIQUID_GLASS_WEB_DEFAULT_OPTIONS,
    width: 160,
    height: 160,
    radius: 'auto',
    strength: 0.08,
    chromaticAberration: 0.5,
    curvature: 0.85,
    depth: 24,
    glow: 0.5,
    edgeHighlight: 0.75,
    specularAngle: 130,
  },
} as const

/**
 * Source boxes measured from the authoritative showcase at a 1600px viewport.
 * The SVG engine normalizes displacement against this box, not against the
 * lens itself, so preserving these dimensions is part of preserving the
 * renderer rather than presentation-only metadata.
 */
export const LIQUID_GLASS_WEB_SOURCE_CONTEXTS = {
  'liquid-web:apple': {
    width: 768,
    height: 460,
    lensOffsetX: 274,
    lensOffsetY: 120,
    radius: 18,
    provenance: 'Playground filtered surface (outer .stage is 770×462).',
  },
  'liquid-web:library-default': {
    width: 768,
    height: 460,
    lensOffsetX: 274,
    lensOffsetY: 120,
    radius: 18,
    provenance: 'Playground filtered surface (outer .stage is 770×462).',
  },
  'liquid-web:fishbowl': {
    width: 768,
    height: 460,
    lensOffsetX: 274,
    lensOffsetY: 120,
    radius: 18,
    provenance: 'Playground filtered surface (outer .stage is 770×462).',
  },
  'liquid-web:frosted': {
    width: 768,
    height: 460,
    lensOffsetX: 234,
    lensOffsetY: 135,
    radius: 18,
    provenance: 'Playground filtered surface (outer .stage is 770×462).',
  },
  'liquid-web:prism': {
    width: 768,
    height: 460,
    lensOffsetX: 264,
    lensOffsetY: 110,
    radius: 18,
    provenance: 'Playground filtered surface (outer .stage is 770×462).',
  },
  'liquid-web:flat-pane': {
    width: 768,
    height: 460,
    lensOffsetX: 254,
    lensOffsetY: 100,
    radius: 18,
    provenance: 'Playground filtered surface (outer .stage is 770×462).',
  },
  'liquid-web:hero-circle': {
    width: 1188,
    height: 575.625,
    lensOffsetX: 779.12,
    lensOffsetY: 256.8875,
    radius: 0,
    provenance: 'Hero GripLens context including x=28/y=40 bleed at initial x=.74/y=.62.',
  },
  'liquid-web:reading-glass': {
    width: 1078,
    height: 209.5,
    lensOffsetX: 464,
    lensOffsetY: 29.75,
    radius: 14,
    provenance: 'Primitives ReadingGlass filtered .readBed at x=.5/y=.5.',
  },
  'liquid-web:orbit': {
    width: 768,
    height: 420,
    lensOffsetX: 299,
    lensOffsetY: 234.1192008768,
    radius: 18,
    provenance: 'Motion filtered .orbitBed at the first imperative RAF position.',
  },
  'liquid-web:engine-panel': {
    width: 768,
    height: 380,
    lensOffsetX: 188.8,
    lensOffsetY: 110,
    radius: 17,
    provenance: 'Raw Engine filtered surface (the excluded outer stage border is 770×382).',
  },
} as const satisfies Record<string, ExperimentElevenReferenceSourceContext>

/**
 * Exact roots used by the authoritative custom-demo. These identifiers are
 * also mounted as stable DOM metadata so browser tests verify the component,
 * not just the numbers claimed by the registry.
 */
export const LIQUID_GLASS_WEB_SOURCE_COMPONENTS = {
  'liquid-web:apple': 'Playground.LiquidGlass',
  'liquid-web:library-default': 'Playground.LiquidGlass',
  'liquid-web:fishbowl': 'Playground.LiquidGlass',
  'liquid-web:frosted': 'Playground.LiquidGlass',
  'liquid-web:prism': 'Playground.LiquidGlass',
  'liquid-web:flat-pane': 'Playground.LiquidGlass',
  'liquid-web:hero-circle': 'GripLens',
  'liquid-web:reading-glass': 'Primitives.ReadingGlass',
  'liquid-web:orbit': 'Motion.LiquidGlass',
  'liquid-web:engine-panel': 'LiquidGlassEngine',
} as const satisfies Record<keyof typeof LIQUID_GLASS_WEB_SOURCE_CONTEXTS, string>

export const WGE_NEXT_SUBMIT_BUTTON_CONFIG = {
  width: 384,
  height: 38,
  radius: 18,
  paddingY: 8,
  label: 'Submit Form',
  border: '1px solid rgba(251,191,36,0.3)',
  background: 'rgba(245,158,11,0.2)',
  hoverBackground: 'rgba(245,158,11,0.3)',
  color: 'rgb(251,191,36)',
  glass: {
    glassThickness: 110,
    bezelWidth: 10,
    refractiveIndex: 1.8,
    blur: 0.4,
    specularOpacity: 1,
    specularSaturation: 4,
  },
  sourceStructure: 'LiquidGlass nested inside source submit button',
  visibleContentPolicy: 'source label explicitly removed; accessible name retained',
  transparentOutsideButton: true,
} as const

export const WGE_NEXT_BOTTOM_BAR_CONFIG = {
  responsiveSourceWidth: 'calc(100% - 32px)',
  targetStageWidth: 672,
  wrapperInset: 16,
  glassThickness: 110,
  bezelWidth: 20,
  specularOpacity: 0.9,
  radius: 28,
  padding: { x: 16, y: 12 },
  values: { width: 400, height: 600 },
  resting: { blur: 0, refractiveIndex: 1.4 },
  hover: { blur: 0.8, refractiveIndex: 2 },
  searchFocused: { blur: 3.5, refractiveIndex: 3 },
  spring: { stiffness: 300, damping: 30 },
  controls: {
    rowHeight: 36,
    valueInput: {
      sourceWidth: 'w-full',
      resolvedWidthAtTargetStage: 152.326,
      height: 36,
      background: 'rgba(255,255,255,0.4)',
      padding: { x: 12, y: 4 },
    },
    searchInput: {
      height: 36,
      background: 'rgba(255,255,255,0.4)',
      placeholder: 'Search images...',
    },
    iconButton: { width: 32, height: 32, radius: 6 },
  },
  computedSurface: {
    width: 640,
    height: 60,
    background: 'rgba(255,255,255,0.05)',
    shadow: '0 3px 14px rgba(0,0,0,0.1)',
  },
  visibleContentPolicy:
    'all width, height, search, icon, label, and button children explicitly removed',
} as const

export const WEB_GLASS_LIBRARY_DEFAULTS = {
  glassThickness: 40,
  bezelWidth: 20,
  refractiveIndex: 1.5,
  blur: 0.2,
  specularOpacity: 1,
  specularSaturation: 4,
  surface: 'CONVEX',
  width: 320,
  height: 200,
  radius: 32,
  dpr: 1,
  scaleRatio: 1,
  canvasPad: 0,
} as const

export const WEB_GLASS_CONFIGS = {
  thickLens: {
    ...WEB_GLASS_LIBRARY_DEFAULTS,
    glassThickness: 260,
    bezelWidth: 70,
    refractiveIndex: 1.9,
    specularOpacity: 0.7,
    radius: 60,
  },
  razorEdge: {
    ...WEB_GLASS_LIBRARY_DEFAULTS,
    glassThickness: 200,
    bezelWidth: 4,
    refractiveIndex: 2.4,
    specularOpacity: 1,
    radius: 24,
  },
  bottomBar: {
    ...WEB_GLASS_LIBRARY_DEFAULTS,
    glassThickness: 110,
    bezelWidth: 20,
    refractiveIndex: 3,
    blur: 3.5,
    specularOpacity: 0.9,
    radius: 28,
  },
  stressPanel: {
    ...WEB_GLASS_LIBRARY_DEFAULTS,
    glassThickness: 92,
    bezelWidth: 18,
    blur: 0.45,
    refractiveIndex: 1.72,
    specularOpacity: 0.85,
    specularSaturation: 6,
    radius: 28,
  },
  storybook: {
    ...WEB_GLASS_LIBRARY_DEFAULTS,
    glassThickness: 100,
    bezelWidth: 22,
    blur: 0.6,
    refractiveIndex: 1.75,
    specularOpacity: 0.95,
    specularSaturation: 8,
    radius: 30,
  },
} as const

export const GLASS_SURFACE_DEFAULTS = GLASS_SURFACE_SOURCE_DEFAULTS

/** Direct, fully resolved adaptations of the showcase's central DEMO_CONFIGS. */
export const GLASS_SURFACE_CONFIGS = {
  componentDefault: {
    ...GLASS_SURFACE_SOURCE_DEFAULTS,
    ...GLASS_SURFACE_SOURCE_DEMO_CONFIGS.componentDefault.props,
  },
  upstreamDemo: {
    ...GLASS_SURFACE_SOURCE_DEFAULTS,
    ...GLASS_SURFACE_SOURCE_DEMO_CONFIGS.upstreamDemo.props,
  },
  pill: {
    ...GLASS_SURFACE_SOURCE_DEFAULTS,
    ...GLASS_SURFACE_SOURCE_DEMO_CONFIGS.pill.props,
  },
  prism: {
    ...GLASS_SURFACE_SOURCE_DEFAULTS,
    ...GLASS_SURFACE_SOURCE_DEMO_CONFIGS.prism.props,
  },
  achromatic: {
    ...GLASS_SURFACE_SOURCE_DEFAULTS,
    ...GLASS_SURFACE_SOURCE_DEMO_CONFIGS.achromatic.props,
  },
  convex: {
    ...GLASS_SURFACE_SOURCE_DEFAULTS,
    ...GLASS_SURFACE_SOURCE_DEMO_CONFIGS.convex.props,
  },
} as const

const sourcePaths = {
  liquidMain: [
    'glass-projects-lab/liquid-glass-main/index.html',
    'glass-projects-lab/liquid-glass-main/index.css',
  ],
  liquidgl: [
    'glass-projects-lab/liquidGL-main 2/demos/demo-1.html',
    'glass-projects-lab/liquidGL-main 2/scripts/liquidGL.js',
  ],
  fluidGlass: [
    'glass-projects-lab/react-bits-fluid-glass-showcase/src/lib/config.ts',
    'glass-projects-lab/react-bits-main/src/ts-default/Components/FluidGlass/FluidGlass.tsx',
  ],
  liquidWeb: [
    'glass-projects-lab/liquid-glass-showcase/src/glass.ts',
    'glass-projects-lab/liquid-glass-web-react/',
  ],
  wgeSubmitButton: [
    'glass-projects-lab/web-glass-effect/apps/next-demo/app/components/liquid-glass-form-demo.tsx',
    'glass-projects-lab/web-glass-effect/packages/web-glass-effect/src/motion/liquid/glass.tsx',
  ],
  wgeBottomBar: [
    'glass-projects-lab/web-glass-effect/apps/next-demo/app/components/liquid-glass-demo.tsx',
  ],
  webGlass: [
    'glass-projects-lab/web-glass-effectshowcase/src/config.ts',
    'glass-projects-lab/web-glass-effect/packages/web-glass-effect/',
  ],
  glassSurface: [
    'glass-projects-lab/react-bits-glass-surface-showcase/src/lib/config.ts',
    'glass-projects-lab/react-bits-main/src/ts-default/Components/GlassSurface/GlassSurface.tsx',
  ],
} as const

const provenance = {
  liquidMain: 'Authoritative liquid-glass-main custom controls and SVG filter graph.',
  liquidgl: 'Authoritative liquidGL Demo 1 .menu-wrap and liquidGL.js renderer.',
  fluidGlass: 'DEMO_CONFIGS and the React Bits FluidGlass R3F implementation.',
  liquidWeb: 'PRESETS/DEMO_LENSES merged with every liquid-glass-web-react DEFAULT_OPTIONS value.',
  wgeSubmitButton: 'The exact Submit Form button and its nested WGE LiquidGlass child; no form or demo frame.',
  wgeBottomBar: 'The exact empty WGE Next bottom-bar LiquidGlass surface at source resting values.',
  webGlass: 'PRESETS merged with all web-glass-effect LIBRARY_DEFAULTS.',
  glassSurface: 'DEMO_CONFIGS merged with all GlassSurface component defaults.',
} as const

/**
 * Exact authoritative root mounted for each save. Keeping this separate from
 * labels and numeric configuration makes a claimed preset/component mismatch
 * machine-detectable.
 */
export const EXPERIMENT_ELEVEN_REFERENCE_SOURCE_COMPONENTS = {
  'liquid-main:custom-300x200': 'liquid-glass-main.custom-surface',
  'liquidgl:demo-1-nav': 'demo-1.menu-wrap',
  'fluid-glass:lens': 'FluidGlass/Lens/ModeWrapper',
  'fluid-glass:frosted': 'FluidGlass/Lens/ModeWrapper',
  'fluid-glass:bar': 'FluidGlass/Bar/ModeWrapper+NavItems',
  'fluid-glass:diamond': 'FluidGlass/Cube/ModeWrapper',
  'fluid-glass:fluid': 'FluidGlass/Lens/ModeWrapper',
  'liquid-web:apple': 'Playground.LiquidGlass',
  'liquid-web:library-default': 'Playground.LiquidGlass',
  'liquid-web:fishbowl': 'Playground.LiquidGlass',
  'liquid-web:frosted': 'Playground.LiquidGlass',
  'liquid-web:prism': 'Playground.LiquidGlass',
  'liquid-web:flat-pane': 'Playground.LiquidGlass',
  'liquid-web:hero-circle': 'GripLens',
  'liquid-web:reading-glass': 'Primitives.ReadingGlass',
  'liquid-web:orbit': 'Motion.LiquidGlass',
  'liquid-web:engine-panel': 'LiquidGlassEngine',
  'wge-next:form-submit-button': 'LiquidGlassFormDemo.SubmitButton.LiquidGlass',
  'wge-next:bottom-bar': 'LiquidGlassDemo.bottomBar.LiquidGlass',
  'web-glass:thick-lens': 'web-glass-effectshowcase.GlassSurface',
  'web-glass:razor-edge': 'web-glass-effectshowcase.GlassSurface',
  'web-glass:bottom-bar': 'web-glass-effectshowcase.GlassSurface',
  'web-glass:stress-panel': 'web-glass-effectshowcase.GlassSurface',
  'web-glass:storybook': 'web-glass-effectshowcase.GlassSurface',
  'glass-surface:component-default': 'react-bits.GlassSurface',
  'glass-surface:upstream-demo': 'react-bits.GlassSurface',
  'glass-surface:ios-pill': 'react-bits.GlassSurface',
  'glass-surface:prism': 'react-bits.GlassSurface',
  'glass-surface:achromatic': 'react-bits.GlassSurface',
  'glass-surface:convex': 'react-bits.GlassSurface',
  'liquid-dom:notification-center-main': 'NotificationCenterDemo.mainGlass',
  'liquid-dom:notification-center-dock': 'NotificationCenterDemo.bottomGlassDock',
  'liquid-dom:ios-notification-banner': 'IosNotificationDemo.notificationGlass',
  'lucas-romero:macos-dock-shell': 'liquidGlass-wrapper.dock',
  'apple-liquid-glass:shader-shell': 'LiquidGlass',
  'frontend-vue:app-card': 'AppCard.vue',
  'css-liquid-glass-switcher:switcher': 'liquid-glass-switcher-css.html.switcher',
  'liquid-glass-dist:glass': 'liquid-glass/dist.button.glass',
  'chromium-configurable-glass:requested': 'dist.effect',
  'liquid-glass-shader:lens': 'canvas#canvas + #fragShader',
  'pure-css-ios-26:glass-container': 'pure-css-ios-26-liquid-glass-effect.glassContainer',
  'liquid-glass-js:rounded-rectangle': 'Button extends Container',
  'liquid-dom:notification-center-main:358x140-r54': 'NotificationCenterDemo.mainGlass',
  'liquid-dom:notification-center-dock:358x140-r54': 'NotificationCenterDemo.bottomGlassDock',
  'liquid-dom:ios-notification-banner:358x140-r54': 'IosNotificationDemo.notificationGlass',
  'lucas-romero:macos-dock-shell:358x140-r54': 'liquidGlass-wrapper.dock',
  'apple-liquid-glass:shader-shell:358x140-r54': 'LiquidGlass',
  'frontend-vue:app-card:358x140-r54': 'AppCard.vue',
  'css-liquid-glass-switcher:switcher:358x140-r54': 'liquid-glass-switcher-css.html.switcher',
  'liquid-glass-dist:glass:358x140-r54': 'liquid-glass/dist.button.glass',
  'chromium-configurable-glass:requested:358x140-r54': 'dist.effect',
  'liquid-glass-shader:lens:358x140-r54': 'canvas#canvas + #fragShader',
  'pure-css-ios-26:glass-container:358x140-r54': 'pure-css-ios-26-liquid-glass-effect.glassContainer',
  'liquid-glass-js:rounded-rectangle:358x140-r54': 'Button extends Container',
} as const

function layout(
  width: number,
  height: number,
  radius: number,
  geometry: ExperimentElevenReferenceNativeLayout['geometry'],
): ExperimentElevenReferenceNativeLayout {
  return { width, height, radius, geometry }
}

function compositing(
  strategy: ExperimentElevenReferenceCompositingStrategy,
  pageLevelPortal: boolean,
  samplingSource: ExperimentElevenReferenceCompositing['samplingSource'],
  notes: string,
): ExperimentElevenReferenceCompositing {
  return { strategy, pageLevelPortal, samplingSource, notes }
}

function interactions(
  pointerInteraction: boolean,
  animation: boolean,
  ...sourceBehaviors: string[]
): ExperimentElevenReferenceInteractions {
  return { draggableLayerC: true, pointerInteraction, animation, sourceBehaviors }
}

function preset(
  value: Omit<
    ExperimentElevenReferencePreset,
    | 'sourceComponent'
    | 'sourceRepository'
    | 'contentPolicy'
    | 'portalMode'
    | 'transparentOutside'
    | 'transparentRenderSurface'
  >,
): ExperimentElevenReferencePreset {
  const sourceComponent =
    EXPERIMENT_ELEVEN_REFERENCE_SOURCE_COMPONENTS[
      value.id as keyof typeof EXPERIMENT_ELEVEN_REFERENCE_SOURCE_COMPONENTS
    ]
  if (!sourceComponent) {
    throw new Error(`Missing authoritative source component for ${value.id}`)
  }
  return {
    ...value,
    sourceRepository: 'glass-projects-lab',
    contentPolicy: 'object-only',
    portalMode: value.compositing.pageLevelPortal ? 'anchored-portal' : 'inline',
    transparentOutside: true,
    sourceComponent,
    transparentRenderSurface: true,
  }
}

const liquidWebPreset = (
  id: keyof typeof LIQUID_GLASS_WEB_SOURCE_CONTEXTS,
  sourcePresetKey: string,
  displayLabel: string,
  config: Readonly<Record<string, unknown>>,
  nativeLayout: ExperimentElevenReferenceNativeLayout,
  sourceBehaviors: readonly string[],
  animation = false,
  disableAutonomousMotion = false,
) =>
  preset({
    id,
    sourceFamily: 'liquid-glass-web-react',
    sourcePresetKey,
    displayLabel,
    renderer: 'liquid-glass-web-react',
    config,
    nativeLayout,
    sourceContext: LIQUID_GLASS_WEB_SOURCE_CONTEXTS[id],
    compositing: compositing(
      'transparent-page-portal-backdrop-filter',
      true,
      'live-experiment-composition',
      'Only the native glass object is painted. The exact generated SVG graph is applied as a backdrop filter over the unchanged Experiment Eleven layers; the larger source-motion box is transparent.',
    ),
    interactions: interactions(
      sourceBehaviors.length > 0 && !disableAutonomousMotion,
      animation && !disableAutonomousMotion,
      ...sourceBehaviors,
    ),
    ...(disableAutonomousMotion ? { disableAutonomousMotion: true } : {}),
    sourcePath: sourcePaths.liquidWeb,
    provenance: provenance.liquidWeb,
  })

const webGlassPreset = (
  id: string,
  sourcePresetKey: string,
  displayLabel: string,
  config: Readonly<Record<string, unknown>>,
  radius: number,
) =>
  preset({
    id,
    sourceFamily: 'web-glass-effect',
    sourcePresetKey,
    displayLabel,
    renderer: 'web-glass-svg-filter',
    config,
    nativeLayout: layout(320, 200, radius, 'rounded-rect'),
    compositing: compositing(
      'transparent-page-portal-backdrop-filter',
      true,
      'live-experiment-composition',
      'The transparent page-level surface samples the live Experiment Eleven composition; no backdrop clone, source stage, or Layer B cutout is mounted.',
    ),
    interactions: interactions(false, false),
    sourcePath: sourcePaths.webGlass,
    provenance: provenance.webGlass,
  })

const glassSurfacePreset = (
  id: string,
  sourcePresetKey: string,
  displayLabel: string,
  config: Readonly<Record<string, unknown>>,
  radius: number,
) =>
  preset({
    id,
    sourceFamily: 'glass-surface',
    sourcePresetKey,
    displayLabel,
    renderer: 'glass-surface-svg-filter',
    config,
    nativeLayout: layout(320, 120, radius, 'rounded-rect'),
    compositing: compositing(
      'transparent-page-portal-backdrop-filter',
      true,
      'live-experiment-composition',
      'The transparent GlassSurface samples the live Experiment Eleven composition while Layer B opacity, clipping, and paint remain unchanged.',
    ),
    interactions: interactions(false, false),
    sourcePath: sourcePaths.glassSurface,
    provenance: provenance.glassSurface,
  })

type NewGlassBasePresetId =
  | GlassProjectObjectId
  | 'css-liquid-glass-switcher:switcher'
  | 'liquid-glass-dist:glass'
  | 'chromium-configurable-glass:requested'
  | 'liquid-glass-shader:lens'
  | 'pure-css-ios-26:glass-container'
  | 'liquid-glass-js:rounded-rectangle'

type NewGlassDuplicatePresetId =
  `${NewGlassBasePresetId}:358x140-r54`
type NewGlassPresetId =
  | NewGlassBasePresetId
  | NewGlassDuplicatePresetId

interface NewGlassBaseDefinition {
  id: NewGlassBasePresetId
  sourceFamily: ExperimentElevenReferenceSourceFamily
  sourcePresetKey: string
  displayLabel: string
  renderer: Extract<
    ExperimentElevenReferenceRenderer,
    'glass-project-app-object' | 'extracted-source-glass-object'
  >
  config: Readonly<Record<string, unknown>>
  normalizedConfig: Readonly<Record<string, unknown>>
  nativeLayout: ExperimentElevenReferenceNativeLayout
  compositing: ExperimentElevenReferenceCompositing
  interactions: ExperimentElevenReferenceInteractions
  sourcePath: readonly string[]
  provenance: string
}

const STANDARD_REFERENCE_GEOMETRY = {
  width: 358,
  height: 140,
  radius: 54,
} as const

function recordConfig(value: object): Readonly<Record<string, unknown>> {
  return value as Readonly<Record<string, unknown>>
}

function glassProjectSourcePaths(id: GlassProjectObjectId): readonly string[] {
  return GLASS_PROJECT_PRESET_BY_ID[id].provenance.sourceFiles.map(
    (file) => `glass-projects-lab/${file.path}`,
  )
}

function glassProjectConfig(
  id: GlassProjectObjectId,
  geometry: { width: number; height: number; cornerRadius: number; technicalInset?: number },
): Readonly<Record<string, unknown>> {
  const source = GLASS_PROJECT_PRESET_BY_ID[id]
  return recordConfig({
    sourceObjectId: id,
    kind: source.kind,
    rendererFamily: source.rendererFamily,
    geometry,
    ...('optics' in source ? { optics: source.optics } : {}),
    ...('config' in source ? { sourceConfig: source.config } : {}),
    ...(id === 'apple-liquid-glass:shader-shell'
      ? { shaderParameters: APPLE_LIQUID_GLASS_SHADER_PARAMETERS }
      : {}),
    opticalInput: source.opticalInput,
    contentPolicy: source.contentPolicy,
    sourceCommit: source.provenance.repositoryCommit,
    sourceHash: source.provenance.combinedSha256,
  })
}

function normalizedGlassProjectConfig(
  id: GlassProjectObjectId,
): Readonly<Record<string, unknown>> {
  const sourceGeometry = GLASS_PROJECT_PRESET_BY_ID[id].geometry
  return glassProjectConfig(id, {
    ...sourceGeometry,
    width: STANDARD_REFERENCE_GEOMETRY.width,
    height: STANDARD_REFERENCE_GEOMETRY.height,
    cornerRadius: STANDARD_REFERENCE_GEOMETRY.radius,
  })
}

function contractSourcePaths(
  contract: ReferenceObjectContract<unknown>,
): readonly string[] {
  return contract.provenance.sourceFiles.map(
    (file) => `glass-projects-lab/${file.path}`,
  )
}

function appObjectDefinition(
  id: GlassProjectObjectId,
  sourceFamily: ExperimentElevenReferenceSourceFamily,
  sourcePresetKey: string,
  displayLabel: string,
  interactionsValue: ExperimentElevenReferenceInteractions,
): NewGlassBaseDefinition {
  const source = GLASS_PROJECT_PRESET_BY_ID[id]
  const { geometry } = source
  const isShader = id === 'apple-liquid-glass:shader-shell'
  const isCanvas =
    source.rendererFamily === 'liquid-dom-webgpu' ||
    source.rendererFamily === 'r3f-three-glsl'
  return {
    id,
    sourceFamily,
    sourcePresetKey,
    displayLabel,
    renderer: 'glass-project-app-object',
    config: glassProjectConfig(id, geometry),
    normalizedConfig: normalizedGlassProjectConfig(id),
    nativeLayout: layout(
      geometry.width,
      geometry.height,
      geometry.cornerRadius,
      isShader ? 'rounded-rect' : 'rounded-rect',
    ),
    compositing: compositing(
      isCanvas
        ? 'transparent-webgl-object'
        : 'transparent-page-portal-backdrop-filter',
      true,
      isCanvas
        ? 'live-experiment-stage-capture'
        : 'live-experiment-composition',
      isCanvas
        ? 'Only the exact source glass object is painted on an alpha-zero technical canvas; a capture of the unchanged Experiment Eleven stage is used only as optical input.'
        : 'Only the exact source surface is mounted in a transparent anchored portal over the unchanged Experiment Eleven layers.',
    ),
    interactions: interactionsValue,
    sourcePath: glassProjectSourcePaths(id),
    provenance:
      `Authoritative ${source.provenance.sourceComponent} from ` +
      `${source.provenance.projectDirectory} at ${source.provenance.repositoryCommit}; ` +
      `combined source hash ${source.provenance.combinedSha256}.`,
  }
}

function extractedObjectDefinition<Config extends object>({
  id,
  sourceFamily,
  sourcePresetKey,
  displayLabel,
  contract,
  config,
  normalizedConfig,
  geometry,
  geometryKind = 'rounded-rect',
  strategy = 'transparent-page-portal-backdrop-filter',
  samplingSource = 'live-experiment-composition',
  pointerInteraction = false,
  animation = false,
  sourceBehaviors = [],
}: {
  id: Exclude<NewGlassBasePresetId, GlassProjectObjectId>
  sourceFamily: ExperimentElevenReferenceSourceFamily
  sourcePresetKey?: string
  displayLabel: string
  contract: ReferenceObjectContract<Config>
  config: Config
  normalizedConfig: Config
  geometry: { width: number; height: number; radius: number }
  geometryKind?: ExperimentElevenReferenceNativeLayout['geometry']
  strategy?: ExperimentElevenReferenceCompositingStrategy
  samplingSource?: ExperimentElevenReferenceCompositing['samplingSource']
  pointerInteraction?: boolean
  animation?: boolean
  sourceBehaviors?: readonly string[]
}): NewGlassBaseDefinition {
  return {
    id,
    sourceFamily,
    sourcePresetKey: sourcePresetKey ?? contract.key,
    displayLabel,
    renderer: 'extracted-source-glass-object',
    config: recordConfig(config),
    normalizedConfig: recordConfig(normalizedConfig),
    nativeLayout: layout(
      geometry.width,
      geometry.height,
      geometry.radius,
      geometryKind,
    ),
    compositing: compositing(
      strategy,
      true,
      samplingSource,
      'The exact extracted source object is mounted in a transparent anchored portal. Source page content and backgrounds are absent and Layer B is neither clipped nor cut out.',
    ),
    interactions: interactions(
      pointerInteraction,
      animation,
      ...sourceBehaviors,
    ),
    sourcePath: contractSourcePaths(
      contract as ReferenceObjectContract<unknown>,
    ),
    provenance:
      `Authoritative ${contract.provenance.sourceComponent}; ` +
      `source hashes ${contract.provenance.sourceFiles
        .map((file) => file.sha256)
        .join(', ')}.`,
  }
}

export const EXPERIMENT_ELEVEN_NEW_GLASS_BASE_DEFINITIONS = [
  appObjectDefinition(
    'liquid-dom:notification-center-main',
    'liquid-dom',
    'NotificationCenterDemo.mainGlass',
    'Liquid DOM · Notification Center main glass',
    interactions(false, false, 'stationary closed-state surface'),
  ),
  appObjectDefinition(
    'liquid-dom:notification-center-dock',
    'liquid-dom',
    'NotificationCenterDemo.bottomGlassDock',
    'Liquid DOM · Notification Center dock',
    interactions(false, false, 'empty source dock surface'),
  ),
  appObjectDefinition(
    'liquid-dom:ios-notification-banner',
    'liquid-dom',
    'IosNotificationDemo.notificationGlass',
    'Liquid DOM · iOS notification banner',
    interactions(false, false, 'stationary notification surface'),
  ),
  appObjectDefinition(
    'lucas-romero:macos-dock-shell',
    'lucas-romero',
    'liquidGlass-wrapper.dock',
    'Lucas Romero · macOS dock shell',
    interactions(true, true, 'source hover geometry transition'),
  ),
  appObjectDefinition(
    'apple-liquid-glass:shader-shell',
    'apple-liquid-glass',
    'script.js.LiquidGlass',
    'Apple Liquid Glass · Shader shell',
    interactions(false, true, 'source shader response; pointer position frozen'),
  ),
  appObjectDefinition(
    'frontend-vue:app-card',
    'frontend-vue',
    'AppCard.vue',
    'Frontend Vue · AppCard glass',
    interactions(false, false, 'native Vue runtime; source drag disabled'),
  ),
  extractedObjectDefinition({
    id: 'css-liquid-glass-switcher:switcher',
    sourceFamily: 'css-liquid-glass-switcher',
    sourcePresetKey: 'liquid-glass-switcher-css:.switcher',
    displayLabel: 'CSS Liquid Glass Switcher · Empty switcher',
    contract: CSS_LIQUID_GLASS_SWITCHER_CONTRACT,
    config: CSS_LIQUID_GLASS_SWITCHER_DEFAULT_CONFIG,
    normalizedConfig: createCssLiquidGlassSwitcherGeometry(358, 140, 54),
    geometry: { width: 244, height: 70, radius: 35 },
  }),
  extractedObjectDefinition({
    id: 'liquid-glass-dist:glass',
    sourceFamily: 'liquid-glass-dist',
    sourcePresetKey: 'liquid-glass/dist:.glass',
    displayLabel: 'Liquid Glass Dist · Empty .glass',
    contract: LIQUID_GLASS_DIST_CONTRACT,
    config: LIQUID_GLASS_DIST_DEFAULT_CONFIG,
    normalizedConfig: createLiquidGlassDistGeometry(358, 140, 54),
    geometry: { width: 324, height: 324, radius: 162 },
    pointerInteraction: true,
    animation: true,
    sourceBehaviors: ['source hover SMIL displacement transition'],
  }),
  extractedObjectDefinition({
    id: 'chromium-configurable-glass:requested',
    sourceFamily: 'liquid-glass-scroll-drag-configure-chromium',
    sourcePresetKey: 'CONFIG.free+requested-overrides',
    displayLabel: 'Chromium Configurable Glass · Requested preset',
    contract: CHROMIUM_CONFIGURABLE_GLASS_CONTRACT,
    config: CHROMIUM_CONFIGURABLE_GLASS_EXACT_CONFIG,
    normalizedConfig: createChromiumConfigurableGlassGeometry(358, 140, 54),
    geometry: { width: 358, height: 140, radius: 54 },
  }),
  extractedObjectDefinition({
    id: 'liquid-glass-shader:lens',
    sourceFamily: 'liquid-glass-shader',
    sourcePresetKey: 'dist:#fragShader',
    displayLabel: 'Liquid Glass Shader · Procedural lens',
    contract: LIQUID_GLASS_SHADER_CONTRACT,
    config: LIQUID_GLASS_SHADER_DEFAULT_CONFIG,
    normalizedConfig: createLiquidGlassShaderGeometryAdaptation(358, 140, 54),
    geometry: {
      width: LIQUID_GLASS_SHADER_DEFAULT_CONFIG.width,
      height: LIQUID_GLASS_SHADER_DEFAULT_CONFIG.height,
      radius: 0,
    },
    geometryKind: 'shader-superellipse',
    strategy: 'live-document-webgl-snapshot',
    samplingSource: 'live-experiment-stage-capture',
    animation: true,
    sourceBehaviors: [
      'unchanged source fragment pass',
      'transparent object-only compositing pass',
      'stationary Layer C center',
    ],
  }),
  extractedObjectDefinition({
    id: 'pure-css-ios-26:glass-container',
    sourceFamily: 'pure-css-ios-26',
    sourcePresetKey: 'pure-css-ios-26:.glassContainer',
    displayLabel: 'Pure CSS iOS 26 · Glass container',
    contract: PURE_CSS_IOS_26_CONTAINER_CONTRACT,
    config: PURE_CSS_IOS_26_CONTAINER_DEFAULT_CONFIG,
    normalizedConfig: createPureCssIos26ContainerGeometry(358, 140, 54),
    geometry: { width: 300, height: 200, radius: 30 },
  }),
  extractedObjectDefinition({
    id: 'liquid-glass-js:rounded-rectangle',
    sourceFamily: 'liquid-glass-js',
    sourcePresetKey: 'demo.js:helloButton',
    displayLabel: 'liquid-glass-js · Rounded rectangle',
    contract: LIQUID_GLASS_JS_RECT_CONTRACT,
    config: LIQUID_GLASS_JS_RECT_DEFAULT_CONFIG,
    normalizedConfig: createLiquidGlassJsRectGeometry(358, 140, 54),
    geometry: { width: 196, height: 90, radius: 36 },
    strategy: 'live-document-webgl-snapshot',
    samplingSource: 'live-experiment-stage-capture',
    animation: true,
    sourceBehaviors: ['source WebGL optical capture tracking'],
  }),
] as const satisfies readonly NewGlassBaseDefinition[]

function createNewGlassPreset(
  definition: NewGlassBaseDefinition,
  normalized: boolean,
): ExperimentElevenReferencePreset {
  const id = (
    normalized
      ? `${definition.id}:358x140-r54`
      : definition.id
  ) as NewGlassPresetId
  return preset({
    id,
    sourceFamily: definition.sourceFamily,
    sourcePresetKey: definition.sourcePresetKey,
    displayLabel: normalized
      ? `${definition.displayLabel} · 358×140 r54`
      : definition.displayLabel,
    renderer: definition.renderer,
    config: normalized ? definition.normalizedConfig : definition.config,
    nativeLayout: normalized
      ? layout(358, 140, 54, 'rounded-rect')
      : definition.nativeLayout,
    compositing: definition.compositing,
    interactions: definition.interactions,
    sourcePath: definition.sourcePath,
    provenance: definition.provenance,
  })
}

export const EXPERIMENT_ELEVEN_NEW_GLASS_PRESETS = Object.fromEntries([
  ...EXPERIMENT_ELEVEN_NEW_GLASS_BASE_DEFINITIONS.map((definition) => [
    definition.id,
    createNewGlassPreset(definition, false),
  ] as const),
  ...EXPERIMENT_ELEVEN_NEW_GLASS_BASE_DEFINITIONS.map((definition) => {
    const id = `${definition.id}:358x140-r54` as NewGlassDuplicatePresetId
    return [id, createNewGlassPreset(definition, true)] as const
  }),
]) as Record<NewGlassPresetId, ExperimentElevenReferencePreset>

export const EXPERIMENT_ELEVEN_REFERENCE_PRESETS = {
  'liquid-main:custom-300x200': preset({
    id: 'liquid-main:custom-300x200',
    sourceFamily: 'liquid-main',
    sourcePresetKey: 'custom-300x200',
    displayLabel: 'Liquid Glass Main · Custom 300×200',
    renderer: 'liquid-main-svg-filter',
    config: LIQUID_MAIN_CUSTOM_CONFIG,
    nativeLayout: layout(300, 200, 60, 'rounded-rect'),
    compositing: compositing(
      'transparent-page-portal-backdrop-filter',
      true,
      'live-experiment-composition',
      'The source SVG graph is mounted on one transparent page-level object and samples the unchanged live Experiment Eleven layers.',
    ),
    interactions: interactions(false, false),
    sourcePath: sourcePaths.liquidMain,
    provenance: provenance.liquidMain,
  }),
  'liquidgl:demo-1-nav': preset({
    id: 'liquidgl:demo-1-nav',
    sourceFamily: 'liquidgl',
    sourcePresetKey: 'demo-1:.menu-wrap',
    displayLabel: 'liquidGL Demo 1 · Nav bar',
    renderer: 'liquidgl-webgl',
    config: LIQUIDGL_DEMO_1_NAV_CONFIG,
    nativeLayout: layout(310.344, 75.188, 21.6, 'liquidgl-menu'),
    compositing: compositing(
      'live-document-webgl-snapshot',
      true,
      'live-document-composition',
      'The exact liquidGL renderer snapshots the live Layer B DOM behind the object. Its shared canvas is transparent outside .menu-wrap; clone normalization never mutates Layer B and no source page is mounted.',
    ),
    interactions: interactions(false, true, 'liquidGL fade reveal'),
    sourcePath: sourcePaths.liquidgl,
    provenance: provenance.liquidgl,
  }),
  'fluid-glass:lens': preset({
    id: 'fluid-glass:lens',
    sourceFamily: 'fluid-glass',
    sourcePresetKey: 'DEMO_CONFIGS.lensDefault',
    displayLabel: 'FluidGlass · Lens',
    renderer: 'fluid-glass-r3f',
    config: { ...FLUID_GLASS_CONFIGS.lensDefault, internals: FLUID_GLASS_INTERNALS },
    nativeLayout: layout(320, 240, 10, 'three-lens'),
    compositing: compositing(
      'transparent-webgl-object',
      false,
      'live-experiment-stage-capture',
      'Only the exact GLB lens is visible on the alpha-zero canvas. MeshTransmissionMaterial receives a cropped capture of the live Experiment Eleven composition in its private FBO; the capture is never blitted as a visible bed.',
    ),
    interactions: interactions(true, true, 'pointer-following lens', 'source ScrollControls'),
    sourcePath: sourcePaths.fluidGlass,
    provenance: provenance.fluidGlass,
  }),
  'fluid-glass:frosted': preset({
    id: 'fluid-glass:frosted',
    sourceFamily: 'fluid-glass',
    sourcePresetKey: 'DEMO_CONFIGS.frosted',
    displayLabel: 'FluidGlass · Frosted',
    renderer: 'fluid-glass-r3f',
    config: { ...FLUID_GLASS_CONFIGS.frosted, internals: FLUID_GLASS_INTERNALS },
    nativeLayout: layout(320, 240, 10, 'three-lens'),
    compositing: compositing(
      'transparent-webgl-object',
      false,
      'live-experiment-stage-capture',
      'Only the exact GLB lens is visible on the alpha-zero canvas. MeshTransmissionMaterial receives a cropped capture of the live Experiment Eleven composition in its private FBO; the capture is never blitted as a visible bed.',
    ),
    interactions: interactions(true, true, 'pointer-following lens', 'source ScrollControls'),
    sourcePath: sourcePaths.fluidGlass,
    provenance: provenance.fluidGlass,
  }),
  'fluid-glass:bar': preset({
    id: 'fluid-glass:bar',
    sourceFamily: 'fluid-glass',
    sourcePresetKey: 'DEMO_CONFIGS.barDefault',
    displayLabel: 'FluidGlass · Bar',
    renderer: 'fluid-glass-r3f',
    config: { ...FLUID_GLASS_CONFIGS.barDefault, internals: FLUID_GLASS_INTERNALS },
    nativeLayout: layout(320, 240, 10, 'three-bar'),
    compositing: compositing(
      'transparent-webgl-object',
      false,
      'live-experiment-stage-capture',
      'Only the exact GLB bar and its intrinsic nav items are visible on the alpha-zero canvas. The private transmission FBO samples the live Experiment Eleven composition and never becomes a visible background.',
    ),
    interactions: interactions(true, true, 'source ScrollControls', 'Home/About/Contact nav text'),
    sourcePath: sourcePaths.fluidGlass,
    provenance: provenance.fluidGlass,
  }),
  'fluid-glass:diamond': preset({
    id: 'fluid-glass:diamond',
    sourceFamily: 'fluid-glass',
    sourcePresetKey: 'DEMO_CONFIGS.diamond',
    displayLabel: 'FluidGlass · Diamond',
    renderer: 'fluid-glass-r3f',
    config: { ...FLUID_GLASS_CONFIGS.diamond, internals: FLUID_GLASS_INTERNALS },
    nativeLayout: layout(320, 240, 10, 'three-cube'),
    compositing: compositing(
      'transparent-webgl-object',
      false,
      'live-experiment-stage-capture',
      'Only the exact GLB cube is visible on the alpha-zero canvas. Its private FBO samples a cropped capture of the live Experiment Eleven composition and is never blitted as a visible background.',
    ),
    interactions: interactions(true, true, 'pointer-following cube', 'source ScrollControls'),
    sourcePath: sourcePaths.fluidGlass,
    provenance: provenance.fluidGlass,
  }),
  'fluid-glass:fluid': preset({
    id: 'fluid-glass:fluid',
    sourceFamily: 'fluid-glass',
    sourcePresetKey: 'DEMO_CONFIGS.fluid',
    displayLabel: 'FluidGlass · Fluid',
    renderer: 'fluid-glass-r3f',
    config: { ...FLUID_GLASS_CONFIGS.fluid, internals: FLUID_GLASS_INTERNALS },
    nativeLayout: layout(320, 240, 10, 'three-lens'),
    compositing: compositing(
      'transparent-webgl-object',
      false,
      'live-experiment-stage-capture',
      'Only the exact fluid GLB lens is visible on the alpha-zero canvas. Its private FBO samples a cropped capture of the live Experiment Eleven composition and never becomes a visible background.',
    ),
    interactions: interactions(true, true, 'pointer-following lens', 'temporal distortion', 'source ScrollControls'),
    sourcePath: sourcePaths.fluidGlass,
    provenance: provenance.fluidGlass,
  }),
  'liquid-web:apple': liquidWebPreset(
    'liquid-web:apple',
    'PRESETS.Apple',
    'Liquid Glass Custom · Apple',
    LIQUID_GLASS_WEB_CONFIGS.apple,
    layout(220, 220, 110, 'circle'),
    [],
  ),
  'liquid-web:library-default': liquidWebPreset(
    'liquid-web:library-default',
    'PRESETS.Library default',
    'Liquid Glass Custom · Library default',
    LIQUID_GLASS_WEB_CONFIGS.libraryDefault,
    layout(220, 220, 110, 'circle'),
    [],
  ),
  'liquid-web:fishbowl': liquidWebPreset(
    'liquid-web:fishbowl',
    'PRESETS.Fishbowl',
    'Liquid Glass Custom · Fishbowl',
    LIQUID_GLASS_WEB_CONFIGS.fishbowl,
    layout(220, 220, 110, 'circle'),
    [],
  ),
  'liquid-web:frosted': liquidWebPreset(
    'liquid-web:frosted',
    'PRESETS.Frosted',
    'Liquid Glass Custom · Frosted',
    LIQUID_GLASS_WEB_CONFIGS.frosted,
    layout(300, 190, 40, 'rounded-rect'),
    [],
  ),
  'liquid-web:prism': liquidWebPreset(
    'liquid-web:prism',
    'PRESETS.Prism',
    'Liquid Glass Custom · Prism',
    LIQUID_GLASS_WEB_CONFIGS.prism,
    layout(240, 240, 120, 'circle'),
    [],
  ),
  'liquid-web:flat-pane': liquidWebPreset(
    'liquid-web:flat-pane',
    'PRESETS.Flat pane',
    'Liquid Glass Custom · Flat pane',
    LIQUID_GLASS_WEB_CONFIGS.flatPane,
    layout(260, 260, 20, 'rounded-rect'),
    [],
  ),
  'liquid-web:hero-circle': liquidWebPreset(
    'liquid-web:hero-circle',
    'PRESETS.Hero circle / DEMO_LENSES.hero',
    'Liquid Glass Custom · Hero circle',
    LIQUID_GLASS_WEB_CONFIGS.hero,
    layout(200, 200, 100, 'circle'),
    ['GripLens optical surface; source positional motion disabled in Experiment Eleven'],
    true,
    true,
  ),
  'liquid-web:reading-glass': liquidWebPreset(
    'liquid-web:reading-glass',
    'PRESETS.Reading glass / DEMO_LENSES.reading',
    'Liquid Glass Custom · Reading glass',
    LIQUID_GLASS_WEB_CONFIGS.reading,
    layout(150, 150, 75, 'circle'),
    ['pointer-following reading magnifier'],
    true,
  ),
  'liquid-web:orbit': liquidWebPreset(
    'liquid-web:orbit',
    'PRESETS.Orbit / DEMO_LENSES.orbit',
    'Liquid Glass Custom · Orbit',
    {
      ...LIQUID_GLASS_WEB_CONFIGS.orbit,
      motion: {
        x: '0.5 + 0.33 * sin(t * 0.9)',
        y: '0.5 + 0.3 * sin(t * 1.4 + PI / 3)',
        strength: '0.05 + 0.045 * (0.5 + 0.5 * sin(t * 1.8))',
        chromaticAberration: '0.25 + 0.5 * (0.5 + 0.5 * sin(t * 1.1))',
      },
    },
    layout(170, 170, 85, 'circle'),
    ['Motion.LiquidGlass canonical/default frame; autonomous timeline disabled'],
    true,
    true,
  ),
  'liquid-web:engine-panel': liquidWebPreset(
    'liquid-web:engine-panel',
    'PRESETS.Engine panel / DEMO_LENSES.engine',
    'Liquid Glass Custom · Engine panel',
    { ...LIQUID_GLASS_WEB_CONFIGS.engine, initialPosition: { x: 0.35, y: 0.5 } },
    layout(160, 160, 80, 'circle'),
    ['raw engine pointer tracking'],
    true,
  ),
  'wge-next:form-submit-button': preset({
    id: 'wge-next:form-submit-button',
    sourceFamily: 'wge-next',
    sourcePresetKey: 'LiquidGlassFormDemo.submitButton',
    displayLabel: 'WGE Next · Submit Form button',
    renderer: 'wge-next-submit-button',
    config: WGE_NEXT_SUBMIT_BUTTON_CONFIG,
    nativeLayout: layout(384, 38, 18, 'source-button'),
    compositing: compositing(
      'transparent-page-portal-backdrop-filter',
      true,
      'live-experiment-composition',
      'The single source button uses a transparent page-level host over the unchanged live Experiment Eleven composition.',
    ),
    interactions: interactions(true, false, 'source hover background', 'native button press'),
    sourcePath: sourcePaths.wgeSubmitButton,
    provenance: provenance.wgeSubmitButton,
  }),
  'wge-next:bottom-bar': preset({
    id: 'wge-next:bottom-bar',
    sourceFamily: 'wge-next',
    sourcePresetKey: 'LiquidGlassDemo.bottomBar',
    displayLabel: 'WGE Next · Glass bottom bar',
    renderer: 'wge-next-bottom-bar',
    config: WGE_NEXT_BOTTOM_BAR_CONFIG,
    nativeLayout: layout(640, 60, 28, 'rounded-rect'),
    compositing: compositing(
      'transparent-page-portal-backdrop-filter',
      true,
      'live-experiment-composition',
      'The responsive source bar keeps its natural 640px inset geometry in a transparent portal and samples the unchanged live Experiment Eleven composition.',
    ),
    interactions: interactions(true, true, 'outer-surface hover spring'),
    sourcePath: sourcePaths.wgeBottomBar,
    provenance: provenance.wgeBottomBar,
  }),
  'web-glass:thick-lens': webGlassPreset(
    'web-glass:thick-lens',
    'PRESETS.thickLens',
    'Web Glass · Thick lens',
    WEB_GLASS_CONFIGS.thickLens,
    60,
  ),
  'web-glass:razor-edge': webGlassPreset(
    'web-glass:razor-edge',
    'PRESETS.razorEdge',
    'Web Glass · Razor edge',
    WEB_GLASS_CONFIGS.razorEdge,
    24,
  ),
  'web-glass:bottom-bar': webGlassPreset(
    'web-glass:bottom-bar',
    'PRESETS.bottomBar',
    'Web Glass · Bottom bar',
    WEB_GLASS_CONFIGS.bottomBar,
    28,
  ),
  'web-glass:stress-panel': webGlassPreset(
    'web-glass:stress-panel',
    'PRESETS.stressPanel',
    'Web Glass · Stress panel',
    WEB_GLASS_CONFIGS.stressPanel,
    28,
  ),
  'web-glass:storybook': webGlassPreset(
    'web-glass:storybook',
    'PRESETS.storybook',
    'Web Glass · Storybook surface',
    WEB_GLASS_CONFIGS.storybook,
    30,
  ),
  'glass-surface:component-default': glassSurfacePreset(
    'glass-surface:component-default',
    'DEMO_CONFIGS.componentDefault',
    'GlassSurface · Component default',
    GLASS_SURFACE_CONFIGS.componentDefault,
    20,
  ),
  'glass-surface:upstream-demo': glassSurfacePreset(
    'glass-surface:upstream-demo',
    'DEMO_CONFIGS.upstreamDemo',
    'GlassSurface · Upstream demo',
    GLASS_SURFACE_CONFIGS.upstreamDemo,
    50,
  ),
  'glass-surface:ios-pill': glassSurfacePreset(
    'glass-surface:ios-pill',
    'DEMO_CONFIGS.pill',
    'GlassSurface · iOS pill',
    GLASS_SURFACE_CONFIGS.pill,
    60,
  ),
  'glass-surface:prism': glassSurfacePreset(
    'glass-surface:prism',
    'DEMO_CONFIGS.prism',
    'GlassSurface · Prism',
    GLASS_SURFACE_CONFIGS.prism,
    24,
  ),
  'glass-surface:achromatic': glassSurfacePreset(
    'glass-surface:achromatic',
    'DEMO_CONFIGS.achromatic',
    'GlassSurface · Achromatic',
    GLASS_SURFACE_CONFIGS.achromatic,
    24,
  ),
  'glass-surface:convex': glassSurfacePreset(
    'glass-surface:convex',
    'DEMO_CONFIGS.convex',
    'GlassSurface · Convex',
    GLASS_SURFACE_CONFIGS.convex,
    30,
  ),
  ...EXPERIMENT_ELEVEN_NEW_GLASS_PRESETS,
} as const satisfies Record<string, ExperimentElevenReferencePreset>

export type ExperimentElevenReferencePresetId = keyof typeof EXPERIMENT_ELEVEN_REFERENCE_PRESETS

export const EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS = Object.freeze(
  Object.keys(EXPERIMENT_ELEVEN_REFERENCE_PRESETS) as ExperimentElevenReferencePresetId[],
)

export const EXPERIMENT_ELEVEN_REFERENCE_FIRST_SAVE_ID = 1038 as const

/**
 * Deterministic save-to-object audit used by both static and browser tests.
 * This deliberately includes component identity and transparent compositing,
 * not only labels/config numbers.
 */
export const EXPERIMENT_ELEVEN_REFERENCE_OBJECT_AUDIT = Object.freeze(
  EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS.map((presetId, index) => {
    const definition = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[presetId]
    return Object.freeze({
      saveId: EXPERIMENT_ELEVEN_REFERENCE_FIRST_SAVE_ID + index,
      presetId,
      sourceFamily: definition.sourceFamily,
      sourcePresetKey: definition.sourcePresetKey,
      renderer: definition.renderer,
      nativeWidth: definition.nativeLayout.width,
      nativeHeight: definition.nativeLayout.height,
      nativeRadius: definition.nativeLayout.radius,
      nativeGeometry: definition.nativeLayout.geometry,
      sourceComponent: definition.sourceComponent,
      portalRequired: definition.compositing.pageLevelPortal,
      portalMode: definition.portalMode,
      contentPolicy: definition.contentPolicy,
      disableAutonomousMotion: definition.disableAutonomousMotion ?? false,
      transparentRenderSurface: definition.transparentRenderSurface,
    })
  }),
)

export function isExperimentElevenReferencePresetId(
  value: unknown,
): value is ExperimentElevenReferencePresetId {
  return typeof value === 'string' && value in EXPERIMENT_ELEVEN_REFERENCE_PRESETS
}

export function getExperimentElevenReferencePreset(
  id: ExperimentElevenReferencePresetId,
): ExperimentElevenReferencePreset {
  return EXPERIMENT_ELEVEN_REFERENCE_PRESETS[id]
}
