import type { RefObject } from 'react';
import {
  EXPERIMENT_ELEVEN_REFERENCE_PRESETS,
  getExperimentElevenReferencePreset,
  type ExperimentElevenReferencePresetId,
} from './experimentElevenReferencePresets';
import { ExperimentElevenReferencePortal } from './ExperimentElevenReferencePortal';
import {
  FluidGlassReferenceRenderer,
  type FluidGlassConfigModeProps,
  type Mode as FluidGlassMode,
} from '../../vendor/reference-glass/fluid-glass';
import {
  GlassSurfaceReferenceRenderer,
  type SurfaceProps as GlassSurfaceConfig,
} from '../../vendor/reference-glass/glass-surface';
import {
  LiquidGlassReferencePreset,
  type LiquidGlassReferenceBed,
  type LiquidGlassReferenceInteraction,
} from '../../vendor/reference-glass/liquid-glass-web-react';
import type { LiquidGlassOptions } from '../../vendor/reference-glass/liquid-glass-web-react/core/types';
import {
  LiquidMainReferenceSurface,
  WebGlassReferenceSurface,
  type LiquidMainReferenceConfig,
  type WebGlassReferenceConfig,
} from '../../vendor/reference-glass/web-glass-effect/ReferenceWebGlass';
import {
  WgeNextBottomBarReference,
  WgeNextFormReference,
} from '../../vendor/reference-glass/web-glass-effect/ReferenceWgeNext';
import { LiquidGlDemoOneNav } from '../../vendor/reference-glass/liquidgl/LiquidGlDemoOneNav';

function liquidMainConfig(
  raw: Readonly<Record<string, unknown>>,
): LiquidMainReferenceConfig {
  const innerShadow = raw.innerShadow as {
    color: string;
    blur: number;
    spread: number;
  };
  const tint = raw.tint as { color: string; opacity: number };
  const outerShadow = raw.outerShadow as { blur: number; color: string };
  return {
    width: raw.width as number,
    height: raw.height as number,
    radius: raw.borderRadius as number,
    glassThickness: raw.glassThickness as number,
    bezelWidth: raw.bezelWidth as number,
    refractiveIndex: raw.refractiveIndex as number,
    scaleRatio: raw.scaleRatio as number,
    blur: raw.blur as number,
    specularOpacity: raw.specularOpacity as number,
    specularSaturation: raw.specularSaturation as number,
    innerShadowColor: innerShadow.color,
    innerShadowBlur: innerShadow.blur,
    innerShadowSpread: innerShadow.spread,
    tintColor: tint.color,
    tintOpacity: tint.opacity,
    outerShadowBlur: outerShadow.blur,
    outerShadowColor: outerShadow.color,
  };
}

const LIQUID_WEB_OPTION_KEYS = [
  'width',
  'height',
  'radius',
  'strength',
  'chromaticAberration',
  'blur',
  'depth',
  'curvature',
  'splay',
  'glow',
  'glowSpread',
  'glowExponent',
  'edgeHighlight',
  'edgeWidth',
  'edgeExponent',
  'specular',
  'specularAngle',
  'quality',
] as const satisfies readonly (keyof LiquidGlassOptions)[];

function liquidWebOptions(raw: Readonly<Record<string, unknown>>): LiquidGlassOptions {
  return Object.fromEntries(
    LIQUID_WEB_OPTION_KEYS.map((key) => [key, raw[key]]),
  ) as unknown as LiquidGlassOptions;
}

function liquidWebInteraction(id: ExperimentElevenReferencePresetId): {
  interaction: LiquidGlassReferenceInteraction;
  bed: LiquidGlassReferenceBed;
} {
  if (id === 'liquid-web:hero-circle') return { interaction: 'hero', bed: 'hero' };
  if (id === 'liquid-web:reading-glass') return { interaction: 'reading', bed: 'text' };
  if (id === 'liquid-web:orbit') return { interaction: 'orbit', bed: 'orbit' };
  if (id === 'liquid-web:engine-panel') return { interaction: 'engine', bed: 'engine' };
  return { interaction: 'static', bed: 'chart' };
}

