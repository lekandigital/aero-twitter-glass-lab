import { useEffect, useState, type RefObject } from 'react';
import {
  invalidateEdgeReflexBackdropCache,
  sampleEdgeReflexBackdrop,
  type EdgeReflexBackdropProfile,
} from './edgeReflexBackdrop';

type EdgeReflexBackdropProfiles = {
  left: EdgeReflexBackdropProfile;
  right: EdgeReflexBackdropProfile;
};

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

const INITIAL_PROFILES: EdgeReflexBackdropProfiles = {
  left: FALLBACK_PROFILE,
  right: FALLBACK_PROFILE,
};

export function useEdgeReflexBackdrop(
  rootRef: RefObject<HTMLElement | null>,
  {
    gapTop,
    gapBottom,
    enabled,
    leftLight,
    rightLight,
  }: {
    gapTop: number;
    gapBottom: number;
    enabled: boolean;
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

    let frame = 0;
    let disposed = false;
    let dragShell: Element | null = null;

    const update = () => {
      const element = rootRef.current;
      if (!element || disposed) return;
      setProfiles({
        left: sampleEdgeReflexBackdrop(element, 'left', gapTop, gapBottom, leftLight),
        right: sampleEdgeReflexBackdrop(element, 'right', gapTop, gapBottom, rightLight),
      });
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
  }, [enabled, gapTop, gapBottom, leftLight, rightLight, rootRef]);

  return profiles;
}
