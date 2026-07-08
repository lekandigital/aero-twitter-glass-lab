/**
 * Camera for the Experiment Set 1 canvas.
 *
 * The wallpaper and the experiment stage share a single scale + translate
 * (driven by the `--e1-cam-*` CSS variables — see experiment-set-one-camera.css).
 * This component owns that transform: zoom in/out to inspect panels up close and
 * drag empty space to pan. Panel sizes never change — it's purely a viewport.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

/** Keep in sync with --e1-menu-width in experiment-set-one-camera.css. */
const MENU_WIDTH = 384;
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 5;
const BUTTON_STEP = 1.25;

type CameraState = { zoom: number; tx: number; ty: number };

const INITIAL: CameraState = { zoom: 1, tx: MENU_WIDTH, ty: 0 };

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

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

export function StageCamera() {
  const [cam, setCam] = useState<CameraState>(INITIAL);
  const camRef = useRef(cam);
  camRef.current = cam;
  const pan = useRef<{ id: number; startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const [panning, setPanning] = useState(false);

  // Flag the page so CSS applies the shared transform to wallpaper + stage.
  useEffect(() => {
    document.body.dataset.e1Camera = 'on';
    return () => {
      delete document.body.dataset.e1Camera;
    };
  }, []);

  // Push camera state into the CSS variables both layers read.
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--e1-cam-zoom', String(cam.zoom));
    root.setProperty('--e1-cam-x', `${cam.tx}px`);
    root.setProperty('--e1-cam-y', `${cam.ty}px`);
  }, [cam]);

  // Ctrl/Cmd + wheel zooms toward the cursor (ignored over the menu so it scrolls).
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const target = e.target as Element | null;
      if (target?.closest('.experiment-one-settings-dock')) return;
      e.preventDefault();
      setCam((prev) => zoomAbout(prev, e.clientX, e.clientY, prev.zoom * Math.exp(-e.deltaY * 0.0015)));
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  const zoomByButton = useCallback((factor: number) => {
    const cx = MENU_WIDTH + (window.innerWidth - MENU_WIDTH) / 2;
    const cy = window.innerHeight / 2;
    setCam((prev) => zoomAbout(prev, cx, cy, prev.zoom * factor));
  }, []);

  const reset = useCallback(() => setCam(INITIAL), []);

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
    setCam((prev) => ({ ...prev, tx: p.baseX + (e.clientX - p.startX), ty: p.baseY + (e.clientY - p.startY) }));
  }, []);

  const endPan = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (pan.current?.id !== e.pointerId) return;
    pan.current = null;
    setPanning(false);
  }, []);

  return (
    <>
      <div
        className={`experiment-set-one-camera-pan${panning ? ' experiment-set-one-camera-pan--panning' : ''}`}
        onPointerDown={onPanDown}
        onPointerMove={onPanMove}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        aria-hidden="true"
      />
      <div className="experiment-set-one-camera-controls" role="group" aria-label="Canvas zoom">
        <button
          type="button"
          className="experiment-set-one-camera-controls__btn"
          onClick={() => zoomByButton(1 / BUTTON_STEP)}
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>
        <span className="experiment-set-one-camera-controls__value">{Math.round(cam.zoom * 100)}%</span>
        <button
          type="button"
          className="experiment-set-one-camera-controls__btn"
          onClick={() => zoomByButton(BUTTON_STEP)}
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="experiment-set-one-camera-controls__btn experiment-set-one-camera-controls__btn--reset"
          onClick={reset}
          title="Reset zoom (100%) and re-center"
        >
          Reset
        </button>
      </div>
    </>
  );
}
