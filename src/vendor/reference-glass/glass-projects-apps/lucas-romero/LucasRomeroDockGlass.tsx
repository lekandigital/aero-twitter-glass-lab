import { useId, type CSSProperties } from 'react';
import { getGlassProjectDataAttributes } from '../objectIdentity.ts';
import {
  LUCAS_ROMERO_DOCK_CONFIG,
  LUCAS_ROMERO_DOCK_PRESET,
} from '../presets.ts';
import {
  resolveGlassGeometry,
  type GlassProjectRendererProps,
} from '../types.ts';
import styles from './LucasRomeroDockGlass.module.css';

type LucasRomeroStyle = CSSProperties &
  Readonly<{
    '--lucas-glass-width': string;
    '--lucas-glass-height': string;
    '--lucas-glass-radius': string;
    '--lucas-glass-hover-growth': string;
    '--lucas-glass-hover-radius': string;
  }>;

const SOURCE_HOVER_GROWTH =
  LUCAS_ROMERO_DOCK_CONFIG.hover.growthPerAxis;
const SOURCE_HOVER_RADIUS_DELTA =
  LUCAS_ROMERO_DOCK_CONFIG.hover.radiusDelta;

export function LucasRomeroDockGlass({
  referencePresetId,
  geometry: geometryOverride,
  className,
  style,
}: GlassProjectRendererProps) {
  const geometry = resolveGlassGeometry(
    LUCAS_ROMERO_DOCK_PRESET.geometry,
    geometryOverride,
  );
  const filterId = `lucas-glass-distortion-${useId().replaceAll(':', '')}`;
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');
  const rootStyle = {
    ...style,
    '--lucas-glass-width': `${geometry.width}px`,
    '--lucas-glass-height': `${geometry.height}px`,
    '--lucas-glass-radius': `${geometry.cornerRadius}px`,
    '--lucas-glass-hover-growth': `${SOURCE_HOVER_GROWTH}px`,
    '--lucas-glass-hover-radius': `${
      geometry.cornerRadius + SOURCE_HOVER_RADIUS_DELTA
    }px`,
  } satisfies LucasRomeroStyle;

  return (
    <div
      {...getGlassProjectDataAttributes(
        LUCAS_ROMERO_DOCK_PRESET,
        geometry,
        referencePresetId,
      )}
      aria-hidden="true"
      className={rootClassName}
      data-hover-height={geometry.height + SOURCE_HOVER_GROWTH}
      data-hover-radius={geometry.cornerRadius + SOURCE_HOVER_RADIUS_DELTA}
      data-hover-width={geometry.width + SOURCE_HOVER_GROWTH}
      data-render-state="ready"
      data-source-hover="retained"
      style={rootStyle}
    >
      <div
        className={styles.effect}
        style={{ filter: `url("#${filterId}")` }}
      />
      <div className={styles.tint} />
      <div className={styles.shine} />

      <svg
        aria-hidden="true"
        className={styles.definitions}
        focusable="false"
      >
        <filter
          id={filterId}
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.01"
            numOctaves="1"
            seed="5"
            result="turbulence"
          />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>
          <feGaussianBlur
            in="turbulence"
            stdDeviation="3"
            result="softMap"
          />
          <feSpecularLighting
            in="softMap"
            surfaceScale="5"
            specularConstant="1"
            specularExponent="100"
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>
          <feComposite
            in="specLight"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
            result="litImage"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale="150"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
    </div>
  );
}
