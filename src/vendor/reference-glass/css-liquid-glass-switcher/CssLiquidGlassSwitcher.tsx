import { useId, type CSSProperties } from 'react';
import {
  CSS_LIQUID_GLASS_SWITCHER_DEFAULT_CONFIG,
  type CssLiquidGlassSwitcherConfig,
} from './config';
import './css-liquid-glass-switcher.css';

const VENDORED_ASSET_ROOT =
  `${import.meta.env.BASE_URL}vendor/reference-glass/css-liquid-glass-switcher`;

function safeId(reactId: string) {
  return `e11-css-switcher-${reactId}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

type SwitcherStyle = CSSProperties & {
  '--e11-switcher-filter': string;
  '--e11-switcher-width': string;
  '--e11-switcher-height': string;
  '--e11-switcher-radius': string;
  '--e11-switcher-c-glass': string;
  '--e11-switcher-c-light': string;
  '--e11-switcher-c-dark': string;
  '--e11-switcher-c-content': string;
  '--e11-switcher-c-action': string;
  '--e11-switcher-c-bg': string;
  '--e11-switcher-reflex-dark': number;
  '--e11-switcher-reflex-light': number;
  '--e11-switcher-saturation': string;
};

export function CssLiquidGlassSwitcher({
  presetId,
  config = CSS_LIQUID_GLASS_SWITCHER_DEFAULT_CONFIG,
}: {
  presetId: string;
  config?: CssLiquidGlassSwitcherConfig;
}) {
  const reactId = useId();
  const filterId = safeId(reactId);
  const style: SwitcherStyle = {
    '--e11-switcher-filter': `url(#${filterId})`,
    '--e11-switcher-width': `${config.width}px`,
    '--e11-switcher-height': `${config.height}px`,
    '--e11-switcher-radius': `${config.radius}px`,
    '--e11-switcher-c-glass': config.glassColor,
    '--e11-switcher-c-light': config.lightColor,
    '--e11-switcher-c-dark': config.darkColor,
    '--e11-switcher-c-content': config.contentColor,
    '--e11-switcher-c-action': config.actionColor,
    '--e11-switcher-c-bg': config.backgroundColor,
    '--e11-switcher-reflex-dark': config.glassReflexDark,
    '--e11-switcher-reflex-light': config.glassReflexLight,
    '--e11-switcher-saturation': config.saturation,
  };

  return (
    <fieldset
      className="e11-css-liquid-glass-switcher switcher"
      data-e11-reference-preset={presetId}
      data-e11-reference-object-root={presetId}
      data-source-family="css-liquid-glass-switcher"
      data-source-preset-key="liquid-glass-switcher-css:.switcher"
      data-source-component="liquid-glass-switcher-css.html.switcher"
      data-source-selector=".switcher"
      data-renderer-family="css-backdrop-svg-displacement"
      data-content-policy="object-only-empty"
      data-visible-child-count="0"
      data-transparent-render-surface="true"
      data-native-width={config.width}
      data-native-height={config.height}
      data-native-radius={config.radius}
      style={style}
      aria-label="Empty CSS liquid glass switcher surface"
    >
      <span className="e11-css-liquid-glass-switcher__filter" aria-hidden="true">
        <svg width="0" height="0" focusable="false">
          <filter id={filterId} primitiveUnits="objectBoundingBox">
            <feImage
              x="0"
              y="0"
              width="1"
              height="1"
              href={`${VENDORED_ASSET_ROOT}/${config.displacementMap}`}
              result="map"
            />
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="0.01"
              result="blur"
            />
            <feDisplacementMap
              in="blur"
              in2="map"
              scale="0.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
      </span>
    </fieldset>
  );
}

