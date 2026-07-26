import type { CSSProperties, ComponentType } from 'react';
import type {
  ReferenceButtonPreset,
  ReferenceButtonRenderer as RendererName,
} from './types';
import {
  AquaCssButton,
  BeforeAfterCssButton,
  ContainerSvgButton,
  DockGradientButton,
  FilteredSvgButton,
  GlassGenerateButton,
  GlassHtmlButton,
  GlassLikeButton,
  TurboButton,
  type ButtonRendererProps,
} from './renderers/sourceCss';
import { LiquidDomShowcaseButton } from './renderers/showcase';
import {
  Ios26FilteredButton,
  LiquidGlassJsButton,
  LiquidWebToggleButton,
  WebGlassNavButton,
  WgeNextButton,
} from './renderers/optical';

const RENDERERS: Record<RendererName, ComponentType<ButtonRendererProps>> = {
  'container-svg': ContainerSvgButton,
  'filtered-svg': FilteredSvgButton,
  'aqua-css': AquaCssButton,
  'before-after-css': BeforeAfterCssButton,
  'dock-gradient-css': DockGradientButton,
  'glass-generate-css': GlassGenerateButton,
  'turbo-container-query': TurboButton,
  'glass-like-css': GlassLikeButton,
  'glass-html-mask': GlassHtmlButton,
  'liquid-dom-showcase': LiquidDomShowcaseButton,
  'liquid-web-toggle': LiquidWebToggleButton,
  'wge-next-motion': WgeNextButton,
  'web-glass-surface': WebGlassNavButton,
  'ios26-svg-filter': Ios26FilteredButton,
  'liquid-glass-js-webgl': LiquidGlassJsButton,
};

export function ReferenceButtonRenderer({ preset }: { preset: ReferenceButtonPreset }) {
  const Renderer = RENDERERS[preset.renderer];
  const style = {
    '--button-native-width': `${preset.nativeWidth}px`,
    '--button-native-height': `${preset.nativeHeight}px`,
    '--button-native-radius': `${preset.nativeRadius}px`,
    width: preset.nativeWidth,
    height: preset.nativeHeight,
    borderRadius: preset.nativeRadius,
  } as CSSProperties;

  return (
    <div
      className="button-reference-object"
      style={style}
      data-reference-button-root="true"
      data-reference-preset={preset.id}
      data-source-family={preset.family}
      data-source-path={preset.sourcePath}
      data-source-component={preset.sourceComponent ?? preset.sourceSelector ?? ''}
      data-source-key={preset.sourceKey}
      data-source-state={preset.sourceState}
      data-renderer-family={preset.renderer}
      data-content-policy={preset.visibleContentPolicy}
      data-native-width={preset.nativeWidth}
      data-native-height={preset.nativeHeight}
      data-native-radius={preset.nativeRadius}
    >
      <Renderer preset={preset} />
    </div>
  );
}
