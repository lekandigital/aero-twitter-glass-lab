import html2canvas from 'html2canvas';

function convertSrgbColors(value: string): string {
  return value.replace(
    /color\(srgb\s+([+-]?(?:\d*\.)?\d+)\s+([+-]?(?:\d*\.)?\d+)\s+([+-]?(?:\d*\.)?\d+)(?:\s*\/\s*([+-]?(?:\d*\.)?\d+))?\)/g,
    (_match, red: string, green: string, blue: string, alpha = '1') =>
      `rgba(${Number(red) * 255}, ${Number(green) * 255}, ${
        Number(blue) * 255
      }, ${alpha})`,
  );
}

function normalizeHtml2CanvasClone(
  clonedDocument: Document,
  clonedSnapshotRoot: HTMLElement,
) {
  const view = clonedDocument.defaultView;
  if (!view) return;
  const properties = [
    'background',
    'background-image',
    'border-color',
    'box-shadow',
    'color',
    'text-shadow',
  ] as const;
  const elements = [
    clonedSnapshotRoot,
    ...clonedSnapshotRoot.querySelectorAll<HTMLElement>('*'),
  ];
  elements.forEach((element) => {
    const computed = view.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    properties.forEach((property) => {
      const value = computed.getPropertyValue(property);
      if (!value.includes('color(srgb')) return;
      element.style.setProperty(property, convertSrgbColors(value));
    });
    if (
      (rect.width === 0 || rect.height === 0) &&
      computed.backgroundImage !== 'none'
    ) {
      element.style.backgroundImage = 'none';
    }
    if (
      element.classList.contains(
        'experiment-four-layer-b__pwzzovO-glass-edge-rim',
      ) ||
      element.classList.contains(
        'experiment-four-layer-b__pwzzovO-glass-edge-tint',
      )
    ) {
      element.style.backgroundImage = 'none';
    }
    if (element.classList.contains('glass-frost-matte')) {
      const backgroundImage = computed.backgroundImage;
      if (
        backgroundImage.includes('data:image/svg+xml') &&
        backgroundImage.includes('%3Csvg viewBox')
      ) {
        element.style.backgroundImage = 'none';
      }
    }
  });
}

let installedAdapter: typeof html2canvas | null = null;
let patternGuardConsumers = 0;
let originalCreatePattern:
  | typeof CanvasRenderingContext2D.prototype.createPattern
  | null = null;
let guardedCreatePattern:
  | typeof CanvasRenderingContext2D.prototype.createPattern
  | null = null;

function retainCreatePatternGuard(): () => void {
  const contextPrototype = CanvasRenderingContext2D.prototype;
  if (patternGuardConsumers === 0) {
    originalCreatePattern = contextPrototype.createPattern;
    const sourceCreatePattern = originalCreatePattern;
    guardedCreatePattern = function (
      this: CanvasRenderingContext2D,
      image: CanvasImageSource,
      repetition: string | null,
    ) {
      if (
        image instanceof HTMLCanvasElement &&
        (image.width === 0 || image.height === 0)
      ) {
        const transparentPixel = document.createElement('canvas');
        transparentPixel.width = 1;
        transparentPixel.height = 1;
        return sourceCreatePattern.call(this, transparentPixel, repetition);
      }
      return sourceCreatePattern.call(this, image, repetition);
    };
    contextPrototype.createPattern = guardedCreatePattern;
  }
  patternGuardConsumers += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    patternGuardConsumers = Math.max(0, patternGuardConsumers - 1);
    if (
      patternGuardConsumers === 0 &&
      originalCreatePattern &&
      guardedCreatePattern &&
      contextPrototype.createPattern === guardedCreatePattern
    ) {
      contextPrototype.createPattern = originalCreatePattern;
      originalCreatePattern = null;
      guardedCreatePattern = null;
    }
  };
}

/**
 * html2canvas adapter shared by liquidGL and FluidGlass. All compatibility
 * normalization is applied only to html2canvas's disposable clone; the live
 * Experiment Eleven DOM is never changed.
 */
export function installExperimentHtml2CanvasAdapter(): typeof html2canvas {
  if (installedAdapter) {
    window.html2canvas = installedAdapter;
    return installedAdapter;
  }

  installedAdapter = ((element, options) => {
    const sourceOnClone = options?.onclone;
    const releasePatternGuard = retainCreatePatternGuard();
    try {
      return html2canvas(element, {
        ...options,
        onclone: (clonedDocument, clonedSnapshotRoot) => {
          normalizeHtml2CanvasClone(clonedDocument, clonedSnapshotRoot);
          sourceOnClone?.(clonedDocument, clonedSnapshotRoot);
        },
      }).finally(releasePatternGuard);
    } catch (error) {
      releasePatternGuard();
      throw error;
    }
  }) as typeof html2canvas;

  window.html2canvas = installedAdapter;
  return installedAdapter;
}

type ExperimentStageSnapshot = Readonly<{
  canvas: HTMLCanvasElement;
  rect: DOMRect;
}>;

let activeStageSnapshot: Promise<ExperimentStageSnapshot> | null = null;

function captureExperimentStage(
  stage: HTMLElement,
  capture: typeof html2canvas,
  dpr: number,
): Promise<ExperimentStageSnapshot> {
  if (activeStageSnapshot) return activeStageSnapshot;
  const task = (async () => {
    const stageRect = stage.getBoundingClientRect();
    const canvas = await capture(stage, {
      scale: dpr,
      backgroundColor: null,
      logging: false,
      useCORS: true,
      ignoreElements: (element) =>
        element.matches('[data-e11-reference-object-root]') ||
        element.matches('[data-e11-reference-overlay]') ||
        Boolean(element.closest('[data-e11-reference-object-root]')) ||
        Boolean(element.closest('[data-e11-reference-overlay]')),
    });
    return { canvas, rect: stageRect };
  })();
  activeStageSnapshot = task;
  const clearActiveSnapshot = () => {
    if (activeStageSnapshot === task) activeStageSnapshot = null;
  };
  void task.then(clearActiveSnapshot, clearActiveSnapshot);
  return task;
}

export async function captureExperimentStageRegion(
  rect: DOMRect,
): Promise<HTMLCanvasElement> {
  const capture = installExperimentHtml2CanvasAdapter();
  const stage = document.querySelector<HTMLElement>(
    '.experiment-set-one-stage__multi-shell[data-stage-experiment="eleven"]',
  );
  if (!stage) {
    throw new Error('Experiment Eleven target stage is not mounted');
  }

  const dpr = window.devicePixelRatio || 1;
  const { canvas: stageCapture, rect: stageRect } =
    await captureExperimentStage(stage, capture, dpr);

  const output = document.createElement('canvas');
  output.width = Math.max(1, Math.round(rect.width * dpr));
  output.height = Math.max(1, Math.round(rect.height * dpr));
  const context = output.getContext('2d');
  if (!context || stageRect.width <= 0 || stageRect.height <= 0) {
    return output;
  }

  const intersection = {
    left: Math.max(rect.left, stageRect.left),
    top: Math.max(rect.top, stageRect.top),
    right: Math.min(rect.right, stageRect.right),
    bottom: Math.min(rect.bottom, stageRect.bottom),
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
    (intersection.left - rect.left) * dpr,
    (intersection.top - rect.top) * dpr,
    (intersection.right - intersection.left) * dpr,
    (intersection.bottom - intersection.top) * dpr,
  );
  return output;
}

export function releaseExperimentHtml2CanvasAdapter() {
  if (window.html2canvas === installedAdapter) {
    delete window.html2canvas;
  }
}
