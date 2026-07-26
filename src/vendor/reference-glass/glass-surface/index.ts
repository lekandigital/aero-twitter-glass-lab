export {
  default as GlassSurface,
  GlassSurfaceReferenceRenderer
} from './GlassSurface';
export type {
  GlassSurfaceProps,
  GlassSurfaceReferenceRendererProps
} from './GlassSurface';
export {
  DEMO_CONFIGS,
  GLASS_SURFACE_DEFAULTS,
  INTERNALS
} from './config';
export type {
  Channel,
  MixBlendMode,
  SurfaceProps
} from './config';

export const GLASS_SURFACE_PROVENANCE = {
  implementation:
    'react-bits-main/src/ts-default/Components/GlassSurface/GlassSurface.tsx',
  showcaseImplementation:
    'react-bits-glass-surface-showcase/src/vendor/GlassSurface.tsx',
  presetSource:
    'react-bits-glass-surface-showcase/src/lib/config.ts',
  license: 'React Bits LICENSE.md (MIT + Commons Clause License Condition v1.0)',
  intentionalAdaptations: [
    'type-only imports for verbatimModuleSyntax',
    'CSS class names namespaced to e11-ref-glass-surface',
    'React useId values sanitized and namespaced for collision-safe SVG ids',
    'previously-global displacement primitive ids namespaced per mount',
    'duplicate ResizeObserver removed and queued map updates cancelled at unmount',
    'portal-ready adapter adds data attributes without an extra DOM wrapper'
  ]
} as const;
