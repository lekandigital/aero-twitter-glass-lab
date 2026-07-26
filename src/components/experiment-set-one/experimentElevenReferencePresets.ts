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

export type ExperimentElevenReferenceSourceFamily =
  | 'liquid-main'
  | 'liquidgl'
  | 'fluid-glass'
  | 'liquid-glass-web-react'
  | 'wge-next'
  | 'web-glass-effect'
  | 'glass-surface'

export type ExperimentElevenReferenceRenderer =
  | 'liquid-main-svg-filter'
  | 'liquidgl-webgl'
  | 'fluid-glass-r3f'
  | 'liquid-glass-web-react'
  | 'wge-next-form'
  | 'wge-next-bottom-bar'
  | 'web-glass-svg-filter'
  | 'glass-surface-svg-filter'

export type ExperimentElevenReferenceCompositingStrategy =
  | 'anchored-backdrop-clone'
  | 'source-content-filter'
  | 'self-contained-webgl'
  | 'source-animated-backdrop'
  | 'liquidgl-stage-snapshot'

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
    | 'complete-form'
}

export interface ExperimentElevenReferenceCompositing {
  strategy: ExperimentElevenReferenceCompositingStrategy
  pageLevelPortal: boolean
  samplingSource: 'experiment-stage-without-layer-b' | 'source-demo-bed' | 'r3f-scene' | 'source-form-backdrop'
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
  sourcePresetKey: string
  displayLabel: string
  renderer: ExperimentElevenReferenceRenderer
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
    scope: 'body',
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
    width: 770,
    height: 382,
    lensOffsetX: 189.8,
    lensOffsetY: 111,
    radius: 18,
    provenance: 'Raw Engine outer stage; filtered bed is the 768×380 one-pixel inset.',
  },
} as const satisfies Record<string, ExperimentElevenReferenceSourceContext>

