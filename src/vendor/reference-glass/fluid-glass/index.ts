export {
  default as FluidGlass,
  FLUID_GLASS_NATIVE_LAYOUT,
  FLUID_GLASS_RUNTIME_ASSETS,
  FluidGlassReferenceRenderer
} from './FluidGlass';
export type {
  BackdropMode,
  FluidGlassProps,
  FluidGlassReferenceRendererProps,
  Mode,
  ModeProps,
  NavItem
} from './FluidGlass';
export {
  BAR_MATERIAL_DEFAULTS,
  DEFAULT_NAV_ITEMS,
  DEMO_CONFIGS,
  FLUID_GLASS_DEFAULTS,
  FLUID_GLASS_REFERENCE_OBJECTS,
  INTERNALS
} from './config';
export type { ModeProps as FluidGlassConfigModeProps } from './config';

export const FLUID_GLASS_PROVENANCE = {
  implementation:
    'react-bits-main/src/ts-default/Components/FluidGlass/FluidGlass.tsx',
  showcaseImplementation:
    'react-bits-fluid-glass-showcase/src/vendor/FluidGlass.tsx',
  presetSource:
    'react-bits-fluid-glass-showcase/src/lib/config.ts',
  license: 'React Bits LICENSE.md (MIT + Commons Clause License Condition v1.0)',
  intentionalAdaptations: [
    'type-only imports for verbatimModuleSyntax',
    'asset URLs moved under /vendor/reference-glass/fluid-glass',
    'drei useGLTF pointed at the vendored Draco decoder',
    'source-resolved Noto Sans Regular font pinned to its byte-identical vendored WOFF',
    'source empty Scroll html portal omitted to avoid duplicate React roots under StrictMode',
    'native 320x240 gallery-stage adapter and scoped stage CSS',
    'object-only mode omits the visible source FBO plane and clears the visible framebuffer to alpha zero',
    'cursor cleanup when the bar renderer unmounts'
  ]
} as const;
