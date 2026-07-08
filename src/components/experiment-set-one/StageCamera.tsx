/**
 * Camera for the Experiment Set 1 canvas — Figma-style trackpad conventions.
 *
 * The wallpaper and the experiment stage share a single scale + translate
 * (driven by the `--e1-cam-*` CSS variables — see experiment-set-one-camera.css).
 * This component owns that transform:
 *  - Pinch (macOS delivers this as a `wheel` event with a synthetic ctrlKey) or
 *    ⌘/Ctrl + scroll zooms toward the cursor/pinch center.
 *  - Plain two-finger trackpad scroll pans the canvas.
 *  - Click-drag on empty canvas pans; holding Space lets you pan-drag from
 *    anywhere, including on top of panels.
 *  - ⌘/Ctrl + '+'/'-' zoom, ⌘/Ctrl + '0' resets.
 * Panel sizes never change — it's purely a viewport transform.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/** Keep in sync with --e1-menu-width in experiment-set-one-camera.css. */
const MENU_WIDTH = 384;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 8;
const BUTTON_STEP = 1.25;
/** Content may be panned to any edge, but at least this many px always stay on
 *  screen — otherwise scrolling would fling the whole canvas into the void and
 *  it would read as "everything blanked out." */
const EDGE_KEEP = 160;
/** Fallback content size before the stage is measured (showcase-align dims). */
const DEFAULT_CONTENT = { w: 1440, h: 1572 };

type CameraState = { zoom: number; tx: number; ty: number };

const INITIAL: CameraState = { zoom: 1, tx: MENU_WIDTH, ty: 0 };

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

/** Keep the scaled content overlapping the visible canvas by at least
 *  EDGE_KEEP px on every side, so the camera can never be panned/zoomed to a
 *  fully blank viewport. `content` is the stage's unscaled layout size. */
function clampPan(cam: CameraState, content: { w: number; h: number }): CameraState {
  const w = content.w * cam.zoom;
  const h = content.h * cam.zoom;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Left edge of the usable canvas sits past the fixed menu.
  const range = (lo: number, hi: number, v: number) => (lo > hi ? (lo + hi) / 2 : Math.min(hi, Math.max(lo, v)));
  return {
    zoom: cam.zoom,
    tx: range(MENU_WIDTH + EDGE_KEEP - w, vw - EDGE_KEEP, cam.tx),
    ty: range(EDGE_KEEP - h, vh - EDGE_KEEP, cam.ty),
  };
}

/** Zoom to `nextZoom` while keeping the (clientX, clientY) point visually fixed. */
function zoomAbout(prev: CameraState, clientX: number, clientY: number, nextZoom: number): CameraState {
  const zoom = clampZoom(nextZoom);
  const ratio = zoom / prev.zoom;
  return {
    zoom,
    tx: clientX - ratio * (clientX - prev.tx),
    ty: clientY - ratio * (clientY - prev.ty),
  };
}

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el as HTMLElement).isContentEditable;
}

