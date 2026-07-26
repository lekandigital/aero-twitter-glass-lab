import type { CSSProperties } from 'react';

export const GLASS_PROJECT_OBJECT_IDS = [
  'liquid-dom:notification-center-main',
  'liquid-dom:notification-center-dock',
  'liquid-dom:ios-notification-banner',
  'lucas-romero:macos-dock-shell',
  'apple-liquid-glass:shader-shell',
  'frontend-vue:app-card',
] as const;

export type GlassProjectObjectId = (typeof GLASS_PROJECT_OBJECT_IDS)[number];

export type GlassProjectRendererFamily =
  | 'liquid-dom-webgpu'
  | 'css-svg-backdrop'
  | 'r3f-three-glsl'
  | 'vue-css-svg-backdrop';

export type GlassProjectKind =
  | 'notification-center-main'
  | 'notification-center-dock'
  | 'ios-notification-banner'
  | 'macos-dock-shell'
  | 'shader-shell'
  | 'app-card';

export type GlassGeometry = Readonly<{
  width: number;
  height: number;
  cornerRadius: number;
  technicalInset?: number;
}>;

export type GlassGeometryOverride = Partial<GlassGeometry>;

export type SourceFileProvenance = Readonly<{
  path: string;
  sha256: string;
  sourceLines?: string;
}>;

export type SourceProvenance = Readonly<{
  repository: 'glass-projects-lab';
  repositoryCommit: string;
  projectDirectory: string;
  deploymentProjectId: string;
  sourceComponent: string;
  sourceFiles: readonly SourceFileProvenance[];
  combinedSha256: string;
  auditedSourceState: 'clean';
}>;

export type Rgba = Readonly<{
  r: number;
  g: number;
  b: number;
  a: number;
}>;

export type LiquidDomOptics = Readonly<{
  blur: number;
  spacing?: number;
  bezelWidth: number;
  thickness: number;
  displacementBlur?: number;
  ior?: number;
  dispersion?: number;
  tint: Rgba;
  shadowColor: Rgba;
  shadowOffsetX?: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowSpread?: number;
  specularOpacity: number;
  specularFalloff?: number;
  blendSupportGating: false;
}>;

export type LiquidDomGlassProjectPreset = Readonly<{
  id: Extract<GlassProjectObjectId, `liquid-dom:${string}`>;
  kind:
    | 'notification-center-main'
    | 'notification-center-dock'
    | 'ios-notification-banner';
  label: string;
  rendererFamily: 'liquid-dom-webgpu';
  geometry: GlassGeometry;
  optics: LiquidDomOptics;
  provenance: SourceProvenance;
  contentPolicy: 'object-only-empty-glass';
  opticalInput: 'experiment-eleven-stage-capture';
}>;

export type CssSvgGlassProjectPreset = Readonly<{
  id:
    | 'lucas-romero:macos-dock-shell'
    | 'frontend-vue:app-card';
  kind: 'macos-dock-shell' | 'app-card';
  label: string;
  rendererFamily: 'css-svg-backdrop' | 'vue-css-svg-backdrop';
  geometry: GlassGeometry;
  config: Readonly<Record<string, unknown>>;
  provenance: SourceProvenance;
  contentPolicy: 'object-only-empty-glass';
  opticalInput: 'live-experiment-eleven-stage-backdrop';
}>;

export type ShaderGlassProjectPreset = Readonly<{
  id: 'apple-liquid-glass:shader-shell';
  kind: 'shader-shell';
  label: string;
  rendererFamily: 'r3f-three-glsl';
  geometry: GlassGeometry;
  config: Readonly<Record<string, unknown>>;
  provenance: SourceProvenance;
  contentPolicy: 'object-only-empty-glass';
  opticalInput: 'experiment-eleven-stage-capture';
}>;

export type GlassProjectPreset =
  | LiquidDomGlassProjectPreset
  | CssSvgGlassProjectPreset
  | ShaderGlassProjectPreset;

export type GlassProjectRendererProps = Readonly<{
  referencePresetId?: string;
  geometry?: GlassGeometryOverride;
  className?: string;
  style?: CSSProperties;
}>;

export function createGlassProjectGeometry(
  width: number,
  height: number,
  cornerRadius: number,
  technicalInset?: number,
): GlassGeometry {
  return {
    width,
    height,
    cornerRadius,
    ...(technicalInset === undefined ? {} : { technicalInset }),
  };
}

export function resolveGlassGeometry(
  geometry: GlassGeometry,
  override?: GlassGeometryOverride,
): GlassGeometry {
  return {
    ...geometry,
    ...override,
  };
}
