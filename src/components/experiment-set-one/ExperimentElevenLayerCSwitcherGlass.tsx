import { useId, type CSSProperties, type ReactNode } from 'react';
import {
  EXPERIMENT_ELEVEN_LIQUID_CSS_FILTER_MAP,
  EXPERIMENT_ELEVEN_SWITCHER_FILTER_MAP,
} from './experimentElevenSwitcherFilterMap';

/**
 * Every liquid-glass surface Layer C can render, each lifted VERBATIM from a
 * reference demo under public/reference-demos. See experiment-eleven-switcher-glass.css
 * for the exact per-surface box-shadow / background / backdrop-filter.
 *
 *   switcher-background → codepen/liquid-glass-switcher-css `.switcher` (SVG feImage displacement)
 *   switcher-button     → codepen/liquid-glass-switcher-css `.switcher::after` (pure box-shadow)
 *   glass-button        → codepen/glass-button-css-only (feTurbulence #glass-distortion + backdrop blur)
 *   ios                 → codepen/ios-liquid-glass (feTurbulence #liquid-glass + backdrop blur)
 *   liquid-css          → codepen/liquid-glass-in-css (feImage #glassFilter + brightness/blur backdrop)
 *   light-btn           → codepen/light-glass-buttoncss-only (pure CSS, iridescent edge)
 */
export type ExperimentElevenSwitcherGlassVariant =
  | 'switcher-background'
  | 'switcher-button'
  | 'glass-button'
  | 'ios'
  | 'liquid-css'
  | 'light-btn';

export type ExperimentElevenSwitcherGlassTone =
  | 'demo-light'
  | 'demo-dark'
  | 'demo-dim'
  | 'ice'
  | 'aqua'
  | 'opal';

type ToneStyle = CSSProperties & Record<`--${string}`, string | number>;

const TONE_STYLES = {
  'demo-light': {
    '--c-glass': '#bbbbbc',
    '--c-light': '#fff',
    '--c-dark': '#000',
    '--glass-reflex-dark': 1,
    '--glass-reflex-light': 1,
    '--saturation': '150%',
  },
  'demo-dark': {
    '--c-glass': '#bbbbbc',
    '--c-light': '#fff',
    '--c-dark': '#000',
    '--glass-reflex-dark': 2,
    '--glass-reflex-light': 0.3,
    '--saturation': '150%',
  },
  'demo-dim': {
    '--c-glass': 'hsl(335 250% 74% / 1)',
    '--c-light': '#99deff',
    '--c-dark': '#20001b',
    '--glass-reflex-dark': 2,
    '--glass-reflex-light': 0.7,
    '--saturation': '200%',
  },
  ice: {
    '--c-glass': '#d7f3ff',
    '--c-light': '#ffffff',
    '--c-dark': '#183a5a',
    '--glass-reflex-dark': 1.35,
    '--glass-reflex-light': 1.15,
    '--saturation': '175%',
  },
  aqua: {
    '--c-glass': '#8eeaff',
    '--c-light': '#f7fdff',
    '--c-dark': '#063452',
    '--glass-reflex-dark': 1.45,
    '--glass-reflex-light': 1.05,
    '--saturation': '190%',
  },
  opal: {
    '--c-glass': '#ebe8f5',
    '--c-light': '#ffffff',
    '--c-dark': '#4f5572',
    '--glass-reflex-dark': 1.1,
    '--glass-reflex-light': 1.2,
    '--saturation': '165%',
  },
} as const satisfies Record<ExperimentElevenSwitcherGlassTone, ToneStyle>;

/**
 * Every demo's feDisplacementMap `scale` was tuned for the demo's own small box
 * (a stadium button). Stretched onto Layer C's larger 293×125 box the same
 * absolute pixel displacement tears the sampled backdrop, so each scale is
 * re-tuned down here — the only change from the demo's verbatim filter (same
 * empirical approach documented for the switcher below). Everything else in each
 * filter (turbulence, feImage map, channel selectors) is exactly as authored.
 */
// objectBoundingBox units (switcher): 0.5 tears, 0.1 keeps a visible liquid wave.
const SWITCHER_BACKGROUND_DISPLACEMENT_SCALE = 0.1;
// userSpace px units: demo values 140 / 40 / 200 are for small buttons — scaled down.
const GLASS_BUTTON_DISPLACEMENT_SCALE = 24;
const IOS_DISPLACEMENT_SCALE = 18;
const LIQUID_CSS_DISPLACEMENT_SCALE = 36;

