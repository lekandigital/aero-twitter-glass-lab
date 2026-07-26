import { useEffect, useState, type RefObject } from 'react';
import { installExperimentHtml2CanvasAdapter } from '../../../vendor/reference-glass/shared/experimentStageCapture.ts';
import type { ShowcaseGeometry } from './showcaseConfig.ts';

export type ButtonStageCapture = Readonly<{
  canvas: HTMLCanvasElement | null;
  dataUrl: string | null;
  error: string | null;
  revision: number;
}>;

const INITIAL_CAPTURE: ButtonStageCapture = {
  canvas: null,
  dataUrl: null,
  error: null,
  revision: 0,
};

let captureQueue = Promise.resolve();

function enqueueCapture(
  task: () => Promise<HTMLCanvasElement>,
): Promise<HTMLCanvasElement> {
  const queued = captureQueue.then(task);
  captureQueue = queued.then(
    () => undefined,
    () => undefined,
  );
  return queued;
}

function isLayerAElement(element: Element): boolean {
  return (
    element.matches('.button-experiment-layer-a') ||
    Boolean(element.closest('.button-experiment-layer-a'))
  );
}

async function captureButtonStageRegion(
  root: HTMLElement,
  geometry: ShowcaseGeometry,
  technicalInset: number,
): Promise<HTMLCanvasElement> {
  const stage = root.closest<HTMLElement>('.button-experiment-stage');
  if (!stage) {
    throw new Error('Button experiment placement stage is not mounted');
  }

  const stageRect = stage.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const renderedScaleX = rootRect.width / geometry.width;
  const renderedScaleY = rootRect.height / geometry.height;
  if (
    stageRect.width <= 0 ||
    stageRect.height <= 0 ||
    renderedScaleX <= 0 ||
    renderedScaleY <= 0
  ) {
    throw new Error('Button experiment placement has no measurable area');
  }

  const captureRect = new DOMRect(
    rootRect.left - technicalInset * renderedScaleX,
    rootRect.top - technicalInset * renderedScaleY,
    rootRect.width + technicalInset * renderedScaleX * 2,
    rootRect.height + technicalInset * renderedScaleY * 2,
  );
  const dpr = window.devicePixelRatio || 1;
  const renderedScale = Math.max(
    0.2,
    Math.min(renderedScaleX, renderedScaleY),
  );
  const stageCapture = await installExperimentHtml2CanvasAdapter()(stage, {
    scale: Math.min(4, dpr / renderedScale),
    backgroundColor: null,
    logging: false,
    useCORS: true,
    ignoreElements: isLayerAElement,
  });

  const output = document.createElement('canvas');
  output.width = Math.max(
    1,
    Math.round((geometry.width + technicalInset * 2) * dpr),
  );
  output.height = Math.max(
    1,
    Math.round((geometry.height + technicalInset * 2) * dpr),
  );
  const context = output.getContext('2d');
  if (!context) return output;

  const intersection = {
    left: Math.max(captureRect.left, stageRect.left),
    top: Math.max(captureRect.top, stageRect.top),
    right: Math.min(captureRect.right, stageRect.right),
    bottom: Math.min(captureRect.bottom, stageRect.bottom),
  };
  if (
    intersection.right <= intersection.left ||
    intersection.bottom <= intersection.top
  ) {
    return output;
  }

  const sourceScaleX = stageCapture.width / stageRect.width;
  const sourceScaleY = stageCapture.height / stageRect.height;
  context.drawImage(
    stageCapture,
    (intersection.left - stageRect.left) * sourceScaleX,
    (intersection.top - stageRect.top) * sourceScaleY,
    (intersection.right - intersection.left) * sourceScaleX,
    (intersection.bottom - intersection.top) * sourceScaleY,
    ((intersection.left - captureRect.left) / renderedScaleX) * dpr,
    ((intersection.top - captureRect.top) / renderedScaleY) * dpr,
    ((intersection.right - intersection.left) / renderedScaleX) * dpr,
    ((intersection.bottom - intersection.top) / renderedScaleY) * dpr,
  );
  return output;
}

export function useButtonStageCapture(
  rootRef: RefObject<HTMLElement | null>,
  geometry: ShowcaseGeometry,
  technicalInset: number,
): ButtonStageCapture {
  const [capture, setCapture] =
    useState<ButtonStageCapture>(INITIAL_CAPTURE);

  useEffect(() => {
    let disposed = false;
    let generation = 0;
    let timer = 0;

    const update = () => {
      const root = rootRef.current;
      if (!root) return;
      generation += 1;
      const requestedGeneration = generation;

      void enqueueCapture(() =>
        captureButtonStageRegion(root, geometry, technicalInset),
      ).then(
        (canvas) => {
          if (disposed || requestedGeneration !== generation) return;
          setCapture((current) => ({
            canvas,
            dataUrl: canvas.toDataURL('image/png'),
            error: null,
            revision: current.revision + 1,
          }));
        },
        (error: unknown) => {
          if (disposed || requestedGeneration !== generation) return;
          setCapture((current) => ({
            ...current,
            error: error instanceof Error ? error.message : String(error),
          }));
        },
      );
    };

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(update, 60);
    };

    const resizeObserver = new ResizeObserver(schedule);
    if (rootRef.current) resizeObserver.observe(rootRef.current);
    window.addEventListener('resize', schedule);
    schedule();

    return () => {
      disposed = true;
      generation += 1;
      window.clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [geometry, rootRef, technicalInset]);

  return capture;
}
