import type { ReactNode } from 'react'
import type {
  ExperimentElevenReferencePreset,
  ExperimentElevenReferencePresetId,
} from './experimentElevenReferencePresets'
import {
  AppleLiquidGlassShader,
  FrontendVueAppCardGlass,
  LiquidDomIosNotificationBannerGlass,
  LiquidDomNotificationCenterDockGlass,
  LiquidDomNotificationCenterMainGlass,
  LucasRomeroDockGlass,
  type GlassGeometryOverride,
  type GlassProjectObjectId,
} from '../../vendor/reference-glass/glass-projects-apps'
import {
  CssLiquidGlassSwitcher,
  type CssLiquidGlassSwitcherConfig,
} from '../../vendor/reference-glass/css-liquid-glass-switcher'
import {
  LiquidGlassDistSurface,
  type LiquidGlassDistConfig,
} from '../../vendor/reference-glass/liquid-glass-dist'
import {
  ChromiumConfigurableGlass,
  type ChromiumConfigurableGlassConfig,
} from '../../vendor/reference-glass/chromium-configurable-glass'
import {
  LiquidGlassShaderSurface,
  type LiquidGlassShaderConfig,
} from '../../vendor/reference-glass/liquid-glass-shader'
import {
  PureCssIos26GlassContainer,
  type PureCssIos26ContainerConfig,
} from '../../vendor/reference-glass/pure-css-ios-26'
import {
  LiquidGlassJsRectSurface,
  type LiquidGlassJsRectConfig,
} from '../../vendor/reference-glass/liquid-glass-js'

const NORMALIZED_SUFFIX = ':358x140-r54'

function basePresetId(presetId: string): string {
  return presetId.endsWith(NORMALIZED_SUFFIX)
    ? presetId.slice(0, -NORMALIZED_SUFFIX.length)
    : presetId
}

interface SourceObjectRendererProps {
  presetId: ExperimentElevenReferencePresetId
  preset: ExperimentElevenReferencePreset
}

type AppObjectRenderer = (
  geometry: GlassGeometryOverride,
  referencePresetId: string,
) => ReactNode

const APP_OBJECT_RENDERERS: Record<GlassProjectObjectId, AppObjectRenderer> = {
  'liquid-dom:notification-center-main': (geometry, referencePresetId) => (
    <LiquidDomNotificationCenterMainGlass
      geometry={geometry}
      referencePresetId={referencePresetId}
    />
  ),
  'liquid-dom:notification-center-dock': (geometry, referencePresetId) => (
    <LiquidDomNotificationCenterDockGlass
      geometry={geometry}
      referencePresetId={referencePresetId}
    />
  ),
  'liquid-dom:ios-notification-banner': (geometry, referencePresetId) => (
    <LiquidDomIosNotificationBannerGlass
      geometry={geometry}
      referencePresetId={referencePresetId}
    />
  ),
  'lucas-romero:macos-dock-shell': (geometry, referencePresetId) => (
    <LucasRomeroDockGlass
      geometry={geometry}
      referencePresetId={referencePresetId}
    />
  ),
  'apple-liquid-glass:shader-shell': (geometry, referencePresetId) => (
    <AppleLiquidGlassShader
      geometry={geometry}
      referencePresetId={referencePresetId}
    />
  ),
  'frontend-vue:app-card': (geometry, referencePresetId) => (
    <FrontendVueAppCardGlass
      geometry={geometry}
      referencePresetId={referencePresetId}
    />
  ),
}

type ExtractedObjectRenderer = (
  presetId: string,
  config: Readonly<Record<string, unknown>>,
) => ReactNode

const EXTRACTED_OBJECT_RENDERERS: Record<string, ExtractedObjectRenderer> = {
  'css-liquid-glass-switcher:switcher': (presetId, config) => (
    <CssLiquidGlassSwitcher
      presetId={presetId}
      config={config as unknown as CssLiquidGlassSwitcherConfig}
    />
  ),
  'liquid-glass-dist:glass': (presetId, config) => (
    <LiquidGlassDistSurface
      presetId={presetId}
      config={config as unknown as LiquidGlassDistConfig}
    />
  ),
  'chromium-configurable-glass:requested': (presetId, config) => (
    <ChromiumConfigurableGlass
      presetId={presetId}
      config={config as unknown as ChromiumConfigurableGlassConfig}
    />
  ),
  'liquid-glass-shader:lens': (presetId, config) => (
    <LiquidGlassShaderSurface
      presetId={presetId}
      config={config as unknown as LiquidGlassShaderConfig}
    />
  ),
  'pure-css-ios-26:glass-container': (presetId, config) => (
    <PureCssIos26GlassContainer
      presetId={presetId}
      config={config as unknown as PureCssIos26ContainerConfig}
    />
  ),
  'liquid-glass-js:rounded-rectangle': (presetId, config) => (
    <LiquidGlassJsRectSurface
      presetId={presetId}
      config={config as unknown as LiquidGlassJsRectConfig}
    />
  ),
}

export function ExperimentElevenNewGlassPresetRenderer({
  presetId,
  preset,
}: SourceObjectRendererProps) {
  const baseId = basePresetId(presetId)
  const renderer =
    preset.renderer === 'glass-project-app-object'
      ? APP_OBJECT_RENDERERS[baseId as GlassProjectObjectId]
      : EXTRACTED_OBJECT_RENDERERS[baseId]

  if (!renderer) {
    throw new Error(`No exact source-object renderer for ${presetId}`)
  }

  const geometry = {
    width: preset.nativeLayout.width,
    height: preset.nativeLayout.height,
    cornerRadius: preset.nativeLayout.radius,
    ...(
      preset.config.geometry &&
      typeof preset.config.geometry === 'object' &&
      'technicalInset' in preset.config.geometry
        ? {
            technicalInset: (
              preset.config.geometry as { technicalInset?: number }
            ).technicalInset,
          }
        : {}
    ),
  } satisfies GlassGeometryOverride

  return (
    <div
      data-e11-new-source-object-renderer=""
      data-selected-reference-preset={presetId}
      data-source-repository={preset.sourceRepository}
      data-source-path={preset.sourcePath[0]}
      data-source-key={preset.sourcePresetKey}
      data-source-component-contract={preset.sourceComponent}
      data-content-policy={preset.contentPolicy}
      data-transparent-render-surface="true"
      style={{
        position: 'relative',
        width: preset.nativeLayout.width,
        height: preset.nativeLayout.height,
        background: 'transparent',
      }}
    >
      {preset.renderer === 'glass-project-app-object'
        ? (renderer as AppObjectRenderer)(geometry, presetId)
        : (renderer as ExtractedObjectRenderer)(presetId, preset.config)}
    </div>
  )
}
