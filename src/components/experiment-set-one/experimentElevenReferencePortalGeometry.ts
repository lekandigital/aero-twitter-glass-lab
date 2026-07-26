import {
  useLayoutEffect,
  useState,
  type RefObject,
} from 'react';

export type ExperimentElevenReferencePortalGeometry = {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  viewportWidth: number;
  viewportHeight: number;
};

function sameGeometry(
  previous: ExperimentElevenReferencePortalGeometry | null,
  next: ExperimentElevenReferencePortalGeometry,
): boolean {
  if (!previous) return false;
  if (
    previous.left !== next.left ||
    previous.top !== next.top ||
    previous.scaleX !== next.scaleX ||
    previous.scaleY !== next.scaleY ||
    previous.viewportWidth !== next.viewportWidth ||
    previous.viewportHeight !== next.viewportHeight
  ) {
    return false;
  }
  return true;
}

/**
 * Tracks the real Layer C drag anchor in page coordinates. The portal has no
 * render bed of its own: backdrop-based reference objects sample the live
 * Experiment Eleven composition, including the unchanged Layer B.
 */
export function useExperimentElevenReferencePortalGeometry(
  anchorRef: RefObject<HTMLElement | null>,
  nativeWidth: number,
  nativeHeight: number,
): ExperimentElevenReferencePortalGeometry | null {
  const [geometry, setGeometry] =
    useState<ExperimentElevenReferencePortalGeometry | null>(null);

  useLayoutEffect(() => {
    let frame = 0;
    let disposed = false;

    const measure = () => {
      if (disposed) return;
      const anchor = anchorRef.current;
      if (anchor) {
        const anchorRect = anchor.getBoundingClientRect();
        const next: ExperimentElevenReferencePortalGeometry = {
          left: anchorRect.left,
          top: anchorRect.top,
          scaleX: anchorRect.width / nativeWidth,
          scaleY: anchorRect.height / nativeHeight,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        };
        setGeometry((previous) =>
          sameGeometry(previous, next) ? previous : next
        );
      }
      frame = requestAnimationFrame(measure);
    };

    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
    };
  }, [anchorRef, nativeHeight, nativeWidth]);

  return geometry;
}
