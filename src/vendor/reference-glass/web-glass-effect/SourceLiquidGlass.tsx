/*
 * Adapted from:
 * glass-projects-lab/web-glass-effect/packages/web-glass-effect/
 *   src/motion/liquid/glass.tsx
 *
 * Intentional changes: local import paths, a namespaced base class, and
 * sanitizing React's useId value for deterministic SVG/CSS URL ids.
 */
'use client';

import {
  motion,
  useSpring,
  type HTMLMotionProps,
  type MotionValue,
} from 'motion/react';
import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
} from 'react';
import {
  LiquidFilter,
  type LiquidFilterProps,
} from '../../web-glass-effect/motion/liquid/filter';

function sourceFilterId(reactId: string) {
  return `e11-wge-glass-${reactId}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function getBorderRadius(element: HTMLElement, rect: DOMRect): number {
  const rawRadius = getComputedStyle(element).borderRadius;
  if (!rawRadius || rawRadius === '0px') return 0;
  const parsedRadius = Number.parseFloat(rawRadius);
  if (Number.isNaN(parsedRadius)) return 0;
  if (parsedRadius > 9999 || /e\+/i.test(rawRadius)) {
    return Math.min(rect.width, rect.height) / 2;
  }
  return parsedRadius;
}

function useMotionSizeObservers<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  disabled = false,
) {
  const width = useSpring(1, { stiffness: 200, damping: 40 });
  const height = useSpring(1, { stiffness: 200, damping: 40 });
  const borderRadius = useSpring(0, { stiffness: 200, damping: 40 });
  const isUpdating = useRef(false);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateDimensions = useCallback(() => {
    if (!containerRef.current || disabled || isUpdating.current) return;
    isUpdating.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const nextWidth = Math.max(rect.width, 1);
    const nextHeight = Math.max(rect.height, 1);
    const nextRadius = Math.max(getBorderRadius(containerRef.current, rect), 0);
    if (Math.abs(width.get() - nextWidth) > 0.5) width.set(nextWidth);
    if (Math.abs(height.get() - nextHeight) > 0.5) height.set(nextHeight);
    if (Math.abs(borderRadius.get() - nextRadius) > 0.5) borderRadius.set(nextRadius);
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    releaseTimer.current = setTimeout(() => {
      isUpdating.current = false;
      releaseTimer.current = null;
    }, 16);
  }, [borderRadius, containerRef, disabled, height, width]);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element || disabled) return;
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(element);
    updateDimensions();
    return () => {
      resizeObserver.disconnect();
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
      releaseTimer.current = null;
      isUpdating.current = false;
    };
  }, [containerRef, disabled, updateDimensions]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || disabled) return;
    let mutationTimer: ReturnType<typeof setTimeout> | null = null;
    const mutationObserver = new MutationObserver(() => {
      if (mutationTimer) clearTimeout(mutationTimer);
      mutationTimer = setTimeout(updateDimensions, 100);
    });
    mutationObserver.observe(element, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    });
    return () => {
      if (mutationTimer) clearTimeout(mutationTimer);
      mutationObserver.disconnect();
    };
  }, [containerRef, disabled, updateDimensions]);

  return { width, height, borderRadius };
}

export interface SourceLiquidGlassProps<T extends HTMLElement = HTMLDivElement>
  extends Pick<
    LiquidFilterProps,
    | 'glassThickness'
    | 'bezelWidth'
    | 'blur'
    | 'bezelHeightFn'
    | 'refractiveIndex'
    | 'specularOpacity'
    | 'specularSaturation'
    | 'dpr'
  > {
  targetRef?: React.RefObject<T | null>;
  width?: MotionValue<number>;
  height?: MotionValue<number>;
  borderRadius?: MotionValue<number>;
}

function useLiquidSurface<T extends HTMLElement>({
  targetRef,
  width: widthProp,
  height: heightProp,
  borderRadius: borderRadiusProp,
  ...props
}: SourceLiquidGlassProps<T>) {
  const filterId = sourceFilterId(useId());
  const rawRef = useRef<T>(null);
  const ref = targetRef ?? rawRef;
  const usePropValues = Boolean(widthProp && heightProp && borderRadiusProp);
  const observed = useMotionSizeObservers(ref, usePropValues);
  const width = usePropValues ? widthProp! : observed.width;
  const height = usePropValues ? heightProp! : observed.height;
  const radius = usePropValues ? borderRadiusProp! : observed.borderRadius;

  const Filter = () => (
    <LiquidFilter
      id={filterId}
      width={width}
      height={height}
      radius={radius}
      {...props}
    />
  );

  return {
    filterId,
    filterStyles: {
      backdropFilter: `url(#${filterId})`,
      WebkitBackdropFilter: `url(#${filterId})`,
    } satisfies React.CSSProperties,
    ref,
    Filter,
  };
}

export const SourceLiquidGlass: React.FC<
  SourceLiquidGlassProps & HTMLMotionProps<'div'>
> = ({
  children,
  glassThickness,
  bezelWidth,
  blur,
  bezelHeightFn,
  refractiveIndex,
  specularOpacity,
  specularSaturation,
  dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio,
  targetRef,
  width,
  height,
  borderRadius,
  ...props
}) => {
  const { filterStyles, filterId, Filter, ref } = useLiquidSurface({
    glassThickness,
    bezelWidth,
    blur,
    bezelHeightFn,
    refractiveIndex,
    specularOpacity,
    specularSaturation,
    dpr,
    targetRef,
    width,
    height,
    borderRadius,
  });

  useEffect(() => {
    if (targetRef?.current) {
      targetRef.current.style.backdropFilter = `url(#${filterId})`;
      targetRef.current.style.setProperty('-webkit-backdrop-filter', `url(#${filterId})`);
    }
  }, [filterId, targetRef]);

  return (
    <>
      <Filter />
      {!targetRef && (
        <SourceLiquidDiv
          {...props}
          style={{ ...props.style, ...filterStyles }}
          filterId={filterId}
          ref={ref}
        >
          {children}
        </SourceLiquidDiv>
      )}
    </>
  );
};

const SourceLiquidDiv = React.forwardRef<
  HTMLDivElement,
  { filterId: string } & HTMLMotionProps<'div'>
>(({ children, filterId, className, ...props }, ref) => {
  const supportsSvgFilters = useCallback(() => {
    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    if (isWebkit || isFirefox) return false;
    const probe = document.createElement('div');
    probe.style.backdropFilter = `url(#${filterId})`;
    return probe.style.backdropFilter !== '';
  }, [filterId]);
  const isLiquidSupported =
    typeof document === 'undefined' ? true : supportsSvgFilters();

  return (
    <motion.div
      ref={ref}
      {...props}
      className={`e11-wge-source-liquid ${className ?? ''}`.trim()}
      style={{
        boxShadow: '0 3px 14px rgba(0,0,0,0.1)',
        ...props.style,
        ...(isLiquidSupported
          ? {}
          : {
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }),
      }}
    >
      {children}
    </motion.div>
  );
});

SourceLiquidDiv.displayName = 'SourceLiquidDiv';
