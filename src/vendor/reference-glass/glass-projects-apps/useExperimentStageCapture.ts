import { useEffect, useState, type RefObject } from 'react';
import { captureExperimentStageRegion } from '../shared/experimentStageCapture.ts';

export type ExperimentStageCapture = Readonly<{
  canvas: HTMLCanvasElement | null;
  dataUrl: string | null;
  error: string | null;
  revision: number;
}>;

const INITIAL_CAPTURE: ExperimentStageCapture = {
  canvas: null,
  dataUrl: null,
  error: null,
  revision: 0,
};

let captureQueue = Promise.resolve();

function enqueueStageCapture(rect: DOMRect): Promise<HTMLCanvasElement> {
  const task = captureQueue.then(() => captureExperimentStageRegion(rect));
  captureQueue = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

function hasUsableRect(rect: DOMRect): boolean {
  return rect.width > 0 && rect.height > 0;
}

/**
 * Captures the live Experiment Eleven target stage below one glass object.
 * Source-demo imagery is deliberately never part of this optical input.
 */
export function useExperimentStageCapture(
  rootRef: RefObject<HTMLElement | null>,
  captureInset = 0,
): ExperimentStageCapture {
  const [capture, setCapture] =
    useState<ExperimentStageCapture>(INITIAL_CAPTURE);

  useEffect(() => {
    let disposed = false;
    let timer = 0;
    let generation = 0;
    let captureInFlight = false;
    let rerunRequested = false;

    const update = async () => {
      if (captureInFlight) {
        rerunRequested = true;
        return;
      }
      const root = rootRef.current;
      if (!root) return;
      const rootRect = root.getBoundingClientRect();
      if (!hasUsableRect(rootRect)) return;
      const rect = new DOMRect(
        rootRect.left - captureInset,
        rootRect.top - captureInset,
        rootRect.width + captureInset * 2,
        rootRect.height + captureInset * 2,
      );

      generation += 1;
      const requestedGeneration = generation;
      captureInFlight = true;
      try {
        const canvas = await enqueueStageCapture(rect);
        if (disposed || requestedGeneration !== generation) return;
        setCapture((current) => ({
          canvas,
          dataUrl: canvas.toDataURL('image/png'),
          error: null,
          revision: current.revision + 1,
        }));
      } catch (error: unknown) {
        if (disposed || requestedGeneration !== generation) return;
        setCapture((current) => ({
          ...current,
          error: error instanceof Error ? error.message : String(error),
        }));
      } finally {
        captureInFlight = false;
        if (!disposed && rerunRequested) {
          rerunRequested = false;
          schedule();
        }
      }
    };

    const schedule = () => {
      if (captureInFlight) {
        rerunRequested = true;
        return;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void update();
      }, 80);
    };

    const resizeObserver = new ResizeObserver(schedule);
    if (rootRef.current) resizeObserver.observe(rootRef.current);

    window.addEventListener('pointerup', schedule, true);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('transitionend', schedule, true);
    window.addEventListener('animationend', schedule, true);
    schedule();

    return () => {
      disposed = true;
      generation += 1;
      window.clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener('pointerup', schedule, true);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('transitionend', schedule, true);
      window.removeEventListener('animationend', schedule, true);
    };
  }, [captureInset, rootRef]);

  return capture;
}
