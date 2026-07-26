/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState, useId } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import './GlassSurface.css';

export interface GlassSurfaceProps {
  children?: ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  redOffset?: number;
  greenOffset?: number;
  blueOffset?: number;
  xChannel?: 'R' | 'G' | 'B';
  yChannel?: 'R' | 'G' | 'B';
  mixBlendMode?:
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity'
    | 'plus-darker'
    | 'plus-lighter';
  className?: string;
  style?: CSSProperties;
  instanceId?: string;
  presetId?: string;
  sourcePresetKey?: string;
  /**
   * Integration-only filter-region expansion. It does not change the source
   * graph or preset values; it prevents displaced pixels from being clipped at
   * a moving page-level compositing boundary.
   */
  filterRegionPaddingPercent?: number;
}

const sanitizeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-');

const supportsSVGFilters = (filterId: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);

  if (isWebkit || isFirefox) {
    return false;
  }

  const div = document.createElement('div');
  div.style.backdropFilter = `url(#${filterId})`;

  return div.style.backdropFilter !== '';
};

const GlassSurface = ({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  redOffset = 0,
  greenOffset = 10,
  blueOffset = 20,
  xChannel = 'R',
  yChannel = 'G',
  mixBlendMode = 'difference',
  className = '',
  style = {},
  instanceId = 'surface',
  presetId,
  sourcePresetKey,
  filterRegionPaddingPercent = 0
}: GlassSurfaceProps) => {
  const reactId = sanitizeId(useId());
  const id = `e11-ref-gs-${sanitizeId(instanceId)}-${reactId}`;
  const filterId = `${id}-filter`;
  const redGradId = `${id}-red-grad`;
  const blueGradId = `${id}-blue-grad`;
  const redChannelId = `${id}-red-channel`;
  const greenChannelId = `${id}-green-channel`;
  const blueChannelId = `${id}-blue-channel`;

  const [svgSupported, setSvgSupported] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const redChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const greenChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const blueChannelRef = useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);
  const timeoutIdsRef = useRef<Set<number>>(new Set());

  const generateDisplacementMap = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualWidth = rect?.width || 400;
    const actualHeight = rect?.height || 200;
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  }, [blueGradId, blur, borderRadius, borderWidth, brightness, mixBlendMode, opacity, redGradId]);

  const updateDisplacementMap = useCallback(() => {
    feImageRef.current?.setAttribute('href', generateDisplacementMap());
  }, [generateDisplacementMap]);

  const scheduleDisplacementMap = useCallback(() => {
    const timeoutId = window.setTimeout(() => {
      timeoutIdsRef.current.delete(timeoutId);
      updateDisplacementMap();
    }, 0);
    timeoutIdsRef.current.add(timeoutId);
  }, [updateDisplacementMap]);

  useEffect(() => {
    updateDisplacementMap();
    [
      { ref: redChannelRef, offset: redOffset },
      { ref: greenChannelRef, offset: greenOffset },
      { ref: blueChannelRef, offset: blueOffset }
    ].forEach(({ ref, offset }) => {
      if (ref.current) {
        ref.current.setAttribute('scale', (distortionScale + offset).toString());
        ref.current.setAttribute('xChannelSelector', xChannel);
        ref.current.setAttribute('yChannelSelector', yChannel);
      }
    });

    gaussianBlurRef.current?.setAttribute('stdDeviation', displace.toString());
  }, [
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode,
    updateDisplacementMap
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      scheduleDisplacementMap();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [scheduleDisplacementMap]);

  useEffect(() => {
    scheduleDisplacementMap();
  }, [height, scheduleDisplacementMap, width]);

  useEffect(() => {
    setSvgSupported(supportsSVGFilters(filterId));
  }, [filterId]);

  useEffect(
    () => () => {
      timeoutIdsRef.current.forEach(timeoutId => window.clearTimeout(timeoutId));
      timeoutIdsRef.current.clear();
    },
    []
  );

  const containerStyle: CSSProperties = {
    ...style,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
    '--glass-frost': backgroundOpacity,
    '--glass-saturation': saturation,
    '--filter-id': `url(#${filterId})`
  } as CSSProperties;

  const resolvedConfig = {
    width,
    height,
    borderRadius,
    borderWidth,
    brightness,
    opacity,
    blur,
    displace,
    backgroundOpacity,
    saturation,
    distortionScale,
    redOffset,
    greenOffset,
    blueOffset,
    xChannel,
    yChannel,
    mixBlendMode
  };

  return (
    <div
      ref={containerRef}
      className={`e11-ref-glass-surface ${
        svgSupported ? 'e11-ref-glass-surface--svg' : 'e11-ref-glass-surface--fallback'
      } ${className}`}
      style={containerStyle}
      data-e11-reference-family="glass-surface"
      data-e11-reference-preset={presetId}
      data-e11-reference-object-root={presetId}
      data-source-family="glass-surface"
      data-source-preset-key={sourcePresetKey}
      data-source-key={sourcePresetKey}
      data-source-component="react-bits.GlassSurface"
      data-reference-preset={presetId}
      data-renderer-family="glass-surface-svg-filter"
      data-content-policy="object-only"
      data-transparent-render-surface="true"
      data-glass-surface-filter-id={filterId}
      data-glass-surface-filter-padding={filterRegionPaddingPercent}
      data-glass-surface-config={JSON.stringify(resolvedConfig)}
    >
      <svg className="e11-ref-glass-surface__filter" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            filterUnits="objectBoundingBox"
            x={`${-filterRegionPaddingPercent}%`}
            y={`${-filterRegionPaddingPercent}%`}
            width={`${100 + filterRegionPaddingPercent * 2}%`}
            height={`${100 + filterRegionPaddingPercent * 2}%`}
          >
            <feImage ref={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />

            <feDisplacementMap
              ref={redChannelRef}
              in="SourceGraphic"
              in2="map"
              id={redChannelId}
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="red"
            />

            <feDisplacementMap
              ref={greenChannelRef}
              in="SourceGraphic"
              in2="map"
              id={greenChannelId}
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0
                      0 1 0 0 0
                      0 0 0 0 0
                      0 0 0 1 0"
              result="green"
            />

            <feDisplacementMap
              ref={blueChannelRef}
              in="SourceGraphic"
              in2="map"
              id={blueChannelId}
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 1 0 0
                      0 0 0 1 0"
              result="blue"
            />

            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
            <feGaussianBlur ref={gaussianBlurRef} in="output" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>

      <div className="e11-ref-glass-surface__content">{children}</div>
    </div>
  );
};

export default GlassSurface;

export interface GlassSurfaceReferenceRendererProps {
  presetId: string;
  sourcePresetKey: string;
  config: GlassSurfaceProps;
  instanceId?: string;
  children?: ReactNode;
  filterRegionPaddingPercent?: number;
}

/**
 * Thin family adapter suitable for an anchored page-level portal. It adds no
 * wrapper, so the source backdrop-filter continues to sample the pixels
 * immediately behind the actual GlassSurface element.
 */
export function GlassSurfaceReferenceRenderer({
  presetId,
  sourcePresetKey,
  config,
  instanceId = presetId,
  children,
  filterRegionPaddingPercent = 0
}: GlassSurfaceReferenceRendererProps) {
  return (
    <GlassSurface
      {...config}
      instanceId={instanceId}
      presetId={presetId}
      sourcePresetKey={sourcePresetKey}
      filterRegionPaddingPercent={filterRegionPaddingPercent}
    >
      {children}
    </GlassSurface>
  );
}
