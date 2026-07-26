import { useEffect, useId, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import type html2canvas from 'html2canvas';
import {
  useExperimentElevenReferencePortalGeometry,
} from '../../../components/experiment-set-one/experimentElevenReferencePortalGeometry';
import {
  installExperimentHtml2CanvasAdapter,
  releaseExperimentHtml2CanvasAdapter,
} from '../shared/experimentStageCapture';

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

function ensureLiquidGlScript(): Promise<void> {
  installExperimentHtml2CanvasAdapter();
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
  releaseExperimentHtml2CanvasAdapter();
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
          <div
            className={`e11-liquidgl-menu-wrap menu-wrap ${targetClass}`}
            data-e11-reference-preset={presetId}
            data-e11-reference-object-root={presetId}
            data-source-family="liquidgl"
            data-source-preset-key="demo-1:.menu-wrap"
            data-source-component="demo-1.menu-wrap"
            data-transparent-render-surface="true"
            data-content-policy="object-only"
            data-visible-child-count="0"
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
            role="img"
            aria-label="liquidGL Demo 1 empty navigation glass"
          >
            {/*
             * The source `.menu-wrap` is the liquidGL target. Its logo,
             * attribution, download link, and version are source-demo UI,
             * explicitly excluded by the object-only integration contract.
             */}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
