import { useEffect, useId, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import {
  useExperimentElevenReferencePortalGeometry,
} from '../../../components/experiment-set-one/experimentElevenReferencePortalGeometry';

type LiquidGlLens = {
  updateMetrics?: () => void;
};

type LiquidGlFactory = ((options: Record<string, unknown>) => LiquidGlLens | LiquidGlLens[]) & {
  destroy?: () => void;
};

declare global {
  interface Window {
    html2canvas?: typeof html2canvas;
    liquidGL?: LiquidGlFactory;
    __liquidGLRenderer__?: { render?: () => void } | null;
  }
}

let liquidGlScriptPromise: Promise<void> | null = null;
const EXPERIMENT_ELEVEN_LIVE_LAYER_B_SELECTOR =
  '.experiment-set-one-stage__canvas ' +
  '.experiment-set-one-stage__multi-shell[data-stage-experiment="eleven"] ' +
  '[role="region"][aria-label="Experiment Eleven layer B"]';

function convertSrgbColors(value: string): string {
  return value.replace(
    /color\(srgb\s+([+-]?(?:\d*\.)?\d+)\s+([+-]?(?:\d*\.)?\d+)\s+([+-]?(?:\d*\.)?\d+)(?:\s*\/\s*([+-]?(?:\d*\.)?\d+))?\)/g,
    (_match, red: string, green: string, blue: string, alpha = '1') =>
      `rgba(${Number(red) * 255}, ${Number(green) * 255}, ${
        Number(blue) * 255
      }, ${alpha})`,
  );
}

/**
 * html2canvas 1.x cannot parse Chromium's computed `color(srgb …)` output
 * for color-mix-based gradients. Normalize only its disposable document
 * clone; the live Save 249 / Layer B DOM and styles are never modified.
 */
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
      // A pair of zero-area decorative edge spans in Layer B still carry
      // gradients. They paint no live pixels, but html2canvas tries to create
      // a zero-size pattern canvas for them and aborts the entire snapshot.
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
      // Their top-edge instances collapse to zero area at this scale. Apply
      // the clone-only guard by semantic class as well because the detached
      // clone can report a transient non-zero box during `onclone`.
      element.style.backgroundImage = 'none';
    }
    if (element.classList.contains('glass-frost-matte')) {
      const backgroundImage = computed.backgroundImage;
      if (
        backgroundImage.includes('data:image/svg+xml') &&
        backgroundImage.includes('%3Csvg viewBox')
      ) {
        // The live frost texture is viewBox-only. Browsers size it from the
        // CSS background box, but html2canvas 1.x materializes it as a
        // zero-size pattern canvas even when equivalent intrinsic dimensions
        // are injected. Omit only that procedural matte texture from the
        // disposable sampling clone; live Layer B is untouched and liquidGL's
        // own exact `frost: 2` pass remains active.
        element.style.backgroundImage = 'none';
      }
    }
  });
}

function installHtml2CanvasAdapter() {
  window.html2canvas = ((element, options) => {
    const sourceOnClone = options?.onclone;
    const contextPrototype = CanvasRenderingContext2D.prototype;
    const sourceCreatePattern = contextPrototype.createPattern;
    const guardedCreatePattern: typeof sourceCreatePattern = function (
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
    return html2canvas(element, {
      ...options,
      onclone: (clonedDocument, clonedSnapshotRoot) => {
        normalizeHtml2CanvasClone(clonedDocument, clonedSnapshotRoot);
        sourceOnClone?.(clonedDocument, clonedSnapshotRoot);
      },
    }).finally(() => {
      if (contextPrototype.createPattern === guardedCreatePattern) {
        contextPrototype.createPattern = sourceCreatePattern;
      }
    });
  }) as typeof html2canvas;
}

function ensureLiquidGlScript(): Promise<void> {
  installHtml2CanvasAdapter();
  if (window.liquidGL) return Promise.resolve();
  if (liquidGlScriptPromise) return liquidGlScriptPromise;
  liquidGlScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-e11-liquidgl-script]',
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load liquidGL.js')), {
        once: true,
      });
      return;
    }
    const script = document.createElement('script');
    script.src = '/vendor/reference-glass/liquidgl/scripts/liquidGL.js';
    script.async = true;
    script.dataset.e11LiquidglScript = '';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Failed to load liquidGL.js')), {
      once: true,
    });
    document.head.appendChild(script);
  });
  return liquidGlScriptPromise;
}

