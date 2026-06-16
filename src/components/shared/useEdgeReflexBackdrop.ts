import { useEffect, useState, type RefObject } from 'react';
import {
  invalidateEdgeReflexBackdropCache,
  sampleEdgeReflexBackdrop,
  type EdgeReflexBackdropProfile,
} from './edgeReflexBackdrop';

export type EdgeReflexBackdropLinearRegion = 'top' | 'bottom' | 'left' | 'right';

export type EdgeReflexBackdropProfiles = Record<EdgeReflexBackdropLinearRegion, EdgeReflexBackdropProfile>;

const LINEAR_EDGE_REGIONS: EdgeReflexBackdropLinearRegion[] = ['top', 'bottom', 'left', 'right'];

const FALLBACK_PROFILE: EdgeReflexBackdropProfile = {
  maskGradient: 'linear-gradient(to bottom, #000 0%, #000 100%)',
  rimMaskGradient: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
  reflexMaskGradient: 'linear-gradient(to bottom, #000 0%, #000 100%)',
  tintGradient: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
  rimGradient: 'linear-gradient(to bottom, transparent 0%, transparent 100%)',
  peakAlpha: 1,
  colorGain: 1,
  rimColor: '#ffffff',
};

const INITIAL_PROFILES = Object.fromEntries(
  LINEAR_EDGE_REGIONS.map((region) => [region, FALLBACK_PROFILE]),
) as EdgeReflexBackdropProfiles;

export function useEdgeReflexBackdrop(
  rootRef: RefObject<HTMLElement | null>,
  {
    enabled,
    topLight,
    bottomLight,
    leftLight,
    rightLight,
  }: {
    enabled: boolean;
    topLight: number;
    bottomLight: number;
    leftLight: number;
    rightLight: number;
  },
): EdgeReflexBackdropProfiles {
  const [profiles, setProfiles] = useState<EdgeReflexBackdropProfiles>(INITIAL_PROFILES);

  useEffect(() => {
    if (!enabled) {
      setProfiles(INITIAL_PROFILES);
      return;
    }

    const lights: Record<EdgeReflexBackdropLinearRegion, number> = {
      top: topLight,
      bottom: bottomLight,
      left: leftLight,
      right: rightLight,
    };

    let frame = 0;
    let disposed = false;
    let dragShell: Element | null = null;

    const update = () => {
      const element = rootRef.current;
      if (!element || disposed) return;

      const next = {} as EdgeReflexBackdropProfiles;
      for (const region of LINEAR_EDGE_REGIONS) {
        next[region] = sampleEdgeReflexBackdrop(element, region, 0, 0, lights[region]);
      }
      setProfiles(next);
    };

    const bindDragShell = () => {
      const element = rootRef.current;
      const nextShell = element?.closest('.experiment-set-two-draggable') ?? null;
      if (nextShell === dragShell) return;
      dragShell?.removeEventListener('pointermove', schedule);
      dragShell?.removeEventListener('pointerup', schedule);
      dragShell = nextShell;
      dragShell?.addEventListener('pointermove', schedule);
      dragShell?.addEventListener('pointerup', schedule);
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        bindDragShell();
        update();
      });
    };

    const img = document.querySelector<HTMLImageElement>(
      '.aero-wallpaper__image:not(.aero-wallpaper__image--reference)',
    );
    const onWallpaperReady = () => {
      invalidateEdgeReflexBackdropCache();
      schedule();
    };

    if (img?.complete) {
      onWallpaperReady();
    } else {
      img?.addEventListener('load', onWallpaperReady);
    }

    schedule();

    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);

    const observed = rootRef.current;
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' && observed ? new ResizeObserver(schedule) : null;
    if (observed) resizeObserver?.observe(observed);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      img?.removeEventListener('load', onWallpaperReady);
      dragShell?.removeEventListener('pointermove', schedule);
      dragShell?.removeEventListener('pointerup', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      resizeObserver?.disconnect();
    };
  }, [enabled, topLight, bottomLight, leftLight, rightLight, rootRef]);

  return profiles;
}
