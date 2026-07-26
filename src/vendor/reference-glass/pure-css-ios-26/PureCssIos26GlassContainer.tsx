import { useId, type CSSProperties } from 'react';
import {
  PURE_CSS_IOS_26_CONTAINER_DEFAULT_CONFIG,
  type PureCssIos26ContainerConfig,
} from './config';
import './pure-css-ios-26.css';

function safeId(reactId: string) {
  return `e11-pure-css-ios26-${reactId}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

type ContainerStyle = CSSProperties & {
  '--e11-ios26-width': string;
  '--e11-ios26-height': string;
  '--e11-ios26-radius': string;
  '--e11-ios26-backdrop-blur': string;
  '--e11-ios26-filter': string;
};

export function PureCssIos26GlassContainer({
  presetId,
  config = PURE_CSS_IOS_26_CONTAINER_DEFAULT_CONFIG,
}: {
  presetId: string;
  config?: PureCssIos26ContainerConfig;
}) {
  const reactId = useId();
  const filterId = safeId(reactId);
  const style: ContainerStyle = {
    '--e11-ios26-width': `${config.width}px`,
    '--e11-ios26-height': `${config.height}px`,
    '--e11-ios26-radius': `${config.radius}px`,
    '--e11-ios26-backdrop-blur': `${config.backdropBlur}px`,
    '--e11-ios26-filter': `url(#${filterId})`,
  };

  return (
    <>
      <div
        className="e11-pure-css-ios26-container glassContainer"
        data-e11-reference-preset={presetId}
        data-e11-reference-object-root={presetId}
        data-source-family="pure-css-ios-26"
        data-source-preset-key="pure-css-ios-26:.glassContainer"
        data-source-component="pure-css-ios-26-liquid-glass-effect.glassContainer"
        data-source-selector=".glassContainer"
        data-renderer-family="css-pseudo-svg-turbulence-displacement"
        data-content-policy="object-only-empty"
        data-visible-child-count="0"
        data-transparent-render-surface="true"
        data-native-width={config.width}
        data-native-height={config.height}
        data-native-radius={config.radius}
        style={style}
        role="img"
        aria-label="Empty pure CSS iOS 26 glass container"
      />
      <svg
        className="e11-pure-css-ios26-filter"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={`${config.noiseBaseFrequencyX} ${config.noiseBaseFrequencyY}`}
            numOctaves={config.noiseOctaves}
            seed={config.noiseSeed}
            result="noise"
          />
          <feGaussianBlur
            in="noise"
            stdDeviation={config.noiseBlur}
            result="blur"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blur"
            scale={config.displacementScale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </>
  );
}

