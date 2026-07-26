import type html2canvas from 'html2canvas';
import {
  installExperimentHtml2CanvasAdapter,
  releaseExperimentHtml2CanvasAdapter,
} from './experimentStageCapture';

declare global {
  interface Window {
    html2canvas?: typeof html2canvas;
  }
}

export const EXPERIMENT_ELEVEN_LIVE_LAYER_B_SELECTOR =
  '.experiment-set-one-stage__canvas ' +
  '.experiment-set-one-stage__multi-shell[data-stage-experiment="eleven"] ' +
  '[role="region"][aria-label="Experiment Eleven layer B"]';

export interface ReferenceOpticalInput {
  canvas: HTMLCanvasElement;
  bounds: DOMRect;
}

let opticalInputConsumers = 0;

export function retainReferenceOpticalInputCapture() {
  opticalInputConsumers += 1;
  installExperimentHtml2CanvasAdapter();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    opticalInputConsumers = Math.max(0, opticalInputConsumers - 1);
    if (opticalInputConsumers === 0) {
      releaseExperimentHtml2CanvasAdapter();
    }
  };
}

function shouldIgnoreCaptureElement(element: Element) {
  return (
    element.matches('[data-e11-reference-object-root]') ||
    element.matches('[data-e11-reference-overlay]') ||
    Boolean(element.closest('[data-e11-reference-object-root]')) ||
    Boolean(element.closest('[data-e11-reference-overlay]'))
  );
}

/**
 * Captures the real Experiment Eleven optical input at one internal pixel per
 * CSS pixel. This is deliberately DPR-independent: both authoritative WebGL
 * sources allocate their canvases without multiplying by devicePixelRatio.
 */
export async function captureReferenceOpticalInput(
  selector = EXPERIMENT_ELEVEN_LIVE_LAYER_B_SELECTOR,
): Promise<ReferenceOpticalInput> {
  const capture = installExperimentHtml2CanvasAdapter();
  const target =
    document.querySelector<HTMLElement>(selector) ?? document.documentElement;
  const sourceBounds = target.getBoundingClientRect();
  const bounds = new DOMRect(
    sourceBounds.left,
    sourceBounds.top,
    Math.max(1, sourceBounds.width),
    Math.max(1, sourceBounds.height),
  );
  const canvas = await (capture as typeof html2canvas)(document.documentElement, {
    x: bounds.left + window.scrollX,
    y: bounds.top + window.scrollY,
    width: bounds.width,
    height: bounds.height,
    scale: 1,
    backgroundColor: null,
    logging: false,
    useCORS: true,
    allowTaint: true,
    ignoreElements: shouldIgnoreCaptureElement,
  });
  return { canvas, bounds };
}
