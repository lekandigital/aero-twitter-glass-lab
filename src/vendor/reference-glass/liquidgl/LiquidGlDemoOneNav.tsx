import { useEffect, useId, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import {
  ExperimentElevenWallpaperClone,
  useExperimentElevenReferencePortalGeometry,
} from '../../../components/experiment-set-one/ExperimentElevenReferencePortal';

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

function ensureLiquidGlScript(): Promise<void> {
  if (window.liquidGL) return Promise.resolve();
  if (liquidGlScriptPromise) return liquidGlScriptPromise;
  window.html2canvas = html2canvas;
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

export function LiquidGlDemoOneNav({
  presetId,
  anchorRef,
  nativeWidth,
  nativeHeight,
  nativeRadius,
}: {
  presetId: string;
  anchorRef: RefObject<HTMLElement | null>;
  nativeWidth: number;
  nativeHeight: number;
  nativeRadius: number;
}) {
  const reactId = useId();
  const instanceId = safeSelectorId(reactId);
  const targetClass = `${instanceId}-menu`;
  const snapshotClass = `${instanceId}-snapshot`;
  const geometry = useExperimentElevenReferencePortalGeometry(
    anchorRef,
    nativeWidth,
    nativeHeight,
  );

  useEffect(() => {
    if (!geometry) return;
    let disposed = false;
    let trackingFrame = 0;
    let instance: LiquidGlLens | LiquidGlLens[] | undefined;

    const initialize = async () => {
      await ensureLiquidGlScript();
      if (disposed || !window.liquidGL) return;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      if (disposed || !window.liquidGL) return;
      instance = window.liquidGL({
        target: `.${targetClass}`,
        snapshot: `.${snapshotClass}`,
        resolution: 2,
        refraction: 0,
        bevelDepth: 0.052,
        bevelWidth: 0.211,
        frost: 2,
        magnify: 1,
        shadow: true,
        specular: true,
        tilt: false,
        tiltFactor: 5,
        reveal: 'fade',
      });

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
      window.liquidGL?.destroy?.();
    };
  }, [geometry !== null, snapshotClass, targetClass]);

  if (typeof document === 'undefined' || !geometry) return null;

  return createPortal(
    <>
      <div
        className={`e11-liquidgl-snapshot ${snapshotClass}`}
        data-e11-liquidgl-snapshot=""
        aria-hidden="true"
        style={{
          width: geometry.viewportWidth,
          height: geometry.viewportHeight,
        }}
      >
        <ExperimentElevenWallpaperClone
          geometry={{
            ...geometry,
            left: 0,
            top: 0,
            scaleX: 1,
            scaleY: 1,
          }}
          nativeWidth={geometry.viewportWidth}
          nativeHeight={geometry.viewportHeight}
        />
      </div>
      <div
        className="e11-liquidgl-overlay"
        data-e11-reference-overlay=""
        data-e11-reference-preset={presetId}
        data-e11-reference-family="liquidgl"
        data-e11-reference-renderer="liquidgl-webgl"
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
              data-refraction={0}
              data-bevel-depth={0.052}
              data-bevel-width={0.211}
              data-frost={2}
              data-magnify={1}
              data-shadow="true"
              data-specular="true"
              data-tilt="false"
              data-tilt-factor={5}
              data-reveal="fade"
              style={{ borderRadius: nativeRadius }}
            >
              <div className="e11-liquidgl-menu-logo-wrap">
                <img
                  src="/vendor/reference-glass/liquidgl/assets/naughtyduk-logo.svg"
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
                        src="/vendor/reference-glass/liquidgl/assets/download-icon.svg"
                        alt="Download"
                        className="e11-liquidgl-download-icon"
                      />
                      <p className="e11-liquidgl-small-text-link">Download</p>
                    </div>
                    <p className="e11-liquidgl-version-text">v1.0.1</p>
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

