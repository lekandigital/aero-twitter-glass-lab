import { useId, useMemo, type CSSProperties } from 'react';
import {
  CHROMIUM_CONFIGURABLE_GLASS_EXACT_CONFIG,
  type ChromiumConfigurableGlassConfig,
} from './config';
import {
  buildChromiumGlassDisplacementDataUri,
  chromiumGlassEdgeSize,
} from './displacementMap';
import './chromium-configurable-glass.css';

function safeId(prefix: string, reactId: string) {
  return `${prefix}-${reactId}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

type SurfaceStyle = CSSProperties & {
  '--e11-chromium-width': string;
  '--e11-chromium-height': string;
  '--e11-chromium-radius': string;
  '--e11-chromium-frost': number;
  '--e11-chromium-saturation': number;
  '--e11-chromium-filter': string;
};

export function ChromiumConfigurableGlass({
  presetId,
  config = CHROMIUM_CONFIGURABLE_GLASS_EXACT_CONFIG,
}: {
  presetId: string;
  config?: ChromiumConfigurableGlassConfig;
}) {
  const reactId = useId();
  const filterId = safeId('e11-chromium-filter', reactId);
  const redChannelId = safeId('e11-chromium-red', reactId);
  const greenChannelId = safeId('e11-chromium-green', reactId);
  const blueChannelId = safeId('e11-chromium-blue', reactId);
  const mapUri = useMemo(
    () => buildChromiumGlassDisplacementDataUri(config),
    [config],
  );
  const edgeSize = chromiumGlassEdgeSize(config);
  const style: SurfaceStyle = {
    '--e11-chromium-width': `${config.width}px`,
    '--e11-chromium-height': `${config.height}px`,
    '--e11-chromium-radius': `${config.radius}px`,
    '--e11-chromium-frost': config.frost,
    '--e11-chromium-saturation': config.saturation,
    '--e11-chromium-filter': `url(#${filterId})`,
    colorScheme:
      config.theme === 'system'
        ? 'light dark'
        : config.theme === 'light'
          ? 'light only'
          : 'dark only',
  };

  return (
    <div
      className="e11-chromium-configurable-glass effect"
      data-e11-reference-preset={presetId}
      data-e11-reference-object-root={presetId}
      data-source-family="liquid-glass-scroll-drag-configure-chromium"
      data-source-preset-key="CONFIG.free+requested-overrides"
      data-source-component="dist.effect"
      data-source-selector=".effect"
      data-renderer-family="chromium-css-backdrop-svg-channel-displacement"
      data-content-policy="object-only-empty"
      data-visible-child-count="0"
      data-transparent-render-surface="true"
      data-native-width={config.width}
      data-native-height={config.height}
      data-native-radius={config.radius}
      data-mode={config.mode}
      data-theme={config.theme}
      data-icons={String(config.icons)}
      data-frost={config.frost}
      data-saturation={config.saturation}
      data-border={config.border}
      data-alpha={config.alpha}
      data-lightness={config.lightness}
      data-input-blur={config.inputBlur}
      data-output-blur={config.outputBlur}
      data-x-channel={config.xChannel}
      data-y-channel={config.yChannel}
      data-map-blend={config.blend}
      data-scale={config.scale}
      data-red-offset={config.redOffset}
      data-green-offset={config.greenOffset}
      data-blue-offset={config.blueOffset}
      data-edge-size={edgeSize}
      style={style}
      role="img"
      aria-label="Empty Chromium configurable liquid glass surface"
    >
      <svg
        className="e11-chromium-configurable-glass__filter"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feImage
              x="0"
              y="0"
              width="100%"
              height="100%"
              href={mapUri}
              result="map"
            />
            <feDisplacementMap
              id={redChannelId}
              in="SourceGraphic"
              in2="map"
              scale={config.scale + config.redOffset}
              xChannelSelector={config.xChannel}
              yChannelSelector={config.yChannel}
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values={`1 0 0 0 0
                       0 0 0 0 0
                       0 0 0 0 0
                       0 0 0 1 0`}
              result="red"
            />
            <feDisplacementMap
              id={greenChannelId}
              in="SourceGraphic"
              in2="map"
              scale={config.scale + config.greenOffset}
              xChannelSelector={config.xChannel}
              yChannelSelector={config.yChannel}
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values={`0 0 0 0 0
                       0 1 0 0 0
                       0 0 0 0 0
                       0 0 0 1 0`}
              result="green"
            />
            <feDisplacementMap
              id={blueChannelId}
              in="SourceGraphic"
              in2="map"
              scale={config.scale + config.blueOffset}
              xChannelSelector={config.xChannel}
              yChannelSelector={config.yChannel}
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values={`0 0 0 0 0
                       0 0 0 0 0
                       0 0 1 0 0
                       0 0 0 1 0`}
              result="blue"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur
              in="output"
              stdDeviation={config.outputBlur}
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