export function ExperimentElevenReferencePresetRenderer({
  presetId,
  anchorRef,
}: {
  presetId: ExperimentElevenReferencePresetId;
  anchorRef: RefObject<HTMLElement | null>;
}) {
  const preset = getExperimentElevenReferencePreset(presetId);
  const { nativeLayout } = preset;

  if (preset.renderer === 'fluid-glass-r3f') {
    const config = preset.config as {
      mode: FluidGlassMode;
      props: FluidGlassConfigModeProps;
    };
    return (
      <FluidGlassReferenceRenderer
        presetId={presetId}
        sourcePresetKey={preset.sourcePresetKey}
        mode={config.mode}
        config={config.props}
      />
    );
  }

  if (preset.renderer === 'liquidgl-webgl') {
    return (
      <LiquidGlDemoOneNav
        presetId={presetId}
        anchorRef={anchorRef}
        nativeWidth={nativeLayout.width}
        nativeHeight={nativeLayout.height}
        nativeRadius={nativeLayout.radius}
      />
    );
  }

  if (preset.renderer === 'liquid-glass-web-react') {
    const { interaction, bed } = liquidWebInteraction(presetId);
    const sourceContext = preset.sourceContext;
    if (!sourceContext) {
      throw new Error(`Missing source context for ${presetId}`);
    }
    return (
      <ExperimentElevenReferencePortal
        anchorRef={anchorRef}
        presetId={presetId}
        sourceFamily={preset.sourceFamily}
        rendererType={preset.renderer}
        nativeWidth={nativeLayout.width}
        nativeHeight={nativeLayout.height}
        nativeRadius={nativeLayout.radius}
        renderWidth={sourceContext.width}
        renderHeight={sourceContext.height}
        renderOffsetX={sourceContext.lensOffsetX}
        renderOffsetY={sourceContext.lensOffsetY}
        renderRadius={sourceContext.radius}
        cloneWallpaper={false}
        interactive={preset.interactions.pointerInteraction}
      >
        <LiquidGlassReferencePreset
          options={liquidWebOptions(preset.config)}
          interaction={interaction}
          bed={bed}
          contextWidth={sourceContext.width}
          contextHeight={sourceContext.height}
          pointerTargetRef={anchorRef}
        />
      </ExperimentElevenReferencePortal>
    );
  }

  if (preset.renderer === 'wge-next-form') {
    return (
      <ExperimentElevenReferencePortal
        anchorRef={anchorRef}
        presetId={presetId}
        sourceFamily={preset.sourceFamily}
        rendererType={preset.renderer}
        nativeWidth={nativeLayout.width}
        nativeHeight={nativeLayout.height}
        nativeRadius={nativeLayout.radius}
        cloneWallpaper={false}
        interactive
      >
        <WgeNextFormReference presetId={presetId} />
      </ExperimentElevenReferencePortal>
    );
  }

  if (preset.renderer === 'wge-next-bottom-bar') {
    return (
      <ExperimentElevenReferencePortal
        anchorRef={anchorRef}
        presetId={presetId}
        sourceFamily={preset.sourceFamily}
        rendererType={preset.renderer}
        nativeWidth={nativeLayout.width}
        nativeHeight={nativeLayout.height}
        nativeRadius={nativeLayout.radius}
        interactive
      >
        <WgeNextBottomBarReference presetId={presetId} />
      </ExperimentElevenReferencePortal>
    );
  }

  if (preset.renderer === 'liquid-main-svg-filter') {
    return (
      <ExperimentElevenReferencePortal
        anchorRef={anchorRef}
        presetId={presetId}
        sourceFamily={preset.sourceFamily}
        rendererType={preset.renderer}
        nativeWidth={nativeLayout.width}
        nativeHeight={nativeLayout.height}
        nativeRadius={nativeLayout.radius}
      >
        <LiquidMainReferenceSurface
          presetId={presetId}
          config={liquidMainConfig(preset.config)}
        />
      </ExperimentElevenReferencePortal>
    );
  }

  if (preset.renderer === 'web-glass-svg-filter') {
    return (
      <ExperimentElevenReferencePortal
        anchorRef={anchorRef}
        presetId={presetId}
        sourceFamily={preset.sourceFamily}
        rendererType={preset.renderer}
        nativeWidth={nativeLayout.width}
        nativeHeight={nativeLayout.height}
        nativeRadius={nativeLayout.radius}
      >
        <WebGlassReferenceSurface
          presetId={presetId}
          config={preset.config as unknown as WebGlassReferenceConfig}
        />
      </ExperimentElevenReferencePortal>
    );
  }

  return (
    <ExperimentElevenReferencePortal
      anchorRef={anchorRef}
      presetId={presetId}
      sourceFamily={preset.sourceFamily}
      rendererType={preset.renderer}
      nativeWidth={nativeLayout.width}
      nativeHeight={nativeLayout.height}
      nativeRadius={nativeLayout.radius}
    >
      <GlassSurfaceReferenceRenderer
        presetId={presetId}
        sourcePresetKey={preset.sourcePresetKey}
        instanceId={`e11-${presetId}`}
        config={preset.config as unknown as GlassSurfaceConfig}
      />
    </ExperimentElevenReferencePortal>
  );
}

export function ExperimentElevenReferencePresetPreview({
  presetId,
}: {
  presetId: ExperimentElevenReferencePresetId;
}) {
  const preset = EXPERIMENT_ELEVEN_REFERENCE_PRESETS[presetId];
  return (
    <div
      className="experiment-eleven-reference-preview"
      data-e11-reference-family-short={preset.displayLabel.split(' · ')[0]}
      style={{
        width: preset.nativeLayout.width,
        height: preset.nativeLayout.height,
        borderRadius: preset.nativeLayout.radius,
      }}
      data-e11-reference-preview={presetId}
      title={preset.displayLabel}
    />
  );
}