export function StageCamera() {
  // The camera transform is high-frequency (every wheel tick / pointer move),
  // so it lives in a ref and is written straight to the CSS variables inside a
  // rAF — never through React state, which would re-render + recomposite the
  // big glass layers on every event and cause jank. `zoomPct` is the only piece
  // React renders, and it's updated at most once per frame for the label.
  const camRef = useRef<CameraState>(INITIAL);
  const [zoomPct, setZoomPct] = useState(Math.round(INITIAL.zoom * 100));
  const rafId = useRef<number | null>(null);
  const pan = useRef<{ id: number; startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const [panning, setPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  // Timer that clears data-e1-cam-active once interaction goes idle, so the
  // transient will-change is dropped and backdrop-filters repaint cleanly.
  const idleTimer = useRef<number | null>(null);
  // Unscaled layout size of the stage, used to bound panning. Measured from the
  // DOM on mount + resize so bounds track the actual canvas, not a guess.
  const content = useRef({ ...DEFAULT_CONTENT });

  const measureContent = useCallback(() => {
    const stage = document.querySelector<HTMLElement>('.experiment-set-one-stage');
    if (stage && stage.offsetWidth && stage.offsetHeight) {
      content.current = { w: stage.offsetWidth, h: stage.offsetHeight };
    }
  }, []);

  // Flag the page so CSS applies the shared transform to wallpaper + stage.
  useEffect(() => {
    document.body.dataset.e1Camera = 'on';
    measureContent();
    const root = document.documentElement.style;
    root.setProperty('--e1-cam-zoom', String(INITIAL.zoom));
    root.setProperty('--e1-cam-x', `${INITIAL.tx}px`);
    root.setProperty('--e1-cam-y', `${INITIAL.ty}px`);
    return () => {
      delete document.body.dataset.e1Camera;
      delete document.body.dataset.e1CamActive;
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      if (idleTimer.current != null) window.clearTimeout(idleTimer.current);
    };
  }, [measureContent]);

  // Re-measure and re-clamp when the viewport changes so a resize can't strand
  // the content out of bounds.
  useEffect(() => {
    const onResize = () => {
      measureContent();
      applyCamRef.current((prev) => prev);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measureContent]);

  // Mutate the camera, flush to CSS vars on the next frame, and keep the layers
  // promoted (data-e1-cam-active) only until movement goes idle.
  const applyCam = useCallback((next: (prev: CameraState) => CameraState) => {
    camRef.current = clampPan(next(camRef.current), content.current);
    document.body.dataset.e1CamActive = '';
    if (idleTimer.current != null) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      delete document.body.dataset.e1CamActive;
    }, 180);
    if (rafId.current != null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const { zoom, tx, ty } = camRef.current;
      const root = document.documentElement.style;
      root.setProperty('--e1-cam-zoom', String(zoom));
      root.setProperty('--e1-cam-x', `${tx}px`);
      root.setProperty('--e1-cam-y', `${ty}px`);
      setZoomPct((p) => (p === Math.round(zoom * 100) ? p : Math.round(zoom * 100)));
    });
  }, []);

  // Latest applyCam for effects (resize) that must not re-subscribe on every render.
  const applyCamRef = useRef(applyCam);
  applyCamRef.current = applyCam;

  // Trackpad conventions: pinch (macOS reports this as `wheel` with a synthetic
  // ctrlKey) or ⌘/Ctrl + scroll zooms toward the cursor. Plain two-finger scroll
  // pans, same as Figma/Miro. Ignored over the dock so its list keeps scrolling.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const target = e.target as Element | null;
      if (target?.closest('.experiment-one-settings-dock')) return;
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        applyCam((prev) => zoomAbout(prev, e.clientX, e.clientY, prev.zoom * Math.exp(-e.deltaY * 0.0015)));
      } else {
        applyCam((prev) => ({ ...prev, tx: prev.tx - e.deltaX, ty: prev.ty - e.deltaY }));
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [applyCam]);

  const zoomByButton = useCallback((factor: number) => {
    const cx = MENU_WIDTH + (window.innerWidth - MENU_WIDTH) / 2;
    const cy = window.innerHeight / 2;
    applyCam((prev) => zoomAbout(prev, cx, cy, prev.zoom * factor));
  }, [applyCam]);

  const reset = useCallback(() => applyCam(() => INITIAL), [applyCam]);

  // ⌘/Ctrl + '+'/'-' zoom, ⌘/Ctrl + '0' resets, and holding Space arms pan-drag
  // over panels (not just empty canvas) — all skipped while typing in the dock.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(document.activeElement)) return;
      if (e.code === 'Space' && !e.repeat) {
        setSpaceHeld(true);
        e.preventDefault();
        return;
      }
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        zoomByButton(BUTTON_STEP);
      } else if (e.key === '-') {
        e.preventDefault();
        zoomByButton(1 / BUTTON_STEP);
      } else if (e.key === '0') {
        e.preventDefault();
        reset();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
    };
    const onBlur = () => setSpaceHeld(false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [zoomByButton, reset]);

  const onPanDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    pan.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      baseX: camRef.current.tx,
      baseY: camRef.current.ty,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setPanning(true);
  }, []);

  const onPanMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const p = pan.current;
    if (!p || p.id !== e.pointerId) return;
    applyCam((prev) => ({ ...prev, tx: p.baseX + (e.clientX - p.startX), ty: p.baseY + (e.clientY - p.startY) }));
  }, [applyCam]);

  const endPan = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (pan.current?.id !== e.pointerId) return;
    pan.current = null;
    setPanning(false);
  }, []);

  return (
    <>
      <div
        className={`experiment-set-one-camera-pan${panning ? ' experiment-set-one-camera-pan--panning' : ''}${spaceHeld ? ' experiment-set-one-camera-pan--armed' : ''}`}
        onPointerDown={onPanDown}
        onPointerMove={onPanMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        aria-hidden="true"
      />
      <div className="experiment-set-one-camera-controls" role="group" aria-label="Canvas zoom">
        <span className="experiment-set-one-camera-controls__hint">Scroll to pan · Pinch/⌘Scroll to zoom · Hold Space to drag</span>
        <button
          type="button"
          className="experiment-set-one-camera-controls__btn"
          onClick={() => zoomByButton(1 / BUTTON_STEP)}
          aria-label="Zoom out"
          title="Zoom out (⌘−)"
        >
          −
        </button>
        <span className="experiment-set-one-camera-controls__value">{zoomPct}%</span>
        <button
          type="button"
          className="experiment-set-one-camera-controls__btn"
          onClick={() => zoomByButton(BUTTON_STEP)}
          aria-label="Zoom in"
          title="Zoom in (⌘+)"
        >
          +
        </button>
        <button
          type="button"
          className="experiment-set-one-camera-controls__btn experiment-set-one-camera-controls__btn--reset"
          onClick={reset}
          title="Reset zoom (⌘0)"
        >
          Reset
        </button>
      </div>
    </>
  );
}