function safeSelectorId(reactId: string) {
  return `e11-liquidgl-${reactId}`.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function destroyLiquidGlRuntime() {
  window.liquidGL?.destroy?.();
  window.__liquidGLRenderer__ = null;
  document
    .querySelectorAll<HTMLCanvasElement>('body > canvas[data-liquid-ignore]')
    .forEach((canvas) => canvas.remove());
  document.getElementById('liquid-gl-dynamic-styles')?.remove();
  document
    .querySelectorAll<HTMLScriptElement>('script[data-e11-liquidgl-script]')
    .forEach((script) => script.remove());
  delete window.liquidGL;
  delete window.html2canvas;
  liquidGlScriptPromise = null;
}

export interface LiquidGlDemoOneNavConfig {
  options: {
    refraction: number;
    bevelDepth: number;
    bevelWidth: number;
    frost: number;
    magnify: number;
    shadow: boolean;
    specular: boolean;
    tilt: boolean;
    tiltFactor: number;
    reveal: string;
  };
  snapshot: {
    resolution: number;
    selector: string;
  };
  content: {
    version: string;
    logoAsset: string;
    downloadAsset: string;
  };
}

export function LiquidGlDemoOneNav({
  presetId,
  anchorRef,
  nativeWidth,
  nativeHeight,
  nativeRadius,
  config,
}: {
  presetId: string;
  anchorRef: RefObject<HTMLElement | null>;
  nativeWidth: number;
  nativeHeight: number;
  nativeRadius: number;
  config: LiquidGlDemoOneNavConfig;
}) {
  const reactId = useId();
  const instanceId = safeSelectorId(reactId);
  const targetClass = `${instanceId}-menu`;
  const geometry = useExperimentElevenReferencePortalGeometry(
    anchorRef,
    nativeWidth,
    nativeHeight,
  );
  const geometryReady = geometry !== null;

  useEffect(() => {
    if (!geometryReady) return;
    let disposed = false;
    let trackingFrame = 0;
    let instance: LiquidGlLens | LiquidGlLens[] | undefined;

    const initialize = async () => {
      await ensureLiquidGlScript();
      if (disposed || !window.liquidGL) {
        if (disposed) destroyLiquidGlRuntime();
        return;
      }
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      if (disposed || !window.liquidGL) return;
      instance = window.liquidGL({
        target: `.${targetClass}`,
        // Capture the *live* Layer B node behind this object. Sampling `body`
        // trips html2canvas over unrelated modern-color declarations elsewhere
        // in the lab; this narrower real-DOM target is also the material the
        // Layer C object is meant to refract. No copied wallpaper, source-demo
        // scene, cutout, or visible technical render bed is mounted.
        snapshot: config.snapshot.selector || EXPERIMENT_ELEVEN_LIVE_LAYER_B_SELECTOR,
        resolution: config.snapshot.resolution,
        ...config.options,
      });
      const rendererCanvas = document.querySelector<HTMLCanvasElement>(
        'body > canvas[data-liquid-ignore]',
      );
      if (rendererCanvas) {
        // liquidGL's shared canvas is transparent outside its lens viewport.
        // Raise that exact WebGL output above Experiment Eleven while keeping
        // the source `.menu-wrap` content one layer higher.
        rendererCanvas.style.zIndex = '11';
        rendererCanvas.dataset.e11ReferencePreset = presetId;
        rendererCanvas.dataset.sourceFamily = 'liquidgl';
        rendererCanvas.dataset.sourcePresetKey = 'demo-1:.menu-wrap';
        rendererCanvas.dataset.sourceRendererComponent = 'liquidGLRenderer.canvas';
        rendererCanvas.dataset.transparentRenderSurface = 'true';
      }

      const track = () => {
        if (disposed) return;
        const lenses = Array.isArray(instance) ? instance : instance ? [instance] : [];
        lenses.forEach((lens) => lens.updateMetrics?.());
        window.__liquidGLRenderer__?.render?.();
        trackingFrame = requestAnimationFrame(track);
      };
      trackingFrame = requestAnimationFrame(track);
    };

    void initialize();
    return () => {
      disposed = true;
      cancelAnimationFrame(trackingFrame);
      destroyLiquidGlRuntime();
    };
  }, [config, geometryReady, presetId, targetClass]);

  if (typeof document === 'undefined' || !geometry) return null;

  return createPortal(
    <>
      <div
        className="e11-liquidgl-overlay"
        data-e11-reference-overlay=""
        data-e11-reference-preset={presetId}
        data-e11-reference-family="liquidgl"
        data-e11-reference-renderer="liquidgl-webgl"
        data-source-family="liquidgl"
        data-source-preset-key="demo-1:.menu-wrap"
        data-transparent-render-surface="true"
      >
        <div
          className="e11-liquidgl-menu-anchor"
          style={{
            left: geometry.left,
            top: geometry.top,
            width: nativeWidth,
            height: nativeHeight,
            transform: `scale(${geometry.scaleX}, ${geometry.scaleY})`,
          }}
        >
          <a
            href="https://github.com/naughtyduk/liquidGL"
            target="_blank"
            rel="noreferrer"
            tabIndex={-1}
            onClick={(event) => event.preventDefault()}
          >
            <div
              className={`e11-liquidgl-menu-wrap menu-wrap ${targetClass}`}
              data-e11-reference-preset={presetId}
              data-e11-reference-object-root={presetId}
              data-source-family="liquidgl"
              data-source-preset-key="demo-1:.menu-wrap"
              data-source-component="demo-1.menu-wrap"
              data-transparent-render-surface="true"
              data-refraction={config.options.refraction}
              data-bevel-depth={config.options.bevelDepth}
              data-bevel-width={config.options.bevelWidth}
              data-frost={config.options.frost}
              data-magnify={config.options.magnify}
              data-shadow={String(config.options.shadow)}
              data-specular={String(config.options.specular)}
              data-tilt={String(config.options.tilt)}
              data-tilt-factor={config.options.tiltFactor}
              data-reveal={config.options.reveal}
              style={{ borderRadius: nativeRadius }}
            >
              <div className="e11-liquidgl-menu-logo-wrap">
                <img
                  src={config.content.logoAsset}
                  loading="eager"
                  alt="NaughtyDuk©"
                  className="e11-liquidgl-menu-logo"
                />
              </div>
              <div className="e11-liquidgl-menu-items-wrap">
                <div className="e11-liquidgl-menu-item-stack">
                  <p className="e11-liquidgl-menu-item-text">liquidGL by NaughtyDuk©</p>
                  <div className="e11-liquidgl-download-wrapper">
                    <div className="e11-liquidgl-download-link">
                      <img
                        src={config.content.downloadAsset}
                        alt="Download"
                        className="e11-liquidgl-download-icon"
                      />
                      <p className="e11-liquidgl-small-text-link">Download</p>
                    </div>
                    <p className="e11-liquidgl-version-text">{config.content.version}</p>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </>,
    document.body,
  );
}
