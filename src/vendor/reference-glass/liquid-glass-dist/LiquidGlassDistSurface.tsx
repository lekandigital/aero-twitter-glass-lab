import { useId, type CSSProperties } from 'react';
import {
  LIQUID_GLASS_DIST_DEFAULT_CONFIG,
  type LiquidGlassDistConfig,
} from './config';
import './liquid-glass-dist.css';

const VENDORED_ASSET_ROOT =
  `${import.meta.env.BASE_URL}vendor/reference-glass/liquid-glass-dist`;

function safeId(prefix: string, reactId: string) {
  return `${prefix}-${reactId}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

type DistStyle = CSSProperties & {
  '--e11-liquid-dist-content-width': string;
  '--e11-liquid-dist-content-height': string;
  '--e11-liquid-dist-radius': string;
  '--e11-liquid-dist-border-width': string;
  '--e11-liquid-dist-background': string;
  '--e11-liquid-dist-filter': string;
};

export function LiquidGlassDistSurface({
  presetId,
  config = LIQUID_GLASS_DIST_DEFAULT_CONFIG,
}: {
  presetId: string;
  config?: LiquidGlassDistConfig;
}) {
  const reactId = useId();
  const targetId = safeId('e11-liquid-dist-target', reactId);
  const filterId = safeId('e11-liquid-dist-filter', reactId);
  const displacementId = safeId('e11-liquid-dist-displacement', reactId);
  const contentWidth = Math.max(0, config.width - config.borderWidth * 2);
  const contentHeight = Math.max(0, config.height - config.borderWidth * 2);
  const style: DistStyle = {
    '--e11-liquid-dist-content-width': `${contentWidth}px`,
    '--e11-liquid-dist-content-height': `${contentHeight}px`,
    '--e11-liquid-dist-radius': `${config.radius}px`,
    '--e11-liquid-dist-border-width': `${config.borderWidth}px`,
    '--e11-liquid-dist-background': config.background,
    '--e11-liquid-dist-filter': `url(#${filterId})`,
  };

  return (
    <>
      <button
        id={targetId}
        type="button"
        className="e11-liquid-glass-dist-surface glass"
        data-e11-reference-preset={presetId}
        data-e11-reference-object-root={presetId}
        data-source-family="liquid-glass-dist"
        data-source-preset-key="liquid-glass/dist:.glass"
        data-source-component="liquid-glass/dist.button.glass"
        data-source-selector=".glass"
        data-renderer-family="css-backdrop-svg-displacement-smil"
        data-content-policy="object-only-empty"
        data-visible-child-count="0"
        data-transparent-render-surface="true"
        data-native-width={config.width}
        data-native-height={config.height}
        data-native-radius={config.radius}
        data-source-content-width={contentWidth}
        data-source-content-height={contentHeight}
        data-source-box-sizing="content-box"
        style={style}
        aria-label="Empty liquid-glass dist surface"
      />
      <svg
        className="e11-liquid-glass-dist-filter"
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
      >
        <filter id={filterId} primitiveUnits="objectBoundingBox">
          <feImage
            href={`${VENDORED_ASSET_ROOT}/${config.displacementMap}`}
            x="0"
            y="0"
            width="1"
            height="1"
            result="map"
          />
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={config.inputBlur}
            result="blur"
          />
          <feDisplacementMap
            id={displacementId}
            in="blur"
            in2="map"
            scale={config.displacementScale}
            xChannelSelector="R"
            yChannelSelector="G"
          >
            <animate
              attributeName="scale"
              to={config.hoverDisplacementScale}
              dur={`${config.hoverDurationSeconds}s`}
              begin={`${targetId}.mouseover`}
              fill="freeze"
            />
            <animate
              attributeName="scale"
              to={config.displacementScale}
              dur={`${config.hoverDurationSeconds}s`}
              begin={`${targetId}.mouseout`}
              fill="freeze"
            />
          </feDisplacementMap>
        </filter>
      </svg>
    </>
  );
}