export const WGE_NEXT_FORM_CONFIG = {
  frame: { width: 432, height: 560, borderRadius: 12, padding: 24, background: '#000000' },
  backdrop: {
    opacity: 0.45,
    gridSize: 24,
    lineColor: 'rgba(255,255,255,0.24)',
    radialGlow: 'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.12), transparent 45%)',
    animation: { name: 'moveBackground', durationMs: 8000, timing: 'linear', iterations: 'infinite', travel: 120 },
  },
  form: { width: 384, verticalGap: 24, nameColumns: 2, nameColumnGap: 16 },
  glass: {
    glassThickness: 110,
    refractiveIndex: 1.8,
    blur: 0.4,
    specularOpacity: 1,
    specularSaturation: 4,
  },
  fields: [
    { key: 'firstName', kind: 'input', label: 'First Name', placeholder: 'John', height: 40, radius: 20, bezelWidth: 20 },
    { key: 'lastName', kind: 'input', label: 'Last Name', placeholder: 'Doe', height: 40, radius: 20, bezelWidth: 10 },
    {
      key: 'message',
      kind: 'textarea',
      label: 'Message',
      placeholder: 'Tell us about yourself...',
      rows: 4,
      radius: 16,
      bezelWidth: 20,
    },
    {
      key: 'gender',
      kind: 'select',
      label: 'Gender',
      placeholder: 'Select your gender',
      height: 40,
      radius: 12,
      bezelWidth: 10,
      options: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    { key: 'submit', kind: 'button', label: 'Submit Form', radius: 18, paddingY: 8, bezelWidth: 10 },
  ],
  preventSubmitNavigation: true,
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
    valueInput: { width: 64, height: 24 },
    searchInput: { height: 32, placeholder: 'Search images...' },
    iconButton: { width: 32, height: 32, radius: 6 },
  },
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
  wgeForm: [
    'glass-projects-lab/web-glass-effect/apps/next-demo/app/components/liquid-glass-form-demo.tsx',
    'glass-projects-lab/web-glass-effect/apps/next-demo/app/page.tsx',
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
  wgeForm: 'Complete WGE Next form demo and its animated source backdrop.',
  wgeBottomBar: 'Complete child bottom bar from WGE Next liquid-glass-demo at source resting values.',
  webGlass: 'PRESETS merged with all web-glass-effect LIBRARY_DEFAULTS.',
  glassSurface: 'DEMO_CONFIGS merged with all GlassSurface component defaults.',
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
  value: ExperimentElevenReferencePreset,
): ExperimentElevenReferencePreset {
  return value
}

const liquidWebPreset = (
  id: keyof typeof LIQUID_GLASS_WEB_SOURCE_CONTEXTS,
  sourcePresetKey: string,
  displayLabel: string,
  config: Readonly<Record<string, unknown>>,
  nativeLayout: ExperimentElevenReferenceNativeLayout,
  sourceBehaviors: readonly string[],
  animation = false,
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
      'source-content-filter',
      true,
      'source-demo-bed',
      'The exact source SVG filter operates on a scoped copy of the preset’s demonstration bed.',
    ),
    interactions: interactions(sourceBehaviors.length > 0, animation, ...sourceBehaviors),
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
      'anchored-backdrop-clone',
      true,
      'experiment-stage-without-layer-b',
      'A clipped stage clone supplies the material behind Layer B without cutting a hole in Layer B.',
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
      'anchored-backdrop-clone',
      true,
      'experiment-stage-without-layer-b',
      'The GlassSurface backdrop filter samples only the clipped stage clone; Layer B remains unchanged.',
    ),
    interactions: interactions(false, false),
    sourcePath: sourcePaths.glassSurface,
    provenance: provenance.glassSurface,
  })

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
      'anchored-backdrop-clone',
      true,
      'experiment-stage-without-layer-b',
      'The source SVG filter samples a clipped stage clone while the live opaque Layer B remains visually intact.',
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
      'liquidgl-stage-snapshot',
      true,
      'experiment-stage-without-layer-b',
      'liquidGL receives a renderer-scoped stage snapshot that excludes Layer B only from the WebGL input.',
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
    compositing: compositing('self-contained-webgl', false, 'r3f-scene', 'The source opaque R3F scene is the transmission buffer.'),
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
    compositing: compositing('self-contained-webgl', false, 'r3f-scene', 'The source opaque R3F scene is the transmission buffer.'),
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
    compositing: compositing('self-contained-webgl', false, 'r3f-scene', 'The source opaque R3F scene is the transmission buffer.'),
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
    compositing: compositing('self-contained-webgl', false, 'r3f-scene', 'The source opaque R3F scene is the transmission buffer.'),
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
    compositing: compositing('self-contained-webgl', false, 'r3f-scene', 'The source opaque R3F scene is the transmission buffer.'),
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
    ['GripLens idle wander', 'source grip drag'],
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
    ['Lissajous orbit', 'breathing strength', 'breathing chromatic aberration'],
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
  'wge-next:form': preset({
    id: 'wge-next:form',
    sourceFamily: 'wge-next',
    sourcePresetKey: 'LiquidGlassFormDemo.form',
    displayLabel: 'WGE Next · Form',
    renderer: 'wge-next-form',
    config: WGE_NEXT_FORM_CONFIG,
    nativeLayout: layout(432, 560, 12, 'complete-form'),
    compositing: compositing(
      'source-animated-backdrop',
      true,
      'source-form-backdrop',
      'Each field samples the form’s own animated grid and radial glow inside the source black frame.',
    ),
    interactions: interactions(true, true, 'input focus', 'textarea editing', 'select', 'submit press without navigation'),
    sourcePath: sourcePaths.wgeForm,
    provenance: provenance.wgeForm,
  }),
  'wge-next:bottom-bar': preset({
    id: 'wge-next:bottom-bar',
    sourceFamily: 'wge-next',
    sourcePresetKey: 'LiquidGlassDemo.bottomBar',
    displayLabel: 'WGE Next · Glass bottom bar',
    renderer: 'wge-next-bottom-bar',
    config: WGE_NEXT_BOTTOM_BAR_CONFIG,
    nativeLayout: layout(640, 56, 28, 'rounded-rect'),
    compositing: compositing(
      'anchored-backdrop-clone',
      true,
      'experiment-stage-without-layer-b',
      'The responsive source bar is mounted at a 672px source stage width, yielding its natural 640px inset box.',
    ),
    interactions: interactions(true, true, 'hover spring', 'search-focus spring', 'input focus', 'icon pressed states'),
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
} as const satisfies Record<string, ExperimentElevenReferencePreset>

export type ExperimentElevenReferencePresetId = keyof typeof EXPERIMENT_ELEVEN_REFERENCE_PRESETS

export const EXPERIMENT_ELEVEN_REFERENCE_PRESET_IDS = Object.freeze(
  Object.keys(EXPERIMENT_ELEVEN_REFERENCE_PRESETS) as ExperimentElevenReferencePresetId[],
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