export function ExperimentElevenLayerCSwitcherGlass({
  variant,
  width,
  height,
  radius,
  tone = 'demo-light',
}: {
  variant: ExperimentElevenSwitcherGlassVariant;
  width: number;
  height: number;
  radius: number;
  tone?: ExperimentElevenSwitcherGlassTone;
}) {
  const reactId = useId();
  const filterId = `e11-ref-filter-${reactId.replace(/:/g, '')}`;

  const baseStyle: CSSProperties = {
    ...TONE_STYLES[tone],
    width,
    height,
    ['--e11-switcher-radius' as string]: `${radius}px`,
  };

  let inner: ReactNode = null;
  let style: CSSProperties = baseStyle;
  let ariaLabel = 'Liquid glass';

  switch (variant) {
    case 'switcher-background': {
      ariaLabel = 'Liquid Glass Switcher background glass';
      style = {
        ...baseStyle,
        backdropFilter: `blur(8px) url(#${filterId}) saturate(var(--saturation))`,
      };
      inner = (
        <svg className="experiment-eleven-switcher-glass__filter" aria-hidden="true">
          <filter id={filterId} primitiveUnits="objectBoundingBox">
            <feImage
              height="100%"
              href={EXPERIMENT_ELEVEN_SWITCHER_FILTER_MAP}
              result="map"
              width="100%"
              x="0"
              y="0"
            />
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="0.04" />
            <feDisplacementMap
              in="blur"
              in2="map"
              scale={SWITCHER_BACKGROUND_DISPLACEMENT_SCALE}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
      );
      break;
    }
    case 'switcher-button': {
      ariaLabel = 'Liquid Glass Switcher button glass';
      break;
    }
    case 'glass-button': {
      ariaLabel = 'Glass button liquid glass';
      inner = (
        <>
          <svg className="experiment-eleven-switcher-glass__filter" aria-hidden="true">
            {/* verbatim #glass-distortion from codepen/glass-button-css-only */}
            <filter id={filterId} x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
              <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves={1} seed={5} result="turbulence" />
              <feComponentTransfer in="turbulence" result="mapped">
                <feFuncR type="gamma" amplitude={1} exponent={10} offset={0.5} />
                <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
                <feFuncB type="gamma" amplitude={0} exponent={1} offset={0.5} />
              </feComponentTransfer>
              <feGaussianBlur in="turbulence" stdDeviation={3} result="softMap" />
              <feSpecularLighting
                in="softMap"
                surfaceScale={5}
                specularConstant={1}
                specularExponent={100}
                lightingColor="white"
                result="specLight"
              >
                <fePointLight x={-200} y={-200} z={300} />
              </feSpecularLighting>
              <feComposite in="specLight" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="litImage" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="softMap"
                scale={GLASS_BUTTON_DISPLACEMENT_SCALE}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </svg>
          <div
            className="experiment-eleven-ref-glass-button__layer1"
            style={{ filter: `url(#${filterId})` }}
            aria-hidden="true"
          />
          <div className="experiment-eleven-ref-glass-button__layer2" aria-hidden="true" />
        </>
      );
      break;
    }
    case 'ios': {
      ariaLabel = 'iOS liquid glass';
      inner = (
        <>
          <svg className="experiment-eleven-switcher-glass__filter" aria-hidden="true">
            {/* verbatim #liquid-glass from codepen/ios-liquid-glass */}
            <filter id={filterId}>
              <feTurbulence type="fractalNoise" baseFrequency="0.01 0.02" numOctaves={2} seed={5} result="turbulence" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="turbulence"
                scale={IOS_DISPLACEMENT_SCALE}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </svg>
          <div
            className="experiment-eleven-ref-ios__morph"
            style={{ filter: `url(#${filterId})` }}
            aria-hidden="true"
          />
          <div className="experiment-eleven-ref-ios__corner" aria-hidden="true" />
          <div className="experiment-eleven-ref-ios__border" aria-hidden="true" />
        </>
      );
      break;
    }
    case 'liquid-css': {
      ariaLabel = 'Liquid glass in CSS';
      style = {
        ...baseStyle,
        backdropFilter: `brightness(1.2) blur(4px) url(#${filterId})`,
      };
      inner = (
        <svg className="experiment-eleven-switcher-glass__filter" aria-hidden="true">
          {/* verbatim #glassFilter from codepen/liquid-glass-in-css */}
          <filter id={filterId}>
            <feImage
              href={EXPERIMENT_ELEVEN_LIQUID_CSS_FILTER_MAP}
              preserveAspectRatio="none"
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={LIQUID_CSS_DISPLACEMENT_SCALE}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
      );
      break;
    }
    case 'light-btn': {
      ariaLabel = 'Light glass button';
      inner = <div className="experiment-eleven-ref-light__container" aria-hidden="true" />;
      break;
    }
  }

  return (
    <div
      className={`experiment-eleven-switcher-glass experiment-eleven-ref-glass--${variant}`}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      {inner}
    </div>
  );
}
